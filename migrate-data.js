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
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db('leader-follower');
    
    // Migrate user data
    const userData = [];
    try {
      console.log('Attempting to read user_data.jsonl...');
      const fileContent = await fs.readFile(path.join(__dirname, 'user_data.jsonl'), 'utf8');
      const lines = fileContent.split('\n');
      
      for (const line of lines) {
        if (line.trim() !== '') {
          try {
            userData.push(JSON.parse(line));
          } catch (parseError) {
            console.error('Error parsing line:', line, parseError);
          }
        }
      }
      
      if (userData.length > 0) {
        console.log(`Found ${userData.length} user data records, inserting into MongoDB...`);
        await db.collection('user_data').insertMany(userData);
        console.log(`Migrated ${userData.length} user data records`);
      } else {
        console.log('No user data found to migrate');
      }
    } catch (error) {
      console.error('Error migrating user data:', error);
    }
    
    // Migrate email preferences
    try {
      console.log('Attempting to read email_preferences.json...');
      const preferencesContent = await fs.readFile('email_preferences.json', 'utf8');
      const preferences = JSON.parse(preferencesContent);
      
      const preferencesArray = Object.entries(preferences).map(([userId, prefs]) => ({
        userId,
        ...prefs,
        updatedAt: new Date()
      }));
      
      if (preferencesArray.length > 0) {
        console.log(`Found ${preferencesArray.length} email preferences, inserting into MongoDB...`);
        await db.collection('email_preferences').insertMany(preferencesArray);
        console.log(`Migrated ${preferencesArray.length} email preferences`);
      } else {
        console.log('No email preferences found to migrate');
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('email_preferences.json file not found, skipping migration');
      } else {
        console.error('Error migrating email preferences:', error);
      }
    }
    
    // Migrate email logs
    try {
      console.log('Attempting to read email_logs.json...');
      const logsContent = await fs.readFile('email_logs.json', 'utf8');
      const logs = JSON.parse(logsContent);
      
      const logsArray = Object.entries(logs).map(([userId, log]) => ({
        userId,
        ...log,
        sentAt: log.sentAt ? new Date(log.sentAt) : new Date(),
        errorAt: log.errorAt ? new Date(log.errorAt) : undefined
      }));
      
      if (logsArray.length > 0) {
        console.log(`Found ${logsArray.length} email logs, inserting into MongoDB...`);
        await db.collection('email_logs').insertMany(logsArray);
        console.log(`Migrated ${logsArray.length} email logs`);
      } else {
        console.log('No email logs found to migrate');
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('email_logs.json file not found, skipping migration');
      } else {
        console.error('Error migrating email logs:', error);
      }
    }
    
    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

migrateData().catch(console.error);