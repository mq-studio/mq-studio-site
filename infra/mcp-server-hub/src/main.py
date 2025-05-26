#!/usr/bin/env python3

import os
import sys
import asyncio
import logging

from server import MCPServerHub

async def main():
    # Determine config path
    config_path = os.environ.get("MCP_HUB_CONFIG", "./config.json")
    
    # Create and start the hub
    hub = MCPServerHub(config_path)
    await hub.start()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        logging.error(f"Failed to start MCP Server Hub: {e}")
        sys.exit(1)
