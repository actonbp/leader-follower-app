const { execSync } = require('child_process');

try {
  const result = execSync('lsof -i -P | grep LISTEN').toString();
  console.log('Listening ports:');
  console.log(result);
} catch (error) {
  console.error('Error checking ports:', error.message);
}