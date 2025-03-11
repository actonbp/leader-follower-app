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

# Run the server with HTTP transport instead of stdio
node -e "
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { HttpServerTransport } = require('@modelcontextprotocol/sdk/server/http.js');
const serverCode = require('./dist/index.js');

// Extract the server from the code
const server = serverCode.default || serverCode.server;

// Create and start HTTP server on port 8080
const httpTransport = new HttpServerTransport({ port: 8080 });
server.connect(httpTransport).then(() => {
  console.log('Browserbase MCP server running on http://localhost:8080/sse');
});
"

# If the above doesn't work, uncomment this fallback approach:
# node dist/index.js 