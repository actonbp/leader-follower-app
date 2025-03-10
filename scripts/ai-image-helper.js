const fs = require('fs');
const path = require('path');

// Function to list images with descriptions
function listImagesWithDescriptions() {
  const aiCaptureDir = path.join(__dirname, '..', 'ai_captures');
  
  // Check if directory exists
  if (!fs.existsSync(aiCaptureDir)) {
    console.log('The ai_captures directory does not exist. Run "npm run ai-capture" first.');
    return;
  }
  
  // Get all PNG files
  const imageFiles = fs.readdirSync(aiCaptureDir)
    .filter(file => file.endsWith('.png'))
    .sort(); // Sort files alphabetically
  
  if (imageFiles.length === 0) {
    console.log('No images found in the ai_captures directory. Run "npm run ai-capture" first.');
    return;
  }
  
  // Get AI_SUMMARY.md if it exists
  let summaryContent = '';
  const summaryPath = path.join(aiCaptureDir, 'AI_SUMMARY.md');
  if (fs.existsSync(summaryPath)) {
    summaryContent = fs.readFileSync(summaryPath, 'utf8');
  }
  
  console.log('======= Available Images in ai_captures =======');
  console.log('');
  
  // Process each image
  imageFiles.forEach(file => {
    const filePath = path.join(aiCaptureDir, file);
    const stats = fs.statSync(filePath);
    const fileSize = (stats.size / 1024).toFixed(2);
    
    // Try to find description from summary
    let description = 'No description available';
    const filePattern = new RegExp(`\\[${file}\\].*\\n.*Description\\]: (.+)`, 'i');
    const match = summaryContent.match(filePattern);
    if (match && match[1]) {
      description = match[1].trim();
    }
    
    console.log(`File: ${file}`);
    console.log(`Path: ${filePath}`);
    console.log(`Size: ${fileSize} KB`);
    console.log(`Description: ${description}`);
    console.log('');
  });
  
  console.log('To view a specific image, you can use:');
  console.log('- For macOS: open <file_path>');
  console.log('- For Linux: xdg-open <file_path>');
  console.log('- For Windows: start <file_path>');
  console.log('');
  
  // Check if TEST01_INFO.md exists
  const testInfoPath = path.join(aiCaptureDir, 'TEST01_INFO.md');
  if (fs.existsSync(testInfoPath)) {
    console.log('For information about the TEST01 user data, see:');
    console.log(testInfoPath);
    console.log('');
  }
}

// Run the function
listImagesWithDescriptions();