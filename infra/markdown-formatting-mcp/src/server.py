#!/usr/bin/env python3

import os
import sys
from fastapi import FastAPI, Request
from fastapi_mcp import FastApiMCP

# Import our formatter
from formatter import format_nested_code_block, generate_markdown_doc

app = FastAPI()
mcp = FastApiMCP(app)

@app.post("/format-code-block")
async def format_code_block(request: Request):
    data = await request.json()
    content = data.get("content", "")
    language = data.get("language", "")
    add_empty_lines = data.get("add_empty_lines", False)
    
    result = format_nested_code_block(content, language, add_empty_lines)
    
    return {"result": result}

@app.post("/generate-markdown")
async def generate_markdown(request: Request):
    data = await request.json()
    title = data.get("title", "Document")
    sections = data.get("sections", [])
    
    result = generate_markdown_doc(title, sections)
    
    return {"result": result}

# Mount MCP server
mcp.mount()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
