import { WSLCommandHelper } from "./wsl-helper";
import { MCPServer, Tool } from "@modelcontextprotocol/sdk";

// Initialize the MCP server
const server = new MCPServer({
  name: "wsl-helper-mcp",
  description: "Helper for executing WSL commands safely and consistently"
});

// Create WSL helper instance
const wslHelper = new WSLCommandHelper();

// Register tools
server.registerTool(new Tool({
  name: "execute_wsl_command",
  description: "Execute a command in the WSL environment",
  parameters: {
    command: {
      type: "string",
      description: "The command to execute in the WSL environment"
    }
  },
  handler: async (toolCall) => {
    const command = toolCall.parameters.command;
    
    if (!command) {
      return {
        success: false,
        error: {
          message: "Command is required"
        }
      };
    }
    
    const result = await wslHelper.executeCommand(command);
    
    return {
      success: result.success,
      result: result.success ? { stdout: result.stdout, stderr: result.stderr } : undefined,
      error: !result.success ? { message: result.error } : undefined
    };
  }
}));

server.registerTool(new Tool({
  name: "validate_wsl_access",
  description: "Validate access to the WSL environment",
  parameters: {},
  handler: async () => {
    const validation = await wslHelper.validateWSLAccess();
    
    return {
      success: validation.available,
      result: { available: validation.available, message: validation.message }
    };
  }
}));

// Start the server
server.listen(3005, "127.0.0.1");
console.log("WSL Helper MCP Server started on port 3005");
