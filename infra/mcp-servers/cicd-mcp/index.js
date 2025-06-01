#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import YAML from 'yaml';

const execAsync = promisify(exec);

/**
 * IDP CI/CD Pipeline MCP Server
 * 
 * Provides secure CI/CD pipeline operations for Claude Desktop
 * with enterprise-grade security controls and governance integration.
 * 
 * Features:
 * - Build pipeline execution
 * - Configuration validation
 * - Pipeline status monitoring
 * - Artifact management
 * - Deployment workflow analysis
 */

// Configuration from environment variables
const ALLOWED_WORKSPACE = process.env.CICD_WORKSPACE || '/home/ichardart/code';
const BUILD_TIMEOUT = parseInt(process.env.BUILD_TIMEOUT) || 300000; // 5 minutes
const MAX_OUTPUT_SIZE = parseInt(process.env.MAX_OUTPUT_SIZE) || 5 * 1024 * 1024; // 5MB
const GOVERNANCE_LOG = process.env.GOVERNANCE_LOG || '/home/ichardart/code/infra/logs/cicd-mcp.log';

// Security configuration
const ALLOWED_BUILD_COMMANDS = [
  // Package managers
  'npm install', 'npm run build', 'npm run test', 'npm run lint',
  'yarn install', 'yarn build', 'yarn test', 'yarn lint',
  'pnpm install', 'pnpm build', 'pnpm test', 'pnpm lint',
  
  // Python
  'pip install', 'python -m pytest', 'python -m flake8', 'python -m black',
  'poetry install', 'poetry build', 'poetry test',
  
  // Build tools
  'make', 'make build', 'make test', 'make clean',
  'cmake', 'cmake --build',
  'cargo build', 'cargo test', 'cargo check',
  
  // Docker
  'docker build', 'docker-compose build',
  
  // Linting and formatting
  'eslint', 'prettier', 'tsc --noEmit'
];

const FORBIDDEN_PATTERNS = [
  /sudo/,
  /rm\s+-rf/,
  />\s*\/dev\/null/,
  /&\s*$/,
  /;\s*rm/,
  /\|\s*sh/,
  /\|\s*bash/,
  /eval\s/,
  /exec\s/,
  /--privileged/,
  /--user\s+root/
];

// Resolve workspace path
const workspacePath = path.resolve(ALLOWED_WORKSPACE);

/**
 * Validates if a build command is safe to execute
 */
function validateBuildCommand(command) {
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
  
  // Check if command is in allowed list
  const isAllowed = ALLOWED_BUILD_COMMANDS.some(allowed => 
    trimmedCommand.startsWith(allowed) || 
    trimmedCommand.includes(allowed)
  );
  
  if (!isAllowed) {
    return { valid: false, reason: 'Command not in allowed build commands list' };
  }
  
  return { valid: true };
}

/**
 * Validates if a project path is within allowed workspace
 */
function validateProjectPath(projectPath) {
  try {
    const resolvedPath = path.resolve(workspacePath, projectPath || '.');
    if (!resolvedPath.startsWith(workspacePath)) {
      return { valid: false, reason: 'Project path outside allowed workspace' };
    }
    return { valid: true, path: resolvedPath };
  } catch (error) {
    return { valid: false, reason: `Invalid project path: ${error.message}` };
  }
}

/**
 * Logs CI/CD operations for governance compliance
 */
