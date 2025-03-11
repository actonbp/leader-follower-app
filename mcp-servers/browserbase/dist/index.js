"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
// Configuration
const PORT = process.env.PORT || 3333;
const API_KEY = process.env.BROWSERBASE_API_KEY;
const PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID;
if (!API_KEY || !PROJECT_ID) {
    console.error('Error: BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID environment variables must be set');
    process.exit(1);
}
const sessions = {};
let activeSessionId = null;
// Create HTTP server for MCP requests
const server = (0, http_1.createServer)(async (req, res) => {
    // Parse JSON body
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        try {
            const request = JSON.parse(body);
            const { method, params = {} } = request;
            console.log(`Received request: ${method}`, params);
            let result;
            // Stub implementation for demo purposes
            switch (method) {
                case 'browserbase_create_session':
                    // Create a new browser session
                    const sessionId = `session_${Date.now()}`;
                    sessions[sessionId] = {
                        id: sessionId,
                        browser: null,
                        page: null
                    };
                    activeSessionId = sessionId;
                    result = { sessionId, message: 'Session created (stub implementation)' };
                    break;
                case 'browserbase_navigate':
                    // Navigate to a URL
                    if (!activeSessionId) {
                        throw new Error('No active session. Create a session first.');
                    }
                    const { url } = params;
                    if (!url) {
                        throw new Error('URL is required');
                    }
                    result = {
                        success: true,
                        url,
                        message: `Navigation to ${url} simulated (stub implementation)`
                    };
                    break;
                case 'browserbase_screenshot':
                    // Take a screenshot
                    if (!activeSessionId) {
                        throw new Error('No active session. Create a session first.');
                    }
                    const { name, selector, width = 800, height = 600 } = params;
                    if (!name) {
                        throw new Error('Name is required for screenshot');
                    }
                    // Create a simple placeholder image (1x1 transparent PNG)
                    const placeholderImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
                    result = {
                        success: true,
                        resourceName: `screenshot://${name}`,
                        resource: {
                            contentType: 'image/png',
                            data: placeholderImage
                        },
                        message: `Screenshot '${name}' simulated (stub implementation)`
                    };
                    break;
                case 'browserbase_click':
                    // Click an element
                    if (!activeSessionId) {
                        throw new Error('No active session. Create a session first.');
                    }
                    const { selector: clickSelector } = params;
                    if (!clickSelector) {
                        throw new Error('Selector is required for click operation');
                    }
                    result = {
                        success: true,
                        message: `Click on '${clickSelector}' simulated (stub implementation)`
                    };
                    break;
                case 'browserbase_fill':
                    // Fill an input field
                    if (!activeSessionId) {
                        throw new Error('No active session. Create a session first.');
                    }
                    const { selector: fillSelector, value } = params;
                    if (!fillSelector) {
                        throw new Error('Selector is required for fill operation');
                    }
                    if (value === undefined) {
                        throw new Error('Value is required for fill operation');
                    }
                    result = {
                        success: true,
                        message: `Field '${fillSelector}' filled with '${value}' (stub implementation)`
                    };
                    break;
                case 'browserbase_evaluate':
                    // Execute JavaScript in the browser
                    if (!activeSessionId) {
                        throw new Error('No active session. Create a session first.');
                    }
                    const { script } = params;
                    if (!script) {
                        throw new Error('Script is required for evaluate operation');
                    }
                    result = {
                        success: true,
                        result: null,
                        message: `Script execution simulated (stub implementation)`
                    };
                    break;
                case 'browserbase_get_content':
                    // Get page content
                    if (!activeSessionId) {
                        throw new Error('No active session. Create a session first.');
                    }
                    const { selector: contentSelector } = params;
                    const sampleContent = contentSelector
                        ? `Sample content for selector: ${contentSelector}`
                        : '<html><body><h1>Sample Page</h1><p>This is sample content from the stub implementation</p></body></html>';
                    result = {
                        success: true,
                        resourceName: 'console://logs',
                        resource: {
                            contentType: 'text/plain',
                            data: sampleContent
                        },
                        message: 'Content retrieved (stub implementation)'
                    };
                    break;
                case 'browserbase_parallel_sessions':
                    // Handle multiple sessions
                    const { sessions: sessionConfigs } = params;
                    if (!sessionConfigs || !Array.isArray(sessionConfigs)) {
                        throw new Error('Sessions array is required for parallel sessions');
                    }
                    const sessionResults = sessionConfigs.map(sessionConfig => {
                        const { url, id } = sessionConfig;
                        if (!url || !id) {
                            throw new Error('Each session must have url and id properties');
                        }
                        sessions[id] = {
                            id,
                            browser: null,
                            page: null
                        };
                        return {
                            id,
                            success: true,
                            message: `Parallel session '${id}' created for '${url}' (stub implementation)`
                        };
                    });
                    result = {
                        success: true,
                        results: sessionResults,
                        message: 'Parallel sessions created (stub implementation)'
                    };
                    break;
                default:
                    throw new Error(`Unknown method: ${method}`);
            }
            console.log('Sending response:', result);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ result }));
        }
        catch (error) {
            console.error('Error handling request:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined
                }
            }));
        }
    });
});
// Start the server
server.listen(PORT, () => {
    console.log(`Browserbase MCP stub server running on port ${PORT}`);
    console.log(`API_KEY: ${API_KEY ? '(set)' : '(not set)'}`);
    console.log(`PROJECT_ID: ${PROJECT_ID ? '(set)' : '(not set)'}`);
});
// Handle cleanup on exit
process.on('SIGINT', () => {
    console.log('Shutting down...');
    process.exit(0);
});
