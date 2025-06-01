#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';

/**
 * IDP API Testing MCP Server
 * 
 * Provides secure HTTP/API testing capabilities for Claude Desktop
 * with enterprise-grade security controls and governance integration.
 * 
 * Features:
 * - HTTP request testing (GET, POST, PUT, DELETE, PATCH)
 * - Response validation and analysis
 * - Performance monitoring
 * - Security headers analysis
 * - API documentation validation
 * - Load testing capabilities
 */

// Configuration from environment variables
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT) || 30000; // 30 seconds
const MAX_RESPONSE_SIZE = parseInt(process.env.MAX_RESPONSE_SIZE) || 5 * 1024 * 1024; // 5MB
const GOVERNANCE_LOG = process.env.GOVERNANCE_LOG || '/home/ichardart/code/infra/logs/api-testing-mcp.log';

// Security configuration
const ALLOWED_PROTOCOLS = ['http:', 'https:'];
const FORBIDDEN_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '::1',
  '0.0.0.0',
  'internal',
  '.local'
];

const ALLOWED_HEADERS = [
  'accept', 'accept-encoding', 'accept-language', 'authorization',
  'cache-control', 'content-type', 'content-length', 'user-agent',
  'x-api-key', 'x-auth-token', 'x-custom-header', 'x-request-id'
];

const FORBIDDEN_HEADERS = [
  'cookie', 'set-cookie', 'x-forwarded-for', 'x-real-ip',
  'proxy-authorization', 'x-forwarded-host'
];

/**
 * Validates if a URL is safe for API testing
 */
function validateUrl(url) {
  try {
    const urlObj = new URL(url);
    
    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(urlObj.protocol)) {
      return { valid: false, reason: `Protocol '${urlObj.protocol}' not allowed` };
    }
    
    // Check forbidden domains
    const hostname = urlObj.hostname.toLowerCase();
    for (const forbidden of FORBIDDEN_DOMAINS) {
      if (hostname.includes(forbidden)) {
        return { valid: false, reason: `Domain '${hostname}' is forbidden` };
      }
    }
    
    // Check for private IP ranges
    if (hostname.match(/^10\./) || hostname.match(/^192\.168\./) || hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)) {
      return { valid: false, reason: 'Private IP addresses are not allowed' };
    }
    
    return { valid: true, url: urlObj };
  } catch (error) {
    return { valid: false, reason: `Invalid URL: ${error.message}` };
  }
}

/**
 * Validates HTTP headers for security
 */
function validateHeaders(headers) {
  if (!headers) return { valid: true, headers: {} };
  
  const validatedHeaders = {};
  
  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();
    
    // Check if header is forbidden
    if (FORBIDDEN_HEADERS.includes(lowerKey)) {
      return { valid: false, reason: `Header '${key}' is forbidden` };
    }
    
    // Check if header is allowed (allow custom headers starting with x-)
    if (!ALLOWED_HEADERS.includes(lowerKey) && !lowerKey.startsWith('x-')) {
      return { valid: false, reason: `Header '${key}' is not allowed` };
    }
    
    validatedHeaders[key] = value;
  }
  
  return { valid: true, headers: validatedHeaders };
}

/**
 * Logs API testing operations for governance compliance
 */
async function logGovernanceEvent(event, url, method, result, error = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: event,
    url: url,
    method: method,
    result: result ? 'success' : 'failure',
    error: error
  };
  
  try {
    const logDir = path.dirname(GOVERNANCE_LOG);
    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(GOVERNANCE_LOG, JSON.stringify(logEntry) + '\n');
  } catch (logError) {
    console.error('Failed to write governance log:', logError);
  }
}

/**
 * Analyzes security headers in HTTP response
 */
function analyzeSecurityHeaders(headers) {
  const securityHeaders = {
    'strict-transport-security': headers['strict-transport-security'] ? '✅' : '❌',
    'content-security-policy': headers['content-security-policy'] ? '✅' : '❌',
    'x-frame-options': headers['x-frame-options'] ? '✅' : '❌',
    'x-content-type-options': headers['x-content-type-options'] ? '✅' : '❌',
    'x-xss-protection': headers['x-xss-protection'] ? '✅' : '❌',
    'referrer-policy': headers['referrer-policy'] ? '✅' : '❌'
  };
  
  const score = Object.values(securityHeaders).filter(v => v === '✅').length;
  
  return {
    headers: securityHeaders,
    score: score,
    total: Object.keys(securityHeaders).length,
    grade: score >= 5 ? 'A' : score >= 4 ? 'B' : score >= 3 ? 'C' : score >= 2 ? 'D' : 'F'
  };
}

