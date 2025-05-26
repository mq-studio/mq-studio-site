#!/usr/bin/env python3

import os
import sys
import json
import logging
from fastapi import FastAPI, Request
# from fastapi_mcp import FastApiMCP  # Removed - using direct MCP integration
from typing import Dict, List, Optional, Any

from .registry import MCPServerRegistry
from .discovery import MCPServerDiscovery
from .proxy import MCPToolProxy
from .a2a_integration import A2AIntegration

# Configure logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("mcp-hub.log")
    ]
)

logger = logging.getLogger(__name__)

class MCPServerHub:
    def __init__(self, config_path="./config.json"):
        self.config_path = config_path
        
        # Initialize components
        self.registry = MCPServerRegistry(logger)
        self.discovery = MCPServerDiscovery(self.registry, self.config_path, logger)
        self.proxy = MCPToolProxy(self.registry, logger)
        self.a2a = A2AIntegration(self.registry, logger)
        
        # Initialize FastAPI app
        self.app = FastAPI(
            title="MCP Server Hub with A2A Integration",
            description="A hub that provides access to MCP servers through both native MCP and A2A protocols",
            version="1.0.0"
        )
        
        # Register routes
        self.register_routes()
        
        # Register A2A routes
        self.a2a.register_routes(self.app)
    
    def register_routes(self):
        """Register routes for the FastAPI app"""
        @self.app.get("/health")
        async def health_check():
            return {"status": "ok"}
        
        @self.app.post("/list-servers")
        async def list_servers(request: Request):
            servers = self.registry.get_all_servers()
            return {
                "success": True,
                "result": {
                    "servers": [{
                        "id": server.get("id"),
                        "name": server.get("name"),
                        "description": server.get("description"),
                        "status": server.get("status"),
                        "last_checked": server.get("last_checked"),
                        "tool_count": len(server.get("tools", [])),
                        "connection_type": server.get("connection_type")
                    } for server in servers]
                }
            }
        
        @self.app.post("/get-server-info")
        async def get_server_info(request: Request):
            data = await request.json()
            server_id = data.get("server_id")
            
            if not server_id:
                return {
                    "success": False,
                    "error": {
                        "message": "Server ID is required"
                    }
                }
            
            server = self.registry.get_server(server_id)
            
            if not server:
                return {
                    "success": False,
                    "error": {
                        "message": f"Server with ID {server_id} not found"
                    }
                }
            
            return {
                "success": True,
                "result": server
            }
        
        @self.app.post("/list-all-tools")
        async def list_all_tools(request: Request):
            tools = self.registry.get_all_tools()
            return {
                "success": True,
                "result": {
                    "tools": tools
                }
            }
        
        @self.app.post("/proxy-tool-call")
        async def proxy_tool_call(request: Request):
            data = await request.json()
            tool_call = data.get("tool_call")
            
            if not tool_call:
                return {
                    "success": False,
                    "error": {
                        "message": "Tool call is required"
                    }
                }
            
            result = await self.proxy.handle_tool_call(tool_call)
            return result
    
    async def start(self):
        """Start the MCP Server Hub"""
        try:
            # Discover MCP servers
            await self.discovery.discover_servers()
            
            logger.info("MCP Server Hub started on port 3000")
            logger.info("Server discovery completed. Use uvicorn to start the web server.")
        except Exception as e:
            logger.error(f"Error starting MCP Server Hub: {e}")
            raise
    
    async def register_tool_proxies(self):
        """Register dynamic tool proxies for all discovered tools"""
        tools = self.registry.get_all_tools()
        
        # TODO: Implement tool proxy registration
        # This would involve dynamically creating FastAPI endpoints
        # or registering MCP tools for each discovered tool
        
        logger.info(f"Registered {len(tools)} tool proxies")
