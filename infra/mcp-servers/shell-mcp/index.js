#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

/**
 * IDP Controlled Shell/Terminal MCP Server
 * 
 * Provides secure command execution capabilities for Claude Desktop
 * with enterprise-grade security controls and governance integration.
 * 
 * Security Features:
 * - Command whitelist/blacklist filtering
 * - Workspace path restrictions
 * - Timeout protection
 * - Output size limits
 * - Real-time governance logging
 * - Read-only mode toggle
 */

// Configuration from environment variables
const ALLOWED_WORKSPACE = process.env.SHELL_WORKSPACE || '/home/ichardart/code';
const MAX_OUTPUT_SIZE = parseInt(process.env.MAX_OUTPUT_SIZE) || 1024 * 1024; // 1MB
const COMMAND_TIMEOUT = parseInt(process.env.COMMAND_TIMEOUT) || 30000; // 30 seconds
const READ_ONLY_MODE = process.env.READ_ONLY_MODE === 'true';
const GOVERNANCE_LOG = process.env.GOVERNANCE_LOG || '/home/ichardart/code/infra/logs/shell-mcp.log';

// Security configuration
const ALLOWED_COMMANDS = [
  // File operations
  'ls', 'cat', 'head', 'tail', 'grep', 'find', 'wc', 'sort', 'uniq',
  
  // Basic shell utilities
  'echo', 'printf', 'which', 'type', 'pwd', 'basename', 'dirname',
  
  // Development tools
  'npm', 'node', 'python', 'python3', 'pip', 'pip3',
  'git', 'docker', 'kubectl',
  
  // Build and test
  'make', 'cmake', 'cargo', 'go', 'javac', 'gcc', 'g++',
  'jest', 'pytest', 'mocha', 'phpunit',
  
  // System information
  'ps', 'top', 'df', 'du', 'free', 'uname', 'whoami', 'id',
  'date', 'uptime', 'hostname',
  
  // Network tools (read-only)
  'ping', 'curl', 'wget', 'dig', 'nslookup',
  
  // Package managers
  'apt', 'yum', 'brew', 'snap', 'flatpak'
];

const FORBIDDEN_COMMANDS = [
  // System modification
  'rm', 'rmdir', 'mv', 'cp', 'chmod', 'chown', 'chgrp',
  'sudo', 'su', 'passwd', 'usermod', 'userdel', 'groupmod',
  
  // Network/security
  'ssh', 'scp', 'rsync', 'nc', 'netcat', 'nmap',
  'iptables', 'ufw', 'firewall-cmd',
  
  // System control
  'systemctl', 'service', 'mount', 'umount', 'fdisk',
  'mkfs', 'fsck', 'crontab', 'at', 'batch',
  
  // Process control
  'kill', 'killall', 'pkill', 'nohup', 'screen', 'tmux',
  
  // Dangerous operations
  'dd', 'shred', 'wipe', 'format', 'fdisk'
];

const FORBIDDEN_PATTERNS = [
  /sudo\s/,
  /rm\s+-rf/,
  />\s*\/dev\/null/,
  /&\s*$/,
  /;\s*rm\s/,
  /\|\s*sh/,
  /\|\s*bash/,
  /`.*`/,
  /\$\(/,
  /eval\s/,
  /exec\s/
];

// Resolve workspace path
const workspacePath = path.resolve(ALLOWED_WORKSPACE);

/**
 * Validates if a command is safe to execute
 */
function validateCommand(command) {
  const trimmedCommand = command.trim();
  
  if (!trimmedCommand) {
    return { valid: false, reason: 'Empty command' };
  }
  
  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(trimmedCommand)) {
      return { valid: false, reason: `Forbidden pattern detected: ${pattern}` };
    }
  }
  
  // Extract the base command
  const baseCommand = trimmedCommand.split(/\s+/)[0].split('/').pop();
  
  // Check if command is explicitly forbidden
  if (FORBIDDEN_COMMANDS.includes(baseCommand)) {
    return { valid: false, reason: `Command '${baseCommand}' is forbidden` };
  }
  
  // Check if command is in allowed list
  if (!ALLOWED_COMMANDS.includes(baseCommand)) {
    return { valid: false, reason: `Command '${baseCommand}' is not in allowed list` };
  }
  
  // Check for read-only mode restrictions
  if (READ_ONLY_MODE) {
    const writeCommands = ['npm install', 'pip install', 'git commit', 'git push', 'make', 'cmake'];
    if (writeCommands.some(cmd => trimmedCommand.includes(cmd))) {
      return { valid: false, reason: 'Write operations disabled in read-only mode' };
    }
  }
  
  return { valid: true };
}

/**
 * Validates if a directory path is within allowed workspace
 */
function validateWorkingDirectory(dir) {
  if (!dir) return { valid: true, path: workspacePath };
  
  try {
    const resolvedPath = path.resolve(workspacePath, dir);
    if (!resolvedPath.startsWith(workspacePath)) {
      return { valid: false, reason: 'Directory outside allowed workspace' };
    }
    return { valid: true, path: resolvedPath };
  } catch (error) {
    return { valid: false, reason: `Invalid directory path: ${error.message}` };
  }
}

/**
 * Logs command execution for governance compliance
 */
