const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const { existsSync, mkdirSync } = require('fs');

// Create directories if they don't exist
const aiCaptureDir = path.join(__dirname, '..', 'ai_captures');
if (!existsSync(aiCaptureDir)) {
  mkdirSync(aiCaptureDir, { recursive: true });
}

// Helper function for waiting
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function captureForAI() {
  console.log('Starting AI-friendly capture process...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ],
    defaultViewport: {
      width: 1280,
      height: 900
    }
  });

  try {
    const page = await browser.newPage();
    
    // Create a summary file that the AI can read
    let summaryContent = `# AI Capture Summary\n\n`;
    summaryContent += `This directory contains screenshots and HTML captures of the Leader-Follower Identity Tracker (LFIT) application.\n`;
    summaryContent += `These files were generated on ${new Date().toLocaleString()} for AI analysis.\n\n`;
    summaryContent += `## Captured Pages\n\n`;
    
    // Main welcome page
    console.log('Capturing main welcome page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Save screenshot
    await page.screenshot({ path: path.join(aiCaptureDir, '01_main_welcome.png'), fullPage: true });
    
    // Save HTML
    const mainHtml = await page.content();
    await fs.writeFile(path.join(aiCaptureDir, '01_main_welcome.html'), mainHtml);
    
    summaryContent += `### 1. Main Welcome Page\n`;
    summaryContent += `- **Screenshot**: [01_main_welcome.png](./01_main_welcome.png)\n`;
    summaryContent += `- **HTML**: [01_main_welcome.html](./01_main_welcome.html)\n`;
    summaryContent += `- **Description**: The main landing page of the application showing the welcome screen.\n\n`;
    
    // Reflector section
    console.log('Capturing reflector section...');
    if (await page.$('#reflector-btn')) {
      await page.click('#reflector-btn');
      await wait(1000);
      
      await page.screenshot({ path: path.join(aiCaptureDir, '02_reflector_section.png'), fullPage: true });
      const reflectorHtml = await page.content();
      await fs.writeFile(path.join(aiCaptureDir, '02_reflector_section.html'), reflectorHtml);
      
      summaryContent += `### 2. Reflector Section\n`;
      summaryContent += `- **Screenshot**: [02_reflector_section.png](./02_reflector_section.png)\n`;
      summaryContent += `- **HTML**: [02_reflector_section.html](./02_reflector_section.html)\n`;
      summaryContent += `- **Description**: The LFIT-Reflector section where users enter their ID to begin reflection.\n\n`;
      
      // Try to enter a test ID and capture the instructions page
      if (await page.$('#user-id')) {
        await page.type('#user-id', 'TEST01');
        if (await page.$('#start-btn')) {
          await page.click('#start-btn');
          await wait(1000);
          
          await page.screenshot({ path: path.join(aiCaptureDir, '03_reflector_instructions.png'), fullPage: true });
          const instructionsHtml = await page.content();
          await fs.writeFile(path.join(aiCaptureDir, '03_reflector_instructions.html'), instructionsHtml);
          
          summaryContent += `### 3. Reflector Instructions\n`;
          summaryContent += `- **Screenshot**: [03_reflector_instructions.png](./03_reflector_instructions.png)\n`;
          summaryContent += `- **HTML**: [03_reflector_instructions.html](./03_reflector_instructions.html)\n`;
          summaryContent += `- **Description**: Instructions for using the reflector tool after entering user ID.\n\n`;
          
          // Try to navigate to the reflection form
          if (await page.$('#continue-btn')) {
            await page.click('#continue-btn');
            await wait(1000);
            
            await page.screenshot({ path: path.join(aiCaptureDir, '04_reflection_form.png'), fullPage: true });
            const formHtml = await page.content();
            await fs.writeFile(path.join(aiCaptureDir, '04_reflection_form.html'), formHtml);
            
            summaryContent += `### 4. Reflection Form\n`;
            summaryContent += `- **Screenshot**: [04_reflection_form.png](./04_reflection_form.png)\n`;
            summaryContent += `- **HTML**: [04_reflection_form.html](./04_reflection_form.html)\n`;
            summaryContent += `- **Description**: The daily reflection form where users input their reflections.\n\n`;
          }
        }
      }
    }
    
    // Reporter section
    console.log('Capturing reporter section...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    if (await page.$('#reporter-btn')) {
      await page.click('#reporter-btn');
      await wait(1000);
      
      await page.screenshot({ path: path.join(aiCaptureDir, '05_reporter_section.png'), fullPage: true });
      const reporterHtml = await page.content();
      await fs.writeFile(path.join(aiCaptureDir, '05_reporter_section.html'), reporterHtml);
      
      summaryContent += `### 5. Reporter Section\n`;
      summaryContent += `- **Screenshot**: [05_reporter_section.png](./05_reporter_section.png)\n`;
      summaryContent += `- **HTML**: [05_reporter_section.html](./05_reporter_section.html)\n`;
      summaryContent += `- **Description**: The LFIT-Reporter section where users can view their reflection data.\n\n`;
      
      // Try to enter a test ID for reporter
      if (await page.$('#reporter-user-id')) {
        await page.type('#reporter-user-id', 'TEST01');
        if (await page.$('#load-data-btn')) {
          await page.click('#load-data-btn');
          // Wait longer for charts to render
          await wait(3000);
          
          await page.screenshot({ path: path.join(aiCaptureDir, '06_reporter_dashboard.png'), fullPage: true });
          const dashboardHtml = await page.content();
          await fs.writeFile(path.join(aiCaptureDir, '06_reporter_dashboard.html'), dashboardHtml);
          
          summaryContent += `### 6. Reporter Dashboard\n`;
          summaryContent += `- **Screenshot**: [06_reporter_dashboard.png](./06_reporter_dashboard.png)\n`;
          summaryContent += `- **HTML**: [06_reporter_dashboard.html](./06_reporter_dashboard.html)\n`;
          summaryContent += `- **Description**: The dashboard showing visualizations of user's reflection data.\n\n`;
          
          // Capture identity tab charts
          if (await page.$('#identity-tab-btn')) {
            await page.click('#identity-tab-btn');
            await wait(1000);
            
            await page.screenshot({ path: path.join(aiCaptureDir, '06a_identity_charts.png'), fullPage: true });
            const identityHtml = await page.content();
            await fs.writeFile(path.join(aiCaptureDir, '06a_identity_charts.html'), identityHtml);
            
            summaryContent += `### 6a. Identity Charts\n`;
            summaryContent += `- **Screenshot**: [06a_identity_charts.png](./06a_identity_charts.png)\n`;
            summaryContent += `- **HTML**: [06a_identity_charts.html](./06a_identity_charts.html)\n`;
            summaryContent += `- **Description**: Identity trajectory and statistics visualizations.\n\n`;
          }
          
          // Capture events tab charts
          if (await page.$('#events-tab-btn')) {
            await page.click('#events-tab-btn');
            await wait(1000);
            
            await page.screenshot({ path: path.join(aiCaptureDir, '06b_events_charts.png'), fullPage: true });
            const eventsHtml = await page.content();
            await fs.writeFile(path.join(aiCaptureDir, '06b_events_charts.html'), eventsHtml);
            
            summaryContent += `### 6b. Events Charts\n`;
            summaryContent += `- **Screenshot**: [06b_events_charts.png](./06b_events_charts.png)\n`;
            summaryContent += `- **HTML**: [06b_events_charts.html](./06b_events_charts.html)\n`;
            summaryContent += `- **Description**: Visualizations of event characteristics and impacts.\n\n`;
          }
        }
      }
    }
    
    // Try to capture any other pages that might exist
    const possiblePages = [
      { name: 'email_preferences', path: '/email-preferences.html', title: 'Email Preferences' },
      { name: 'about', path: '/about.html', title: 'About' },
      { name: 'help', path: '/help.html', title: 'Help' }
    ];
    
    let pageIndex = 7;
    for (const { name, path: pagePath, title } of possiblePages) {
      try {
        console.log(`Trying to capture ${name} page...`);
        await page.goto(`http://localhost:3000${pagePath}`, { 
          waitUntil: 'networkidle0',
          timeout: 5000 
        });
        
        const paddedIndex = pageIndex.toString().padStart(2, '0');
        const filename = `${paddedIndex}_${name}`;
        
        await page.screenshot({ path: path.join(aiCaptureDir, `${filename}.png`), fullPage: true });
        const pageHtml = await page.content();
        await fs.writeFile(path.join(aiCaptureDir, `${filename}.html`), pageHtml);
        
        summaryContent += `### ${pageIndex}. ${title} Page\n`;
        summaryContent += `- **Screenshot**: [${filename}.png](./${filename}.png)\n`;
        summaryContent += `- **HTML**: [${filename}.html](./${filename}.html)\n`;
        summaryContent += `- **Description**: The ${title.toLowerCase()} page of the application.\n\n`;
        
        pageIndex++;
      } catch (error) {
        console.log(`Page ${name} not found or error capturing it, skipping...`);
      }
    }
    
    // Add notes for AI
    summaryContent += `## Notes for AI Analysis\n\n`;
    summaryContent += `1. The screenshots (.png files) show the visual appearance of the application.\n`;
    summaryContent += `2. The HTML files contain the structure and content of each page.\n`;
    summaryContent += `3. The TEST01 user ID was used for demonstration purposes.\n`;
    summaryContent += `4. Some pages may not be available if they don't exist in the application.\n`;
    summaryContent += `5. The application is a Leader-Follower Identity Tracker (LFIT) that helps users reflect on their leader and follower identities.\n`;
    
    // Save the summary file
    await fs.writeFile(path.join(aiCaptureDir, 'AI_SUMMARY.md'), summaryContent);
    console.log('Created AI summary file');

    console.log('All captures completed successfully!');
  } catch (error) {
    console.error('Error during capture process:', error);
  } finally {
    await browser.close();
    console.log(`Browser closed. All captures saved to: ${aiCaptureDir}`);
    console.log('An AI can now analyze these files to understand the application interface.');
  }
}

// Run the function
captureForAI(); 