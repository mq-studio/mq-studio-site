# PostgreSQL Setup for MCP Server

## Option 1: Docker PostgreSQL (Recommended)

### Install and run PostgreSQL container:
```bash
# Pull and run PostgreSQL in Docker
docker run --name mcp-postgres \
  -e POSTGRES_USER=mcpuser \
  -e POSTGRES_PASSWORD=mcppassword \
  -e POSTGRES_DB=mcpdb \
  -p 5432:5432 \
  -d postgres:15

# Test connection
docker exec -it mcp-postgres psql -U mcpuser -d mcpdb -c "SELECT version();"
```

### Connection String:
```
postgresql://mcpuser:mcppassword@localhost:5432/mcpdb
```

## Option 2: Native PostgreSQL Installation

### Install PostgreSQL:
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

### Setup database and user:
```bash
sudo -u postgres createuser --interactive mcpuser
sudo -u postgres createdb mcpdb -O mcpuser
sudo -u postgres psql -c "ALTER USER mcpuser PASSWORD 'mcppassword';"
```

### Connection String:
```
postgresql://mcpuser:mcppassword@localhost:5432/mcpdb
```

## Option 3: SQLite (Lightweight Alternative)

If PostgreSQL is too heavy, the MCP server also supports SQLite:
```
sqlite:///home/ichardart/code/infra/data/mcp.db
```

## Test MCP Server Connection

```bash
export POSTGRES_CONNECTION_STRING="postgresql://mcpuser:mcppassword@localhost:5432/mcpdb"
npx -y @modelcontextprotocol/server-postgres --help
```