#!/usr/bin/env node

/**
 * IDP Secure Filesystem MCP Server
 * Secure file operations for Claude Desktop with comprehensive governance
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';

// Security configuration
const ALLOWED_WORKSPACE = process.env.FS_WORKSPACE || '/home/ichardart/code';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
const MAX_DIRECTORY_DEPTH = parseInt(process.env.MAX_DIRECTORY_DEPTH) || 10;
const GOVERNANCE_LOG = process.env.GOVERNANCE_LOG || '/home/ichardart/code/infra/logs/filesystem-mcp.log';
const READ_ONLY_MODE = process.env.READ_ONLY_MODE === 'true';

// Forbidden patterns for enhanced security
const FORBIDDEN_PATTERNS = [
  /\.ssh/,
  /\.env/,
  /\.key$/,
  /\.pem$/,
  /password/i,
  /secret/i,
  /token/i,
  /node_modules/,
  /\.git/,
  /\.npm/,
  /\.cache/
];

// File type restrictions
const ALLOWED_EXTENSIONS = new Set([
  '.js', '.ts', '.jsx', '.tsx', '.vue', '.svelte',
  '.py', '.rb', '.php', '.go', '.rs', '.java', '.cpp', '.c', '.h',
  '.html', '.css', '.scss', '.sass', '.less',
  '.json', '.yaml', '.yml', '.toml', '.xml',
  '.md', '.txt', '.rst', '.adoc',
  '.sql', '.sh', '.bash', '.zsh',
  '.dockerfile', '.gitignore', '.gitattributes',
  '.config', '.conf', '.ini', '.env.example'
]);

// Governance logging
function logOperation(operation, details, result, error = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    operation,
    details,
    result: result ? 'SUCCESS' : 'FAILED',
    error: error?.message || null,
    workspace: ALLOWED_WORKSPACE,
    read_only: READ_ONLY_MODE
  };
  
  try {
    fs.appendFile(GOVERNANCE_LOG, JSON.stringify(logEntry) + '\n');
  } catch (logError) {
    console.error('Failed to log operation:', logError);
  }
}

// Security validation functions
function validatePath(filePath) {
  if (!filePath) return { valid: false, reason: 'No path provided' };
  
  try {
    const resolvedPath = path.resolve(ALLOWED_WORKSPACE, filePath);
    const workspacePath = path.resolve(ALLOWED_WORKSPACE);
    
    // Check if path is within workspace
    if (!resolvedPath.startsWith(workspacePath)) {
      return { valid: false, reason: 'Path outside allowed workspace' };
    }
    
    // Check forbidden patterns
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(resolvedPath)) {
        return { valid: false, reason: `Path matches forbidden pattern: ${pattern}` };
      }
    }
    
    // Check directory depth
    const relativePath = path.relative(workspacePath, resolvedPath);
    const depth = relativePath.split(path.sep).length;
    if (depth > MAX_DIRECTORY_DEPTH) {
      return { valid: false, reason: `Path exceeds maximum depth of ${MAX_DIRECTORY_DEPTH}` };
    }
    
    return { valid: true, resolvedPath };
  } catch (error) {
    return { valid: false, reason: `Path validation error: ${error.message}` };
  }
}

function validateFileExtension(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext && !ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, reason: `File extension '${ext}' not allowed` };
  }
  return { valid: true };
}

async function checkFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    if (stats.size > MAX_FILE_SIZE) {
      return { valid: false, reason: `File size ${stats.size} exceeds maximum ${MAX_FILE_SIZE}` };
    }
    return { valid: true };
  } catch (error) {
    return { valid: true }; // File doesn't exist yet, size check not applicable
  }
}

function truncateOutput(content, maxLength = 50000) {
  if (typeof content !== 'string') return content;
  
  if (content.length > maxLength) {
    return content.substring(0, maxLength) + '\n... (content truncated for security)';
  }
  return content;
}

// Initialize MCP server
const server = new Server(
  {
    name: 'idp-filesystem-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define filesystem tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = [
    {
      name: 'read_file',
      description: 'Read the contents of a file',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to the file to read (relative to workspace)'
          }
        },
        required: ['path']
      },
    },
    {
      name: 'list_directory',
      description: 'List the contents of a directory',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to the directory (relative to workspace, default: ".")',
            default: '.'
          },
          recursive: {
            type: 'boolean',
            description: 'List subdirectories recursively',
            default: false
          }
        },
      },
    },
    {
      name: 'get_file_info',
      description: 'Get information about a file or directory',
      inputSchema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to the file or directory'
          }
        },
        required: ['path']
      },
    },
    {
      name: 'search_files',
      description: 'Search for files by name pattern',
      inputSchema: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: 'File name pattern to search for (supports wildcards)'
          },
          directory: {
            type: 'string',
            description: 'Directory to search in (default: ".")',
            default: '.'
          },
          recursive: {
            type: 'boolean',
            description: 'Search recursively in subdirectories',
            default: true
          }
        },
        required: ['pattern']
      },
    }
  ];

  // Add write operations only if not in read-only mode
  if (!READ_ONLY_MODE) {
    tools.push(
      {
        name: 'write_file',
        description: 'Write content to a file',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file to write'
            },
            content: {
              type: 'string',
              description: 'Content to write to the file'
            },
            create_directories: {
              type: 'boolean',
              description: 'Create parent directories if they don\'t exist',
              default: false
            }
          },
          required: ['path', 'content']
        },
      },
      {
        name: 'edit_file',
        description: 'Edit a file by replacing specific content',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file to edit'
            },
            old_content: {
              type: 'string',
              description: 'Content to replace'
            },
            new_content: {
              type: 'string',
              description: 'New content to insert'
            }
          },
          required: ['path', 'old_content', 'new_content']
        },
      },
      {
        name: 'create_directory',
        description: 'Create a new directory',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the directory to create'
            },
            recursive: {
              type: 'boolean',
              description: 'Create parent directories if they don\'t exist',
              default: false
            }
          },
          required: ['path']
        },
      },
      {
        name: 'delete_file',
        description: 'Delete a file or directory (use with caution)',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to the file or directory to delete'
            },
            recursive: {
              type: 'boolean',
              description: 'Delete directories recursively',
              default: false
            }
          },
          required: ['path']
        },
      }
    );
  }

  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    let result;
    let success = true;
    
    switch (name) {
      case 'read_file':
        const readValidation = validatePath(args.path);
        if (!readValidation.valid) {
          throw new Error(`Security validation failed: ${readValidation.reason}`);
        }
        
        const extValidation = validateFileExtension(args.path);
        if (!extValidation.valid) {
          throw new Error(`File type validation failed: ${extValidation.reason}`);
        }
        
        const sizeValidation = await checkFileSize(readValidation.resolvedPath);
        if (!sizeValidation.valid) {
          throw new Error(`File size validation failed: ${sizeValidation.reason}`);
        }
        
        const content = await fs.readFile(readValidation.resolvedPath, 'utf-8');
        logOperation('read_file', { path: args.path }, success);
        
        return {
          content: [
            {
              type: 'text',
              text: `File: ${args.path}\n\n${truncateOutput(content)}`
            }
          ]
        };
        
      case 'list_directory':
        const dirPath = args.path || '.';
        const dirValidation = validatePath(dirPath);
        if (!dirValidation.valid) {
          throw new Error(`Security validation failed: ${dirValidation.reason}`);
        }
        
        async function listDir(dirPath, recursive = false, currentDepth = 0) {
          if (currentDepth > MAX_DIRECTORY_DEPTH) return [];
          
          const items = await fs.readdir(dirPath, { withFileTypes: true });
          let result = [];
          
          for (const item of items) {
            const itemPath = path.join(dirPath, item.name);
            const relativePath = path.relative(ALLOWED_WORKSPACE, itemPath);
            
            if (item.isDirectory()) {
              result.push(`📁 ${relativePath}/`);
              if (recursive) {
                const subItems = await listDir(itemPath, true, currentDepth + 1);
                result.push(...subItems);
              }
            } else {
              const stats = await fs.stat(itemPath);
              const size = stats.size;
              const modified = stats.mtime.toISOString().split('T')[0];
              result.push(`📄 ${relativePath} (${size} bytes, ${modified})`);
            }
          }
          
          return result;
        }
        
        const items = await listDir(dirValidation.resolvedPath, args.recursive);
        logOperation('list_directory', { path: dirPath, recursive: args.recursive }, success);
        
        return {
          content: [
            {
              type: 'text',
              text: `Directory: ${dirPath}\n\n${items.join('\n')}`
            }
          ]
        };
        
      case 'get_file_info':
        const infoValidation = validatePath(args.path);
        if (!infoValidation.valid) {
          throw new Error(`Security validation failed: ${infoValidation.reason}`);
        }
        
        const stats = await fs.stat(infoValidation.resolvedPath);
        const info = {
          path: args.path,
          type: stats.isDirectory() ? 'directory' : 'file',
          size: stats.size,
          created: stats.birthtime.toISOString(),
          modified: stats.mtime.toISOString(),
          permissions: stats.mode.toString(8),
          extension: path.extname(args.path)
        };
        
        logOperation('get_file_info', { path: args.path }, success);
        
        return {
          content: [
            {
              type: 'text',
              text: `File Info: ${args.path}\n\nType: ${info.type}\nSize: ${info.size} bytes\nCreated: ${info.created}\nModified: ${info.modified}\nExtension: ${info.extension}\nPermissions: ${info.permissions}`
            }
          ]
        };
        
      case 'search_files':
        const searchDir = args.directory || '.';
        const searchValidation = validatePath(searchDir);
        if (!searchValidation.valid) {
          throw new Error(`Security validation failed: ${searchValidation.reason}`);
        }
        
        async function searchFiles(dir, pattern, recursive = true, currentDepth = 0) {
          if (currentDepth > MAX_DIRECTORY_DEPTH) return [];
          
          const items = await fs.readdir(dir, { withFileTypes: true });
          let matches = [];
          
          for (const item of items) {
            const itemPath = path.join(dir, item.name);
            const relativePath = path.relative(ALLOWED_WORKSPACE, itemPath);
            
            // Check if filename matches pattern (simple wildcard support)
            const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'), 'i');
            
            if (item.isFile() && regex.test(item.name)) {
              matches.push(relativePath);
            } else if (item.isDirectory() && recursive) {
              const subMatches = await searchFiles(itemPath, pattern, true, currentDepth + 1);
              matches.push(...subMatches);
            }
          }
          
          return matches;
        }
        
        const matches = await searchFiles(searchValidation.resolvedPath, args.pattern, args.recursive);
        logOperation('search_files', { pattern: args.pattern, directory: searchDir }, success);
        
        return {
          content: [
            {
              type: 'text',
              text: `Search Results for "${args.pattern}" in ${searchDir}:\n\n${matches.length > 0 ? matches.join('\n') : 'No matches found'}`
            }
          ]
        };
        
      // Write operations (only if not read-only)
      case 'write_file':
        if (READ_ONLY_MODE) {
          throw new Error('Write operations disabled in read-only mode');
        }
        
        const writeValidation = validatePath(args.path);
        if (!writeValidation.valid) {
          throw new Error(`Security validation failed: ${writeValidation.reason}`);
        }
        
        const writeExtValidation = validateFileExtension(args.path);
        if (!writeExtValidation.valid) {
          throw new Error(`File type validation failed: ${writeExtValidation.reason}`);
        }
        
        if (args.content.length > MAX_FILE_SIZE) {
          throw new Error(`Content size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`);
        }
        
        if (args.create_directories) {
          const dir = path.dirname(writeValidation.resolvedPath);
          await fs.mkdir(dir, { recursive: true });
        }
        
        await fs.writeFile(writeValidation.resolvedPath, args.content, 'utf-8');
        logOperation('write_file', { path: args.path, size: args.content.length }, success);
        
        return {
          content: [
            {
              type: 'text',
              text: `File written: ${args.path} (${args.content.length} bytes)`
            }
          ]
        };
        
      case 'edit_file':
        if (READ_ONLY_MODE) {
          throw new Error('Write operations disabled in read-only mode');
        }
        
        const editValidation = validatePath(args.path);
        if (!editValidation.valid) {
          throw new Error(`Security validation failed: ${editValidation.reason}`);
        }
        
        const currentContent = await fs.readFile(editValidation.resolvedPath, 'utf-8');
        const newContent = currentContent.replace(args.old_content, args.new_content);
        
        if (newContent === currentContent) {
          throw new Error('Old content not found in file');
        }
        
        await fs.writeFile(editValidation.resolvedPath, newContent, 'utf-8');
        logOperation('edit_file', { path: args.path, oldLength: args.old_content.length, newLength: args.new_content.length }, success);
        
        return {
          content: [
            {
              type: 'text',
              text: `File edited: ${args.path} (replaced ${args.old_content.length} chars with ${args.new_content.length} chars)`
            }
          ]
        };
        
      case 'create_directory':
        if (READ_ONLY_MODE) {
          throw new Error('Write operations disabled in read-only mode');
        }
        
        const mkdirValidation = validatePath(args.path);
        if (!mkdirValidation.valid) {
          throw new Error(`Security validation failed: ${mkdirValidation.reason}`);
        }
        
        await fs.mkdir(mkdirValidation.resolvedPath, { recursive: args.recursive });
        logOperation('create_directory', { path: args.path, recursive: args.recursive }, success);
        
        return {
          content: [
            {
              type: 'text',
              text: `Directory created: ${args.path}`
            }
          ]
        };
        
      case 'delete_file':
        if (READ_ONLY_MODE) {
          throw new Error('Write operations disabled in read-only mode');
        }
        
        const deleteValidation = validatePath(args.path);
        if (!deleteValidation.valid) {
          throw new Error(`Security validation failed: ${deleteValidation.reason}`);
        }
        
        const deleteStats = await fs.stat(deleteValidation.resolvedPath);
        if (deleteStats.isDirectory()) {
          await fs.rmdir(deleteValidation.resolvedPath, { recursive: args.recursive });
        } else {
          await fs.unlink(deleteValidation.resolvedPath);
        }
        
        logOperation('delete_file', { path: args.path, recursive: args.recursive }, success);
        
        return {
          content: [
            {
              type: 'text',
              text: `Deleted: ${args.path}`
            }
          ]
        };
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logOperation(name, args, false, error);
    return {
      content: [
        {
          type: 'text',
          text: `Error executing ${name}: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`IDP Filesystem MCP Server running (read-only: ${READ_ONLY_MODE})`);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});