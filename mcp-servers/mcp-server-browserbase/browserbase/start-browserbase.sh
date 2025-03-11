#!/bin/bash

# Set the environment variables
export BROWSERBASE_API_KEY=bb_live_X4aDGr_Il5_vWX50tFRPXbinPhc
export BROWSERBASE_PROJECT_ID=d868ded2-fe19-44b7-a02a-8296c919b15d

# Change to the script's directory
cd "$(dirname "$0")"

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