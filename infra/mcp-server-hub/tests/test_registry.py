#!/usr/bin/env python3

import os
import sys
import unittest
import logging

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src")))

from registry import MCPServerRegistry

class TestMCPServerRegistry(unittest.TestCase):
    def setUp(self):
        # Configure logger for testing
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger("test_registry")
        
        # Create registry with test logger
        self.registry = MCPServerRegistry(logger)
        
        # Sample server for testing
        self.sample_server = {
            "id": "test-server",
            "name": "Test Server",
            "description": "Test server for unit tests",
            "url": "http://localhost:9999",
            "status": "active",
            "last_checked": "2025-05-05T12:00:00Z",
            "tools": [
                {
                    "name": "test-tool",
                    "description": "Test tool for unit tests",
                    "parameters": {}
                }
            ],
            "connection_type": "remote"
        }
    
    def test_register_server(self):
        # Test registering a server
        result = self.registry.register_server(self.sample_server)
        self.assertTrue(result)
        
        # Test that server was registered correctly
        registered_server = self.registry.get_server("test-server")
        self.assertEqual(registered_server, self.sample_server)
    
    def test_unregister_server(self):
        # Register a server
        self.registry.register_server(self.sample_server)
        
        # Test unregistering an existing server
        result = self.registry.unregister_server("test-server")
        self.assertTrue(result)
        
        # Test that server was unregistered
        self.assertIsNone(self.registry.get_server("test-server"))
        
        # Test unregistering a non-existent server
        result = self.registry.unregister_server("non-existent-server")
        self.assertFalse(result)
    
    def test_get_all_servers(self):
        # Register multiple servers
        self.registry.register_server(self.sample_server)
        
        second_server = dict(self.sample_server)
        second_server["id"] = "test-server-2"
        self.registry.register_server(second_server)
        
        # Test getting all servers
        servers = self.registry.get_all_servers()
        self.assertEqual(len(servers), 2)
    
    def test_get_all_tools(self):
        # Register servers with tools
        self.registry.register_server(self.sample_server)
        
        # Test getting all tools
        tools = self.registry.get_all_tools()
        self.assertEqual(len(tools), 1)
        self.assertEqual(tools[0]["name"], "test-tool")
    
    def test_get_server_for_tool(self):
        # Register a server with a tool
        self.registry.register_server(self.sample_server)
        
        # Test finding server for an existing tool
        server = self.registry.get_server_for_tool("test-tool")
        self.assertEqual(server, self.sample_server)
        
        # Test finding server for a non-existent tool
        server = self.registry.get_server_for_tool("non-existent-tool")
        self.assertIsNone(server)
    
    def test_update_server_status(self):
        # Register a server
        self.registry.register_server(self.sample_server)
        
        # Test updating status of an existing server
        result = self.registry.update_server_status("test-server", "inactive")
        self.assertTrue(result)
        
        # Test that status was updated
        server = self.registry.get_server("test-server")
        self.assertEqual(server["status"], "inactive")
        
        # Test updating status of a non-existent server
        result = self.registry.update_server_status("non-existent-server", "active")
        self.assertFalse(result)

if __name__ == "__main__":
    unittest.main()
