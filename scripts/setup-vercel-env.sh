#!/bin/bash
# Script to set up Neon PostgreSQL environment variable for Vercel

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Display header
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Setting up Neon PostgreSQL for Vercel Deployment${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install Vercel CLI. Please install it manually:${NC}"
        echo -e "npm install -g vercel"
        exit 1
    fi
    echo -e "${GREEN}Vercel CLI installed successfully!${NC}"
fi

# Function to login to Vercel if not already logged in
ensure_login() {
  echo -e "${YELLOW}Checking Vercel login status...${NC}"
  # Try to perform a minimal command to check login status
  vercel projects ls --limit 1 > /dev/null 2>&1
  if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Not logged in. Logging in to Vercel...${NC}"
    vercel login
    if [ $? -ne 0 ]; then
      echo -e "${RED}Failed to login to Vercel.${NC}"
      exit 1
    fi
    echo -e "${GREEN}Successfully logged in to Vercel!${NC}"
  else
    echo -e "${GREEN}Already logged in to Vercel.${NC}"
  fi
}

# Function to setup Neon PostgreSQL connection string
setup_neon() {
  echo -e "${BLUE}Setting up Neon PostgreSQL connection string${NC}"
  echo ""
  echo -e "${YELLOW}You need a Neon PostgreSQL account and connection string.${NC}"
  echo -e "If you don't have one, please follow the steps in NEON_SETUP.md"
  echo ""
  
  # Read Neon connection string
  read -p "Enter your Neon PostgreSQL connection string: " NEON_DATABASE_URL
  
  if [[ -z "$NEON_DATABASE_URL" ]]; then
    echo -e "${RED}No connection string provided. Aborting.${NC}"
    exit 1
  fi
  
  # Check if the connection string looks valid
  if [[ ! "$NEON_DATABASE_URL" == postgresql://* ]]; then
    echo -e "${YELLOW}Warning: The connection string doesn't start with 'postgresql://'.${NC}"
    echo -e "It might not be a valid Neon PostgreSQL connection string."
    read -p "Do you want to continue anyway? (y/n): " CONTINUE
    if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
      echo -e "${RED}Aborting.${NC}"
      exit 1
    fi
  fi
  
  echo -e "${BLUE}Setting NEON_DATABASE_URL environment variable for Vercel...${NC}"
  
  # Get the project name from vercel.json
  PROJECT_NAME=$(grep '"name":' vercel.json | head -1 | cut -d '"' -f 4)
  if [[ -z "$PROJECT_NAME" ]]; then
    PROJECT_NAME="leader-follower-app"
  fi
  
  # Add environment variable to Vercel project for all environments
  echo -e "${YELLOW}Adding environment variable to Vercel project ${PROJECT_NAME}...${NC}"
  vercel env add NEON_DATABASE_URL production <<< "$NEON_DATABASE_URL"
  vercel env add NEON_DATABASE_URL preview <<< "$NEON_DATABASE_URL"
  vercel env add NEON_DATABASE_URL development <<< "$NEON_DATABASE_URL"
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to add environment variable to Vercel.${NC}"
    echo -e "You may need to add it manually in the Vercel dashboard."
    exit 1
  fi
  
  echo -e "${GREEN}Successfully added NEON_DATABASE_URL environment variable to Vercel!${NC}"
  
  # Ask for email configuration (optional)
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
  echo -e "${BLUE}Next steps:${NC}"
  echo -e "1. Deploy your app with: ${YELLOW}npm run vercel-deploy${NC} (for testing)"
  echo -e "   or ${YELLOW}npm run vercel-prod${NC} (for production)"
  echo -e "2. Your app should now work with Neon PostgreSQL!"
}

# Main script execution
ensure_login
setup_neon

exit 0