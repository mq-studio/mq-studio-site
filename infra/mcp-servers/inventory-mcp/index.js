#!/usr/bin/env node

/**
 * Dynamic IDP Inventory MCP Server
 * Provides agents with real-time access to directory inventory and governance data
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError 
} from '@modelcontextprotocol/sdk/types.js';
import sqlite3 from 'sqlite3';
import { promises as fs } from 'fs';
import path from 'path';

// Configuration
const DB_PATH = '/home/ichardart/code/infra/data/idp-inventory.db';
const CACHE_PATH = '/home/ichardart/code/infra/data/inventory-cache.json';

class InventoryServer {
  constructor() {
    this.server = new Server(
      {
        name: 'inventory-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async connectDB() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          reject(new McpError(ErrorCode.InternalError, `Database connection failed: ${err.message}`));
        } else {
          resolve(db);
        }
      });
    });
  }

  async executeQuery(db, query, params = []) {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(new McpError(ErrorCode.InternalError, `Query failed: ${err.message}`));
        } else {
          resolve(rows);
        }
      });
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_inventory_context',
            description: 'Get governance context and metadata for a specific directory path',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Directory path to analyze (absolute path)'
                }
              },
              required: ['path']
            }
          },
          {
            name: 'analyze_impact',
            description: 'Analyze potential impact of changes to specific directories',
            inputSchema: {
              type: 'object',
              properties: {
                target_paths: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of directory paths that will be affected'
                },
                change_type: {
                  type: 'string',
                  enum: ['create', 'modify', 'delete', 'move'],
                  description: 'Type of change being planned'
                }
              },
              required: ['target_paths', 'change_type']
            }
          },
          {
            name: 'get_dependencies',
            description: 'Get directories that depend on or are depended upon by target path',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Directory path to check dependencies for'
                },
                direction: {
                  type: 'string',
                  enum: ['incoming', 'outgoing', 'both'],
                  default: 'both',
                  description: 'Direction of dependencies to check'
                }
              },
              required: ['path']
            }
          },
          {
            name: 'search_inventory',
            description: 'Search inventory by governance score, activity level, or project type',
            inputSchema: {
              type: 'object',
              properties: {
                governance_score_min: {
                  type: 'number',
                  description: 'Minimum governance score (0-100)'
                },
                activity_level: {
                  type: 'string',
                  enum: ['empty', 'low', 'medium', 'high'],
                  description: 'Activity level filter'
                },
                project_type: {
                  type: 'string',
                  description: 'Project type filter (nodejs, python, git_repo, etc.)'
                },
                risk_level: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  description: 'Risk level filter'
                },
                limit: {
                  type: 'number',
                  default: 50,
                  description: 'Maximum number of results to return'
                }
              }
            }
          },
          {
            name: 'get_inventory_stats',
            description: 'Get overall inventory statistics and health metrics',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          },
          {
            name: 'trigger_update',
            description: 'Manually trigger inventory update for specific paths',
            inputSchema: {
              type: 'object', 
              properties: {
                paths: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Array of paths to update in inventory'
                }
              },
              required: ['paths']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'get_inventory_context':
            return await this.getInventoryContext(args.path);
          
          case 'analyze_impact':
            return await this.analyzeImpact(args.target_paths, args.change_type);
          
          case 'get_dependencies':
            return await this.getDependencies(args.path, args.direction || 'both');
          
          case 'search_inventory':
            return await this.searchInventory(args);
          
          case 'get_inventory_stats':
            return await this.getInventoryStats();
          
          case 'trigger_update':
            return await this.triggerUpdate(args.paths);
          
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`);
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
      }
    });
  }

  async getInventoryContext(targetPath) {
    const db = await this.connectDB();
    
    try {
      // Get exact match first
      let rows = await this.executeQuery(
        db, 
        'SELECT * FROM directories WHERE path = ?', 
        [targetPath]
      );
      
      // If no exact match, find closest parent
      if (rows.length === 0) {
        const parentPath = path.dirname(targetPath);
        rows = await this.executeQuery(
          db,
          'SELECT * FROM directories WHERE path = ? OR ? LIKE path || "/%"',
          [parentPath, targetPath]
        );
      }
      
      // Get child directories
      const children = await this.executeQuery(
        db,
        'SELECT path, governance_score, activity_level, risk_level FROM directories WHERE parent_path = ?',
        [targetPath]
      );
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              target_path: targetPath,
              directory_info: rows[0] || null,
              child_directories: children,
              context_analysis: {
                governance_ready: rows[0]?.governance_score > 60,
                requires_attention: rows[0]?.risk_level === 'high',
                has_children: children.length > 0
              }
            }, null, 2)
          }
        ]
      };
    } finally {
      db.close();
    }
  }

  async analyzeImpact(targetPaths, changeType) {
    const db = await this.connectDB();
    
    try {
      const impact_analysis = {
        change_type: changeType,
        target_paths: targetPaths,
        affected_directories: [],
        risk_assessment: 'low',
        recommendations: []
      };
      
      for (const targetPath of targetPaths) {
        // Get directory info
        const dirInfo = await this.executeQuery(
          db,
          'SELECT * FROM directories WHERE path = ?',
          [targetPath]
        );
        
        // Get dependencies
        const dependencies = await this.executeQuery(
          db,
          'SELECT * FROM directory_dependencies WHERE source_path = ? OR target_path = ?',
          [targetPath, targetPath]
        );
        
        // Get child directories for delete operations
        let children = [];
        if (changeType === 'delete') {
          children = await this.executeQuery(
            db,
            'SELECT path FROM directories WHERE path LIKE ?',
            [targetPath + '/%']
          );
        }
        
        const pathAnalysis = {
          path: targetPath,
          exists_in_inventory: dirInfo.length > 0,
          governance_score: dirInfo[0]?.governance_score || 0,
          risk_level: dirInfo[0]?.risk_level || 'unknown',
          dependencies: dependencies,
          affected_children: children.map(c => c.path)
        };
        
        impact_analysis.affected_directories.push(pathAnalysis);
        
        // Update risk assessment
        if (dirInfo[0]?.risk_level === 'high' || dependencies.length > 3) {
          impact_analysis.risk_assessment = 'high';
        } else if (dirInfo[0]?.risk_level === 'medium' || dependencies.length > 0) {
          impact_analysis.risk_assessment = 'medium';
        }
      }
      
      // Generate recommendations
      if (impact_analysis.risk_assessment === 'high') {
        impact_analysis.recommendations.push('⚠️ HIGH RISK: Review dependencies before proceeding');
        impact_analysis.recommendations.push('📋 Update manifests for affected projects');
      }
      if (changeType === 'delete') {
        impact_analysis.recommendations.push('🔍 Verify no active references to deleted paths');
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(impact_analysis, null, 2)
          }
        ]
      };
    } finally {
      db.close();
    }
  }

  async getDependencies(targetPath, direction) {
    const db = await this.connectDB();
    
    try {
      let query = '';
      let params = [];
      
      if (direction === 'incoming') {
        query = 'SELECT * FROM directory_dependencies WHERE target_path = ?';
        params = [targetPath];
      } else if (direction === 'outgoing') {
        query = 'SELECT * FROM directory_dependencies WHERE source_path = ?';
        params = [targetPath];
      } else {
        query = 'SELECT * FROM directory_dependencies WHERE source_path = ? OR target_path = ?';
        params = [targetPath, targetPath];
      }
      
      const dependencies = await this.executeQuery(db, query, params);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              target_path: targetPath,
              direction: direction,
              dependencies: dependencies,
              dependency_count: dependencies.length
            }, null, 2)
          }
        ]
      };
    } finally {
      db.close();
    }
  }

  async searchInventory(filters) {
    const db = await this.connectDB();
    
    try {
      let query = 'SELECT * FROM directories WHERE 1=1';
      const params = [];
      
      if (filters.governance_score_min !== undefined) {
        query += ' AND governance_score >= ?';
        params.push(filters.governance_score_min);
      }
      
      if (filters.activity_level) {
        query += ' AND activity_level = ?';
        params.push(filters.activity_level);
      }
      
      if (filters.project_type) {
        query += ' AND project_type = ?';
        params.push(filters.project_type);
      }
      
      if (filters.risk_level) {
        query += ' AND risk_level = ?';
        params.push(filters.risk_level);
      }
      
      query += ' ORDER BY governance_score DESC, path';
      query += ` LIMIT ${filters.limit || 50}`;
      
      const results = await this.executeQuery(db, query, params);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              filters_applied: filters,
              result_count: results.length,
              results: results
            }, null, 2)
          }
        ]
      };
    } finally {
      db.close();
    }
  }

  async getInventoryStats() {
    try {
      // Read from cache first for performance
      const cacheData = await fs.readFile(CACHE_PATH, 'utf8');
      const cache = JSON.parse(cacheData);
      
      const db = await this.connectDB();
      
      // Get additional real-time stats
      const recentChanges = await this.executeQuery(
        db,
        'SELECT COUNT(*) as count FROM inventory_changes WHERE timestamp > datetime("now", "-1 hour")',
        []
      );
      
      db.close();
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              ...cache,
              recent_activity: {
                changes_last_hour: recentChanges[0]?.count || 0
              }
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      throw new McpError(ErrorCode.InternalError, `Failed to get stats: ${error.message}`);
    }
  }

  async triggerUpdate(paths) {
    // This would trigger the filesystem watcher or direct analysis
    // For now, just log the request
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            action: 'trigger_update',
            requested_paths: paths,
            status: 'queued',
            note: 'Updates will be processed by filesystem watcher'
          }, null, 2)
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Inventory MCP server running on stdio');
  }
}

const server = new InventoryServer();
server.run().catch(console.error);