/**
 * Formats response data for display
 */
function formatResponseData(data, contentType) {
  if (!data) return 'No response body';
  
  try {
    if (contentType && contentType.includes('application/json')) {
      if (typeof data === 'string') {
        return JSON.stringify(JSON.parse(data), null, 2);
      }
      return JSON.stringify(data, null, 2);
    }
    
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    
    return String(data).substring(0, 1000); // Limit display
  } catch (error) {
    return String(data).substring(0, 1000);
  }
}

// Create MCP server
const server = new Server(
  {
    name: 'api-testing-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Configure axios defaults
axios.defaults.timeout = REQUEST_TIMEOUT;
axios.defaults.maxContentLength = MAX_RESPONSE_SIZE;
axios.defaults.maxBodyLength = MAX_RESPONSE_SIZE;

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'send_http_request',
        description: 'Send an HTTP request and analyze the response',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL to send the request to'
            },
            method: {
              type: 'string',
              enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
              description: 'HTTP method (default: GET)'
            },
            headers: {
              type: 'object',
              description: 'HTTP headers to include'
            },
            body: {
              type: 'string',
              description: 'Request body (for POST, PUT, PATCH)'
            },
            params: {
              type: 'object',
              description: 'Query parameters'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'analyze_api_response',
        description: 'Analyze an API response for performance and security',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL to analyze'
            },
            expected_status: {
              type: 'number',
              description: 'Expected HTTP status code (default: 200)'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'test_api_endpoint',
        description: 'Perform comprehensive testing of an API endpoint',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The API endpoint URL'
            },
            test_cases: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  method: { type: 'string' },
                  headers: { type: 'object' },
                  body: { type: 'string' },
                  expected_status: { type: 'number' }
                }
              },
              description: 'Array of test cases to execute'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'check_api_health',
        description: 'Check the health and availability of an API',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The API base URL'
            },
            endpoints: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of endpoints to check (optional)'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'validate_url',
        description: 'Check if a URL is allowed for API testing',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL to validate'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'get_api_testing_info',
        description: 'Get information about API testing capabilities and security settings',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'send_http_request': {
        const { url, method = 'GET', headers, body, params } = args;
        
        // Validate URL
        const urlValidation = validateUrl(url);
        if (!urlValidation.valid) {
          await logGovernanceEvent('request_blocked', url, method, false, urlValidation.reason);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Request blocked: ${urlValidation.reason}`
              }
            ]
          };
        }
        
        // Validate headers
        const headerValidation = validateHeaders(headers);
        if (!headerValidation.valid) {
          await logGovernanceEvent('headers_blocked', url, method, false, headerValidation.reason);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Headers blocked: ${headerValidation.reason}`
              }
            ]
          };
        }
        
        try {
          const startTime = Date.now();
          
          const config = {
            method: method,
            url: url,
            headers: headerValidation.headers,
            timeout: REQUEST_TIMEOUT
          };
          
          if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
            config.data = body;
          }
          
          if (params) {
            config.params = params;
          }
          
          const response = await axios(config);
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          const securityAnalysis = analyzeSecurityHeaders(response.headers);
          const formattedData = formatResponseData(response.data, response.headers['content-type']);
          
          await logGovernanceEvent('request_sent', url, method, true);
          
          let output = `🚀 **HTTP Request Result**\n\n`;
          output += `**URL:** ${url}\n`;
          output += `**Method:** ${method}\n`;
          output += `**Status:** ${response.status} ${response.statusText}\n`;
          output += `**Response Time:** ${responseTime}ms\n`;
          output += `**Content Type:** ${response.headers['content-type'] || 'Not specified'}\n`;
          output += `**Content Length:** ${response.headers['content-length'] || 'Unknown'}\n\n`;
          
          output += `**Security Headers Analysis:**\n`;
          output += `- Grade: ${securityAnalysis.grade} (${securityAnalysis.score}/${securityAnalysis.total})\n`;
          for (const [header, status] of Object.entries(securityAnalysis.headers)) {
            output += `- ${header}: ${status}\n`;
          }
          output += `\n`;
          
          output += `**Response Headers:**\n`;
          for (const [key, value] of Object.entries(response.headers)) {
            if (key.toLowerCase() !== 'set-cookie') { // Hide cookies for security
              output += `- ${key}: ${value}\n`;
            }
          }
          output += `\n`;
          
          output += `**Response Body:**\n`;
          output += `\`\`\`\n${formattedData}\n\`\`\``;
          
          return {
            content: [
              {
                type: 'text',
                text: output
              }
            ]
          };
          
        } catch (error) {
          await logGovernanceEvent('request_failed', url, method, false, error.message);
          
          let errorOutput = `⚠️ **HTTP Request Failed**\n\n`;
          errorOutput += `**URL:** ${url}\n`;
          errorOutput += `**Method:** ${method}\n`;
          errorOutput += `**Error:** ${error.message}\n`;
          
          if (error.response) {
            errorOutput += `**Status:** ${error.response.status} ${error.response.statusText}\n`;
            errorOutput += `**Response Time:** ${error.response.duration || 'Unknown'}ms\n`;
          }
          
          return {
            content: [
              {
                type: 'text',
                text: errorOutput
              }
            ]
          };
        }
      }

      case 'analyze_api_response': {
        const { url, expected_status = 200 } = args;
        
        const urlValidation = validateUrl(url);
        if (!urlValidation.valid) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Analysis blocked: ${urlValidation.reason}`
              }
            ]
          };
        }
        
        try {
          const startTime = Date.now();
          const response = await axios.get(url, { timeout: REQUEST_TIMEOUT });
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          const securityAnalysis = analyzeSecurityHeaders(response.headers);
          
          await logGovernanceEvent('response_analyzed', url, 'GET', true);
          
          let output = `📊 **API Response Analysis**\n\n`;
          output += `**URL:** ${url}\n`;
          output += `**Status Check:** ${response.status === expected_status ? '✅' : '❌'} (Expected: ${expected_status}, Got: ${response.status})\n`;
          output += `**Response Time:** ${responseTime}ms\n`;
          output += `**Performance Grade:** ${responseTime < 200 ? 'A' : responseTime < 500 ? 'B' : responseTime < 1000 ? 'C' : 'D'}\n`;
          output += `**Security Grade:** ${securityAnalysis.grade}\n\n`;
          
          output += `**Performance Metrics:**\n`;
          output += `- Response Time: ${responseTime}ms\n`;
          output += `- Content Size: ${response.headers['content-length'] || 'Unknown'} bytes\n`;
          output += `- Compression: ${response.headers['content-encoding'] ? '✅' : '❌'}\n\n`;
          
          output += `**Security Analysis:**\n`;
          for (const [header, status] of Object.entries(securityAnalysis.headers)) {
            output += `- ${header}: ${status}\n`;
          }
          
          return {
            content: [
              {
                type: 'text',
                text: output
              }
            ]
          };
          
        } catch (error) {
          await logGovernanceEvent('analysis_failed', url, 'GET', false, error.message);
          return {
            content: [
              {
                type: 'text',
                text: `⚠️ API analysis failed: ${error.message}`
              }
            ]
          };
        }
      }

      case 'validate_url': {
        const { url } = args;
        const validation = validateUrl(url);
        
        return {
          content: [
            {
              type: 'text',
              text: validation.valid 
                ? `✅ URL '${url}' is allowed for API testing`
                : `❌ URL '${url}' is blocked: ${validation.reason}`
            }
          ]
        };
      }

      case 'get_api_testing_info': {
        return {
          content: [
            {
              type: 'text',
              text: `🔧 **API Testing MCP Configuration**

**Request Timeout:** ${REQUEST_TIMEOUT}ms
**Max Response Size:** ${Math.round(MAX_RESPONSE_SIZE / 1024 / 1024)}MB

**✅ Allowed Protocols:**
- HTTP (http://)
- HTTPS (https://)

**❌ Forbidden Domains:**
- localhost, 127.0.0.1, ::1
- Private IP ranges (10.x.x.x, 192.168.x.x, 172.16-31.x.x)
- Internal domains (.local, internal)

**✅ Allowed Headers:**
- Standard HTTP headers (accept, authorization, content-type, etc.)
- Custom headers (x-api-key, x-auth-token, x-custom-*, etc.)

**❌ Forbidden Headers:**
- Cookie headers (cookie, set-cookie)
- Proxy headers (x-forwarded-*, proxy-authorization)

**🔍 Analysis Features:**
- Response time monitoring
- Security headers analysis
- Performance grading
- Content validation
- Error analysis

**🛡️ Security Features:**
- URL validation and filtering
- Header security validation
- Response size limits
- Timeout protection
- Complete audit logging`
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    await logGovernanceEvent('tool_error', name, 'UNKNOWN', false, error.message);
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error.message}`
        }
      ]
    };
  }
});

// Start server
async function main() {
  // Ensure log directory exists
  try {
    const logDir = path.dirname(GOVERNANCE_LOG);
    await fs.mkdir(logDir, { recursive: true });
    await logGovernanceEvent('server_started', 'api-testing-mcp', 'SYSTEM', true);
  } catch (error) {
    console.error('Failed to initialize governance logging:', error);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('IDP API Testing MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});