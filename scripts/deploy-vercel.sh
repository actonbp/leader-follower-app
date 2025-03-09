#!/bin/bash
# Vercel Deployment Script for Leader-Follower Identity Tracker

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Display header
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Leader-Follower Identity Tracker Deployment    ${NC}"
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

# Function to display help
show_help() {
  echo -e "${YELLOW}Usage:${NC}"
  echo -e "  ./deploy-vercel.sh [command]"
  echo ""
  echo -e "${YELLOW}Commands:${NC}"
  echo -e "  ${GREEN}login${NC}      Login to Vercel"
  echo -e "  ${GREEN}deploy${NC}     Deploy to Vercel (preview)"
  echo -e "  ${GREEN}prod${NC}       Deploy to Vercel (production)"
  echo -e "  ${GREEN}help${NC}       Show this help message"
  echo ""
  echo -e "${YELLOW}Examples:${NC}"
  echo -e "  ./deploy-vercel.sh login"
  echo -e "  ./deploy-vercel.sh deploy"
  echo -e "  ./deploy-vercel.sh prod"
  echo ""
}

# Function to login to Vercel
login_vercel() {
  echo -e "${YELLOW}Logging in to Vercel...${NC}"
  vercel login
  if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to login to Vercel.${NC}"
    exit 1
  fi
  echo -e "${GREEN}Successfully logged in to Vercel!${NC}"
}

# Function to deploy to Vercel (preview)
deploy_preview() {
  echo -e "${YELLOW}Deploying to Vercel (preview)...${NC}"
  echo -e "${BLUE}This will create a preview deployment.${NC}"
  
  # Check if .env file exists
  if [ -f .env ]; then
    echo -e "${YELLOW}Warning: .env file detected. Make sure to set up environment variables in Vercel dashboard.${NC}"
  fi
  
  # Deploy to Vercel
  vercel
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Deployment failed.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Preview deployment successful!${NC}"
  echo -e "Visit the URL above to view your deployment."
}

# Function to deploy to Vercel (production)
deploy_production() {
  echo -e "${YELLOW}Deploying to Vercel (production)...${NC}"
  echo -e "${BLUE}This will create a production deployment.${NC}"
  
  # Check if .env file exists
  if [ -f .env ]; then
    echo -e "${YELLOW}Warning: .env file detected. Make sure to set up environment variables in Vercel dashboard.${NC}"
  fi
  
  # Deploy to Vercel production
  vercel --prod
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Production deployment failed.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Production deployment successful!${NC}"
  echo -e "Your application is now live at the URL above."
}

# Process command line arguments
if [ $# -eq 0 ]; then
  show_help
  exit 0
fi

case "$1" in
  login)
    login_vercel
    ;;
  deploy)
    deploy_preview
    ;;
  prod)
    deploy_production
    ;;
  help)
    show_help
    ;;
  *)
    echo -e "${RED}Unknown command: $1${NC}"
    show_help
    exit 1
    ;;
esac

exit 0 