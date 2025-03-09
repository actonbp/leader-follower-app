#!/bin/bash
# SSH Helper Script for Leader-Follower Identity Tracker
# This script helps with SSH access and capturing screenshots remotely

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Display header
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Leader-Follower Identity Tracker SSH Helper    ${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Function to display help
show_help() {
  echo -e "${YELLOW}Usage:${NC}"
  echo -e "  ./ssh-helper.sh [command]"
  echo ""
  echo -e "${YELLOW}Commands:${NC}"
  echo -e "  ${GREEN}start${NC}           Start the application in the background"
  echo -e "  ${GREEN}stop${NC}            Stop the application"
  echo -e "  ${GREEN}capture${NC}         Capture screenshots for AI analysis"
  echo -e "  ${GREEN}terminal-capture${NC} Capture HTML only (no browser required)"
  echo -e "  ${GREEN}help${NC}            Show this help message"
  echo ""
  echo -e "${YELLOW}Examples:${NC}"
  echo -e "  ./ssh-helper.sh start"
  echo -e "  ./ssh-helper.sh capture"
  echo ""
}

# Function to start the application
start_app() {
  echo -e "${YELLOW}Starting the application in the background...${NC}"
  npm run dev &
  echo -e "${GREEN}Application started! Server running at http://localhost:3000${NC}"
  echo -e "Process ID: $!"
  echo -e "To stop the application, run: ${BLUE}./ssh-helper.sh stop${NC}"
}

# Function to stop the application
stop_app() {
  echo -e "${YELLOW}Stopping the application...${NC}"
  pkill -f "node server.js"
  echo -e "${GREEN}Application stopped!${NC}"
}

# Function to capture screenshots for AI analysis
capture_screenshots() {
  echo -e "${YELLOW}Capturing screenshots and HTML for AI analysis...${NC}"
  npm run ai-capture
  echo -e "${GREEN}Capture complete!${NC}"
  echo -e "Screenshots and HTML saved to: ${BLUE}./ai_captures/${NC}"
  echo -e "To view the summary, check: ${BLUE}./ai_captures/AI_SUMMARY.md${NC}"
}

# Function to capture HTML only (no browser required)
terminal_capture() {
  echo -e "${YELLOW}Capturing HTML only (no browser required)...${NC}"
  npm run terminal-capture
  echo -e "${GREEN}Capture complete!${NC}"
  echo -e "HTML saved to: ${BLUE}./terminal_captures/${NC}"
}

# Process command line arguments
if [ $# -eq 0 ]; then
  show_help
  exit 0
fi

case "$1" in
  start)
    start_app
    ;;
  stop)
    stop_app
    ;;
  capture)
    capture_screenshots
    ;;
  terminal-capture)
    terminal_capture
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