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

#### Environment Setup

1. Set up Vercel environment variables:
   ```
   npm run vercel-setup:neon
   ```
   This will add the `NEON_DATABASE_URL` to all environments (development, preview, production).

#### Best Practice for GitHub-based Deployments

For a safer deployment workflow with multiple environments:

1. Use different branches for different environments:
   - `main` branch → Production environment
   - `development` branch → Preview/staging environment
   - Feature branches → Preview environments for testing

2. Deploy workflow:
   ```bash
   # For development/staging (deploys to a preview URL)
   git checkout development
   # Make your changes
   git commit -am "Your changes"
   git push origin development
   npm run vercel-deploy:neon

   # When ready for production (after testing in preview)
   git checkout main
   git merge development
   git push origin main
   npm run vercel-prod:neon
   ```

3. To deploy any branch for testing:
   ```
   npm run vercel-deploy:neon   # Deploys current branch to preview URL
   npm run vercel-prod:neon     # Deploys current branch to production
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