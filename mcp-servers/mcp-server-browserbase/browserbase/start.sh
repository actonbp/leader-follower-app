#!/bin/bash

# Change to the script's directory
cd "$(dirname "$0")"

# Load environment variables from .env file if present
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | xargs)
else
  echo "Warning: .env file not found. Make sure to set BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID environment variables."
fi

# Check if environment variables are set
if [ -z "$BROWSERBASE_API_KEY" ] || [ -z "$BROWSERBASE_PROJECT_ID" ]; then
  echo "Error: BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID must be set in .env file or environment."
  exit 1
fi

node --no-warnings dist/index.js 