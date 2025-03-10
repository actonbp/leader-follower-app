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