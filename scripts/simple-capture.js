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

async function captureSimpleScreens() {
  console.log('Launching browser...');
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
    await page.screenshot({ path: `${screenshotsDir}/main_welcome.png`, fullPage: true });
    
    // Reflector section
    console.log('Capturing reflector section...');
    if (await page.$('#reflector-btn')) {
      await page.click('#reflector-btn');
      await wait(1000);
      await page.screenshot({ path: `${screenshotsDir}/reflector_section.png`, fullPage: true });
    }
    
    // Reporter section
    console.log('Capturing reporter section...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    if (await page.$('#reporter-btn')) {
      await page.click('#reporter-btn');
      await wait(1000);
      await page.screenshot({ path: `${screenshotsDir}/reporter_section.png`, fullPage: true });
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
        await page.screenshot({ path: `${screenshotsDir}/${name}.png`, fullPage: true });
        console.log(`Successfully captured ${name} page`);
      } catch (error) {
        console.log(`Page ${name} not found or error capturing it, skipping...`);
      }
    }

  } catch (error) {
    console.error('Error capturing screens:', error);
  } finally {
    await browser.close();
    console.log('Browser closed. All screenshots saved to the "screenshots" directory.');
  }
}

// Run the function
captureSimpleScreens(); 