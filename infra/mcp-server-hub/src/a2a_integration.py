#!/usr/bin/env python3

import os
import sys
import json
import logging
from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from fastapi import FastAPI, Request, HTTPException
from datetime import datetime

# A2A Protocol Types
class AgentProvider(BaseModel):
    organization: str
    url: Optional[str] = None

class AgentCapabilities(BaseModel):
    streaming: bool = False
    pushNotifications: bool = False
    stateTransitionHistory: bool = False

class AgentSkill(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    examples: Optional[List[str]] = None
    inputModes: Optional[List[str]] = None
    outputModes: Optional[List[str]] = None

class AgentCard(BaseModel):
    name: str
    description: Optional[str] = None
    url: str
    provider: Optional[AgentProvider] = None
    version: str
    documentationUrl: Optional[str] = None
    capabilities: AgentCapabilities
    defaultInputModes: List[str] = ["text/plain"]
    defaultOutputModes: List[str] = ["text/plain"]
    skills: List[AgentSkill]

class TaskState(str):
    SUBMITTED = "submitted"
    WORKING = "working"
    INPUT_REQUIRED = "input-required"
    COMPLETED = "completed"
    CANCELED = "canceled"
    FAILED = "failed"
    UNKNOWN = "unknown"

class TaskStatus(BaseModel):
    state: str
    message: Optional[str] = None
    timestamp: str = datetime.now().isoformat()

class Task(BaseModel):
    id: str
    contextId: str
    status: TaskStatus
    artifacts: Optional[List[Any]] = None
    history: Optional[List[Any]] = None
    metadata: Optional[Dict[str, Any]] = None

class A2AIntegration:
    def __init__(self, mcp_registry, logger=None):
        self.mcp_registry = mcp_registry
        self.logger = logger or logging.getLogger(__name__)
        self.agents = {}  # A2A agent registry
        
    def register_routes(self, app: FastAPI):
        """Register A2A protocol routes"""
        
        @app.get("/agent-card")
        async def get_agent_card():
            """Return agent card for this MCP Hub as an A2A agent"""
            return self.generate_hub_agent_card()
        
        @app.post("/message/send")
        async def send_message(request: Request):
            """A2A message/send endpoint"""
            data = await request.json()
            return await self.handle_message_send(data)
        
        @app.post("/message/stream")
        async def stream_message(request: Request):
            """A2A message/stream endpoint"""
            data = await request.json()
            return await self.handle_message_stream(data)
        
        @app.post("/tasks/get")
        async def get_task(request: Request):
            """A2A tasks/get endpoint"""
            data = await request.json()
            return await self.handle_get_task(data)
        
        @app.post("/tasks/cancel")
        async def cancel_task(request: Request):
            """A2A tasks/cancel endpoint"""
            data = await request.json()
            return await self.handle_cancel_task(data)
        
        @app.get("/agents")
        async def list_agents():
            """List all registered A2A agents"""
            return {
                "success": True,
                "result": {
                    "agents": list(self.agents.values())
                }
            }
        
        @app.post("/agents/register")
        async def register_agent(request: Request):
            """Register a new A2A agent"""
            data = await request.json()
            return await self.register_a2a_agent(data)
    
    def generate_hub_agent_card(self) -> AgentCard:
        """Generate an AgentCard for the MCP Hub itself"""
        # Convert MCP tools to A2A skills
        skills = []
        tools = self.mcp_registry.get_all_tools()
        
        for tool in tools:
            skill = AgentSkill(
                id=tool.get("name", "unknown"),
                name=tool.get("name", "Unknown Tool"),
                description=tool.get("description", "MCP tool available through hub"),
                tags=["mcp", "tool"],
                examples=[f"Use {tool.get('name')} to perform tasks"],
                inputModes=["text/plain", "application/json"],
                outputModes=["text/plain", "application/json"]
            )
            skills.append(skill)
        
        agent_card = AgentCard(
            name="MCP Server Hub",
            description="A hub that provides access to multiple MCP servers and their tools through A2A protocol",
            url="http://127.0.0.1:3000",
            provider=AgentProvider(
                organization="Local Development",
                url="http://127.0.0.1:3000"
            ),
            version="1.0.0",
            documentationUrl="http://127.0.0.1:3000/docs",
            capabilities=AgentCapabilities(
                streaming=True,
                pushNotifications=False,
                stateTransitionHistory=True
            ),
            defaultInputModes=["text/plain", "application/json"],
            defaultOutputModes=["text/plain", "application/json"],
            skills=skills
        )
        
        return agent_card
    
    async def handle_message_send(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle A2A message/send requests"""
        try:
            # Extract message parameters
            params = data.get("params", {})
            message = params.get("message", {})
            
            # Convert A2A message to MCP tool call
            tool_call = self.convert_a2a_to_mcp(message)
            
            if not tool_call:
                return {
                    "jsonrpc": "2.0",
                    "id": data.get("id"),
                    "error": {
                        "code": -32602,
                        "message": "Could not convert A2A message to MCP tool call"
                    }
                }
            
            # Execute via MCP proxy
            from .proxy import MCPToolProxy
            proxy = MCPToolProxy(self.mcp_registry, self.logger)
            result = await proxy.handle_tool_call(tool_call)
            
            # Convert result back to A2A format
            task = self.convert_mcp_to_a2a_task(result, data.get("id"))
            
            return {
                "jsonrpc": "2.0",
                "id": data.get("id"),
                "result": task.dict()
            }
            
        except Exception as e:
            self.logger.error(f"Error handling A2A message send: {e}")
            return {
                "jsonrpc": "2.0",
                "id": data.get("id"),
                "error": {
                    "code": -32603,
                    "message": f"Internal error: {str(e)}"
                }
            }
    
    async def handle_message_stream(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle A2A message/stream requests (placeholder)"""
        # For now, delegate to regular send
        return await self.handle_message_send(data)
    
    async def handle_get_task(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle A2A tasks/get requests"""
        task_id = data.get("params", {}).get("id")
        
        if not task_id:
            return {
                "jsonrpc": "2.0",
                "id": data.get("id"),
                "error": {
                    "code": -32602,
                    "message": "Task ID is required"
                }
            }
        
        # For now, return a placeholder task
        task = Task(
            id=task_id,
            contextId=f"context-{task_id}",
            status=TaskStatus(state=TaskState.COMPLETED)
        )
        
        return {
            "jsonrpc": "2.0",
            "id": data.get("id"),
            "result": task.dict()
        }
    
    async def handle_cancel_task(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle A2A tasks/cancel requests"""
        task_id = data.get("params", {}).get("id")
        
        if not task_id:
            return {
                "jsonrpc": "2.0",
                "id": data.get("id"),
                "error": {
                    "code": -32602,
                    "message": "Task ID is required"
                }
            }
        
        # For now, return a canceled task
        task = Task(
            id=task_id,
            contextId=f"context-{task_id}",
            status=TaskStatus(state=TaskState.CANCELED)
        )
        
        return {
            "jsonrpc": "2.0",
            "id": data.get("id"),
            "result": task.dict()
        }
    
    async def register_a2a_agent(self, agent_card_data: Dict[str, Any]) -> Dict[str, Any]:
        """Register a new A2A agent"""
        try:
            agent_card = AgentCard(**agent_card_data)
            agent_id = agent_card.name.lower().replace(" ", "_")
            
            self.agents[agent_id] = agent_card.dict()
            
            self.logger.info(f"Registered A2A agent: {agent_card.name}")
            
            return {
                "success": True,
                "result": {
                    "agent_id": agent_id,
                    "message": f"Agent {agent_card.name} registered successfully"
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error registering A2A agent: {e}")
            return {
                "success": False,
                "error": {
                    "message": f"Registration failed: {str(e)}"
                }
            }
    
    def convert_a2a_to_mcp(self, message: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Convert A2A message to MCP tool call format"""
        try:
            parts = message.get("parts", [])
            
            for part in parts:
                if part.get("kind") == "text":
                    text = part.get("text", "")
                    
                    # Simple parsing - look for tool name and parameters
                    # In a real implementation, this would be more sophisticated
                    if ":" in text:
                        tool_name, params_text = text.split(":", 1)
                        tool_name = tool_name.strip()
                        
                        # Try to parse parameters
                        parameters = {}
                        try:
                            if params_text.strip().startswith("{"):
                                parameters = json.loads(params_text.strip())
                            else:
                                parameters = {"input": params_text.strip()}
                        except:
                            parameters = {"input": params_text.strip()}
                        
                        return {
                            "name": tool_name,
                            "parameters": parameters
                        }
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error converting A2A to MCP: {e}")
            return None
    
    def convert_mcp_to_a2a_task(self, mcp_result: Dict[str, Any], task_id: str) -> Task:
        """Convert MCP result to A2A Task format"""
        try:
            if mcp_result.get("success"):
                status = TaskStatus(state=TaskState.COMPLETED)
                result_data = mcp_result.get("result", {})
            else:
                status = TaskStatus(
                    state=TaskState.FAILED,
                    message=mcp_result.get("error", {}).get("message", "Unknown error")
                )
                result_data = {}
            
            task = Task(
                id=task_id,
                contextId=f"context-{task_id}",
                status=status,
                metadata={"mcp_result": result_data}
            )
            
            return task
            
        except Exception as e:
            self.logger.error(f"Error converting MCP to A2A: {e}")
            return Task(
                id=task_id,
                contextId=f"context-{task_id}",
                status=TaskStatus(
                    state=TaskState.FAILED,
                    message=f"Conversion error: {str(e)}"
                )
            )