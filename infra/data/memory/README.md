# Knowledge Graph Memory Storage

This directory contains the persistent memory storage for your AI agents.

## Storage Location
- **File**: `knowledge-graph.json`
- **Path**: `/home/ichardart/code/infra/data/memory/knowledge-graph.json`

## Knowledge Graph Structure

The memory system uses three main components:

### 1. Entities
Primary nodes in the knowledge graph with properties like name and type.

Example:
```json
{
  "name": "IDP_Infrastructure_Project",
  "type": "project",
  "metadata": {
    "created": "2024-05-24",
    "status": "active"
  }
}
```

### 2. Relations
Directed connections between entities stored in active voice.

Example:
```json
{
  "from": "IDP_Infrastructure_Project",
  "to": "PostgreSQL_Database",
  "type": "uses",
  "description": "Project uses PostgreSQL for data storage"
}
```

### 3. Observations
Discrete pieces of information about entities.

Example:
```json
{
  "entityName": "IDP_Infrastructure_Project",
  "observations": [
    "Implements governance-based MCP server management",
    "Uses template-driven configuration system",
    "Supports 10 different MCP servers",
    "Integrates Google ADK for agent orchestration"
  ]
}
```

## AI Agent Memory Capabilities

With this knowledge graph, your AI agents can:

### Cross-Session Memory
- Remember previous conversations and decisions
- Maintain context about your development environment
- Learn your preferences and working patterns

### Relationship Intelligence
- Understand connections between projects, tools, and team members
- Map dependencies and architectural relationships
- Track evolution of decisions over time

### Contextual Assistance
- Provide personalized recommendations based on history
- Reference previous solutions to similar problems
- Maintain awareness of project constraints and requirements

## Security & Privacy
- All memory data stored locally in your infrastructure
- No external transmission of sensitive information
- Full control over what gets remembered
- Can be cleared or modified as needed

## Backup Strategy
Consider backing up the knowledge graph file regularly:
```bash
cp knowledge-graph.json knowledge-graph-backup-$(date +%Y%m%d).json
```

This persistent memory transforms your AI agents from stateless tools into intelligent assistants that learn and evolve with your development environment.