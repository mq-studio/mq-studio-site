#!/usr/bin/env python3

import os
import sys
import json
import logging
import subprocess
from typing import Dict, List, Optional, Any

from fastapi import FastAPI, Request
from fastapi_mcp import FastApiMCP

# Configure logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("wsl-helper.log")
    ]
)

logger = logging.getLogger(__name__)

app = FastAPI()
mcp = FastApiMCP(app)

@app.post("/execute-wsl-command")
async def execute_wsl_command(request: Request):
    data = await request.json()
    command = data.get("command")
    
    if not command:
        return {
            "success": False,
            "error": {
                "message": "Command is required"
            }
        }
    
    try:
        # Execute command in WSL
        result = subprocess.run(
            ["bash", "-c", command],
            capture_output=True,
            text=True
        )
        
        return {
            "success": result.returncode == 0,
            "result": {
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode
            }
        }
    except Exception as e:
        logger.error(f"Error executing WSL command: {e}")
        return {
            "success": False,
            "error": {
                "message": f"Error executing WSL command: {str(e)}"
            }
        }

@app.post("/validate-wsl-path")
async def validate_wsl_path(request: Request):
    data = await request.json()
    path = data.get("path")
    
    if not path:
        return {
            "success": False,
            "error": {
                "message": "Path is required"
            }
        }
    
    try:
        # Check if path exists in WSL
        result = subprocess.run(
            ["bash", "-c", f"test -e \"{path}\" && echo \"exists\" || echo \"not_exists\""],
            capture_output=True,
            text=True
        )
        
        status = result.stdout.strip() == "exists"
        
        if status:
            # Get additional information about the path
            info_result = subprocess.run(
                ["bash", "-c", f"ls -la \"{path}\""],
                capture_output=True,
                text=True
            )
            
            return {
                "success": True,
                "result": {
                    "exists": True,
                    "path": path,
                    "info": info_result.stdout
                }
            }
        else:
            return {
                "success": True,
                "result": {
                    "exists": False,
                    "path": path
                }
            }
    except Exception as e:
        logger.error(f"Error validating WSL path: {e}")
        return {
            "success": False,
            "error": {
                "message": f"Error validating WSL path: {str(e)}"
            }
        }

@app.post("/list-wsl-directory")
async def list_wsl_directory(request: Request):
    data = await request.json()
    path = data.get("path")
    
    if not path:
        return {
            "success": False,
            "error": {
                "message": "Path is required"
            }
        }
    
    try:
        # List directory in WSL
        result = subprocess.run(
            ["bash", "-c", f"ls -la \"{path}\""],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            return {
                "success": True,
                "result": {
                    "path": path,
                    "contents": result.stdout
                }
            }
        else:
            return {
                "success": False,
                "error": {
                    "message": f"Error listing WSL directory: {result.stderr}"
                }
            }
    except Exception as e:
        logger.error(f"Error listing WSL directory: {e}")
        return {
            "success": False,
            "error": {
                "message": f"Error listing WSL directory: {str(e)}"
            }
        }

# Mount MCP server
mcp.mount()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8002)
