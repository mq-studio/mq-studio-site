# A2A (Agent2Agent) Integration with MCP Server Hub

## Overview

The MCP Server Hub has been extended with A2A (Agent2Agent) protocol support, enabling seamless communication between AI agents across different frameworks. This integration transforms the hub from a simple MCP tool aggregator into a comprehensive **multi-agent coordination platform**.

## Key Features

### 🔗 Dual Protocol Support
- **Native MCP Protocol**: Direct access to MCP servers and tools
- **A2A Protocol**: Standardized agent-to-agent communication via JSON-RPC 2.0
- **Bidirectional Bridge**: Convert between MCP tool calls and A2A messages

### 🌐 Agent Discovery
- **Agent Cards**: Each MCP server is exposed as an A2A agent with discoverable capabilities
- **Dynamic Registration**: External A2A agents can register with the hub
- **Unified Registry**: Single point of discovery for both MCP tools and A2A agents

### 📋 Enterprise Integration
- **Governance Alignment**: Fits within existing IDP governance framework
- **Security**: Supports A2A authentication schemes
- **Observability**: Logging and monitoring for agent interactions

## API Endpoints

### A2A Protocol Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/agent-card` | GET | Returns the hub's agent card with all available skills |
| `/message/send` | POST | Handle A2A message/send requests |
| `/message/stream` | POST | Handle A2A streaming messages |
| `/tasks/get` | POST | Retrieve task status |
| `/tasks/cancel` | POST | Cancel running tasks |
| `/agents` | GET | List all registered A2A agents |
| `/agents/register` | POST | Register new A2A agents |

### Legacy MCP Endpoints
- `/health` - Health check
- `/list-servers` - List MCP servers
- `/list-all-tools` - List all MCP tools
- `/proxy-tool-call` - Execute MCP tool calls

## Agent Card Structure

The hub automatically generates an A2A Agent Card that exposes all MCP tools as discoverable skills:

```json
{
  "name": "MCP Server Hub",
  "description": "A hub that provides access to multiple MCP servers and their tools through A2A protocol",
  "url": "http://127.0.0.1:3000",
  "version": "1.0.0",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  },
  "skills": [
    {
      "id": "memory_store",
      "name": "memory_store",
      "description": "Store information in persistent memory",
      "tags": ["mcp", "tool"]
    }
    // ... more skills for each MCP tool
  ]
}
```

## Message Flow

### A2A to MCP Bridge
1. **A2A Agent** sends message to hub via `/message/send`
2. **Hub** parses A2A message and extracts tool call
3. **MCP Proxy** executes tool call on appropriate MCP server
4. **Hub** converts MCP result back to A2A Task format
5. **Response** returned to A2A agent

### MCP to A2A Exposure
1. **MCP Tools** are discovered during hub startup
2. **Skills** are automatically generated for each tool
3. **Agent Card** is updated with new capabilities
4. **External Agents** can discover and use MCP tools via A2A protocol

## Configuration

The A2A integration uses the existing MCP hub configuration. No additional configuration is required - A2A support is automatically enabled when the hub starts.

## Usage Examples

### Registering an External A2A Agent

```bash
curl -X POST http://127.0.0.1:3000/agents/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Weather Assistant",
    "description": "Provides weather information",
    "url": "http://weather-agent.example.com",
    "version": "1.0.0",
    "capabilities": {
      "streaming": false,
      "pushNotifications": false
    },
    "skills": [
      {
        "id": "get_weather",
        "name": "Get Weather",
        "description": "Get current weather for a location",
        "tags": ["weather", "external"]
      }
    ]
  }'
```

### Sending A2A Message to Hub

```bash
curl -X POST http://127.0.0.1:3000/message/send \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "message/send",
    "id": "msg-123",
    "params": {
      "message": {
        "role": "user",
        "parts": [
          {
            "kind": "text",
            "text": "memory_store: {\"key\": \"project_status\", \"value\": \"A2A integration completed\"}"
          }
        ]
      }
    }
  }'
```

## Architecture Benefits

### 🔄 Interoperability
- Connect agents built on different frameworks (CrewAI, LangGraph, etc.)
- Bridge existing MCP tools to the broader A2A ecosystem
- Enable complex multi-agent workflows

### 📈 Scalability
- Hub acts as central coordination point
- Agents can discover each other's capabilities
- Distributed agent architecture support

### 🛡️ Governance
- Centralized policy enforcement
- Agent interaction monitoring
- Compliance with organizational standards

## Future Enhancements

- **Advanced Agent Discovery**: Support for agent capability querying
- **Workflow Orchestration**: Multi-agent task coordination
- **Security Enhancements**: Advanced authentication and authorization
- **Performance Optimization**: Caching and connection pooling
- **Governance Integration**: Policy-based agent interaction controls

## Related Documentation

- [MCP Server Hub README](../README.md)
- [IDP Governance Framework](../../idp-governance/IDP_GOVERNANCE_FRAMEWORK.md)
- [A2A Protocol Specification](../../A2A/specification/json/a2a.json)