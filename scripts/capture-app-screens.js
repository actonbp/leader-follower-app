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

async function captureAppScreens() {
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
    
    // 1. Capture the welcome page
    console.log('Capturing welcome page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: `${screenshotsDir}/01_welcome.png`, fullPage: true });

    // 2. Capture the reflector section
    console.log('Capturing reflector section...');
    await page.waitForSelector('#reflector-btn');
    await page.click('#reflector-btn');
    await wait(1000);
    await page.screenshot({ path: `${screenshotsDir}/02_reflector_welcome.png`, fullPage: true });

    // 3. Enter user ID and capture instructions page
    console.log('Capturing reflector instructions...');
    await page.type('#user-id', 'TEST01');
    await page.click('#start-btn');
    await wait(1000);
    await page.screenshot({ path: `${screenshotsDir}/03_reflector_instructions.png`, fullPage: true });

    // 4. Navigate to the reflection form
    console.log('Capturing reflection form...');
    await page.waitForSelector('#continue-btn');
    await page.click('#continue-btn');
    await wait(1000);
    await page.screenshot({ path: `${screenshotsDir}/04_reflection_form.png`, fullPage: true });

    // 5. Go back to welcome page and capture reporter section
    console.log('Capturing reporter section...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.waitForSelector('#reporter-btn');
    await page.click('#reporter-btn');
    await wait(1000);
    await page.screenshot({ path: `${screenshotsDir}/05_reporter_welcome.png`, fullPage: true });

    // 6. Enter user ID for reporter
    console.log('Capturing reporter dashboard...');
    await page.waitForSelector('#reporter-user-id');
    await page.type('#reporter-user-id', 'TEST01');
    await page.click('#reporter-start-btn');
    await wait(2000);
    await page.screenshot({ path: `${screenshotsDir}/06_reporter_dashboard.png`, fullPage: true });

    // 7. Capture email preferences section if it exists
    try {
      console.log('Capturing email preferences...');
      await page.goto('http://localhost:3000/email-preferences.html', { waitUntil: 'networkidle0', timeout: 5000 });
      await wait(1000);
      await page.screenshot({ path: `${screenshotsDir}/07_email_preferences.png`, fullPage: true });
    } catch (error) {
      console.log('Email preferences page not found, skipping...');
    }

  } catch (error) {
    console.error('Error capturing screens:', error);
  } finally {
    await browser.close();
    console.log('Browser closed. All screenshots saved to the "screenshots" directory.');
  }
}

// Run the function
captureAppScreens(); 