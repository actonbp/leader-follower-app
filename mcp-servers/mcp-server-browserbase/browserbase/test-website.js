import http from 'http';

// MCP Server typically uses port 32123
const MCP_PORT = 32123;

// First create a session
const createSessionOptions = {
  hostname: 'localhost',
  port: MCP_PORT,
  path: '/mcp/invoke',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const createSessionData = JSON.stringify({
  name: 'browserbase_create_session'
});

console.log('Creating browser session...');
const createSessionReq = http.request(createSessionOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Session created successfully:', data);
    
    // Now navigate to a website
    navigateToWebsite();
  });
});

createSessionReq.on('error', (error) => {
  console.error('Error creating session:', error);
});

createSessionReq.write(createSessionData);
createSessionReq.end();

// Function to navigate to a website
function navigateToWebsite() {
  const navigateOptions = {
    hostname: 'localhost',
    port: MCP_PORT,
    path: '/mcp/invoke',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const navigateData = JSON.stringify({
    name: 'browserbase_navigate',
    inputs: {
      url: 'https://lfit.me'
    }
  });

  console.log('Navigating to website...');
  const navigateReq = http.request(navigateOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Navigation successful:', data);
      
      // Take a screenshot
      takeScreenshot();
    });
  });

  navigateReq.on('error', (error) => {
    console.error('Error navigating:', error);
  });

  navigateReq.write(navigateData);
  navigateReq.end();
}

// Function to take a screenshot
function takeScreenshot() {
  const screenshotOptions = {
    hostname: 'localhost',
    port: MCP_PORT,
    path: '/mcp/invoke',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const screenshotData = JSON.stringify({
    name: 'browserbase_screenshot',
    inputs: {
      name: 'example-screenshot'
    }
  });

  console.log('Taking screenshot...');
  const screenshotReq = http.request(screenshotOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Screenshot taken:', data);
      
      // Get page content
      getPageContent();
    });
  });

  screenshotReq.on('error', (error) => {
    console.error('Error taking screenshot:', error);
  });

  screenshotReq.write(screenshotData);
  screenshotReq.end();
}

// Function to get page content
function getPageContent() {
  const contentOptions = {
    hostname: 'localhost',
    port: MCP_PORT,
    path: '/mcp/invoke',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const contentData = JSON.stringify({
    name: 'browserbase_get_content'
  });

  console.log('Getting page content...');
  const contentReq = http.request(contentOptions, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log('Page content received:');
      try {
        const parsed = JSON.parse(data);
        console.log(parsed);
      } catch (e) {
        console.log(data);
      }
    });
  });

  contentReq.on('error', (error) => {
    console.error('Error getting content:', error);
  });

  contentReq.write(contentData);
  contentReq.end();
}