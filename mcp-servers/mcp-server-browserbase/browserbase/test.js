const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/mcp/invoke',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const data = JSON.stringify({
  name: 'browserbase_create_session'
});

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end(); 