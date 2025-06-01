#!/usr/bin/env node

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const axios = require('axios');

const server = new Server(
  {
    name: "fetch-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool to fetch URL content
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "fetch") {
    const { url, method = "GET", headers = {}, data = null } = args;

    try {
      // Basic URL validation
      if (!url || typeof url !== 'string') {
        throw new Error('URL parameter is required and must be a string');
      }

      // Create request config
      const requestConfig = {
        method: method.toUpperCase(),
        url: url,
        headers: {
          'User-Agent': 'fetch-mcp/1.0.0',
          ...headers
        },
        timeout: 30000, // 30 second timeout
        maxRedirects: 5,
      };

      // Add data for POST/PUT requests
      if (data && ['POST', 'PUT', 'PATCH'].includes(requestConfig.method)) {
        requestConfig.data = data;
      }

      // Make the request
      const response = await axios(requestConfig);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              data: response.data,
              url: response.config.url
            }, null, 2)
          }
        ]
      };

    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching ${url}: ${error.message}`
          }
        ],
        isError: true
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// List available tools
server.setRequestHandler("tools/list", async () => {
  return {
    tools: [
      {
        name: "fetch",
        description: "Fetch content from a URL using HTTP requests",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              description: "The URL to fetch"
            },
            method: {
              type: "string",
              description: "HTTP method (GET, POST, PUT, DELETE, etc.)",
              default: "GET"
            },
            headers: {
              type: "object",
              description: "Optional HTTP headers"
            },
            data: {
              type: ["object", "string"],
              description: "Optional request body data for POST/PUT requests"
            }
          },
          required: ["url"]
        }
      }
    ]
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Fetch MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});