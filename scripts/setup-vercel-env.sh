#!/bin/bash
# Script to set up MongoDB environment variable for Vercel

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Display header
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Setting up MongoDB for Vercel Deployment       ${NC}"
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

# Function to setup MongoDB Atlas connection string
setup_mongodb() {
  echo -e "${BLUE}Setting up MongoDB Atlas connection string${NC}"
  echo ""
  echo -e "${YELLOW}You need a MongoDB Atlas account and connection string.${NC}"
  echo -e "If you don't have one, please follow the steps in VERCEL_SETUP.md"
  echo ""
  
  # Read MongoDB connection string
  read -p "Enter your MongoDB Atlas connection string: " MONGODB_URI
  
  if [[ -z "$MONGODB_URI" ]]; then
    echo -e "${RED}No connection string provided. Aborting.${NC}"
    exit 1
  fi
  
  # Check if the connection string looks valid
  if [[ ! "$MONGODB_URI" == mongodb+srv://* ]]; then
    echo -e "${YELLOW}Warning: The connection string doesn't start with 'mongodb+srv://'.${NC}"
    echo -e "It might not be a valid MongoDB Atlas connection string."
    read -p "Do you want to continue anyway? (y/n): " CONTINUE
    if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
      echo -e "${RED}Aborting.${NC}"
      exit 1
    fi
  fi
  
  echo -e "${BLUE}Setting MONGODB_URI environment variable for Vercel...${NC}"
  
  # Get the project name from vercel.json
  PROJECT_NAME=$(grep '"name":' vercel.json | head -1 | cut -d '"' -f 4)
  if [[ -z "$PROJECT_NAME" ]]; then
    PROJECT_NAME="leader-follower-app"
  fi
  
  # Add environment variable to Vercel project
  echo -e "${YELLOW}Adding environment variable to Vercel project ${PROJECT_NAME}...${NC}"
  vercel env add MONGODB_URI production <<< "$MONGODB_URI"
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to add environment variable to Vercel.${NC}"
    echo -e "You may need to add it manually in the Vercel dashboard."
    exit 1
  fi
  
  echo -e "${GREEN}Successfully added MONGODB_URI environment variable to Vercel!${NC}"
  echo ""
  echo -e "${BLUE}Next steps:${NC}"
  echo -e "1. Deploy your app with: ${YELLOW}npm run vercel-deploy${NC} (for testing)"
  echo -e "   or ${YELLOW}npm run vercel-prod${NC} (for production)"
  echo -e "2. Your app should now work with MongoDB!"
}

# Main script execution
ensure_login
setup_mongodb

exit 0