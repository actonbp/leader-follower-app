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
const { getCollection } = require('./db');

// Route to handle data submission
app.post('/submit-data', async (req, res) => {
    try {
        const data = req.body;
        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

        const dataToSave = {
            userId: data.userId,
            startTime: data.startTime,
            submitTime: timestamp,
            leaderScore: data.leaderPercent,
            followerScore: data.followerPercent,
            novelty: data.novelty,
            disruption: data.disruption,
            ordinariness: data.ordinariness,
            eventDescription: data.eventDescription
        };

        // Get the user_data collection
        const collection = await getCollection('user_data');
        
        // Insert the document
        const result = await collection.insertOne(dataToSave);
        
        console.log(`Data saved with ID: ${result.insertedId}`);
        res.json({ 
            message: 'Data saved successfully', 
            id: result.insertedId 
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
        // Get the user_data collection
        const collection = await getCollection('user_data');
        
        // Find all documents for this user ID
        const userData = await collection.find({ userId: userId }).toArray();

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
        
        // Get the email_preferences collection
        const preferencesCollection = await getCollection('email_preferences');
        
        // Save or update preferences
        const preference = { 
            userId, 
            wantsReminders, 
            userEmail, 
            reminderTime,
            updatedAt: new Date()
        };
        
        // Using upsert to either insert or update
        await preferencesCollection.updateOne(
            { userId },
            { $set: preference },
            { upsert: true }
        );

        // Log email without actually sending (for demo purposes)
        console.log('Would send welcome email to:', userEmail);
        console.log('Email reminders:', wantsReminders ? 'Enabled' : 'Disabled');
        console.log('Reminder time:', reminderTime);
        
        // Log the "sent" email
        const emailLogsCollection = await getCollection('email_logs');
        
        const emailLog = {
            userId,
            emailSent: true, // Consider it sent for demo purposes
            sentAt: new Date(),
            demo: true
        };
        
        await emailLogsCollection.updateOne(
            { userId },
            { $set: emailLog },
            { upsert: true }
        );

        res.json({ 
            message: 'Preferences saved successfully', 
            note: 'Demo mode: No actual email sent'
        });
    } catch (error) {
        console.error('Error:', error);

        try {
            // Log the error
            const emailLogsCollection = await getCollection('email_logs');
            
            const errorLog = {
                userId,
                emailSent: false,
                error: error.message,
                errorAt: new Date()
            };
            
            await emailLogsCollection.updateOne(
                { userId },
                { $set: errorLog },
                { upsert: true }
            );
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
        const preferences = JSON.parse(await fs.readFile('email_preferences.json', 'utf8'));
        for (const [userId, { wantsReminders, userEmail }] of Object.entries(preferences)) {
            if (wantsReminders) {
                console.log(`DEMO: Would send reminder email to ${userEmail}`);
            }
        }
    } catch (error) {
        console.error('Error processing reminder emails:', error);
    }
}

// Schedule reminder emails for each user (Demo mode)
async function scheduleReminders() {
    console.log('Setting up demo reminder schedules (no actual emails will be sent)');
    
    try {
        const preferences = JSON.parse(await fs.readFile('email_preferences.json', 'utf8'));
        for (const [userId, { wantsReminders, userEmail, reminderTime }] of Object.entries(preferences)) {
            if (wantsReminders && reminderTime) {
                const [hours, minutes] = reminderTime.split(':');
                console.log(`DEMO: Would schedule reminder for ${userEmail} at ${hours}:${minutes}`);
                
                // In demo mode, we don't actually set up the cron job
                // This avoids errors with missing email credentials
                /*
                cron.schedule(`${minutes} ${hours} * * *`, () => {
                    console.log(`DEMO: Would send reminder email to ${userEmail}`);
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
        // Get the email_preferences collection
        const preferencesCollection = await getCollection('email_preferences');
        
        // Find user preferences
        const userPreference = await preferencesCollection.findOne({ userId });
        
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
        // Get the email_logs collection
        const emailLogsCollection = await getCollection('email_logs');
        
        // Find user email log
        let emailLog = await emailLogsCollection.findOne({ userId });
        
        // If there's no status yet, create a demo one
        if (!emailLog) {
            const demoLog = { 
                userId,
                emailSent: true, 
                sentAt: new Date(),
                demo: true
            };
            
            await emailLogsCollection.insertOne(demoLog);
            emailLog = demoLog;
        }
        
        res.json({
            ...emailLog,
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