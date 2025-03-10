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

// Route to handle data submission
app.post('/submit-data', (req, res) => {
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

    const dataString = JSON.stringify(dataToSave) + '\n';

    fs.appendFile(path.join(__dirname, 'user_data.jsonl'), dataString)
        .then(() => {
            res.json({ message: 'Data saved successfully' });
        })
        .catch((err) => {
            console.error('Error saving data:', err);
            res.status(500).json({ message: 'Error saving data', error: err.message });
        });
});

// Route to get user data for the reporter
app.get('/get-user-data/:userId', async (req, res) => {
    const userId = req.params.userId;
    const userData = [];

    try {
        const filePath = path.join(__dirname, 'user_data.jsonl');
        let fileContent;
        try {
            fileContent = await fs.readFile(filePath, 'utf8');
        } catch (readError) {
            if (readError.code === 'ENOENT') {
                console.log('user_data.jsonl file not found. Creating an empty file.');
                await fs.writeFile(filePath, '');
                fileContent = '';
            } else {
                throw readError;
            }
        }

        const lines = fileContent.split('\n');

        for (const line of lines) {
            if (line.trim() !== '') {
                try {
                    const data = JSON.parse(line);
                    if (data.userId === userId) {
                        userData.push(data);
                    }
                } catch (parseError) {
                    console.error('Error parsing line:', line, parseError);
                }
            }
        }

        if (userData.length === 0) {
            console.log(`No data found for user ID: ${userId}`);
        }

        res.json(userData);
    } catch (error) {
        console.error('Error processing user data:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
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
        
        // Save preferences
        let preferences;
        try {
            preferences = JSON.parse(await fs.readFile('email_preferences.json', 'utf8'));
        } catch (error) {
            if (error.code === 'ENOENT') {
                preferences = {};
            } else {
                throw error;
            }
        }

        preferences[userId] = { wantsReminders, userEmail, reminderTime };
        await fs.writeFile('email_preferences.json', JSON.stringify(preferences));

        // Log email without actually sending (for demo purposes)
        console.log('Would send welcome email to:', userEmail);
        console.log('Email reminders:', wantsReminders ? 'Enabled' : 'Disabled');
        console.log('Reminder time:', reminderTime);
        
        // Log the "sent" email
        let emailLogs;
        try {
            emailLogs = JSON.parse(await fs.readFile('email_logs.json', 'utf8'));
        } catch (error) {
            if (error.code === 'ENOENT') {
                emailLogs = {};
            } else {
                throw error;
            }
        }

        emailLogs[userId] = {
            emailSent: true, // Consider it sent for demo purposes
            sentAt: new Date().toISOString(),
            demo: true
        };
        await fs.writeFile('email_logs.json', JSON.stringify(emailLogs));

        res.json({ 
            message: 'Preferences saved successfully', 
            note: 'Demo mode: No actual email sent'
        });
    } catch (error) {
        console.error('Error:', error);

        let emailLogs;
        try {
            emailLogs = JSON.parse(await fs.readFile('email_logs.json', 'utf8'));
        } catch (readError) {
            if (readError.code === 'ENOENT') {
                emailLogs = {};
            } else {
                throw readError;
            }
        }

        emailLogs[userId] = {
            emailSent: false,
            error: error.message,
            errorAt: new Date().toISOString()
        };
        await fs.writeFile('email_logs.json', JSON.stringify(emailLogs));

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
        let preferences;
        try {
            preferences = JSON.parse(await fs.readFile('email_preferences.json', 'utf8'));
        } catch (error) {
            if (error.code === 'ENOENT') {
                preferences = {};
            } else {
                throw error;
            }
        }
        
        const userPreference = preferences[userId];
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
        let emailLogs;
        try {
            emailLogs = JSON.parse(await fs.readFile('email_logs.json', 'utf8'));
        } catch (error) {
            if (error.code === 'ENOENT') {
                emailLogs = {};
            } else {
                throw error;
            }
        }
        
        // If there's no status yet, create a demo one
        if (!emailLogs[userId]) {
            emailLogs[userId] = { 
                emailSent: true, 
                sentAt: new Date().toISOString(),
                demo: true
            };
            await fs.writeFile('email_logs.json', JSON.stringify(emailLogs));
        }
        
        const userEmailStatus = emailLogs[userId];
        res.json({
            ...userEmailStatus,
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