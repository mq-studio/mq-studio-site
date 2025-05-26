from fastapi import FastAPI, Request
from fastapi_mcp import FastApiMCP
import uvicorn

app = FastAPI()
mcp = FastApiMCP(app)

@app.post("/format-code-block")
async def format_code_block(request: Request):
    data = await request.json()
    content = data.get("content", "")
    language = data.get("language", "")
    
    result = format_nested_code(content, language)
    
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
    uvicorn.run(app, host="127.0.0.1", port=8001)

