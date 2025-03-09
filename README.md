# Leader-Follower Identity Tracker (LFIT)

A web application for tracking and visualizing leader and follower identity dynamics over time.

## Overview

The Leader-Follower Identity Tracker (LFIT) helps users reflect on the changing nature of their leader and follower identities. It provides two main components:

1. **LFIT-Reflector**: A tool for daily reflections on leader and follower identities
2. **LFIT-Reporter**: A visualization dashboard for analyzing reflection data over time

## Repository Structure

```
leader-follower-app/
├── src/                    # Application source code
│   ├── public/             # Frontend assets (HTML, CSS, JS)
│   ├── routes/             # Express route handlers
│   └── views/              # View templates
├── scripts/                # Utility scripts for screenshots and captures
├── screenshots/            # Screenshots of the application
├── ai_captures/            # Screenshots and HTML for AI analysis
├── terminal_captures/      # Terminal-friendly HTML captures
├── config/                 # Configuration files
├── tests/                  # Test files
├── server.js               # Main application entry point
├── package.json            # Project dependencies and scripts
└── .env                    # Environment variables
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/leader-follower-app.git
   cd leader-follower-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   EMAIL_USER=your-email@example.com
   EMAIL_PASS=your-email-password
   PORT=3000
   ```

## Running the Application

### Local Development

Start the application in development mode with auto-reloading:

```bash
npm run dev
```

Or start without auto-reloading:

```bash
npm start
```

The application will be available at http://localhost:3000

## Deployment

### Deploying to Vercel

This application is configured for easy deployment to Vercel:

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy the application:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

Alternatively, you can deploy directly from the Vercel dashboard:

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign up/login
3. Click "New Project" and import your GitHub repository
4. Configure the project settings:
   - Framework Preset: Other
   - Build Command: None (leave empty)
   - Output Directory: None (leave empty)
   - Install Command: `npm install`
   - Development Command: `npm run dev`
5. Add environment variables from your `.env` file
6. Click "Deploy"

Your application will be deployed and available at a Vercel URL (e.g., `https://leader-follower-app.vercel.app`).

## SSH Access and Remote Development

### Connecting via SSH

To connect to the server hosting this application:

```bash
ssh -i /path/to/your-key.pem user@server-address
```

If using the included key (for authorized users only):

```bash
ssh -i ai_team.pem user@server-address
```

### SSH Helper Script

For convenience, a helper script is provided to simplify common tasks when working via SSH:

```bash
# Make the script executable (first time only)
chmod +x scripts/ssh-helper.sh

# Show available commands
./scripts/ssh-helper.sh help

# Start the application in the background
./scripts/ssh-helper.sh start

# Capture screenshots for AI analysis
./scripts/ssh-helper.sh capture

# Capture HTML only (no browser required)
./scripts/ssh-helper.sh terminal-capture

# Stop the application
./scripts/ssh-helper.sh stop
```

### Running the Application Remotely

1. Connect to the server via SSH
2. Navigate to the application directory:
   ```bash
   cd /path/to/leader-follower-app
   ```
3. Start the application:
   ```bash
   npm run dev
   ```

### Capturing Screenshots Remotely

This repository includes several scripts for capturing screenshots and HTML snapshots of the application, which is especially useful when working via SSH without a GUI.

#### For AI Analysis

To capture screenshots and HTML for AI analysis:

```bash
# Start the application in the background
npm run dev &

# Capture screenshots and HTML for AI analysis
npm run ai-capture
```

This will create a directory called `ai_captures` containing:
- PNG screenshots of each page
- HTML snapshots of each page
- A summary markdown file for AI analysis

#### Other Capture Options

- `npm run ssh-capture`: Optimized for headless environments
- `npm run html-capture`: Captures both screenshots and HTML
- `npm run terminal-capture`: Uses only Node.js built-in modules (no Puppeteer)

See the [scripts/README.md](./scripts/README.md) file for more details on these capture options.

### Downloading Captures to Local Machine

After capturing screenshots or HTML on the remote server, you can download them to your local machine:

```bash
# From your local machine
scp -r -i /path/to/key.pem user@server-address:/path/to/leader-follower-app/ai_captures ./local-folder
```

## Features

- Daily reflection on leader and follower identities
- Visualization of identity dynamics over time
- Email reminders for consistent reflection
- Data export and reporting

## License

This project is licensed under the terms of the license included in the [LICENSE](LICENSE) file.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request