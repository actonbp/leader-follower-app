# AI Captures

This directory contains screenshots and HTML captures of the Leader-Follower Identity Tracker (LFIT) application, specifically formatted for AI analysis.

## Contents

- **PNG Screenshots**: Visual representation of each page of the application
- **HTML Files**: Raw HTML content of each page
- **AI_SUMMARY.md**: Detailed summary of all captures with descriptions

## Purpose

These captures allow an AI to "see" and analyze the application's interface without requiring a human to manually view the screen. This is especially useful when:

1. Working via SSH without a GUI
2. Needing AI assistance with UI analysis
3. Documenting the application's appearance for reference

## How to Generate

To regenerate these captures:

```bash
# Make sure the application is running
npm run dev

# In another terminal, run the AI capture script
npm run ai-capture
```

## For AI Assistants

If you are an AI assistant analyzing this application:

1. Review the AI_SUMMARY.md file first for an overview
2. Examine the PNG files to understand the visual layout
3. Use the HTML files to understand the structure and content
4. Note that these captures represent the application at a specific point in time

## Notes

- The TEST01 user ID was used for demonstration purposes
- Some pages may not be available if they don't exist in the application
- The captures were taken with a viewport size of 1280x900 pixels 