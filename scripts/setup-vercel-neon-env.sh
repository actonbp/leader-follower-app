#!/bin/bash

# Setup script for Vercel environment variables for Neon PostgreSQL

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found! Please install it with 'npm install -g vercel'"
    exit 1
fi

# Make sure user is logged in
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "You are not logged in to Vercel. Please run 'vercel login' first."
    exit 1
fi

echo "Setting up Neon PostgreSQL environment variables for Vercel..."
echo

# Ask for Neon connection string
read -p "Enter your Neon PostgreSQL connection string: " NEON_DATABASE_URL

# Validate connection string format
if [[ ! $NEON_DATABASE_URL =~ ^postgresql://.*@.*/.* ]]; then
    echo "Invalid Neon connection string format. It should look like:"
    echo "postgresql://username:password@hostname/database?sslmode=require"
    exit 1
fi

# Set environment variables for development, preview, and production
echo "Setting NEON_DATABASE_URL for all environments..."
vercel env add NEON_DATABASE_URL production <<< "$NEON_DATABASE_URL"
vercel env add NEON_DATABASE_URL preview <<< "$NEON_DATABASE_URL"
vercel env add NEON_DATABASE_URL development <<< "$NEON_DATABASE_URL"

echo
echo "Environment variables set successfully!"
echo "You can now deploy your app with 'npm run vercel-deploy:neon' or 'npm run vercel-prod:neon'"