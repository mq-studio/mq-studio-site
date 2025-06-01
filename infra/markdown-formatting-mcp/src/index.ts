// Markdown Formatting MCP Server Entry Point
import { MCPServer, Tool } from "@modelcontextprotocol/sdk";
import { MarkdownFormatter } from "./markdown-formatting";

// Initialize the MCP server
const server = new MCPServer({
  name: "markdown-formatting-mcp",
  description: "Tools for proper markdown formatting, especially nested code blocks"
});

// Create markdown formatter instance
const markdownFormatter = new MarkdownFormatter();

// Register tools
server.registerTool(new Tool({
  name: "format_nested_markdown",
  description: "Format markdown content with nested code blocks using the fence quantity variation technique",
  parameters: {
    content: {
      type: "string",
      description: "The outer markdown content"
    },
    inner_code: {
      type: "string",
      description: "The code that should be nested inside the markdown"
    },
    inner_language: {
      type: "string",
      description: "The language of the inner code block for syntax highlighting"
    }
  },
  handler: async (toolCall) => {
    const content = toolCall.parameters.content;
    const innerCode = toolCall.parameters.inner_code;
    const innerLanguage = toolCall.parameters.inner_language;
    
    const result = markdownFormatter.formatNestedMarkdown(content, innerCode, innerLanguage);
    
    return {
      success: true,
      result: result
    };
  }
}));

server.registerTool(new Tool({
  name: "validate_markdown",
  description: "Validate markdown content for proper formatting",
  parameters: {
    content: {
      type: "string",
      description: "The markdown content to validate"
    }
  },
  handler: async (toolCall) => {
    const content = toolCall.parameters.content;
    
    const result = markdownFormatter.validateMarkdown(content);
    
    return {
      success: true,
      result: result
    };
  }
}));

// Start the server
server.listen(3006, "127.0.0.1");
console.log("Markdown Formatting MCP Server started on port 3006");
