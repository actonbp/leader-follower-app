# Neon PostgreSQL Setup for Leader-Follower App

This guide explains how to set up the Leader-Follower app for deployment on Vercel with Neon PostgreSQL - a serverless Postgres database.

## 1. Set Up Neon PostgreSQL

1. **Create a Neon account**
   - Go to [Neon](https://neon.tech) and sign up for a free account

2. **Create a new project**
   - After signing up, create a new project
   - Give it a name like "leader-follower-app"
   - Choose a region closest to your users

3. **Create a database**
   - In your new project, create a database named "leader_follower"
   - The default user is fine for this setup

4. **Get your connection string**
   - From your project dashboard, click on "Connection Details"
   - Select "Connect from anywhere" or "Connect from Vercel"
   - Copy the provided connection string that looks like:
     `postgresql://username:password@ep-something.us-east-1.aws.neon.tech/leader_follower?sslmode=require`

## 2. Local Development with Neon

1. **Set up your local environment**
   - Create a `.env` file in the project root (if not already done)
   - Add your Neon connection string:
     ```
     NEON_DATABASE_URL=postgresql://username:password@ep-something.us-east-1.aws.neon.tech/leader_follower?sslmode=require
     ```

2. **Install required packages**
   ```bash
   npm install pg pg-hstore sequelize
   ```

3. **Use the server-neon.js file**
   ```bash
   node server-neon.js
   ```
   - Or modify your package.json to use the new server:
     ```json
     "scripts": {
       "start": "node server-neon.js",
       "dev": "nodemon server-neon.js"
     }
     ```

## 3. Migrating Data from MongoDB

If you have existing data in MongoDB and want to migrate it to Neon PostgreSQL:

1. **Ensure both connection strings are in your `.env` file**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/leader-follower
   NEON_DATABASE_URL=postgresql://username:password@ep-something.us-east-1.aws.neon.tech/leader_follower?sslmode=require
   ```

2. **Run the migration script**
   ```bash
   node migrate-to-neon.js
   ```

## 4. Deploy to Vercel

1. **Set up Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Add your Neon connection string to Vercel environment variables**
   - Create or update your project on Vercel
   - Go to your project settings
   - Add the following environment variable:
     - Key: `NEON_DATABASE_URL`
     - Value: Your Neon connection string

4. **Update vercel.json**
   Make sure your vercel.json file points to the new server-neon.js file.
   Example:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "server-neon.js",
         "use": "@vercel/node"
       },
       {
         "src": "src/public/**",
         "use": "@vercel/static"
       }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "server-neon.js" },
       { "src": "/(.*)", "dest": "server-neon.js" }
     ]
   }
   ```

5. **Deploy to Vercel**
   ```bash
   vercel
   ```
   or for production:
   ```bash
   vercel --prod
   ```

## 5. Advanced Neon Features

Neon offers several features that can be useful for your application:

1. **Autoscaling**
   - Neon automatically scales compute and storage resources based on demand
   - Perfect for serverless Vercel deployments with variable traffic

2. **Branching**
   - Create database branches for development, staging, and testing
   - Helpful for testing database schema changes without affecting production

3. **Point-in-time Recovery**
   - Restore your database to any moment in time within the retention period
   - Protects against accidental data loss

4. **Connection Pooling**
   - Neon handles connection pooling automatically
   - Important for serverless environments where connections are frequently created and destroyed

## Troubleshooting

### Common Issues

1. **Connection Error**
   - Ensure your connection string is correct
   - Check that SSL is enabled with `sslmode=require`

2. **Database Timeouts**
   - Neon may scale down inactive projects. The first request might be slower.
   - This is normal for serverless databases

3. **Migration Failures**
   - Check your data types in both MongoDB and PostgreSQL
   - Ensure MongoDB data is properly formatted for Postgres
   - Run migrations in smaller batches

4. **Sequelize Errors**
   - Ensure model definitions match the actual database schema
   - Check for proper table/column names

### Support

If you encounter issues:
- Check the [Neon documentation](https://neon.tech/docs)
- Visit the [Neon Community forum](https://community.neon.tech)
- Contact Neon support through your dashboard