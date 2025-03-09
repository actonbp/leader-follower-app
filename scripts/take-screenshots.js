const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Define the pages to capture
const pages = [
  { name: 'home', path: '/', fullPage: true },
  { name: 'reflector', path: '/#reflector-section', fullPage: true, clickSelector: '#reflector-btn' },
  { name: 'reporter', path: '/#reporter-section', fullPage: true, clickSelector: '#reporter-btn' }
];

async function takeScreenshots() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new', // Use the new headless mode
    defaultViewport: {
      width: 1280,
      height: 800
    }
  });

  try {
    const page = await browser.newPage();
    
    for (const { name, path, fullPage, clickSelector } of pages) {
      console.log(`Taking screenshot of ${name}...`);
      
      // Navigate to the page
      await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle0' });
      
      // If there's a click selector, click it and wait for any animations
      if (clickSelector) {
        await page.waitForSelector(clickSelector);
        await page.click(clickSelector);
        // Use setTimeout instead of waitForTimeout
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Take the screenshot
      const screenshotPath = `${screenshotsDir}/${name}.png`;
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: fullPage || false 
      });
      
      console.log(`Screenshot saved to ${screenshotPath}`);
    }
  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
    console.log('Browser closed. All screenshots taken.');
  }
}

takeScreenshots(); 