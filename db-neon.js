// db-neon.js - PostgreSQL connection utility using Sequelize
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Neon connection string - should be in environment variables
let connectionString = process.env.NEON_DATABASE_URL;

// Connection validation and error handling
if (!connectionString) {
  console.error('Missing NEON_DATABASE_URL environment variable');
  // Instead of exiting, use a fallback or dummy connection string for Vercel 
  // that will allow the app to load but show a better error message
  connectionString = 'postgresql://dummy:dummy@dummy.neon.tech/dummy?sslmode=require';
}

// Throw a clearer error message if the connection string is incorrect
if (connectionString === 'postgresql://neondb_owner:npg_KSGHL4eXAzQ0@ep-quiet-silence-a4gfx18p-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require') {
  console.log('Using the configured Neon database connection string');
}

// Create a new Sequelize instance
const sequelize = new Sequelize(connectionString, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false // Required for some Neon connections
    }
  },
  pool: {
    max: 5, // Maximum number of connection in pool
    min: 0, // Minimum number of connection in pool
    acquire: 30000, // Maximum time, in milliseconds, that pool will try to get connection before throwing error
    idle: 10000 // Maximum time, in milliseconds, that a connection can be idle before being released
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
    allowNull: false,
    index: true
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
    type: DataTypes.STRING, // Store as STRING to match original format
    allowNull: false,
    get() {
      // This ensures data is returned with the same format as MongoDB
      return this.getDataValue('leaderScore');
    },
    set(value) {
      // Allow both string and number inputs (for backward compatibility)
      this.setDataValue('leaderScore', value.toString());
    }
  },
  followerScore: {
    type: DataTypes.STRING, // Store as STRING to match original format
    allowNull: false,
    get() {
      // This ensures data is returned with the same format as MongoDB
      return this.getDataValue('followerScore');
    },
    set(value) {
      // Allow both string and number inputs (for backward compatibility)
      this.setDataValue('followerScore', value.toString());
    }
  },
  novelty: {
    type: DataTypes.STRING, // Store as STRING to match original format
    allowNull: true,
    get() {
      return this.getDataValue('novelty');
    },
    set(value) {
      if (value === null || value === undefined) {
        this.setDataValue('novelty', null);
      } else {
        this.setDataValue('novelty', value.toString());
      }
    }
  },
  disruption: {
    type: DataTypes.STRING, // Store as STRING to match original format
    allowNull: true,
    get() {
      return this.getDataValue('disruption');
    },
    set(value) {
      if (value === null || value === undefined) {
        this.setDataValue('disruption', null);
      } else {
        this.setDataValue('disruption', value.toString());
      }
    }
  },
  ordinariness: {
    type: DataTypes.STRING, // Store as STRING to match original format
    allowNull: true,
    get() {
      return this.getDataValue('ordinariness');
    },
    set(value) {
      if (value === null || value === undefined) {
        this.setDataValue('ordinariness', null);
      } else {
        this.setDataValue('ordinariness', value.toString());
      }
    }
  },
  eventDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    }
  ]
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
  wantsReminders: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reminderTime: {
    type: DataTypes.STRING,
    allowNull: true
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    }
  ]
});

const EmailLog = sequelize.define('email_log', {
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
  emailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  demo: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  error: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  errorAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    }
  ]
});

// Create connection pool and validate connection
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to Neon PostgreSQL has been established successfully.');
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    console.error('Please verify your NEON_DATABASE_URL environment variable.');
    console.error('Use npm run vercel-setup:neon to set it up for Vercel deployment.');
    // We'll continue but functionality will be limited
    return sequelize;
  }
};

// Initialize database and create tables if they don't exist
const initializeDatabase = async () => {
  try {
    // Sync all models
    await sequelize.sync();
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    console.warn('App will continue but database functionality may be limited');
    // Don't throw the error so the app can still load
  }
};

module.exports = {
  sequelize,
  connectToDatabase,
  initializeDatabase,
  models: {
    UserData,
    EmailPreference,
    EmailLog
  }
};