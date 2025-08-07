const { MCPServer } = require('@modelcontextprotocol/sdk/server');

describe('graphiti-mcp MCP Server', () => {
    let server;

    beforeEach(() => {
        server = new MCPServer({
            name: 'graphiti-mcp',
            version: '1.0.0'
        });
    });

    afterEach(async () => {
        if (server) {
            await server.close();
        }
    });

    test('should initialize server successfully', () => {
        expect(server).toBeDefined();
        expect(server.name).toBe('graphiti-mcp');
    });

    test('should handle basic MCP protocol', () => {
        expect(server.listTools).toBeDefined();
        expect(server.callTool).toBeDefined();
    });

    test('should handle errors gracefully', async () => {
        // Test error handling
        expect(() => {
            server.callTool('nonexistent-tool', {});
        }).not.toThrow();
    });
});