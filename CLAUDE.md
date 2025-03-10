# Leader-Follower App Guide for AI Assistants

## Development Commands
- **Run dev server**: `npm run dev` (with auto-reload)
- **Start production**: `npm start`
- **Screenshots**: `npm run ai-capture` (creates screenshots in ai_captures/)
- **Deploy**: `npm run vercel-deploy` (test) or `npm run vercel-prod` (production)

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
- `server.js` - Main Express server
- Data stored in `user_data.jsonl` and `email_preferences.json`

## Core Functionality
This app helps users track their leader/follower identities over time using:
1. Daily grid-based reflections (LFIT-Reflector)
2. Visualization of patterns (LFIT-Reporter)
3. Email reminders for consistent usage