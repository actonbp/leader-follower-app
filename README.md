# Leader-Follower Identity Tracker (LFIT)

A web application for tracking and visualizing leader and follower identity dynamics over time, created as a companion tool to the book chapter "Lead Today, Follow Tomorrow? How to Manage the Ebb and Flow of Leader and Follower Identities."

## Authors and Contributors

This application was primarily developed by:
- **Bryan P. Acton, PhD** - University of South Florida
- **Karolina W. Nieberle, PhD** - Technical University of Munich

Development was assisted by AI coding tools including Cursor and Claude Code. This README is designed to help both human developers and AI assistants understand and work with the codebase.

## Purpose

The Leader-Follower Identity Tracker (LFIT) helps users reflect on the complex, changing nature of their leader and follower identities through two main components:

1. **LFIT-Reflector**: A daily measurement tool where users:
   - Position their current leader/follower identities on an interactive grid
   - Record important daily events
   - Rate events on dimensions like novelty and disruption
   - Complete the measure in 3 minutes per day over at least two weeks

2. **LFIT-Reporter**: A visualization dashboard that:
   - Displays identity trajectory charts over time
   - Analyzes identity switches
   - Shows event impacts
   - Generates downloadable reports

## Conceptual Background

This application is based on research showing that leader and follower identities are dynamic rather than static. Key concepts:

### Leader-Follower Identity Grid

The grid allows users to report their identities on two separate dimensions:
- **X-axis**: Follower identity strength (Not at all → Very much so)
- **Y-axis**: Leader identity strength (Not at all → Very much so)

This creates four possible states:
1. **High Leader / Low Follower**: Strong leader identity only
2. **High Leader / High Follower**: Both identities active ("Dual identity")
3. **Low Leader / High Follower**: Strong follower identity only
4. **Low Leader / Low Follower**: Neither identity strongly activated

### Identity Switching

The app helps track how people switch between these identity states over time, revealing:
- Identity variability
- Common identity transitions
- Patterns of identity activation
- Event-triggered identity changes

### Research Purpose

The tool helps researchers and users understand:
1. How leader and follower identities fluctuate over time
2. What events trigger identity changes
3. How the dynamics between identities affect behavior, well-being, and relationships

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
├── server-neon.js          # Main application entry point
├── db-neon.js              # Database connection and models
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
   NEON_DATABASE_URL=your-neon-postgresql-connection-string
   PORT=3000
   ```

## Running the Application

### Local Development

Start the application in development mode with auto-reloading:

```bash
npm run dev:neon
```

Or start without auto-reloading:

```bash
npm run start:neon
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

3. Set up environment variables:
   ```bash
   npm run vercel-setup:neon
   ```

4. Deploy the application:
   ```bash
   npm run vercel-deploy:neon
   ```

5. For production deployment:
   ```bash
   npm run vercel-prod:neon
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
   - Development Command: `npm run dev:neon`
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
   npm run dev:neon
   ```

### Capturing Screenshots Remotely

This repository includes several scripts for capturing screenshots and HTML snapshots of the application, which is especially useful when working via SSH without a GUI.

#### For AI Analysis

To capture screenshots and HTML for AI analysis:

```bash
# Start the application in the background
npm run dev:neon &

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

## For AI Agents

If you're an AI agent exploring this codebase to make changes, here's where to start:

### Key Files and Directories

1. **App Structure:**
   - `server-neon.js` - Main Express server entry point
   - `src/app.js` - Core application logic
   - `src/public/index.html` - Main HTML template
   - `src/public/css/styles.css` - Styles (recently updated for mobile responsiveness)
   - `src/routes/index.js` - API routes

2. **Frontend Components:**
   - `src/public/js/main.js` - Main frontend interaction
   - `src/public/js/reporter.js` - Reporter visualization functionality 

3. **Data Management:**
   - `user_data.jsonl` - Where user reflection data is stored
   - `email_preferences.json` - User email reminder settings

4. **Understanding the App (Without Running It):**
   - Check `ai_captures/` for screenshots and HTML
   - Review `ai_captures/AI_SUMMARY.md` for an overview
   - Use `npm run ai-capture` to generate fresh captures

3. See `server-neon.js` and related route files for backend processing
4. Run `npm run ai-capture` to see the app's visual interface

### Common AI Tasks

As an AI working on this app, you might be asked to:

1. **Enhance Visualizations**
   - Add new chart types to the Reporter section
   - Improve existing visualizations
   - Create additional data insights

2. **Improve User Experience**
   - Add better validation for form inputs
   - Implement better error handling
   - Enhance mobile responsiveness (started but could be improved)
   - Add user onboarding or tooltips

3. **Extend Functionality**
   - Add user authentication
   - Implement data import/export
   - Create additional reminder options
   - Add social sharing capabilities

4. **Fix Technical Issues**
   - Debug reported problems
   - Fix the broken About & Help pages
   - Improve data handling performance
   - Ensure security best practices

5. **Documentation**
   - Create additional technical documentation
   - Add user guides
   - Document API endpoints

## Features

- Interactive identity grid for daily reflection
- Visualization of identity dynamics over time
- Email reminders for consistent reflection
- Data export and reporting
- PDF generation of reports

## License

This project is licensed under the terms of the license included in the [LICENSE](LICENSE) file.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## PDF Report Enhancement To-Do List

The application now uses a browser-based printable view approach for PDF reports. Future enhancements should focus on:

### Visual and Design Improvements
- [ ] Add proper LFIT branding and logo to the PDF report
- [ ] Improve typography with professional font pairings
- [ ] Create a consistent color scheme matching the application
- [ ] Add visual data separators and section dividers
- [ ] Implement proper page breaks to ensure charts don't split across pages

### Content Enhancements
- [ ] Add detailed data interpretations for each chart
- [ ] Include personalized insights based on identity patterns
- [ ] Add development recommendations section based on identity distribution
- [ ] Incorporate reference to relevant research findings
- [ ] Add explanatory text about how to interpret the metrics

### Technical Improvements
- [ ] Optimize chart rendering for print output
- [ ] Add support for different paper sizes (A4, Letter)
- [ ] Ensure cross-browser compatibility
- [ ] Add option to include/exclude specific sections
- [ ] Implement error handling for missing data

### User Interface
- [ ] Redesign the Reporter page UI for a more professional look
- [ ] Add email option to send the report directly to the user
- [ ] Provide additional format options (PDF, PNG, HTML)
- [ ] Add a preview mode before generating the final PDF
- [ ] Implement a loading indicator during report generation