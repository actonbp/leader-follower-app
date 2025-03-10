const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create a dated screenshots directory
const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
const screenshotsBaseDir = path.join(__dirname, '..', 'screenshots');
const screenshotsDir = path.join(screenshotsBaseDir, currentDate);

// Create directories if they don't exist
if (!fs.existsSync(screenshotsBaseDir)) {
  fs.mkdirSync(screenshotsBaseDir, { recursive: true });
}
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Clean up old screenshots (keep only the last 5 days)
function cleanupOldScreenshots() {
  try {
    const dirs = fs.readdirSync(screenshotsBaseDir)
      .filter(file => {
        const fullPath = path.join(screenshotsBaseDir, file);
        return fs.statSync(fullPath).isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(file);
      })
      .sort((a, b) => b.localeCompare(a)); // Sort in descending order (newest first)
    
    // Keep only the 5 most recent directories
    if (dirs.length > 5) {
      const dirsToDelete = dirs.slice(5);
      dirsToDelete.forEach(dir => {
        const fullPath = path.join(screenshotsBaseDir, dir);
        fs.rmdirSync(fullPath, { recursive: true });
        console.log(`Deleted old screenshot directory: ${dir}`);
      });
    }
  } catch (error) {
    console.error('Error cleaning up old screenshots:', error);
  }
}

// Helper function for waiting
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function captureScreens() {
  console.log(`Launching browser for captures on ${currentDate}...`);
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: {
      width: 1280,
      height: 900
    }
  });

  try {
    const page = await browser.newPage();
    
    // Main welcome page
    console.log('Capturing main welcome page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: `${screenshotsDir}/01_main_welcome.png`, fullPage: true });
    
    // Reflector section
    console.log('Capturing reflector section...');
    if (await page.$('#reflector-btn')) {
      await page.click('#reflector-btn');
      await wait(1000);
      await page.screenshot({ path: `${screenshotsDir}/02_reflector_section.png`, fullPage: true });
    }
    
    // Reporter section - empty
    console.log('Capturing reporter section (empty)...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    if (await page.$('#reporter-btn')) {
      await page.click('#reporter-btn');
      await wait(1000);
      await page.screenshot({ path: `${screenshotsDir}/03_reporter_empty.png`, fullPage: true });
      
      // Enter test user ID (127) and load data
      console.log('Loading data for user ID 127...');
      await page.type('#reporter-user-id', '127');
      await page.click('#load-data-btn');
      
      // Wait for data to load and charts to render
      console.log('Waiting for charts to render...');
      await wait(5000);
      
      // Take screenshot of reporter with data - identity tab
      console.log('Capturing identity tab with charts...');
      await page.screenshot({ path: `${screenshotsDir}/04_reporter_identity_tab.png`, fullPage: true });
      
      // Switch to events tab
      console.log('Switching to events tab...');
      if (await page.$('#events-tab-btn')) {
        await page.click('#events-tab-btn');
        await wait(2000);
        console.log('Capturing events tab with charts...');
        await page.screenshot({ path: `${screenshotsDir}/05_reporter_events_tab.png`, fullPage: true });
      }
    }
    
    console.log('Screenshots captured successfully!');
  } catch (error) {
    console.error('Error during capture process:', error);
  } finally {
    await browser.close();
    console.log('Browser closed. Screenshots saved to:', screenshotsDir);
  }
}

// Run the cleanup and capture
cleanupOldScreenshots();
captureScreens(); 