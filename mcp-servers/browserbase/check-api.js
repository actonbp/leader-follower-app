// Simple script to check browserbase API
const browserbase = require('browserbase');

console.log('Browserbase module keys:', Object.keys(browserbase));
console.log('Default export type:', typeof browserbase.default);

// Check if there's a constructor
if (typeof browserbase.default === 'function') {
  console.log('Constructor parameters:', browserbase.default.length);
}

// Check for other properties
console.log('Other properties:');
for (const key in browserbase) {
  console.log(`- ${key}: ${typeof browserbase[key]}`);
}