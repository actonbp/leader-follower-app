const http = require('http');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// Convert callback-based functions to promise-based
const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const rmdir = promisify(fs.rmdir);

// Create a dated directory for captures
const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
const terminalCaptureBaseDir = path.join(__dirname, '..', 'terminal_captures');
const terminalCaptureDir = path.join(terminalCaptureBaseDir, currentDate);

// Create directories if they don't exist
if (!fs.existsSync(terminalCaptureBaseDir)) {
  fs.mkdirSync(terminalCaptureBaseDir, { recursive: true });
}
if (!fs.existsSync(terminalCaptureDir)) {
  fs.mkdirSync(terminalCaptureDir, { recursive: true });
}

// Clean up old captures (keep only the last 5 days)
async function cleanupOldCaptures() {
  try {
    const dirs = await readdir(terminalCaptureBaseDir);
    const dateDirs = [];
    
    for (const dir of dirs) {
      const fullPath = path.join(terminalCaptureBaseDir, dir);
      const stats = await stat(fullPath);
      if (stats.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(dir)) {
        dateDirs.push(dir);
      }
    }
    
    // Sort in descending order (newest first)
    dateDirs.sort((a, b) => b.localeCompare(a));
    
    // Keep only the 5 most recent directories
    if (dateDirs.length > 5) {
      const dirsToDelete = dateDirs.slice(5);
      for (const dir of dirsToDelete) {
        const fullPath = path.join(terminalCaptureBaseDir, dir);
        await rmdir(fullPath, { recursive: true });
        console.log(`Deleted old capture directory: ${dir}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old captures:', error);
  }
}

// Function to make HTTP requests and save the response
function fetchPage(url, filename) {
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url}: ${response.statusCode}`));
        return;
      }

      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', async () => {
        try {
          await writeFile(path.join(terminalCaptureDir, filename), data);
          console.log(`Saved ${url} to ${filename}`);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Function to fetch data for a specific user ID
function fetchUserData(userId) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000/get-user-data/${userId}`, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch data for user ${userId}: ${response.statusCode}`));
        return;
      }

      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const userData = JSON.parse(data);
          resolve(userData);
        } catch (error) {
          reject(new Error(`Failed to parse user data: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// Main function to capture pages
async function capturePages() {
  console.log(`Starting terminal-based HTML capture for ${currentDate}...`);
  
  // Clean up old captures first
  await cleanupOldCaptures();
  
  const pagesToCapture = [
    { url: 'http://localhost:3000/', filename: '01_main_page.html' },
    { url: 'http://localhost:3000/email-preferences.html', filename: '02_email_preferences.html' },
    { url: 'http://localhost:3000/about.html', filename: '03_about.html' },
    { url: 'http://localhost:3000/help.html', filename: '04_help.html' }
  ];
  
  // Create a README file explaining what these files are
  const readmeContent = `# Terminal Captures - ${currentDate}

This directory contains HTML captures of the Leader-Follower Identity Tracker (LFIT) application.
These captures were made using a simple HTTP client without requiring a browser.

## Files

${pagesToCapture.map(page => `- ${page.filename}: Captured from ${page.url}`).join('\n')}
- 05_user_data_127.json: User data for ID 127
- 06_reporter_summary.html: Summary of reporter data for user ID 127

## Note

These captures only include the initial HTML of each page and do not include any dynamic content
that would normally be generated by JavaScript after the page loads.

The user data JSON file can be used to analyze the data structure and content.
`;

  await writeFile(path.join(terminalCaptureDir, 'README.md'), readmeContent);
  console.log('Created README.md file');
  
  // Capture each page
  for (const page of pagesToCapture) {
    try {
      await fetchPage(page.url, page.filename);
    } catch (error) {
      console.error(`Error capturing ${page.url}: ${error.message}`);
    }
  }
  
  // Fetch and save user data for ID 127
  try {
    console.log('Fetching data for user ID 127...');
    const userData = await fetchUserData('127');
    await writeFile(
      path.join(terminalCaptureDir, '05_user_data_127.json'), 
      JSON.stringify(userData, null, 2)
    );
    console.log('Saved user data for ID 127');
    
    // Create a summary HTML file with the user data
    const summaryHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Reporter Data Summary - User 127</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2 { color: #4CAF50; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    .summary { margin-top: 30px; padding: 15px; background-color: #f0f8ff; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>Reporter Data Summary - User 127</h1>
  <p>This is a summary of the data for user ID 127 as of ${new Date().toLocaleString()}</p>
  
  <h2>Data Points: ${userData.length}</h2>
  
  <div class="summary">
    <h2>Leader/Follower Scores</h2>
    <table>
      <tr>
        <th>Date</th>
        <th>Leader Score</th>
        <th>Follower Score</th>
        <th>Event Description</th>
      </tr>
      ${userData.map(item => `
        <tr>
          <td>${new Date(item.submitTime).toLocaleString()}</td>
          <td>${item.leaderScore}</td>
          <td>${item.followerScore}</td>
          <td>${item.eventDescription || 'No description'}</td>
        </tr>
      `).join('')}
    </table>
  </div>
  
  <div class="summary">
    <h2>Event Ratings</h2>
    <table>
      <tr>
        <th>Date</th>
        <th>Novelty</th>
        <th>Disruption</th>
        <th>Ordinariness</th>
      </tr>
      ${userData.map(item => `
        <tr>
          <td>${new Date(item.submitTime).toLocaleString()}</td>
          <td>${item.novelty || 'N/A'}</td>
          <td>${item.disruption || 'N/A'}</td>
          <td>${item.ordinariness || 'N/A'}</td>
        </tr>
      `).join('')}
    </table>
  </div>
</body>
</html>
    `;
    
    await writeFile(path.join(terminalCaptureDir, '06_reporter_summary.html'), summaryHtml);
    console.log('Created reporter summary HTML');
    
  } catch (error) {
    console.error(`Error fetching user data: ${error.message}`);
  }
  
  console.log(`\nAll captures completed. Files saved to: ${terminalCaptureDir}`);
}

// Run the capture function
capturePages().catch(error => {
  console.error('Error in capture process:', error);
}); 