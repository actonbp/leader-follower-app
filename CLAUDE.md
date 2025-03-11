# Leader-Follower App Guide for AI Assistants

## Development Commands
- **Run dev server**: `npm run dev` (with auto-reload)
- **Run with Neon DB**: `npm run dev:neon` (with auto-reload)
- **Start production**: `npm start`
- **Start with Neon DB**: `npm run start:neon`
- **Create test data**: `npm run create-test-data` (creates TEST01 user with sample data)
- **Screenshots**: `npm run ai-capture` (creates screenshots in ai_captures/)
- **List images**: `npm run list-images` (shows available screenshots with descriptions)
- **Deploy with MongoDB**: `npm run vercel-deploy` (test) or `npm run vercel-prod` (production)
- **Deploy with Neon**: `npm run vercel-deploy:neon` (test) or `npm run vercel-prod:neon` (production)
- **Setup Vercel for Neon**: `npm run vercel-setup:neon`

## MCP Server Credentials
- **Browserbase API Key**: `bb_live_X4aDGr_Il5_vWX50tFRPXbinPhc`
- **Browserbase Project ID**: `d868ded2-fe19-44b7-a02a-8296c919b15d`

## MCP Server Setup & Usage

### Setting up Browserbase MCP
1. Configure the MCP server for Claude Code:
   ```bash
   claude mcp add-json Browserbase '{
     "type": "stdio", 
     "command": "node",
     "args": ["path/to/mcp-servers/mcp-server-browserbase/browserbase/dist/index.js"],
     "env": {
       "BROWSERBASE_API_KEY": "bb_live_X4aDGr_Il5_vWX50tFRPXbinPhc", 
       "BROWSERBASE_PROJECT_ID": "d868ded2-fe19-44b7-a02a-8296c919b15d"
     }
   }'
   ```
   - Replace `path/to` with your actual project path

2. Verify configuration:
   ```bash
   claude mcp get Browserbase
   ```

### Using Browserbase MCP Tools
Use these tools to automate browser tasks:
- `browserbase_create_session` - Create a new browser session
- `browserbase_navigate` - Visit a URL (e.g., https://lfit.me)
- `browserbase_screenshot` - Take a screenshot
- `browserbase_get_content` - Extract page content
- `browserbase_click` - Click elements by CSS selector
- `browserbase_fill` - Fill form fields

### Manual Server Commands
- **Start Browserbase MCP**: `/Users/acton/Documents/GitHub/leader-follower-app/mcp-servers/mcp-server-browserbase/browserbase/run-server.sh` 
- **Start Stagehand MCP**: `npm run mcp:stagehand` (requires OpenAI API key)

## Code Style
- **JS**: ES6, CommonJS imports, semicolons, camelCase for variables/functions
- **CSS**: Mobile-first with media queries (768px, 480px), flexbox layouts
- **Components**: Single page app with sections toggled via display property
- **Naming**: descriptive, action-verb for functions (e.g., `saveUserData`)
- **Error handling**: try/catch with console.error() and user-friendly messages

## Project Structure
- `/src/public/` - Frontend assets (HTML/CSS/JS)
- `/src/routes/` - Express API routes
- `/scripts/` - Utility scripts for screenshots
- `server.js` - Main Express server (MongoDB version)
- `server-neon.js` - Express server with Neon PostgreSQL
- `db.js` - MongoDB connection
- `db-neon.js` - Neon PostgreSQL connection and models
- `migrate-to-neon.js` - Data migration from MongoDB to Neon

## Core Functionality
This app helps users track their leader/follower identities over time using:
1. Daily grid-based reflections (LFIT-Reflector)
2. Visualization of patterns (LFIT-Reporter)
3. Email reminders for consistent usage