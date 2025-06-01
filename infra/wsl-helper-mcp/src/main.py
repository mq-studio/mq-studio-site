#!/usr/bin/env python3

import os
import sys
import uvicorn

from wsl_helper import app

def main():
    print("Starting WSL Helper MCP server...")
    uvicorn.run(app, host="127.0.0.1", port=8002)

if __name__ == "__main__":
    main()