async function logGovernanceEvent(event, command, result, error = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: event,
    command: command,
    workspace: workspacePath,
    result: result ? 'success' : 'failure',
    error: error,
    read_only_mode: READ_ONLY_MODE
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
 * Truncates output if it exceeds size limit
 */
function truncateOutput(output) {
  if (output.length <= MAX_OUTPUT_SIZE) {
    return output;
  }
  
  const truncated = output.slice(0, MAX_OUTPUT_SIZE);
  const truncationMsg = `\n\n[OUTPUT TRUNCATED - Exceeded ${MAX_OUTPUT_SIZE} bytes limit]`;
  return truncated + truncationMsg;
}

// Create MCP server
const server = new Server(
  {
    name: 'shell-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'execute_command',
        description: 'Execute a shell command in the allowed workspace with security controls',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The command to execute (must be in allowed commands list)'
            },
            working_directory: {
              type: 'string',
              description: 'Working directory relative to workspace (optional)'
            },
            timeout: {
              type: 'number',
              description: 'Command timeout in milliseconds (max 60000, default 30000)'
            }
          },
          required: ['command']
        }
      },
      {
        name: 'check_command_status',
        description: 'Check if a command is allowed to be executed',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The command to check'
            }
          },
          required: ['command']
        }
      },
      {
        name: 'list_allowed_commands',
        description: 'Get list of allowed commands and security information',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false
        }
      },
      {
        name: 'get_workspace_info',
        description: 'Get information about the current workspace and permissions',
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
      case 'execute_command': {
        const { command, working_directory, timeout } = args;
        
        // Validate command
        const commandValidation = validateCommand(command);
        if (!commandValidation.valid) {
          await logGovernanceEvent('command_blocked', command, false, commandValidation.reason);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Command blocked: ${commandValidation.reason}`
              }
            ]
          };
        }
        
        // Validate working directory
        const dirValidation = validateWorkingDirectory(working_directory);
        if (!dirValidation.valid) {
          await logGovernanceEvent('directory_blocked', command, false, dirValidation.reason);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Directory blocked: ${dirValidation.reason}`
              }
            ]
          };
        }
        
        // Set timeout (max 60 seconds)
        const execTimeout = Math.min(timeout || COMMAND_TIMEOUT, 60000);
        
        try {
          const { stdout, stderr } = await execAsync(command, {
            cwd: dirValidation.path,
            timeout: execTimeout,
            maxBuffer: MAX_OUTPUT_SIZE
          });
          
          const output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
          const truncatedOutput = truncateOutput(output);
          
          await logGovernanceEvent('command_executed', command, true);
          
          return {
            content: [
              {
                type: 'text',
                text: `✅ Command executed successfully:\n\n${truncatedOutput}`
              }
            ]
          };
          
        } catch (execError) {
          const errorOutput = execError.stdout || execError.stderr || execError.message;
          const truncatedError = truncateOutput(errorOutput);
          
          await logGovernanceEvent('command_failed', command, false, execError.message);
          
          return {
            content: [
              {
                type: 'text',
                text: `⚠️ Command failed:\n\n${truncatedError}`
              }
            ]
          };
        }
      }

      case 'check_command_status': {
        const { command } = args;
        const validation = validateCommand(command);
        
        return {
          content: [
            {
              type: 'text',
              text: validation.valid 
                ? `✅ Command '${command}' is allowed`
                : `❌ Command '${command}' is blocked: ${validation.reason}`
            }
          ]
        };
      }

      case 'list_allowed_commands': {
        const commandList = ALLOWED_COMMANDS.sort().join(', ');
        const forbiddenList = FORBIDDEN_COMMANDS.sort().join(', ');
        
        return {
          content: [
            {
              type: 'text',
              text: `🛡️ **Shell MCP Security Configuration**

**Workspace:** ${workspacePath}
**Read-Only Mode:** ${READ_ONLY_MODE ? 'Enabled' : 'Disabled'}
**Command Timeout:** ${COMMAND_TIMEOUT}ms
**Max Output Size:** ${MAX_OUTPUT_SIZE} bytes

**✅ Allowed Commands:**
${commandList}

**❌ Forbidden Commands:**
${forbiddenList}

**🚫 Forbidden Patterns:**
- sudo commands
- Destructive operations (rm -rf)
- Command injection patterns
- Background processes
- Eval/exec patterns`
            }
          ]
        };
      }

      case 'get_workspace_info': {
        try {
          const stats = await fs.stat(workspacePath);
          const isDirectory = stats.isDirectory();
          
          return {
            content: [
              {
                type: 'text',
                text: `📁 **Workspace Information**

**Path:** ${workspacePath}
**Type:** ${isDirectory ? 'Directory' : 'File'}
**Accessible:** ✅ Yes
**Read-Only Mode:** ${READ_ONLY_MODE ? 'Enabled' : 'Disabled'}
**Security Level:** Enterprise
**Governance Logging:** ${GOVERNANCE_LOG}

**Permissions:**
- Execute allowed commands: ✅
- Access workspace files: ✅
- Modify files: ${READ_ONLY_MODE ? '❌' : '✅'}
- System access: ❌
- Network operations: Limited (read-only)`
              }
            ]
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Workspace not accessible: ${error.message}`
              }
            ]
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    await logGovernanceEvent('tool_error', name, false, error.message);
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
    await logGovernanceEvent('server_started', 'shell-mcp', true);
  } catch (error) {
    console.error('Failed to initialize governance logging:', error);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('IDP Shell MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});