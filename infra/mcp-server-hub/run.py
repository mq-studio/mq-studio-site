#!/usr/bin/env python3

import os
import sys
import asyncio
import uvicorn
from src.server import MCPServerHub

def main():
    # Determine config path
    config_path = os.environ.get("MCP_HUB_CONFIG", "./config.json")
    
    # Create hub and discover servers
    hub = MCPServerHub(config_path)
    
    # Run server discovery in async context
    async def init_hub():
        await hub.start()
    
    asyncio.run(init_hub())
    
    # Start the FastAPI server
    uvicorn.run(hub.app, host="127.0.0.1", port=3000)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nShutting down MCP Server Hub...")
    except Exception as e:
        print(f"Failed to start MCP Server Hub: {e}")
        sys.exit(1)