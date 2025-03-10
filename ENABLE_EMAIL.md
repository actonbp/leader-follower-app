# How to Enable Email Functionality

This guide explains how to enable actual email sending in the Leader-Follower App.

## 1. Set Up Email Credentials

First, you need to edit the `.env` file in the project root directory:

```
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

For Gmail, you need to use an App Password, not your regular password:
1. Enable 2-Step Verification on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate a new App Password for "Mail" and "Other (Custom name)"
4. Use that 16-character password here

## 2. Restore Email Code in server.js

You need to modify the server.js file to restore the email functionality. Here's what to change:

### A. Set Email Preferences Route

Replace the current demo mode implementation with the actual email sending code:

```javascript
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

        // Set up email transport
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
        
        // Log the sent email
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

        res.status(500).json({ 
            message: 'Error processing request',
            error: error.message 
        });
    }
});
```

### B. Restore Reminder Functions

Replace the demo mode functions with actual email sending:

```javascript
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
                console.log(`Reminder email sent to ${userEmail}`);
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
                cron.schedule(`${minutes} ${hours} * * *`, () => {
                    // Send a reminder email to this specific user
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS
                        }
                    });
                    
                    transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to: userEmail,
                        subject: 'LFIT Daily Reminder',
                        text: 'Remember to complete your daily LFIT reflection!'
                    }).catch(error => {
                        console.error(`Error sending reminder to ${userEmail}:`, error);
                    });
                }, {
                    timezone: 'America/New_York'
                });
                console.log(`Scheduled reminder for ${userEmail} at ${hours}:${minutes}`);
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
```

### C. Update Email Status Check

Restore the email status check:

```javascript
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
        res.status(500).json({ 
            message: 'Error checking email status',
            error: error.message 
        });
    }
});
```

## 3. Restart the Server

After making these changes, restart the server:

```bash
npm restart
```

## 4. Test the Email Functionality

Try submitting the email preferences form with a valid email address to test if emails are being sent.

## Troubleshooting

If emails are not being sent, check the following:

1. Verify that your .env file has the correct credentials
2. Make sure your email provider allows sending from third-party applications
3. For Gmail, ensure you're using an App Password, not your regular password
4. Check the server logs for any error messages
5. Try using a different email provider if needed

Note: Some email providers have strict security policies that may block emails sent from applications. Gmail with an App Password is generally the most reliable option.