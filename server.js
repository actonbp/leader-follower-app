const express = require('express');
const path = require('path');
const moment = require('moment');
const bodyParser = require('body-parser');
const readline = require('readline');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const fs = require('fs').promises;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the src/public directory
app.use(express.static(path.join(__dirname, 'src', 'public')));

app.use(bodyParser.json());

// Route to serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'public', 'index.html'));
});

// Import the database module
const { models, connectToDatabase, initializeDatabase } = require('./db-neon');

// Connect to database when server starts
(async () => {
  try {
    await connectToDatabase();
    await initializeDatabase();
    console.log('Database connected and initialized');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
})();

// Route to handle data submission
app.post('/submit-data', async (req, res) => {
    try {
        const data = req.body;
        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

        // Create a new user data record
        const result = await models.UserData.create({
          userId: data.userId,
          startTime: data.startTime,
          submitTime: timestamp,
          leaderScore: data.leaderPercent.toString(), // Store as string to match original format
          followerScore: data.followerPercent.toString(), // Store as string to match original format
          novelty: data.novelty ? data.novelty.toString() : null,
          disruption: data.disruption ? data.disruption.toString() : null,
          ordinariness: data.ordinariness ? data.ordinariness.toString() : null,
          eventDescription: data.eventDescription
        });
        
        console.log(`Data saved with ID: ${result.id}`);
        res.json({ 
            message: 'Data saved successfully', 
            id: result.id 
        });
    } catch (err) {
        console.error('Error saving data:', err);
        res.status(500).json({ 
            message: 'Error saving data', 
            error: err.message 
        });
    }
});

// Route to get user data for the reporter
app.get('/get-user-data/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find all data for this user ID
        const userData = await models.UserData.findAll({
          where: { userId },
          order: [['createdAt', 'ASC']]
        });

        if (userData.length === 0) {
            console.log(`No data found for user ID: ${userId}`);
        } else {
            console.log(`Found ${userData.length} entries for user ID: ${userId}`);
        }

        res.json(userData);
    } catch (error) {
        console.error('Error processing user data:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message 
        });
    }
});

// User registration route
app.post('/register', (req, res) => {
    // Handle user registration and store email
});

// Set email preferences route
app.post('/set-email-preferences', async (req, res) => {
    const { userId, wantsReminders, userEmail, reminderTime } = req.body;
    try {
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        
        // Upsert email preferences
        const [preference, created] = await models.EmailPreference.findOrCreate({
          where: { userId },
          defaults: {
            wantsReminders: wantsReminders || false,
            userEmail,
            reminderTime,
            updatedAt: new Date()
          }
        });

        // If record existed, update it
        if (!created) {
          await preference.update({
            wantsReminders: wantsReminders || false,
            userEmail,
            reminderTime,
            updatedAt: new Date()
          });
        }

        // Log email without actually sending (for demo purposes)
        console.log('Would send welcome email to:', userEmail);
        console.log('Email reminders:', wantsReminders ? 'Enabled' : 'Disabled');
        console.log('Reminder time:', reminderTime);
        
        // Log the "sent" email
        const [emailLog, emailLogCreated] = await models.EmailLog.findOrCreate({
          where: { userId },
          defaults: {
            emailSent: true, // Consider it sent for demo purposes
            sentAt: new Date(),
            demo: true
          }
        });

        // If record existed, update it
        if (!emailLogCreated) {
          await emailLog.update({
            emailSent: true,
            sentAt: new Date(),
            demo: true
          });
        }

        res.json({ 
            message: 'Preferences saved successfully', 
            note: 'Demo mode: No actual email sent'
        });
    } catch (error) {
        console.error('Error:', error);

        try {
            // Log the error
            const [errorLog, errorLogCreated] = await models.EmailLog.findOrCreate({
              where: { userId },
              defaults: {
                emailSent: false,
                error: error.message,
                errorAt: new Date()
              }
            });

            // If record existed, update it
            if (!errorLogCreated) {
              await errorLog.update({
                emailSent: false,
                error: error.message,
                errorAt: new Date()
              });
            }
        } catch (logError) {
            console.error('Error logging failure:', logError);
        }

        res.status(500).json({ 
            message: 'Error saving preferences', 
            error: error.message 
        });
    }
});

// Function to send reminder emails (Demo mode - just logs to console)
async function sendReminderEmails() {
    console.log('DEMO MODE: Would send reminder emails to users with preferences');
    
    try {
        const preferences = await models.EmailPreference.findAll({
          where: { wantsReminders: true }
        });
        
        for (const pref of preferences) {
            console.log(`DEMO: Would send reminder email to ${pref.userEmail}`);
        }
    } catch (error) {
        console.error('Error processing reminder emails:', error);
    }
}

// Schedule reminder emails for each user (Demo mode)
async function scheduleReminders() {
    console.log('Setting up demo reminder schedules (no actual emails will be sent)');
    
    try {
        const preferences = await models.EmailPreference.findAll({
          where: { wantsReminders: true }
        });
        
        for (const pref of preferences) {
            if (pref.reminderTime) {
                const [hours, minutes] = pref.reminderTime.split(':');
                console.log(`DEMO: Would schedule reminder for ${pref.userEmail} at ${hours}:${minutes}`);
                
                // In demo mode, we don't actually set up the cron job
                // This avoids errors with missing email credentials
                /*
                cron.schedule(`${minutes} ${hours} * * *`, () => {
                    console.log(`DEMO: Would send reminder email to ${pref.userEmail}`);
                }, {
                    timezone: 'America/New_York'
                });
                */
            }
        }
    } catch (error) {
        console.error('Error processing reminder schedules:', error);
    }
}

// Call this function when the server starts
scheduleReminders();

// Also schedule it to run daily to pick up any new preferences (in demo mode, just log)
console.log('DEMO: Would schedule daily check for new preferences at midnight');
// cron.schedule('0 0 * * *', scheduleReminders);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.get('/check-user/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        // Find user preferences
        const userPreference = await models.EmailPreference.findOne({
          where: { userId }
        });
        
        res.json({
            isNewUser: !userPreference,
            hasEmail: userPreference && userPreference.userEmail,
            demo: true
        });
    } catch (error) {
        console.error('Error checking user status:', error);
        res.status(500).json({ 
            message: 'Error checking user status',
            error: error.message 
        });
    }
});

app.get('/check-email-status/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        // Find user email log
        let emailLog = await models.EmailLog.findOne({
          where: { userId }
        });
        
        // If there's no status yet, create a demo one
        if (!emailLog) {
            emailLog = await models.EmailLog.create({ 
                userId,
                emailSent: true, 
                sentAt: new Date(),
                demo: true
            });
        }
        
        // Convert to plain object for response
        const plainLog = emailLog.get({ plain: true });
        
        res.json({
            ...plainLog,
            demo: true,
            message: 'Demo mode: Email functionality simulated'
        });
    } catch (error) {
        console.error('Error checking email status:', error);
        res.status(500).json({ 
            message: 'Error checking email status',
            error: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});