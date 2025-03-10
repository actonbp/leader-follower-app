// db-neon.js - PostgreSQL connection utility optimized for serverless environments
const { Sequelize, DataTypes } = require('sequelize');
const { Pool } = require('pg');
const { parse } = require('pg-connection-string');
require('dotenv').config();

// Use the recommended variable from Neon
let connectionString = process.env.DATABASE_URL;

// Connection validation and error handling
if (!connectionString) {
  console.error('Missing DATABASE_URL environment variable');
  // Instead of exiting, use a fallback or dummy connection string for Vercel 
  // that will allow the app to load but show a better error message
  connectionString = 'postgresql://dummy:dummy@dummy.neon.tech/dummy?sslmode=require';
}

// Create a new pool for each serverless invocation
const pool = new Pool({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

// Create a new Sequelize instance with serverless-friendly options
const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: false, // Disable logging in production
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 2,
    min: 0,
    idle: 5000
  }
});

// Define models
const UserData = sequelize.define('user_data', {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  submitTime: {
    type: DataTypes.STRING,
    allowNull: false
  },
  leaderScore: {
    type: DataTypes.STRING,
    allowNull: false
  },
  followerScore: {
    type: DataTypes.STRING,
    allowNull: false
  },
  novelty: {
    type: DataTypes.STRING,
    allowNull: true
  },
  disruption: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ordinariness: {
    type: DataTypes.STRING,
    allowNull: true
  },
  eventDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

const EmailPreference = sequelize.define('email_preference', {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  wantsReminders: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  reminderTime: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

const EmailLog = sequelize.define('email_log', {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

// Make sure to close connections after use
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release(); // Important for serverless
  }
};

// Connect to the database
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to Neon PostgreSQL has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

// Initialize the database (sync models)
const initializeDatabase = async () => {
  try {
    await sequelize.sync();
    console.log('Database synchronized successfully');
    return true;
  } catch (error) {
    console.error('Error synchronizing database:', error);
    return false;
  }
};

// Export models and functions
module.exports = {
  models: {
    UserData,
    EmailPreference,
    EmailLog
  },
  sequelize,
  connectToDatabase,
  initializeDatabase,
  query // Export the direct query method for serverless use
};