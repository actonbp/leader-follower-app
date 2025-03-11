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

# Run the server with its original transport (stdio)
node dist/index.js

# The server will now be running and waiting for input on stdin
# This is exactly what Cursor expects for a "command" type MCP server 