async function logGovernanceEvent(event, projectPath, command, result, error = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: event,
    project: projectPath,
    command: command,
    workspace: workspacePath,
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

/**
 * Analyzes project configuration files
 */
async function analyzeProjectConfig(projectPath) {
  const configs = {};
  
  try {
    // Check for common config files
    const configFiles = [
      'package.json',
      'pyproject.toml',
      'Cargo.toml',
      'Makefile',
      'Dockerfile',
      'docker-compose.yml',
      '.github/workflows',
      '.gitlab-ci.yml',
      'Jenkinsfile',
      'azure-pipelines.yml'
    ];
    
    for (const configFile of configFiles) {
      const configPath = path.join(projectPath, configFile);
      try {
        const stats = await fs.stat(configPath);
        if (stats.isFile()) {
          configs[configFile] = {
            exists: true,
            size: stats.size,
            modified: stats.mtime
          };
          
          // Read and parse specific configs
          if (configFile === 'package.json') {
            const content = await fs.readFile(configPath, 'utf8');
            const packageJson = JSON.parse(content);
            configs[configFile].scripts = Object.keys(packageJson.scripts || {});
            configs[configFile].dependencies = Object.keys(packageJson.dependencies || {}).length;
            configs[configFile].devDependencies = Object.keys(packageJson.devDependencies || {}).length;
          }
        } else if (stats.isDirectory() && configFile === '.github/workflows') {
          const workflowFiles = await fs.readdir(configPath);
          configs[configFile] = {
            exists: true,
            workflows: workflowFiles.filter(f => f.endsWith('.yml') || f.endsWith('.yaml')).length
          };
        }
      } catch (error) {
        configs[configFile] = { exists: false };
      }
    }
    
    return { success: true, configs };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Detects project type based on configuration files
 */
function detectProjectType(configs) {
  if (configs['package.json']?.exists) return 'Node.js';
  if (configs['pyproject.toml']?.exists) return 'Python (Poetry)';
  if (configs['requirements.txt']?.exists) return 'Python';
  if (configs['Cargo.toml']?.exists) return 'Rust';
  if (configs['Makefile']?.exists) return 'C/C++/Make';
  if (configs['Dockerfile']?.exists) return 'Docker';
  return 'Unknown';
}

// Create MCP server
const server = new Server(
  {
    name: 'cicd-mcp',
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
        name: 'run_build_command',
        description: 'Execute a build command with security validation',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The build command to execute'
            },
            project_path: {
              type: 'string',
              description: 'Path to the project directory (optional, defaults to workspace root)'
            },
            timeout: {
              type: 'number',
              description: 'Command timeout in milliseconds (max 600000, default 300000)'
            }
          },
          required: ['command']
        }
      },
      {
        name: 'analyze_project_pipeline',
        description: 'Analyze project structure and CI/CD configuration',
        inputSchema: {
          type: 'object',
          properties: {
            project_path: {
              type: 'string',
              description: 'Path to the project directory (optional)'
            }
          }
        }
      },
      {
        name: 'validate_build_command',
        description: 'Check if a build command is allowed to be executed',
        inputSchema: {
          type: 'object',
          properties: {
            command: {
              type: 'string',
              description: 'The build command to validate'
            }
          },
          required: ['command']
        }
      },
      {
        name: 'get_build_suggestions',
        description: 'Get build suggestions based on project type',
        inputSchema: {
          type: 'object',
          properties: {
            project_path: {
              type: 'string',
              description: 'Path to the project directory (optional)'
            }
          }
        }
      },
      {
        name: 'get_cicd_info',
        description: 'Get information about CI/CD capabilities and security settings',
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
      case 'run_build_command': {
        const { command, project_path, timeout } = args;
        
        // Validate command
        const commandValidation = validateBuildCommand(command);
        if (!commandValidation.valid) {
          await logGovernanceEvent('build_blocked', project_path, command, false, commandValidation.reason);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Build command blocked: ${commandValidation.reason}`
              }
            ]
          };
        }
        
        // Validate project path
        const pathValidation = validateProjectPath(project_path);
        if (!pathValidation.valid) {
          await logGovernanceEvent('path_blocked', project_path, command, false, pathValidation.reason);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Project path blocked: ${pathValidation.reason}`
              }
            ]
          };
        }
        
        // Set timeout (max 10 minutes)
        const execTimeout = Math.min(timeout || BUILD_TIMEOUT, 600000);
        
        try {
          const startTime = Date.now();
          const { stdout, stderr } = await execAsync(command, {
            cwd: pathValidation.path,
            timeout: execTimeout,
            maxBuffer: MAX_OUTPUT_SIZE
          });
          const endTime = Date.now();
          const executionTime = endTime - startTime;
          
          const output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
          const truncatedOutput = truncateOutput(output);
          
          await logGovernanceEvent('build_executed', project_path, command, true);
          
          let result = `🔨 **Build Command Results**\n\n`;
          result += `**Project:** ${project_path || 'workspace root'}\n`;
          result += `**Command:** ${command}\n`;
          result += `**Execution Time:** ${executionTime}ms\n`;
          result += `**Status:** ✅ Success\n\n`;
          result += `**Output:**\n\`\`\`\n${truncatedOutput}\n\`\`\``;
          
          return {
            content: [
              {
                type: 'text',
                text: result
              }
            ]
          };
          
        } catch (execError) {
          const errorOutput = execError.stdout || execError.stderr || execError.message;
          const truncatedError = truncateOutput(errorOutput);
          
          await logGovernanceEvent('build_failed', project_path, command, false, execError.message);
          
          let result = `⚠️ **Build Command Failed**\n\n`;
          result += `**Project:** ${project_path || 'workspace root'}\n`;
          result += `**Command:** ${command}\n`;
          result += `**Status:** ❌ Failed\n\n`;
          result += `**Error Output:**\n\`\`\`\n${truncatedError}\n\`\`\``;
          
          return {
            content: [
              {
                type: 'text',
                text: result
              }
            ]
          };
        }
      }

      case 'analyze_project_pipeline': {
        const { project_path } = args;
        
        const pathValidation = validateProjectPath(project_path);
        if (!pathValidation.valid) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Project analysis blocked: ${pathValidation.reason}`
              }
            ]
          };
        }
        
        try {
          const analysis = await analyzeProjectConfig(pathValidation.path);
          
          if (!analysis.success) {
            await logGovernanceEvent('analysis_failed', project_path, null, false, analysis.error);
            return {
              content: [
                {
                  type: 'text',
                  text: `⚠️ Project analysis failed: ${analysis.error}`
                }
              ]
            };
          }
          
          await logGovernanceEvent('project_analyzed', project_path, null, true);
          
          const projectType = detectProjectType(analysis.configs);
          
          let output = `📊 **Project Pipeline Analysis**\n\n`;
          output += `**Project Path:** ${project_path || 'workspace root'}\n`;
          output += `**Project Type:** ${projectType}\n\n`;
          
          output += `**Configuration Files:**\n`;
          for (const [file, info] of Object.entries(analysis.configs)) {
            if (info.exists) {
              output += `- ✅ **${file}**`;
              if (info.size) {
                output += ` (${Math.round(info.size / 1024)} KB)`;
              }
              if (info.scripts) {
                output += ` - Scripts: ${info.scripts.join(', ')}`;
              }
              if (info.dependencies !== undefined) {
                output += ` - Deps: ${info.dependencies}, DevDeps: ${info.devDependencies}`;
              }
              if (info.workflows) {
                output += ` - Workflows: ${info.workflows}`;
              }
              output += '\n';
            } else {
              output += `- ❌ ${file}\n`;
            }
          }
          
          // Build recommendations
          output += `\n**Build Recommendations:**\n`;
          if (analysis.configs['package.json']?.exists) {
            output += `- Run \`npm install\` to install dependencies\n`;
            output += `- Run \`npm run build\` to build the project\n`;
            output += `- Run \`npm test\` to run tests\n`;
          }
          if (analysis.configs['Dockerfile']?.exists) {
            output += `- Run \`docker build .\` to build container image\n`;
          }
          if (analysis.configs['Makefile']?.exists) {
            output += `- Run \`make\` to build the project\n`;
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
          await logGovernanceEvent('analysis_failed', project_path, null, false, error.message);
          return {
            content: [
              {
                type: 'text',
                text: `⚠️ Project analysis failed: ${error.message}`
              }
            ]
          };
        }
      }

      case 'validate_build_command': {
        const { command } = args;
        const validation = validateBuildCommand(command);
        
        return {
          content: [
            {
              type: 'text',
              text: validation.valid 
                ? `✅ Build command '${command}' is allowed`
                : `❌ Build command '${command}' is blocked: ${validation.reason}`
            }
          ]
        };
      }

      case 'get_build_suggestions': {
        const { project_path } = args;
        
        const pathValidation = validateProjectPath(project_path);
        if (!pathValidation.valid) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Path validation failed: ${pathValidation.reason}`
              }
            ]
          };
        }
        
        try {
          const analysis = await analyzeProjectConfig(pathValidation.path);
          const projectType = detectProjectType(analysis.configs);
          
          let suggestions = `💡 **Build Suggestions for ${projectType} Project**\n\n`;
          
          if (analysis.configs['package.json']?.exists) {
            suggestions += `**Node.js/JavaScript Project:**\n`;
            suggestions += `- \`npm install\` - Install dependencies\n`;
            suggestions += `- \`npm run build\` - Build the project\n`;
            suggestions += `- \`npm run test\` - Run tests\n`;
            suggestions += `- \`npm run lint\` - Run linting\n`;
            suggestions += `- \`npm audit\` - Check for vulnerabilities\n\n`;
          }
          
          if (analysis.configs['pyproject.toml']?.exists) {
            suggestions += `**Python (Poetry) Project:**\n`;
            suggestions += `- \`poetry install\` - Install dependencies\n`;
            suggestions += `- \`poetry build\` - Build the project\n`;
            suggestions += `- \`poetry test\` - Run tests\n\n`;
          }
          
          if (analysis.configs['Cargo.toml']?.exists) {
            suggestions += `**Rust Project:**\n`;
            suggestions += `- \`cargo build\` - Build the project\n`;
            suggestions += `- \`cargo test\` - Run tests\n`;
            suggestions += `- \`cargo check\` - Check for errors\n\n`;
          }
          
          if (analysis.configs['Dockerfile']?.exists) {
            suggestions += `**Docker Project:**\n`;
            suggestions += `- \`docker build -t myapp .\` - Build container image\n`;
            if (analysis.configs['docker-compose.yml']?.exists) {
              suggestions += `- \`docker-compose build\` - Build with compose\n`;
            }
            suggestions += `\n`;
          }
          
          if (analysis.configs['Makefile']?.exists) {
            suggestions += `**Make Project:**\n`;
            suggestions += `- \`make\` - Build the project\n`;
            suggestions += `- \`make clean\` - Clean build artifacts\n`;
            suggestions += `- \`make test\` - Run tests\n\n`;
          }
          
          suggestions += `**General Recommendations:**\n`;
          suggestions += `- Always run tests before deployment\n`;
          suggestions += `- Use linting tools to maintain code quality\n`;
          suggestions += `- Consider security scanning with appropriate tools\n`;
          suggestions += `- Set up proper CI/CD pipelines for automation\n`;
          
          return {
            content: [
              {
                type: 'text',
                text: suggestions
              }
            ]
          };
          
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `⚠️ Failed to generate suggestions: ${error.message}`
              }
            ]
          };
        }
      }

      case 'get_cicd_info': {
        const allowedCommands = ALLOWED_BUILD_COMMANDS.join('\n- ');
        
        return {
          content: [
            {
              type: 'text',
              text: `🔧 **CI/CD Pipeline MCP Configuration**

**Workspace:** ${workspacePath}
**Build Timeout:** ${BUILD_TIMEOUT}ms
**Max Output Size:** ${Math.round(MAX_OUTPUT_SIZE / 1024 / 1024)}MB

**✅ Allowed Build Commands:**
- ${allowedCommands}

**🚫 Security Controls:**
- No sudo/root access
- No destructive file operations
- No command injection patterns
- No privileged container operations
- Workspace path restrictions
- Build timeout protection

**📊 Supported Project Types:**
- Node.js/JavaScript (npm, yarn, pnpm)
- Python (pip, poetry)
- Rust (cargo)
- C/C++ (make, cmake)
- Docker (docker build, docker-compose)

**🛡️ Security Features:**
- Command validation and filtering
- Project path validation
- Output size limits
- Timeout protection
- Complete governance logging
- Pattern-based injection prevention`
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    await logGovernanceEvent('tool_error', name, null, false, error.message);
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
    await logGovernanceEvent('server_started', 'cicd-mcp', null, true);
  } catch (error) {
    console.error('Failed to initialize governance logging:', error);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('IDP CI/CD Pipeline MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});