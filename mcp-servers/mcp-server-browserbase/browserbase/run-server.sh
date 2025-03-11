#!/bin/bash

# Set the environment variables
export BROWSERBASE_API_KEY=bb_live_X4aDGr_Il5_vWX50tFRPXbinPhc
export BROWSERBASE_PROJECT_ID=d868ded2-fe19-44b7-a02a-8296c919b15d

# Change to the script's directory
cd "$(dirname "$0")"

# Run the server with its original transport (stdio)
node dist/index.js

# The server will now be running and waiting for input on stdin
# This is exactly what Cursor expects for a "command" type MCP server 