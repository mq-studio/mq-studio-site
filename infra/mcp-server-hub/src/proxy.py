#!/usr/bin/env python3

import os
import sys
import json
import logging
import requests
from typing import Dict, List, Optional, Any

class MCPToolProxy:
    def __init__(self, registry, logger=None):
        self.registry = registry
        self.logger = logger or logging.getLogger(__name__)
    
    async def handle_tool_call(self, tool_call):
        """Handle tool call by proxying to the appropriate server
        
        Args:
            tool_call (dict): Tool call information including name and parameters
            
        Returns:
            dict: Tool call result
        """
        tool_name = tool_call.get("name")
        
        # Find the server that can handle this tool
        server = self.registry.get_server_for_tool(tool_name)
        
        if not server:
            self.logger.error(f"No server found for tool: {tool_name}")
            return {
                "success": False,
                "error": {
                    "message": f"No server available for tool: {tool_name}"
                }
            }
        
        try:
            # Handle based on server connection type
            if server.get("connection_type") == "local":
                # Local servers are not directly accessible via HTTP
                # This would require more complex IPC mechanisms
                self.logger.error("Direct proxy to local MCP servers not yet implemented")
                return {
                    "success": False,
                    "error": {
                        "message": "Direct proxy to local MCP servers not yet implemented"
                    }
                }
            else:
                # Remote servers can be called via HTTP
                return await self.proxy_to_remote_server(server, tool_call)
        except Exception as e:
            self.logger.error(f"Error proxying tool call for {tool_name}: {e}")
            return {
                "success": False,
                "error": {
                    "message": f"Error proxying tool call: {str(e)}"
                }
            }
    
    async def proxy_to_remote_server(self, server, tool_call):
        """Proxy tool call to a remote MCP server
        
        Args:
            server (dict): Server information
            tool_call (dict): Tool call information
            
        Returns:
            dict: Tool call result
        """
        try:
            # Make HTTP request to remote server
            response = requests.post(
                f"{server['url']}/mcp/tools/{tool_call['name']}",
                json={"parameters": tool_call.get("parameters", {})}
            )
            
            # Check response status
            if response.status_code == 200:
                return {
                    "success": True,
                    "result": response.json()
                }
            else:
                return {
                    "success": False,
                    "error": {
                        "message": f"Remote server error: {response.status_code}"
                    }
                }
        except Exception as e:
            self.logger.error(f"Error calling remote server {server['id']}: {e}")
            return {
                "success": False,
                "error": {
                    "message": f"Network error: {str(e)}"
                }
            }
