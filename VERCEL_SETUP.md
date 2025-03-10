# Vercel Deployment Setup

This document explains how to set up the Leader-Follower app for deployment on Vercel with MongoDB Atlas.

## 1. Set Up MongoDB Atlas

1. **Create a MongoDB Atlas account** (if you don't have one)
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account

2. **Create a new cluster**
   - Select the free tier (M0)
   - Choose a cloud provider and region close to your users
   - Click "Create Cluster" (this takes a few minutes)

3. **Set up database access**
   - In the left sidebar, go to "Database Access"
   - Click "Add New Database User"
   - Create a username and password (save these securely)
   - Set privileges to "Read and Write to Any Database"
   - Click "Add User"

4. **Configure network access**
   - In the left sidebar, go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (or specify your IP)
   - Click "Confirm"

5. **Get your connection string**
   - Go back to your cluster and click "Connect"
   - Select "Connect your application"
   - Copy the connection string (it looks like `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`)
   - Replace `<password>` with your database user's password
   - Replace `myFirstDatabase` with `leader-follower`

## 2. Deploy to Vercel

1. **Set up Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   npm run vercel-login
   ```

3. **Add your MongoDB connection string to Vercel environment variables**
   - Create a project on Vercel if you haven't already
   - Go to your project settings
   - Add the following environment variable:
     - Key: `MONGODB_URI`
     - Value: Your MongoDB connection string from step 1.5

4. **Deploy to Vercel**
   ```bash
   npm run vercel-deploy   # for testing
   ```
   or
   ```bash
   npm run vercel-prod     # for production
   ```

## 3. Local Development with MongoDB

1. **Set up your local environment**
   - Create a `.env` file in the project root (if not already done)
   - Add your MongoDB connection string:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/leader-follower?retryWrites=true&w=majority
     ```

2. **Run the app locally**
   ```bash
   npm run dev
   ```

## Troubleshooting

### Common MongoDB Issues
- **Connection Error**: Make sure your IP is whitelisted in MongoDB Atlas
- **Authentication Error**: Verify your username and password in the connection string
- **Network Error**: Ensure you have internet connectivity

### Common Vercel Issues
- **Build Failure**: Check the build logs for any syntax errors
- **Environment Variables**: Verify they are set correctly in Vercel dashboard
- **API Timeout**: Vercel serverless functions have a 10-second timeout; optimize database queries

## Data Migration (Optional)

If you have existing data in JSON files and want to migrate it to MongoDB, you can use the following script:

```javascript
// migrate-data.js
require('dotenv').config();
const fs = require('fs').promises;
const { MongoClient } = require('mongodb');
const path = require('path');

async function migrateData() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('leader-follower');
    
    // Migrate user data
    const userData = [];
    try {
      const fileContent = await fs.readFile(path.join(__dirname, 'user_data.jsonl'), 'utf8');
      const lines = fileContent.split('\n');
      
      for (const line of lines) {
        if (line.trim() !== '') {
          userData.push(JSON.parse(line));
        }
      }
      
      if (userData.length > 0) {
        await db.collection('user_data').insertMany(userData);
        console.log(`Migrated ${userData.length} user data records`);
      }
    } catch (error) {
      console.error('Error migrating user data:', error);
    }
    
    // Migrate email preferences
    try {
      const preferences = JSON.parse(await fs.readFile('email_preferences.json', 'utf8'));
      const preferencesArray = Object.entries(preferences).map(([userId, prefs]) => ({
        userId,
        ...prefs,
        updatedAt: new Date()
      }));
      
      if (preferencesArray.length > 0) {
        await db.collection('email_preferences').insertMany(preferencesArray);
        console.log(`Migrated ${preferencesArray.length} email preferences`);
      }
    } catch (error) {
      console.error('Error migrating email preferences:', error);
    }
    
    // Migrate email logs
    try {
      const logs = JSON.parse(await fs.readFile('email_logs.json', 'utf8'));
      const logsArray = Object.entries(logs).map(([userId, log]) => ({
        userId,
        ...log,
        sentAt: new Date(log.sentAt || new Date()),
        errorAt: log.errorAt ? new Date(log.errorAt) : undefined
      }));
      
      if (logsArray.length > 0) {
        await db.collection('email_logs').insertMany(logsArray);
        console.log(`Migrated ${logsArray.length} email logs`);
      }
    } catch (error) {
      console.error('Error migrating email logs:', error);
    }
    
    console.log('Migration complete!');
  } finally {
    await client.close();
  }
}

migrateData().catch(console.error);
```

Run it with:
```bash
node migrate-data.js
```