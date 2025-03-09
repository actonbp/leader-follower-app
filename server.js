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

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const welcomeEmailContent = `
Dear LFIT Participant,

Welcome to the Leader-Follower Identity Tracker (LFIT)! We're excited to have you on board.

LFIT is designed to help you reflect on your daily experiences and how they shape your identity as a leader or follower. By participating in this study, you'll gain valuable insights into your own leadership development journey.

Here's what you can expect:
1. Daily reminders to complete a short reflection (if you've opted for them).
2. A simple interface to record your experiences and feelings.
3. Personalized reports to track your progress over time.

Remember, consistency is key. We recommend completing the reflection for at least two consecutive weeks to see meaningful patterns in your leader-follower identity dynamics.

If you have any questions or need assistance, please don't hesitate to reach out to our support team.

Thank you for your participation, and we look forward to accompanying you on this journey of self-discovery and growth!

Best regards,
The LFIT Team
`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Welcome to the Leader-Follower Identity Tracker (LFIT)',
            text: welcomeEmailContent
        });

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
            emailSent: true,
            sentAt: new Date().toISOString()
        };
        await fs.writeFile('email_logs.json', JSON.stringify(emailLogs));

        res.json({ message: 'Preferences saved successfully and welcome email sent' });
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

        res.status(500).json({ message: 'Error processing request' });
    }
});

// Function to send reminder emails
async function sendReminderEmails() {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        const preferences = JSON.parse(await fs.readFile('email_preferences.json', 'utf8'));
        for (const [userId, { wantsReminders, userEmail }] of Object.entries(preferences)) {
            if (wantsReminders) {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: userEmail,
                    subject: 'LFIT Daily Reminder',
                    text: 'Remember to complete your daily LFIT reflection!'
                });
            }
        }
    } catch (error) {
        console.error('Error sending reminder emails:', error);
    }
}

// Schedule reminder emails for each user
async function scheduleReminders() {
    try {
        const preferences = JSON.parse(await fs.readFile('email_preferences.json', 'utf8'));
        for (const [userId, { wantsReminders, userEmail, reminderTime }] of Object.entries(preferences)) {
            if (wantsReminders && reminderTime) {
                const [hours, minutes] = reminderTime.split(':');
                cron.schedule(`${minutes} ${hours} * * *`, () => sendReminderEmail(userEmail), {
                    timezone: 'America/New_York'
                });
            }
        }
    } catch (error) {
        console.error('Error scheduling reminders:', error);
    }
}

// Call this function when the server starts
scheduleReminders();

// Also schedule it to run daily to pick up any new preferences
cron.schedule('0 0 * * *', scheduleReminders);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.get('/check-user/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const preferences = JSON.parse(await fs.readFile('email_preferences.json', 'utf8'));
        const userPreference = preferences[userId];
        res.json({
            isNewUser: !userPreference,
            hasEmail: userPreference && userPreference.userEmail
        });
    } catch (error) {
        console.error('Error checking user status:', error);
        res.status(500).json({ message: 'Error checking user status' });
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
        const userEmailStatus = emailLogs[userId] || { emailSent: false, error: 'No email sent yet' };
        res.json(userEmailStatus);
    } catch (error) {
        console.error('Error checking email status:', error);
        res.status(500).json({ message: 'Error checking email status' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});