#!/usr/bin/env python3

import os
import sys
import json
import logging
from typing import Dict, List, Optional, Any

class MCPServerRegistry:
    def __init__(self, logger=None):
        self.servers = {}  # Dictionary of server info by ID
        self.logger = logger or logging.getLogger(__name__)
    
    def register_server(self, server_info):
        """Register an MCP server with the registry
        
        Args:
            server_info (dict): Server information including ID, URL, etc.
        """
        server_id = server_info.get("id")
        if not server_id:
            raise ValueError("Server ID is required")
            
        self.logger.info(f"Registering server: {server_id}")
        self.servers[server_id] = server_info
        return True
    
    def unregister_server(self, server_id):
        """Unregister an MCP server from the registry
        
        Args:
            server_id (str): ID of the server to unregister
            
        Returns:
            bool: True if server was unregistered, False if not found
        """
        if server_id in self.servers:
            self.logger.info(f"Unregistering server: {server_id}")
            del self.servers[server_id]
            return True
        return False
    
    def get_server(self, server_id):
        """Get information about a specific server
        
        Args:
            server_id (str): ID of the server to retrieve
            
        Returns:
            dict: Server information, or None if not found
        """
        return self.servers.get(server_id)
    
    def get_all_servers(self):
        """Get information about all registered servers
        
        Returns:
            list: List of server information dictionaries
        """
        return list(self.servers.values())
    
    def get_all_tools(self):
        """Get all tools from all active servers
        
        Returns:
            list: List of tool information dictionaries
        """
        tools = []
        for server in self.servers.values():
            if server.get("status") == "active":
                tools.extend(server.get("tools", []))
        return tools
    
    def get_server_for_tool(self, tool_name):
        """Find which server provides a specific tool
        
        Args:
            tool_name (str): Name of the tool to find
            
        Returns:
            dict: Server information, or None if tool not found
        """
        for server in self.servers.values():
            if server.get("status") != "active":
                continue
                
            for tool in server.get("tools", []):
                if tool.get("name") == tool_name:
                    return server
        return None
    
    def update_server_status(self, server_id, status):
        """Update the status of a server
        
        Args:
            server_id (str): ID of the server to update
            status (str): New status ("active", "inactive", or "error")
            
        Returns:
            bool: True if updated, False if server not found
        """
        if server_id not in self.servers:
            return False
            
        self.servers[server_id]["status"] = status
        self.servers[server_id]["last_checked"] = "<current_timestamp>"  # Would use datetime in real impl
        return True
    
    def load_from_file(self, filename):
        """Load registry from a JSON file
        
        Args:
            filename (str): Path to the JSON file
            
        Returns:
            bool: True if loaded successfully, False otherwise
        """
        try:
            with open(filename, "r") as f:
                data = json.load(f)
                if isinstance(data, dict) and "servers" in data:
                    self.servers = data["servers"]
                    return True
                return False
        except Exception as e:
            self.logger.error(f"Error loading registry: {e}")
            return False
    
    def save_to_file(self, filename):
        """Save registry to a JSON file
        
        Args:
            filename (str): Path to the JSON file
            
        Returns:
            bool: True if saved successfully, False otherwise
        """
        try:
            with open(filename, "w") as f:
                json.dump({"servers": self.servers}, f, indent=2)
                return True
        except Exception as e:
            self.logger.error(f"Error saving registry: {e}")
            return False
