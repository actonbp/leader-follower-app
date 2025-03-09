const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Helper function for waiting
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function captureHeadlessScreenshots() {
  console.log('Launching browser in fully headless mode...');
  
  // These arguments help Puppeteer run in environments without a display
  const browser = await puppeteer.launch({
    headless: true, // Use true instead of 'new' for better compatibility
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ],
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
    await page.screenshot({ path: `${screenshotsDir}/ssh_main_welcome.png`, fullPage: true });
    
    // Reflector section
    console.log('Capturing reflector section...');
    if (await page.$('#reflector-btn')) {
      await page.click('#reflector-btn');
      await wait(1000);
      await page.screenshot({ path: `${screenshotsDir}/ssh_reflector_section.png`, fullPage: true });
    }
    
    // Reporter section
    console.log('Capturing reporter section...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    if (await page.$('#reporter-btn')) {
      await page.click('#reporter-btn');
      await wait(1000);
      await page.screenshot({ path: `${screenshotsDir}/ssh_reporter_section.png`, fullPage: true });
    }
    
    // Try to capture any other pages that might exist
    const possiblePages = [
      { name: 'email_preferences', path: '/email-preferences.html' },
      { name: 'about', path: '/about.html' },
      { name: 'help', path: '/help.html' }
    ];
    
    for (const { name, path } of possiblePages) {
      try {
        console.log(`Trying to capture ${name} page...`);
        await page.goto(`http://localhost:3000${path}`, { 
          waitUntil: 'networkidle0',
          timeout: 5000 
        });
        await page.screenshot({ path: `${screenshotsDir}/ssh_${name}.png`, fullPage: true });
        console.log(`Successfully captured ${name} page`);
      } catch (error) {
        console.log(`Page ${name} not found or error capturing it, skipping...`);
      }
    }

    console.log('All screenshots captured successfully!');
  } catch (error) {
    console.error('Error capturing screens:', error);
  } finally {
    await browser.close();
    console.log('Browser closed. All screenshots saved to the "screenshots" directory.');
  }
}

// Run the function
captureHeadlessScreenshots(); 