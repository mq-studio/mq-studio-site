#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

class OnePasswordMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'onepassword-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'op_get_secret',
            description: 'Retrieve a secret from 1Password vault',
            inputSchema: {
              type: 'object',
              properties: {
                vault: {
                  type: 'string',
                  description: 'Name or ID of the 1Password vault',
                },
                item: {
                  type: 'string',
                  description: 'Name or ID of the item in the vault',
                },
                field: {
                  type: 'string',
                  description: 'Specific field to retrieve (optional, defaults to password)',
                  default: 'password'
                }
              },
              required: ['vault', 'item'],
            },
          },
          {
            name: 'op_list_vaults',
            description: 'List available 1Password vaults',
            inputSchema: {
              type: 'object',
              properties: {},
              additionalProperties: false,
            },
          },
          {
            name: 'op_list_items',
            description: 'List items in a 1Password vault',
            inputSchema: {
              type: 'object',
              properties: {
                vault: {
                  type: 'string',
                  description: 'Name or ID of the vault to list items from',
                }
              },
              required: ['vault'],
            },
          },
          {
            name: 'op_inject_secrets',
            description: 'Inject 1Password secrets into environment variables for a command',
            inputSchema: {
              type: 'object',
              properties: {
                command: {
                  type: 'string',
                  description: 'Command to run with injected secrets',
                },
                env_file: {
                  type: 'string',
                  description: 'Path to .env template file with op:// references (optional)',
                }
              },
              required: ['command'],
            },
          },
          {
            name: 'op_create_env_template',
            description: 'Create a .env template with 1Password secret references',
            inputSchema: {
              type: 'object',
              properties: {
                template_path: {
                  type: 'string',
                  description: 'Path where to create the .env template',
                },
                secrets: {
                  type: 'array',
                  description: 'Array of secret definitions',
                  items: {
                    type: 'object',
                    properties: {
                      env_var: { type: 'string' },
                      vault: { type: 'string' },
                      item: { type: 'string' },
                      field: { type: 'string', default: 'password' }
                    },
                    required: ['env_var', 'vault', 'item']
                  }
                }
              },
              required: ['template_path', 'secrets'],
            },
          }
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'op_get_secret':
            return await this.getSecret(args.vault, args.item, args.field);
          
          case 'op_list_vaults':
            return await this.listVaults();
          
          case 'op_list_items':
            return await this.listItems(args.vault);
          
          case 'op_inject_secrets':
            return await this.injectSecrets(args.command, args.env_file);
          
          case 'op_create_env_template':
            return await this.createEnvTemplate(args.template_path, args.secrets);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  async checkOpCLI() {
    try {
      execSync('op --version', { stdio: 'ignore' });
      return true;
    } catch (error) {
      throw new Error('1Password CLI not found. Please install op CLI and authenticate.');
    }
  }

  async getSecret(vault, item, field = 'password') {
    await this.checkOpCLI();
    
    try {
      const command = `op item get "${item}" --vault="${vault}" --field="${field}"`;
      const result = execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      
      return {
        content: [
          {
            type: 'text',
            text: `Secret retrieved successfully from ${vault}/${item}/${field}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to retrieve secret: ${error.message}`);
    }
  }

  async listVaults() {
    await this.checkOpCLI();
    
    try {
      const result = execSync('op vault list --format=json', { encoding: 'utf8' });
      const vaults = JSON.parse(result);
      
      const vaultList = vaults.map(vault => 
        `- ${vault.name} (${vault.id})`
      ).join('\\n');
      
      return {
        content: [
          {
            type: 'text',
            text: `Available 1Password vaults:\\n${vaultList}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list vaults: ${error.message}`);
    }
  }

  async listItems(vault) {
    await this.checkOpCLI();
    
    try {
      const result = execSync(`op item list --vault="${vault}" --format=json`, { encoding: 'utf8' });
      const items = JSON.parse(result);
      
      const itemList = items.map(item => 
        `- ${item.title} (${item.id}) - ${item.category}`
      ).join('\\n');
      
      return {
        content: [
          {
            type: 'text',
            text: `Items in vault "${vault}":\\n${itemList}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to list items: ${error.message}`);
    }
  }

  async injectSecrets(command, envFile) {
    await this.checkOpCLI();
    
    try {
      let cmd;
      if (envFile) {
        cmd = `op run --env-file="${envFile}" -- ${command}`;
      } else {
        cmd = `op run -- ${command}`;
      }
      
      const result = execSync(cmd, { encoding: 'utf8', maxBuffer: 1024 * 1024 });
      
      return {
        content: [
          {
            type: 'text',
            text: `Command executed successfully with injected secrets:\\n${result}`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to inject secrets: ${error.message}`);
    }
  }

  async createEnvTemplate(templatePath, secrets) {
    try {
      const templateContent = secrets.map(secret => {
        const field = secret.field || 'password';
        return `${secret.env_var}=op://${secret.vault}/${secret.item}/${field}`;
      }).join('\\n');
      
      const fullContent = `# 1Password Environment Template
# Generated by IDP Governance Framework
# Use with: op run --env-file=.env.template -- your-command

${templateContent}
`;
      
      fs.writeFileSync(templatePath, fullContent);
      
      return {
        content: [
          {
            type: 'text',
            text: `Environment template created at: ${templatePath}\\n\\nTemplate contains ${secrets.length} secret references.`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to create template: ${error.message}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('1Password MCP server running on stdio');
  }
}

const server = new OnePasswordMCPServer();
server.run().catch(console.error);