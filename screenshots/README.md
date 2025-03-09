# Application Screenshots

This directory contains screenshots of the Leader-Follower Identity Tracker (LFIT) application. These screenshots provide a visual reference of the application's interface.

## Purpose

These screenshots serve several purposes:
- Visual documentation of the application's interface
- Reference for UI/UX discussions
- Historical record of the application's appearance

## Contents

Various screenshots of the application, including:
- Main welcome page
- Reflector section
- Reporter section
- Various UI states and interactions

## How to Generate

To regenerate these screenshots, you can use any of the following scripts:

```bash
# Basic screenshots
npm run screenshots

# Comprehensive screenshots with navigation
npm run capture-screens

# Simple, robust screenshots
npm run simple-capture

# SSH-friendly screenshots
npm run ssh-capture
```

Make sure the application is running (`npm run dev`) before running any of these scripts.

## Naming Convention

Screenshots follow these naming conventions:
- Numbered screenshots (e.g., `01_welcome.png`) are from the comprehensive capture script
- Named screenshots (e.g., `home.png`) are from the basic script
- SSH-prefixed screenshots (e.g., `ssh_main_welcome.png`) are from the SSH-friendly script

## Notes

- Screenshots are taken with various viewport sizes
- Some scripts capture full-page screenshots while others capture only the visible area
- The TEST01 user ID is used for demonstration purposes in some screenshots 