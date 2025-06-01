#!/usr/bin/env python3

import os
import sys
import uvicorn

from server import app

def main():
    print("Starting Markdown Formatting MCP server...")
    uvicorn.run(app, host="127.0.0.1", port=8001)

if __name__ == "__main__":
    main()
