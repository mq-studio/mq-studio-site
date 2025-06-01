#!/usr/bin/env python3
"""
ADK Agent that bridges with existing MCP servers
This demonstrates how Google ADK can integrate with your governance-managed MCP infrastructure
"""

from google.adk.agents import Agent
import subprocess
import json
import os


class MCPBridgeAgent:
    """Agent that can communicate with existing MCP servers"""
    
    def __init__(self, model_name="anthropic/claude-3-sonnet"):
        """Initialize with model that supports API calls (avoiding Gemini costs)"""
        
        self.mcp_servers = {
            'github': {
                'command': 'npx',
                'args': ['-y', '@modelcontextprotocol/server-github'],
                'env': {'GITHUB_PERSONAL_ACCESS_TOKEN': os.getenv('GITHUB_TOKEN', '')}
            },
            'fetch': {
                'command': 'node',
                'args': ['/home/ichardart/code/infra/mcp-servers/fetch-mcp/index.js'],
                'env': {}
            },
            'gdrive': {
                'command': 'npx',
                'args': ['-y', '@modelcontextprotocol/server-gdrive'],
                'env': {}
            },
            'context7': {
                'command': 'npx', 
                'args': ['-y', '@upstash/context7-mcp'],
                'env': {}
            },
            'filesystem': {
                'command': 'npx',
                'args': ['-y', '@modelcontextprotocol/server-filesystem'],
                'env': {}
            },
            'puppeteer': {
                'command': 'npx',
                'args': ['-y', '@modelcontextprotocol/server-puppeteer'],
                'env': {}
            },
            'postgres': {
                'command': 'npx',
                'args': ['-y', '@modelcontextprotocol/server-postgres'],
                'env': {'POSTGRES_CONNECTION_STRING': os.getenv('POSTGRES_CONNECTION_STRING', '')},
                'enabled': os.getenv('POSTGRES_ENABLED', 'false').lower() == 'true'
            },
            'slack': {
                'command': 'npx',
                'args': ['-y', '@modelcontextprotocol/server-slack'],
                'env': {
                    'SLACK_BOT_TOKEN': os.getenv('SLACK_BOT_TOKEN', ''),
                    'SLACK_TEAM_ID': os.getenv('SLACK_TEAM_ID', '')
                },
                'enabled': os.getenv('SLACK_ENABLED', 'false').lower() == 'true'
            },
            'e2b': {
                'command': 'npx',
                'args': ['-y', '@e2b/mcp-server'],
                'env': {'E2B_API_KEY': os.getenv('E2B_API_KEY', '')},
                'enabled': os.getenv('E2B_ENABLED', 'false').lower() == 'true'
            },
            'memory': {
                'command': 'npx',
                'args': ['-y', '@modelcontextprotocol/server-memory'],
                'env': {'MEMORY_FILE_PATH': os.getenv('MEMORY_FILE_PATH', '')},
                'enabled': os.getenv('MEMORY_ENABLED', 'false').lower() == 'true'
            }
        }
        
        # Create the ADK agent
        self.agent = Agent(
            model=model_name,  # Use non-Google model to avoid API costs
            name='mcp_bridge_agent',
            description='An agent that can access governance-managed MCP servers',
            instruction='''You are an intelligent assistant that can access multiple MCP servers for enhanced capabilities:
            
            - GitHub server: Access repositories, issues, PRs
            - Fetch server: Web content retrieval  
            - Google Drive server: Document access and search
            - Context7 server: Real-time documentation (use "use context7" in requests)
            - Filesystem server: Local file operations, directory browsing
            - Puppeteer server: Web scraping, automation, screenshots
            - Postgres server: Database queries, schema inspection (when enabled)
            - Slack server: Team communication, message history (when enabled)
            - E2B server: Secure code execution in isolated sandboxes (Python/JavaScript)
            
            When users ask for information that requires these services, use the appropriate MCP server tools.
            For code execution, data analysis, or computational tasks, use the E2B server for safe execution.
            '''
        )
    
    def call_mcp_server(self, server_name, tool_name, parameters=None):
        """Call an MCP server tool and return the result"""
        if server_name not in self.mcp_servers:
            return f"Unknown MCP server: {server_name}"
        
        server_config = self.mcp_servers[server_name]
        
        try:
            # This is a simplified example - real implementation would use MCP protocol
            cmd = server_config['command']
            args = server_config['args']
            env = {**os.environ, **server_config['env']}
            
            # For demonstration - in real usage, this would be proper MCP communication
            result = f"✅ Would call {server_name} server with tool '{tool_name}'"
            if parameters:
                result += f" and parameters: {parameters}"
            
            return result
            
        except Exception as e:
            return f"Error calling MCP server {server_name}: {str(e)}"
    
    def get_available_tools(self):
        """Return list of available MCP tools"""
        tools = []
        for server_name in self.mcp_servers:
            tools.append(f"{server_name}_*")  # Wildcard for all tools in server
        return tools


def main():
    """Test the MCP bridge agent"""
    print("🚀 Creating ADK agent with MCP bridge capabilities...")
    
    try:
        bridge = MCPBridgeAgent()
        print(f"✅ Created agent: {bridge.agent.name}")
        print(f"📋 Available MCP servers: {list(bridge.mcp_servers.keys())}")
        
        # Test MCP server call simulation
        result = bridge.call_mcp_server('fetch', 'fetch_url', {'url': 'https://example.com'})
        print(f"🔗 Test result: {result}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    main()