require('dotenv').config();
import('./dist/index.js').catch(err => console.error('Error:', err)); 