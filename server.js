const express = require('express');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const bodyParser = require('body-parser');
const readline = require('readline');

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

    fs.appendFile('user_data.jsonl', dataString, (err) => {
        if (err) {
            console.error('Error saving data:', err);
            res.status(500).json({ message: 'Error saving data' });
        } else {
            res.json({ message: 'Data saved successfully' });
        }
    });
});

// Route to get user data for the reporter
app.get('/get-user-data/:userId', async (req, res) => {
    const userId = req.params.userId;
    const userData = [];

    const fileStream = fs.createReadStream('user_data.jsonl');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const data = JSON.parse(line);
        if (data.userId === userId) {
            userData.push(data);
        }
    }

    res.json(userData);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});