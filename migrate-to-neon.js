// migrate-to-neon.js - Migration script from MongoDB to Neon PostgreSQL
require('dotenv').config();
const { MongoClient } = require('mongodb');
const { models, connectToDatabase, initializeDatabase } = require('./db-neon');

async function migrateFromMongo() {
  // MongoDB connection
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Missing MONGODB_URI environment variable');
    process.exit(1);
  }

  const mongoClient = new MongoClient(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    // Connect to MongoDB
    await mongoClient.connect();
    console.log('Connected to MongoDB');
    const mongoDb = mongoClient.db('leader-follower');

    // Connect to Neon PostgreSQL
    await connectToDatabase();
    await initializeDatabase();
    console.log('Connected to Neon PostgreSQL');

    // 1. Migrate user data
    console.log('Migrating user data...');
    const userDataCursor = mongoDb.collection('user_data').find({});
    const userData = await userDataCursor.toArray();
    console.log(`Found ${userData.length} user data records to migrate`);

    if (userData.length > 0) {
      // Process in batches of 100
      const batchSize = 100;
      for (let i = 0; i < userData.length; i += batchSize) {
        const batch = userData.slice(i, i + batchSize);
        const pgData = batch.map(item => ({
          userId: item.userId,
          startTime: item.startTime,
          submitTime: item.submitTime,
          leaderScore: item.leaderScore.toString(), // Convert to string to match DB model
          followerScore: item.followerScore.toString(), // Convert to string to match DB model
          novelty: item.novelty ? item.novelty.toString() : null, // Keep as string
          disruption: item.disruption ? item.disruption.toString() : null, // Keep as string
          ordinariness: item.ordinariness ? item.ordinariness.toString() : null, // Keep as string
          eventDescription: item.eventDescription,
          createdAt: item.createdAt || new Date(),
          updatedAt: item.updatedAt || new Date()
        }));

        await models.UserData.bulkCreate(pgData);
        console.log(`Migrated batch ${i/batchSize + 1}/${Math.ceil(userData.length/batchSize)}`);
      }
      console.log(`Successfully migrated ${userData.length} user data records`);
    }

    // 2. Migrate email preferences
    console.log('Migrating email preferences...');
    const prefsCursor = mongoDb.collection('email_preferences').find({});
    const prefsData = await prefsCursor.toArray();
    console.log(`Found ${prefsData.length} email preferences to migrate`);

    if (prefsData.length > 0) {
      const pgPrefs = prefsData.map(item => ({
        userId: item.userId,
        wantsReminders: item.wantsReminders || false,
        userEmail: item.userEmail,
        reminderTime: item.reminderTime,
        updatedAt: item.updatedAt || new Date(),
        createdAt: item.createdAt || item.updatedAt || new Date()
      }));

      await models.EmailPreference.bulkCreate(pgPrefs);
      console.log(`Successfully migrated ${prefsData.length} email preferences`);
    }

    // 3. Migrate email logs
    console.log('Migrating email logs...');
    const logsCursor = mongoDb.collection('email_logs').find({});
    const logsData = await logsCursor.toArray();
    console.log(`Found ${logsData.length} email logs to migrate`);

    if (logsData.length > 0) {
      const pgLogs = logsData.map(item => ({
        userId: item.userId,
        emailSent: item.emailSent || false,
        sentAt: item.sentAt || null,
        demo: item.demo || false,
        error: item.error,
        errorAt: item.errorAt,
        createdAt: item.createdAt || new Date(),
        updatedAt: item.updatedAt || new Date()
      }));

      await models.EmailLog.bulkCreate(pgLogs);
      console.log(`Successfully migrated ${logsData.length} email logs`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close connections
    await mongoClient.close();
    console.log('Closed MongoDB connection');
  }
}

migrateFromMongo().catch(console.error);