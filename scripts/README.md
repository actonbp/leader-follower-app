# Screenshot and Capture Scripts

This directory contains various scripts for capturing screenshots and HTML snapshots of the Leader-Follower Identity Tracker (LFIT) application. These scripts are designed to work in different environments, from local development with a GUI to remote SSH sessions without a display.

## Available Scripts

### For Local Development (with GUI)

- **`npm run screenshots`**: Basic screenshot capture of main pages
- **`npm run capture-screens`**: Comprehensive screenshot capture with navigation
- **`npm run simple-capture`**: Simplified screenshot capture that's more robust

### For Remote/SSH Environments (without GUI)

- **`npm run ssh-capture`**: Optimized for headless environments with special browser arguments
- **`npm run html-capture`**: Captures both screenshots and HTML content, with fallback to HTML-only
- **`npm run terminal-capture`**: Uses only Node.js built-in modules (no Puppeteer) to capture HTML content

### For AI Analysis

- **`npm run ai-capture`**: Comprehensive capture of screenshots and HTML with detailed summary for AI analysis

### For Deployment

- **`npm run vercel-login`**: Login to Vercel
- **`npm run vercel-deploy`**: Deploy to Vercel (preview)
- **`npm run vercel-prod`**: Deploy to Vercel (production)

## Usage Instructions

### Prerequisites

- Node.js and npm installed
- Application running on localhost:3000 (`npm run dev` in a separate terminal)

### Local Usage

```bash
# Start the application in one terminal
npm run dev

# In another terminal, run one of the screenshot scripts
npm run screenshots
```

### Remote/SSH Usage

When working in an SSH session without a display:

```bash
# Start the application
npm run dev

# Use one of the SSH-friendly scripts
npm run terminal-capture
```

### AI Analysis Usage

To capture screenshots and HTML specifically for AI analysis:

```bash
# Start the application in the background
npm run dev &

# Capture screenshots and HTML for AI analysis
npm run ai-capture
```

This will create a directory called `ai_captures` containing:
- PNG screenshots of each page
- HTML snapshots of each page
- A summary markdown file (AI_SUMMARY.md) that explains what each file is

### Deployment Usage

To deploy the application to Vercel:

```bash
# Login to Vercel (first time only)
npm run vercel-login

# Create a preview deployment
npm run vercel-deploy

# Deploy to production
npm run vercel-prod
```

## Output Locations

- Screenshots: `./screenshots/`
- HTML snapshots: `./html_snapshots/`
- Terminal captures: `./terminal_captures/`
- AI captures: `./ai_captures/`

## Script Details

### take-screenshots.js
Basic screenshot capture of main pages using Puppeteer.

### capture-app-screens.js
Comprehensive screenshot capture with navigation through different screens.

### simple-capture.js
Simplified screenshot capture that's more robust for general use.

### ssh-friendly-capture.js
Optimized for headless environments with special browser arguments for SSH sessions.

### html-capture.js
Captures both screenshots and HTML content, with fallback to HTML-only if screenshots fail.

### terminal-capture.js
Uses only Node.js built-in modules (no Puppeteer) to capture HTML content, perfect for minimal environments.

### ai-capture.js
Comprehensive capture of screenshots and HTML with detailed summary specifically designed for AI analysis.

### ssh-helper.sh
Helper script for SSH access and capturing screenshots remotely.

### deploy-vercel.sh
Helper script for deploying the application to Vercel.

## Troubleshooting

If you encounter issues with Puppeteer in headless environments:

1. Try the `terminal-capture` script which doesn't use Puppeteer
2. Ensure you have the necessary dependencies for Puppeteer (if using other scripts):
   ```bash
   sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
   ``` 