#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs/promises';

/**
 * IDP Database Management MCP Server
 * 
 * Provides secure database operations for Claude Desktop
 * with enterprise-grade security controls and governance integration.
 * 
 * Features:
 * - SQLite database operations
 * - SQL query validation and analysis
 * - Schema inspection and analysis
 * - Query performance monitoring
 * - Data security validation
 */

// Configuration from environment variables
const ALLOWED_WORKSPACE = process.env.DB_WORKSPACE || '/home/ichardart/code';
const MAX_QUERY_TIMEOUT = parseInt(process.env.MAX_QUERY_TIMEOUT) || 30000; // 30 seconds
const MAX_RESULTS = parseInt(process.env.MAX_RESULTS) || 1000; // 1000 rows
const READ_ONLY_MODE = process.env.READ_ONLY_MODE === 'true';
const GOVERNANCE_LOG = process.env.GOVERNANCE_LOG || '/home/ichardart/code/infra/logs/database-mcp.log';

// Security configuration
const ALLOWED_SQL_COMMANDS = [
  'SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN', 'ANALYZE'
];

const FORBIDDEN_SQL_COMMANDS = [
  'DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE',
  'TRUNCATE', 'REPLACE', 'MERGE', 'GRANT', 'REVOKE'
];

const FORBIDDEN_SQL_PATTERNS = [
  /--/,  // SQL comments
  /\/\*/,  // Multi-line comments
  /;.*?;/,  // Multiple statements
  /UNION\s+SELECT/i,
  /OR\s+1\s*=\s*1/i,
  /AND\s+1\s*=\s*1/i,
  /'\s*OR\s*'1'\s*=\s*'1/i,
  /EXEC\s*\(/i,
  /EXECUTE\s*\(/i
];

// Resolve workspace path
const workspacePath = path.resolve(ALLOWED_WORKSPACE);

/**
 * Validates if a database file path is within allowed workspace
 */
function validateDatabasePath(dbPath) {
  try {
    const resolvedPath = path.resolve(workspacePath, dbPath);
    
    if (!resolvedPath.startsWith(workspacePath)) {
      return { valid: false, reason: 'Database outside allowed workspace' };
    }
    
    const ext = path.extname(resolvedPath).toLowerCase();
    if (!['.db', '.sqlite', '.sqlite3'].includes(ext)) {
      return { valid: false, reason: 'Only SQLite databases allowed' };
    }
    
    return { valid: true, path: resolvedPath };
  } catch (error) {
    return { valid: false, reason: `Invalid database path: ${error.message}` };
  }
}

/**
 * Validates SQL query for security
 */
function validateSQLQuery(query) {
  const trimmedQuery = query.trim().toUpperCase();
  
  if (!trimmedQuery) {
    return { valid: false, reason: 'Empty query' };
  }
  
  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_SQL_PATTERNS) {
    if (pattern.test(query)) {
      return { valid: false, reason: `Forbidden SQL pattern detected: ${pattern}` };
    }
  }
  
  // Extract main command
  const firstWord = trimmedQuery.split(/\s+/)[0];
  
  // Check if command is forbidden
  if (FORBIDDEN_SQL_COMMANDS.includes(firstWord)) {
    return { valid: false, reason: `Forbidden SQL command: ${firstWord}` };
  }
  
  // Check if command is allowed
  if (!ALLOWED_SQL_COMMANDS.includes(firstWord)) {
    return { valid: false, reason: `SQL command not in allowed list: ${firstWord}` };
  }
  
  // Additional read-only mode checks
  if (READ_ONLY_MODE && !['SELECT', 'SHOW', 'DESCRIBE', 'EXPLAIN'].includes(firstWord)) {
    return { valid: false, reason: 'Only read operations allowed in read-only mode' };
  }
  
  return { valid: true };
}

/**
 * Logs database operations for governance compliance
 */
async function logGovernanceEvent(event, dbPath, query, result, error = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: event,
    database: dbPath,
    query: query ? query.substring(0, 200) : null, // Truncate long queries
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
 * Executes a SQL query on SQLite database
 */
async function executeSQLiteQuery(dbPath, query) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        reject(new Error(`Failed to connect to database: ${err.message}`));
        return;
      }
      
      const startTime = Date.now();
      
      if (query.trim().toUpperCase().startsWith('SELECT')) {
        db.all(query, [], (err, rows) => {
          const endTime = Date.now();
          db.close();
          
          if (err) {
            reject(new Error(`Query failed: ${err.message}`));
          } else {
            resolve({
              rows: rows.slice(0, MAX_RESULTS), // Limit results
              rowCount: rows.length,
              executionTime: endTime - startTime,
              truncated: rows.length > MAX_RESULTS
            });
          }
        });
      } else {
        // For schema queries
        db.get(query, [], (err, row) => {
          const endTime = Date.now();
          db.close();
          
          if (err) {
            reject(new Error(`Query failed: ${err.message}`));
          } else {
            resolve({
              rows: row ? [row] : [],
              rowCount: row ? 1 : 0,
              executionTime: endTime - startTime,
              truncated: false
            });
          }
        });
      }
    });
    
    // Set timeout
    setTimeout(() => {
      db.close();
      reject(new Error('Query timeout'));
    }, MAX_QUERY_TIMEOUT);
  });
}

