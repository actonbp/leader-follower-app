// db.js - MongoDB connection utility
const { MongoClient } = require('mongodb');

// MongoDB Atlas connection string
// This should be in your environment variables on Vercel
// For local development, you can use .env file
const uri = process.env.MONGODB_URI || "mongodb+srv://<username>:<password>@<cluster-url>/leader-follower?retryWrites=true&w=majority";

// Create a MongoDB client
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connection variable
let cachedDb = null;

// Connect to the database
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    // Connect the client
    await client.connect();
    const db = client.db('leader-follower');
    
    // Cache the database connection
    cachedDb = db;
    console.log("Connected to MongoDB Atlas");
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

// Function to get collection
async function getCollection(collectionName) {
  const db = await connectToDatabase();
  return db.collection(collectionName);
}

module.exports = {
  connectToDatabase,
  getCollection,
};