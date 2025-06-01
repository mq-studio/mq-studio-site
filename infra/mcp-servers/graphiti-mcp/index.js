#!/usr/bin/env node
/**
 * Graphiti MCP Server - Knowledge Graph Access for IDP
 */

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const neo4j = require('neo4j-driver');
const path = require('path');
require('dotenv').config();

// Server configuration
const server = new Server(
  {
    name: "graphiti-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Neo4j connection
let driver;
let session;

async function connectToNeo4j() {
  try {
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'password';
    
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    await driver.verifyConnectivity();
    console.error("Connected to Neo4j");
    return true;
  } catch (error) {
    console.error("Failed to connect to Neo4j:", error);
    return false;
  }
}

// Tool definitions
const TOOLS = [
  {
    name: "query_knowledge_graph",
    description: "Query the IDP knowledge graph for relationships and insights",
    inputSchema: {
      type: "object",
      properties: {
        query_type: {
          type: "string",
          enum: ["project_dependencies", "governance_rules", "impact_analysis", "semantic_search"],
          description: "Type of query to perform"
        },
        target: {
          type: "string",
          description: "Target entity or search term"
        },
        depth: {
          type: "number",
          default: 2,
          description: "Depth of relationship traversal"
        }
      },
      required: ["query_type", "target"]
    }
  },
  {
    name: "add_knowledge",
    description: "Add new knowledge to the graph",
    inputSchema: {
      type: "object",
      properties: {
        entity_type: {
          type: "string",
          enum: ["project", "artifact", "dependency", "decision", "rule"],
          description: "Type of entity to add"
        },
        name: {
          type: "string",
          description: "Name of the entity"
        },
        properties: {
          type: "object",
          description: "Additional properties for the entity"
        },
        relationships: {
          type: "array",
          items: {
            type: "object",
            properties: {
              target: { type: "string" },
              type: { type: "string" }
            }
          },
          description: "Relationships to other entities"
        }
      },
      required: ["entity_type", "name"]
    }
  },
  {
    name: "analyze_impact",
    description: "Analyze the impact of a proposed change",
    inputSchema: {
      type: "object",
      properties: {
        change_type: {
          type: "string",
          enum: ["modify_file", "delete_directory", "add_dependency", "change_config"],
          description: "Type of change"
        },
        target_path: {
          type: "string",
          description: "Path of the artifact being changed"
        },
        details: {
          type: "object",
          description: "Additional details about the change"
        }
      },
      required: ["change_type", "target_path"]
    }
  }
];

// Register tools
server.setRequestHandler("tools/list", async () => {
  return { tools: TOOLS };
});

// Tool implementations
async function queryKnowledgeGraph(query_type, target, depth = 2) {
  if (!driver) {
    return {
      content: [{
        type: "text",
        text: "Error: Not connected to Neo4j. Please ensure Neo4j is running."
      }]
    };
  }

  const session = driver.session();
  try {
    let cypher;
    let params = { target, depth };
    
    switch (query_type) {
      case "project_dependencies":
        cypher = `
          MATCH (p:Project {name: $target})-[r:DEPENDS_ON*1..$depth]-(d)
          RETURN p, r, d
        `;
        break;
        
      case "governance_rules":
        cypher = `
          MATCH (e {name: $target})-[r:GOVERNED_BY]-(g:GovernanceRule)
          RETURN e, r, g
        `;
        break;
        
      case "impact_analysis":
        cypher = `
          MATCH (source {path: $target})-[r*1..$depth]-(affected)
          RETURN source, r, affected
        `;
        break;
        
      case "semantic_search":
        cypher = `
          MATCH (n)
          WHERE n.name CONTAINS $target OR n.description CONTAINS $target
          RETURN n LIMIT 20
        `;
        break;
    }
    
    const result = await session.run(cypher, params);
    const records = result.records.map(record => record.toObject());
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify(records, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error querying graph: ${error.message}`
      }]
    };
  } finally {
    await session.close();
  }
}

async function addKnowledge(entity_type, name, properties = {}, relationships = []) {
  if (!driver) {
    return {
      content: [{
        type: "text",
        text: "Error: Not connected to Neo4j"
      }]
    };
  }

  const session = driver.session();
  try {
    // Create node
    const createNodeQuery = `
      CREATE (n:${entity_type} $props)
      RETURN n
    `;
    
    const nodeProps = {
      name,
      created: new Date().toISOString(),
      ...properties
    };
    
    const nodeResult = await session.run(createNodeQuery, { props: nodeProps });
    
    // Create relationships
    for (const rel of relationships) {
      const relQuery = `
        MATCH (a {name: $sourceName}), (b {name: $targetName})
        CREATE (a)-[r:${rel.type}]->(b)
        RETURN r
      `;
      
      await session.run(relQuery, {
        sourceName: name,
        targetName: rel.target
      });
    }
    
    return {
      content: [{
        type: "text",
        text: `Successfully added ${entity_type}: ${name}`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error adding knowledge: ${error.message}`
      }]
    };
  } finally {
    await session.close();
  }
}

async function analyzeImpact(change_type, target_path, details = {}) {
  // Simplified impact analysis
  const impacts = {
    high: [],
    medium: [],
    low: []
  };
  
  // This would query the graph for dependencies
  if (target_path.includes('governance')) {
    impacts.high.push("Changes to governance files affect all IDP components");
  }
  
  if (target_path.includes('mcp-servers')) {
    impacts.medium.push("MCP server changes affect agent capabilities");
  }
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        change_type,
        target_path,
        impacts,
        recommendation: impacts.high.length > 0 ? 
          "High-impact change detected. Recommend thorough testing." :
          "Low to medium impact. Standard validation sufficient."
      }, null, 2)
    }]
  };
}

// Tool execution handler
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "query_knowledge_graph":
        return await queryKnowledgeGraph(args.query_type, args.target, args.depth);
        
      case "add_knowledge":
        return await addKnowledge(args.entity_type, args.name, args.properties, args.relationships);
        
      case "analyze_impact":
        return await analyzeImpact(args.change_type, args.target_path, args.details);
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error executing tool ${name}: ${error.message}`
      }],
      isError: true
    };
  }
});

// Main function
async function main() {
  // Try to connect to Neo4j
  await connectToNeo4j();
  
  // Start MCP server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Graphiti MCP server running");
}

// Cleanup on exit
process.on('SIGINT', async () => {
  if (driver) {
    await driver.close();
  }
  process.exit(0);
});

if (require.main === module) {
  main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}

module.exports = { server };
