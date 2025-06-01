#!/usr/bin/env node

/**
 * IDP Git MCP Server
 * Secure Git operations for Claude Desktop with governance integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import simpleGit from 'simple-git';
import path from 'path';
import fs from 'fs';

// Security configuration
const ALLOWED_WORKSPACE = process.env.GIT_WORKSPACE || '/home/ichardart/code';
const MAX_DIFF_SIZE = 100000; // 100KB max diff output
const GOVERNANCE_LOG = process.env.GOVERNANCE_LOG || '/home/ichardart/code/infra/logs/git-mcp.log';

// Initialize git with workspace restriction
const git = simpleGit({
  baseDir: ALLOWED_WORKSPACE,
  binary: 'git',
  maxConcurrentProcesses: 1,
  timeout: {
    block: 30000, // 30 second timeout
  }
});

// Governance logging
function logOperation(operation, details, result) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    operation,
    details,
    result: result ? 'SUCCESS' : 'FAILED',
    workspace: ALLOWED_WORKSPACE
  };
  
  try {
    fs.appendFileSync(GOVERNANCE_LOG, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    console.error('Failed to log operation:', error);
  }
}

// Security validation
function validatePath(filePath) {
  if (!filePath) return true; // Allow operations without specific paths
  
  const resolvedPath = path.resolve(ALLOWED_WORKSPACE, filePath);
  return resolvedPath.startsWith(path.resolve(ALLOWED_WORKSPACE));
}

function truncateOutput(output, maxSize = MAX_DIFF_SIZE) {
  if (typeof output !== 'string') return output;
  
  if (output.length > maxSize) {
    return output.substring(0, maxSize) + '\n... (output truncated for security)';
  }
  return output;
}

// Initialize MCP server
const server = new Server(
  {
    name: 'idp-git-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define Git tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'git_status',
        description: 'Get the current git status of the repository',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'git_log',
        description: 'Show git commit history',
        inputSchema: {
          type: 'object',
          properties: {
            maxCount: {
              type: 'number',
              description: 'Maximum number of commits to show (default: 10, max: 50)',
              default: 10
            },
            oneline: {
              type: 'boolean',
              description: 'Show commits in oneline format',
              default: true
            }
          },
        },
      },
      {
        name: 'git_diff',
        description: 'Show git diff for staged or unstaged changes',
        inputSchema: {
          type: 'object',
          properties: {
            staged: {
              type: 'boolean',
              description: 'Show staged changes (--cached)',
              default: false
            },
            file: {
              type: 'string',
              description: 'Specific file to diff (optional)'
            }
          },
        },
      },
      {
        name: 'git_branch',
        description: 'List, create, or switch git branches',
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['list', 'create', 'switch', 'delete'],
              description: 'Branch action to perform'
            },
            name: {
              type: 'string',
              description: 'Branch name (required for create, switch, delete)'
            },
            force: {
              type: 'boolean',
              description: 'Force action (for delete)',
              default: false
            }
          },
          required: ['action']
        },
      },
      {
        name: 'git_add',
        description: 'Stage files for commit',
        inputSchema: {
          type: 'object',
          properties: {
            files: {
              type: 'array',
              items: { type: 'string' },
              description: 'Files to stage (use ["."] for all files)'
            }
          },
          required: ['files']
        },
      },
      {
        name: 'git_commit',
        description: 'Create a git commit',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Commit message'
            },
            all: {
              type: 'boolean',
              description: 'Automatically stage all modified files',
              default: false
            }
          },
          required: ['message']
        },
      },
      {
        name: 'git_push',
        description: 'Push commits to remote repository',
        inputSchema: {
          type: 'object',
          properties: {
            remote: {
              type: 'string',
              description: 'Remote name (default: origin)',
              default: 'origin'
            },
            branch: {
              type: 'string',
              description: 'Branch name (current branch if not specified)'
            },
            force: {
              type: 'boolean',
              description: 'Force push',
              default: false
            }
          },
        },
      },
      {
        name: 'git_pull',
        description: 'Pull changes from remote repository',
        inputSchema: {
          type: 'object',
          properties: {
            remote: {
              type: 'string',
              description: 'Remote name (default: origin)',
              default: 'origin'
            },
            branch: {
              type: 'string',
              description: 'Branch name (current branch if not specified)'
            }
          },
        },
      },
      {
        name: 'git_remote',
        description: 'Manage git remotes',
        inputSchema: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['list', 'add', 'remove', 'show'],
              description: 'Remote action to perform'
            },
            name: {
              type: 'string',
              description: 'Remote name'
            },
            url: {
              type: 'string',
              description: 'Remote URL (for add action)'
            }
          },
          required: ['action']
        },
      }
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    let result;
    let success = true;
    
    switch (name) {
      case 'git_status':
        result = await git.status();
        logOperation('git_status', {}, success);
        return {
          content: [
            {
              type: 'text',
              text: `Git Status:\n\nBranch: ${result.current}\nAhead: ${result.ahead}\nBehind: ${result.behind}\n\nModified files:\n${result.modified.join('\n')}\n\nStaged files:\n${result.staged.join('\n')}\n\nUntracked files:\n${result.not_added.join('\n')}`
            }
          ]
        };
        
      case 'git_log':
        const maxCount = Math.min(args.maxCount || 10, 50);
        const logOptions = {
          maxCount,
          format: args.oneline ? 'oneline' : 'fuller'
        };
        result = await git.log(logOptions);
        logOperation('git_log', { maxCount, oneline: args.oneline }, success);
        
        const logOutput = result.all.map(commit => 
          args.oneline 
            ? `${commit.hash.substring(0, 8)} ${commit.message}`
            : `Commit: ${commit.hash}\nAuthor: ${commit.author_name} <${commit.author_email}>\nDate: ${commit.date}\nMessage: ${commit.message}\n`
        ).join('\n');
        
        return {
          content: [
            {
              type: 'text',
              text: `Git Log (${result.total} commits):\n\n${logOutput}`
            }
          ]
        };
        
      case 'git_diff':
        const diffOptions = [];
        if (args.staged) diffOptions.push('--cached');
        if (args.file && validatePath(args.file)) diffOptions.push(args.file);
        
        result = await git.diff(diffOptions);
        logOperation('git_diff', { staged: args.staged, file: args.file }, success);
        
        return {
          content: [
            {
              type: 'text',
              text: `Git Diff${args.staged ? ' (Staged)' : ''}:\n\n${truncateOutput(result)}`
            }
          ]
        };
        
      case 'git_branch':
        switch (args.action) {
          case 'list':
            result = await git.branch();
            logOperation('git_branch_list', {}, success);
            return {
              content: [
                {
                  type: 'text',
                  text: `Git Branches:\n\nCurrent: ${result.current}\nAll branches:\n${result.all.join('\n')}`
                }
              ]
            };
            
          case 'create':
            if (!args.name) throw new Error('Branch name required for create action');
            await git.checkoutLocalBranch(args.name);
            logOperation('git_branch_create', { name: args.name }, success);
            return {
              content: [
                {
                  type: 'text',
                  text: `Created and switched to branch: ${args.name}`
                }
              ]
            };
            
          case 'switch':
            if (!args.name) throw new Error('Branch name required for switch action');
            await git.checkout(args.name);
            logOperation('git_branch_switch', { name: args.name }, success);
            return {
              content: [
                {
                  type: 'text',
                  text: `Switched to branch: ${args.name}`
                }
              ]
            };
            
          case 'delete':
            if (!args.name) throw new Error('Branch name required for delete action');
            const deleteOptions = args.force ? ['-D', args.name] : ['-d', args.name];
            await git.branch(deleteOptions);
            logOperation('git_branch_delete', { name: args.name, force: args.force }, success);
            return {
              content: [
                {
                  type: 'text',
                  text: `Deleted branch: ${args.name}`
                }
              ]
            };
        }
        break;
        
      case 'git_add':
        if (!args.files || args.files.length === 0) {
          throw new Error('Files array required');
        }
        
        // Validate all file paths
        for (const file of args.files) {
          if (file !== '.' && !validatePath(file)) {
            throw new Error(`Invalid file path: ${file}`);
          }
        }
        
        await git.add(args.files);
        logOperation('git_add', { files: args.files }, success);
        return {
          content: [
            {
              type: 'text',
              text: `Staged files: ${args.files.join(', ')}`
            }
          ]
        };
        
      case 'git_commit':
        const commitOptions = ['-m', args.message];
        if (args.all) commitOptions.unshift('-a');
        
        result = await git.commit(args.message, args.all ? undefined : []);
        logOperation('git_commit', { message: args.message, all: args.all }, success);
        return {
          content: [
            {
              type: 'text',
              text: `Commit created: ${result.commit}\nSummary: ${result.summary}`
            }
          ]
        };
        
      case 'git_push':
        const pushArgs = [args.remote || 'origin'];
        if (args.branch) pushArgs.push(args.branch);
        if (args.force) pushArgs.push('--force');
        
        result = await git.push(pushArgs);
        logOperation('git_push', { remote: args.remote, branch: args.branch, force: args.force }, success);
        return {
          content: [
            {
              type: 'text',
              text: `Push completed to ${args.remote || 'origin'}${args.branch ? '/' + args.branch : ''}`
            }
          ]
        };
        
      case 'git_pull':
        result = await git.pull(args.remote || 'origin', args.branch);
        logOperation('git_pull', { remote: args.remote, branch: args.branch }, success);
        return {
          content: [
            {
              type: 'text',
              text: `Pull completed from ${args.remote || 'origin'}${args.branch ? '/' + args.branch : ''}\nSummary: ${result.summary}`
            }
          ]
        };
        
      case 'git_remote':
        switch (args.action) {
          case 'list':
            result = await git.getRemotes(true);
            logOperation('git_remote_list', {}, success);
            const remoteList = result.map(r => `${r.name}: ${r.refs.fetch}`).join('\n');
            return {
              content: [
                {
                  type: 'text',
                  text: `Git Remotes:\n\n${remoteList}`
                }
              ]
            };
            
          case 'add':
            if (!args.name || !args.url) {
              throw new Error('Name and URL required for add action');
            }
            await git.addRemote(args.name, args.url);
            logOperation('git_remote_add', { name: args.name, url: args.url }, success);
            return {
              content: [
                {
                  type: 'text',
                  text: `Added remote: ${args.name} -> ${args.url}`
                }
              ]
            };
            
          case 'remove':
            if (!args.name) throw new Error('Name required for remove action');
            await git.removeRemote(args.name);
            logOperation('git_remote_remove', { name: args.name }, success);
            return {
              content: [
                {
                  type: 'text',
                  text: `Removed remote: ${args.name}`
                }
              ]
            };
            
          case 'show':
            if (!args.name) throw new Error('Name required for show action');
            result = await git.remote(['show', args.name]);
            logOperation('git_remote_show', { name: args.name }, success);
            return {
              content: [
                {
                  type: 'text',
                  text: `Remote info for ${args.name}:\n\n${result}`
                }
              ]
            };
        }
        break;
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    logOperation(name, args, false);
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
  console.error('IDP Git MCP Server running with governance integration');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});