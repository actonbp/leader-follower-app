const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const { existsSync, mkdirSync } = require('fs');

// Create directories if they don't exist
const htmlDir = path.join(__dirname, '..', 'html_snapshots');
if (!existsSync(htmlDir)) {
  mkdirSync(htmlDir, { recursive: true });
}

// Helper function for waiting
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function captureHtmlSnapshots() {
  console.log('Launching browser in fully headless mode...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    
    // Main welcome page
    console.log('Capturing main welcome page HTML...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Get HTML content and save it
    const mainHtml = await page.content();
    await fs.writeFile(path.join(htmlDir, 'main_welcome.html'), mainHtml);
    console.log('Main welcome page HTML saved');
    
    // Also save a screenshot if possible
    try {
      await page.screenshot({ path: path.join(htmlDir, 'main_welcome.png'), fullPage: true });
    } catch (err) {
      console.log('Could not save screenshot, but HTML was saved');
    }
    
    // Reflector section
    console.log('Capturing reflector section HTML...');
    if (await page.$('#reflector-btn')) {
      await page.click('#reflector-btn');
      await wait(1000);
      
      const reflectorHtml = await page.content();
      await fs.writeFile(path.join(htmlDir, 'reflector_section.html'), reflectorHtml);
      console.log('Reflector section HTML saved');
      
      try {
        await page.screenshot({ path: path.join(htmlDir, 'reflector_section.png'), fullPage: true });
      } catch (err) {
        console.log('Could not save screenshot, but HTML was saved');
      }
    }
    
    // Reporter section
    console.log('Capturing reporter section HTML...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    if (await page.$('#reporter-btn')) {
      await page.click('#reporter-btn');
      await wait(1000);
      
      const reporterHtml = await page.content();
      await fs.writeFile(path.join(htmlDir, 'reporter_section.html'), reporterHtml);
      console.log('Reporter section HTML saved');
      
      try {
        await page.screenshot({ path: path.join(htmlDir, 'reporter_section.png'), fullPage: true });
      } catch (err) {
        console.log('Could not save screenshot, but HTML was saved');
      }
    }
    
    // Try to capture any other pages that might exist
    const possiblePages = [
      { name: 'email_preferences', path: '/email-preferences.html' },
      { name: 'about', path: '/about.html' },
      { name: 'help', path: '/help.html' }
    ];
    
    for (const { name, path: pagePath } of possiblePages) {
      try {
        console.log(`Trying to capture ${name} page HTML...`);
        await page.goto(`http://localhost:3000${pagePath}`, { 
          waitUntil: 'networkidle0',
          timeout: 5000 
        });
        
        const pageHtml = await page.content();
        await fs.writeFile(path.join(htmlDir, `${name}.html`), pageHtml);
        console.log(`${name} page HTML saved`);
        
        try {
          await page.screenshot({ path: path.join(htmlDir, `${name}.png`), fullPage: true });
        } catch (err) {
          console.log('Could not save screenshot, but HTML was saved');
        }
      } catch (error) {
        console.log(`Page ${name} not found or error capturing it, skipping...`);
      }
    }

    console.log('All HTML snapshots captured successfully!');
  } catch (error) {
    console.error('Error capturing HTML snapshots:', error);
  } finally {
    await browser.close();
    console.log('Browser closed. All HTML snapshots saved to the "html_snapshots" directory.');
  }
}

// Run the function
captureHtmlSnapshots(); 