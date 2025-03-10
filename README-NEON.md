# Migrating to Neon PostgreSQL

This document explains how the Leader-Follower app has been migrated from MongoDB to Neon PostgreSQL for better Vercel integration.

## Files Added

- `db-neon.js` - Database connection and models for Neon PostgreSQL
- `server-neon.js` - Server version that uses Neon instead of MongoDB
- `migrate-to-neon.js` - Migration script for data
- `NEON_SETUP.md` - Detailed setup instructions
- `vercel-neon.json` - Vercel configuration for Neon deployment
- `scripts/setup-vercel-neon-env.sh` - Script to set up Vercel environment variables

## Using the Neon Version

### Local Development

1. Create a Neon account at [neon.tech](https://neon.tech) and get your connection string
2. Add it to your `.env` file:
   ```
   NEON_DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
   ```
3. Start the server with:
   ```
   npm run dev:neon
   ```

### Data Migration

To migrate data from MongoDB to Neon:

1. Ensure both MongoDB and Neon connection strings are in your `.env` file
2. Run:
   ```
   npm run migrate-to-neon
   ```

### Vercel Deployment

1. Set up Vercel environment variables:
   ```
   npm run vercel-setup:neon
   ```
2. Deploy:
   ```
   npm run vercel-deploy:neon   # For testing
   npm run vercel-prod:neon     # For production
   ```

## Data Compatibility

The Neon version maintains full compatibility with the existing frontend code by:

1. Storing numeric values as strings to match the original format
2. Using the same API endpoints with identical response structure
3. Preserving all field names and formats

## Benefits of Neon

- **Serverless Architecture**: Perfect for Vercel's serverless deployment
- **Auto-scaling**: Database resources scale with your usage
- **Connection Pooling**: Handles serverless connection patterns
- **Branching**: Create database branches for development/testing
- **Standard PostgreSQL**: Use familiar SQL and tools

## Switching Between Versions

You can easily switch between MongoDB and Neon versions:

- MongoDB: `npm run dev` and `npm run vercel-deploy`
- Neon: `npm run dev:neon` and `npm run vercel-deploy:neon`

Both versions can run side by side with different databases.