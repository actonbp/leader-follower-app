process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Add these lines at the top of the file, after the existing process handlers
process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await cleanup();
  process.exit(0);
});

// Cleanup function to close database connections
async function cleanup() {
  try {
    const { sequelize } = require('./db-neon');
    if (sequelize) {
      console.log('Closing database connections...');
      await sequelize.close();
      console.log('Database connections closed');
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

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

// Import the database module
const { models, connectToDatabase, initializeDatabase } = require('./db-neon');

// Serve static files from the src/public directory
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use(bodyParser.json());

// Connect to database when server starts
(async () => {
  try {
    await connectToDatabase();
    await initializeDatabase();
    console.log('Database connected and initialized');
  } catch (error) {
    console.error('Database initialization failed:', error);
    // Don't crash the server, just log the error
    console.error('You may need to set the NEON_DATABASE_URL environment variable');
    console.error('Run: npm run vercel-setup:neon');
  }
})();

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'public', 'index.html'));
});

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
    // Use the direct query method for better serverless compatibility
    const result = await models.UserData.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']]
    });
    
    if (result.length === 0) {
      console.log(`No data found for user ID: ${userId} in database, checking file...`);
      
      // Fall back to file-based data
      try {
        const fileData = [];
        const fileContent = await fs.readFile(path.join(__dirname, 'user_data.jsonl'), 'utf8');
        const lines = fileContent.split('\n');
        
        for (const line of lines) {
          if (line.trim() !== '') {
            try {
              const entry = JSON.parse(line);
              if (entry.userId === userId) {
                fileData.push(entry);
              }
            } catch (parseError) {
              console.error('Error parsing line:', line, parseError);
            }
          }
        }
        
        if (fileData.length > 0) {
          console.log(`Found ${fileData.length} entries for user ID: ${userId} in file`);
          return res.json(fileData);
        } else {
          console.log(`No data found for user ID: ${userId} in file either`);
          return res.json([]);
        }
      } catch (fileError) {
        console.error('Error reading file:', fileError);
        return res.json([]);
      }
    } else {
      console.log(`Found ${result.length} entries for user ID: ${userId} in database`);
      res.json(result);
    }
  } catch (error) {
    console.error('Detailed error in get-user-data:', error);
    res.status(500).json({ 
      error: 'Database query failed', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
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
    try {
      const preferences = await models.EmailPreference.findAll({
        where: { wantsReminders: true }
      });
      
      for (const pref of preferences) {
        console.log(`DEMO: Would send reminder email to ${pref.userEmail}`);
      }
    } catch (dbError) {
      console.error('Database error when getting email preferences:', dbError);
      console.log('Email functionality disabled due to database error');
    }
  } catch (error) {
    console.error('Error processing reminder emails:', error);
  }
}

// Schedule reminder emails for each user (Demo mode)
async function scheduleReminders() {
  console.log('Setting up demo reminder schedules (no actual emails will be sent)');
  
  try {
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
    } catch (dbError) {
      console.error('Database error when setting up schedules:', dbError);
      console.log('Reminder scheduling disabled due to database error');
      
      // Try to load from file as fallback for demo purposes
      try {
        const fileContent = await fs.readFile('email_preferences.json', 'utf8');
        const preferences = JSON.parse(fileContent);
        console.log(`Fallback: Loaded ${Object.keys(preferences).length} preferences from file`);
        
        for (const [userId, pref] of Object.entries(preferences)) {
          if (pref.wantsReminders && pref.reminderTime) {
            const [hours, minutes] = pref.reminderTime.split(':');
            console.log(`DEMO (file fallback): Would schedule reminder for ${pref.userEmail} at ${hours}:${minutes}`);
          }
        }
      } catch (fileError) {
        console.log('No fallback preference file available');
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

// Add a catch-all error handler middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});