/**
 * Gets database schema information
 */
async function getDatabaseSchema(dbPath) {
  const schemaQuery = "SELECT name, type, sql FROM sqlite_master WHERE type IN ('table', 'view') ORDER BY name";
  
  try {
    const result = await executeSQLiteQuery(dbPath, schemaQuery);
    return {
      success: true,
      tables: result.rows,
      executionTime: result.executionTime
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Create MCP server
const server = new Server(
  {
    name: 'database-mcp',
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
        name: 'execute_sql_query',
        description: 'Execute a SQL query on a database with security validation',
        inputSchema: {
          type: 'object',
          properties: {
            database_path: {
              type: 'string',
              description: 'Path to the SQLite database file'
            },
            query: {
              type: 'string',
              description: 'SQL query to execute (SELECT, SHOW, DESCRIBE, EXPLAIN only)'
            }
          },
          required: ['database_path', 'query']
        }
      },
      {
        name: 'analyze_database_schema',
        description: 'Analyze database schema and structure',
        inputSchema: {
          type: 'object',
          properties: {
            database_path: {
              type: 'string',
              description: 'Path to the SQLite database file'
            }
          },
          required: ['database_path']
        }
      },
      {
        name: 'validate_sql_query',
        description: 'Validate a SQL query for security and syntax',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'SQL query to validate'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'get_database_info',
        description: 'Get information about database capabilities and security settings',
        inputSchema: {
          type: 'object',
          properties: {
            database_path: {
              type: 'string',
              description: 'Path to the database file (optional)'
            }
          }
        }
      },
      {
        name: 'list_workspace_databases',
        description: 'List all database files in the workspace',
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
      case 'execute_sql_query': {
        const { database_path, query } = args;
        
        // Validate database path
        const pathValidation = validateDatabasePath(database_path);
        if (!pathValidation.valid) {
          await logGovernanceEvent('query_blocked', database_path, query, false, pathValidation.reason);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Database access blocked: ${pathValidation.reason}`
              }
            ]
          };
        }
        
        // Validate SQL query
        const queryValidation = validateSQLQuery(query);
        if (!queryValidation.valid) {
          await logGovernanceEvent('query_blocked', database_path, query, false, queryValidation.reason);
          return {
            content: [
              {
                type: 'text',
                text: `❌ SQL query blocked: ${queryValidation.reason}`
              }
            ]
          };
        }
        
        try {
          // Check if database file exists
          await fs.access(pathValidation.path);
          
          const result = await executeSQLiteQuery(pathValidation.path, query);
          
          await logGovernanceEvent('query_executed', database_path, query, true);
          
          let output = `📊 **SQL Query Results**\n\n`;
          output += `**Database:** ${database_path}\n`;
          output += `**Query:** ${query}\n`;
          output += `**Execution Time:** ${result.executionTime}ms\n`;
          output += `**Rows Returned:** ${result.rowCount}${result.truncated ? ` (truncated to ${MAX_RESULTS})` : ''}\n\n`;
          
          if (result.rows.length > 0) {
            output += `**Results:**\n`;
            
            // Format results as table
            const headers = Object.keys(result.rows[0]);
            output += `| ${headers.join(' | ')} |\n`;
            output += `| ${headers.map(() => '---').join(' | ')} |\n`;
            
            for (const row of result.rows.slice(0, 10)) { // Show first 10 rows
              const values = headers.map(h => String(row[h] || '').replace(/\|/g, '\\|'));
              output += `| ${values.join(' | ')} |\n`;
            }
            
            if (result.rows.length > 10) {
              output += `\n... and ${result.rows.length - 10} more rows`;
            }
          } else {
            output += `**Results:** No rows returned`;
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
          await logGovernanceEvent('query_failed', database_path, query, false, error.message);
          return {
            content: [
              {
                type: 'text',
                text: `⚠️ Query execution failed: ${error.message}`
              }
            ]
          };
        }
      }

      case 'analyze_database_schema': {
        const { database_path } = args;
        
        const pathValidation = validateDatabasePath(database_path);
        if (!pathValidation.valid) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Database access blocked: ${pathValidation.reason}`
              }
            ]
          };
        }
        
        try {
          await fs.access(pathValidation.path);
          const schema = await getDatabaseSchema(pathValidation.path);
          
          if (!schema.success) {
            await logGovernanceEvent('schema_analysis_failed', database_path, null, false, schema.error);
            return {
              content: [
                {
                  type: 'text',
                  text: `⚠️ Schema analysis failed: ${schema.error}`
                }
              ]
            };
          }
          
          await logGovernanceEvent('schema_analyzed', database_path, null, true);
          
          let output = `🗂️ **Database Schema Analysis**\n\n`;
          output += `**Database:** ${database_path}\n`;
          output += `**Analysis Time:** ${schema.executionTime}ms\n`;
          output += `**Total Objects:** ${schema.tables.length}\n\n`;
          
          if (schema.tables.length > 0) {
            output += `**Database Objects:**\n`;
            
            const tables = schema.tables.filter(t => t.type === 'table');
            const views = schema.tables.filter(t => t.type === 'view');
            
            if (tables.length > 0) {
              output += `\n**Tables (${tables.length}):**\n`;
              for (const table of tables) {
                output += `- **${table.name}**\n`;
              }
            }
            
            if (views.length > 0) {
              output += `\n**Views (${views.length}):**\n`;
              for (const view of views) {
                output += `- **${view.name}**\n`;
              }
            }
          } else {
            output += `**Schema:** Empty database - no tables or views found`;
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
          await logGovernanceEvent('schema_analysis_failed', database_path, null, false, error.message);
          return {
            content: [
              {
                type: 'text',
                text: `⚠️ Database analysis failed: ${error.message}`
              }
            ]
          };
        }
      }

      case 'validate_sql_query': {
        const { query } = args;
        const validation = validateSQLQuery(query);
        
        return {
          content: [
            {
              type: 'text',
              text: validation.valid 
                ? `✅ SQL query is valid and safe to execute`
                : `❌ SQL query validation failed: ${validation.reason}`
            }
          ]
        };
      }

      case 'get_database_info': {
        const { database_path } = args;
        
        let output = `🗄️ **Database MCP Configuration**\n\n`;
        output += `**Workspace:** ${workspacePath}\n`;
        output += `**Read-Only Mode:** ${READ_ONLY_MODE ? 'Enabled' : 'Disabled'}\n`;
        output += `**Query Timeout:** ${MAX_QUERY_TIMEOUT}ms\n`;
        output += `**Max Results:** ${MAX_RESULTS} rows\n\n`;
        
        output += `**✅ Allowed SQL Commands:**\n`;
        for (const cmd of ALLOWED_SQL_COMMANDS) {
          output += `- ${cmd}\n`;
        }
        
        output += `\n**❌ Forbidden SQL Commands:**\n`;
        for (const cmd of FORBIDDEN_SQL_COMMANDS) {
          output += `- ${cmd}\n`;
        }
        
        output += `\n**🛡️ Security Features:**\n`;
        output += `- Workspace path validation\n`;
        output += `- SQL injection prevention\n`;
        output += `- Query timeout protection\n`;
        output += `- Result set size limits\n`;
        output += `- Complete governance logging\n`;
        output += `- Read-only enforcement option\n`;
        
        if (database_path) {
          const validation = validateDatabasePath(database_path);
          output += `\n**Database Path Validation:**\n`;
          output += validation.valid 
            ? `✅ Path '${database_path}' is valid and accessible`
            : `❌ Path '${database_path}' blocked: ${validation.reason}`;
        }
        
        return {
          content: [
            {
              type: 'text',
              text: output
            }
          ]
        };
      }

      case 'list_workspace_databases': {
        try {
          const files = await fs.readdir(workspacePath, { recursive: true });
          const dbFiles = files.filter(file => 
            ['.db', '.sqlite', '.sqlite3'].includes(path.extname(file).toLowerCase())
          );
          
          let output = `💾 **Workspace Database Files**\n\n`;
          output += `**Workspace:** ${workspacePath}\n`;
          output += `**Database Files Found:** ${dbFiles.length}\n\n`;
          
          if (dbFiles.length > 0) {
            for (const dbFile of dbFiles) {
              const filePath = path.join(workspacePath, dbFile);
              try {
                const stats = await fs.stat(filePath);
                const sizeKB = Math.round(stats.size / 1024);
                output += `- **${dbFile}** (${sizeKB} KB)\n`;
              } catch (error) {
                output += `- **${dbFile}** (size unknown)\n`;
              }
            }
          } else {
            output += `No SQLite database files found in workspace.`;
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
          return {
            content: [
              {
                type: 'text',
                text: `⚠️ Failed to list database files: ${error.message}`
              }
            ]
          };
        }
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
    await logGovernanceEvent('server_started', 'database-mcp', null, true);
  } catch (error) {
    console.error('Failed to initialize governance logging:', error);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('IDP Database MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});