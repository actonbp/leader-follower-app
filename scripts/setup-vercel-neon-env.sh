#!/bin/bash

# Setup script for Vercel environment variables for Neon PostgreSQL

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}Vercel CLI not found! Please install it with 'npm install -g vercel'${NC}"
    exit 1
fi

# Make sure user is logged in
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}You are not logged in to Vercel. Logging you in now...${NC}"
    vercel login
    if [ $? -ne 0 ]; then
        echo -e "${RED}Login failed. Please run 'vercel login' manually and try again.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Login successful!${NC}"
fi

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Setting up Neon PostgreSQL for Vercel Deployment${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Ask if they want to setup separate environments
echo -e "${YELLOW}Do you want to set up separate database branches for different environments?${NC}"
echo -e "This is a best practice for development workflows."
echo -e "1. Production: Main branch of your database"
echo -e "2. Preview: Development branch for staging/testing"
echo ""
read -p "Set up separate environments? (y/n): " SEPARATE_ENV

if [[ $SEPARATE_ENV == "y" || $SEPARATE_ENV == "Y" ]]; then
    # Production environment
    echo ""
    echo -e "${BLUE}Setting up PRODUCTION environment${NC}"
    read -p "Enter your PRODUCTION Neon PostgreSQL connection string: " PROD_DATABASE_URL

    # Validate connection string format
    if [[ ! $PROD_DATABASE_URL =~ ^postgresql://.*@.*/.* ]]; then
        echo -e "${RED}Invalid Neon connection string format. It should look like:${NC}"
        echo "postgresql://username:password@hostname/database?sslmode=require"
        exit 1
    fi

    # Development/Preview environment
    echo ""
    echo -e "${BLUE}Setting up PREVIEW/DEVELOPMENT environment${NC}"
    echo -e "${YELLOW}Do you have a separate database branch for development?${NC}"
    read -p "Enter PREVIEW Neon connection string (or press ENTER to use same as production): " DEV_DATABASE_URL

    if [[ -z "$DEV_DATABASE_URL" ]]; then
        echo -e "${YELLOW}Using production database for preview deployments.${NC}"
        echo -e "${YELLOW}You can create a development branch later with: npm run neon-branch${NC}"
        DEV_DATABASE_URL=$PROD_DATABASE_URL
    elif [[ ! $DEV_DATABASE_URL =~ ^postgresql://.*@.*/.* ]]; then
        echo -e "${RED}Invalid connection string format. Using production database for preview.${NC}"
        DEV_DATABASE_URL=$PROD_DATABASE_URL
    fi

    # Set environment variables for each environment
    echo ""
    echo -e "${BLUE}Setting environment variables in Vercel...${NC}"
    
    echo -e "${YELLOW}Setting NEON_DATABASE_URL for PRODUCTION...${NC}"
    vercel env add NEON_DATABASE_URL production <<< "$PROD_DATABASE_URL"
    
    echo -e "${YELLOW}Setting NEON_DATABASE_URL for PREVIEW...${NC}"
    vercel env add NEON_DATABASE_URL preview <<< "$DEV_DATABASE_URL"
    
    echo -e "${YELLOW}Setting NEON_DATABASE_URL for DEVELOPMENT...${NC}"
    vercel env add NEON_DATABASE_URL development <<< "$DEV_DATABASE_URL"

else
    # Single environment for all
    echo ""
    read -p "Enter your Neon PostgreSQL connection string: " NEON_DATABASE_URL

    # Validate connection string format
    if [[ ! $NEON_DATABASE_URL =~ ^postgresql://.*@.*/.* ]]; then
        echo -e "${RED}Invalid Neon connection string format. It should look like:${NC}"
        echo "postgresql://username:password@hostname/database?sslmode=require"
        exit 1
    fi

    # Set environment variables for all environments
    echo -e "${BLUE}Setting NEON_DATABASE_URL for all environments...${NC}"
    vercel env add NEON_DATABASE_URL production <<< "$NEON_DATABASE_URL"
    vercel env add NEON_DATABASE_URL preview <<< "$NEON_DATABASE_URL"
    vercel env add NEON_DATABASE_URL development <<< "$NEON_DATABASE_URL"
fi

# Ask for email configuration (optional)
echo ""
echo -e "${BLUE}Do you want to set up email credentials? (y/n):${NC}"
read SETUP_EMAIL
if [[ $SETUP_EMAIL == "y" || $SETUP_EMAIL == "Y" ]]; then
    read -p "Enter your email address: " EMAIL_USER
    read -s -p "Enter your email app password: " EMAIL_PASS
    echo ""

    # Set email environment variables for all environments
    echo -e "${YELLOW}Adding email environment variables...${NC}"
    vercel env add EMAIL_USER production <<< "$EMAIL_USER"
    vercel env add EMAIL_USER preview <<< "$EMAIL_USER"
    vercel env add EMAIL_USER development <<< "$EMAIL_USER"

    vercel env add EMAIL_PASS production <<< "$EMAIL_PASS"
    vercel env add EMAIL_PASS preview <<< "$EMAIL_PASS"
    vercel env add EMAIL_PASS development <<< "$EMAIL_PASS"
    
    echo -e "${GREEN}Successfully added email environment variables!${NC}"
fi

echo ""
echo -e "${GREEN}Environment variables set successfully!${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Deploy to PREVIEW (from development branch):"
echo -e "   ${YELLOW}git checkout development${NC}"
echo -e "   ${YELLOW}npm run vercel-deploy:neon${NC}"
echo -e ""
echo -e "2. Deploy to PRODUCTION:"
echo -e "   ${YELLOW}git checkout main${NC}"
echo -e "   ${YELLOW}npm run vercel-prod:neon${NC}"
echo -e "${BLUE}==================================================${NC}"