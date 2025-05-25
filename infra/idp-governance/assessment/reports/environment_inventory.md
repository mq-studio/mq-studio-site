# IDP Environment Inventory

## WSL Environment Components

The WSL environment contains the primary development components, organized in the following structure:

### Core Directories

| Directory | Purpose | Status |
|-----------|---------|--------|
| /home/ichardart/code | Primary code repository | Active |
| /home/ichardart/code/infra | Infrastructure components | Active |
| /home/ichardart/.mcp | MCP configuration | Active |
| /home/ichardart/.claude | Claude configuration | Active |


### Infrastructure Components

| Component | Location | Purpose | Dependencies |
|-----------|----------|---------|-------------|
| mcp-server-hub | /code/infra/mcp-server-hub | Central orchestration for MCP servers | Node.js |
| markdown-formatting-mcp | /code/infra/markdown-formatting-mcp | Formatting markdown with nested code blocks | Python |
| claude-projects-access-mcp | /code/infra/claude-projects-access-mcp | Access to Claude projects | Node.js |
| mcp-utils | /code/infra/mcp-utils | Utility functions for MCP servers | Node.js |
| wsl-helper-mcp | /code/infra/wsl-helper-mcp | Utilities for WSL access | Node.js |
| dev-env-docs | /code/infra/dev-env-docs | Documentation for development environment | None |
| dev-env-cli | /code/infra/dev-env-cli | Command-line interface for dev environment | Node.js |
| idp-governance | /code/infra/idp-governance | IDP governance framework | None |


### Governance Documents

| Document | Location | Purpose | Related Documents |
|----------|----------|---------|------------------|
| OSAA_DIRECTIVE.md | /code/infra/dev-env-docs | Defines One Single Atomized Action methodology | OPERATING_RULES.md |
| OPERATING_RULES.md | /code/infra/dev-env-docs | Defines rules for AI and human collaboration | OSAA_DIRECTIVE.md |
| AUTOMATION_PROTOCOL.md | /code/infra/dev-env-docs | Guidelines for automation implementation | OPERATING_RULES.md |
| WSL_ACCESS_INSTRUCTIONS.md | /code/infra/dev-env-docs | Instructions for accessing WSL directories | None |
| MARKDOWN_FORMATTING_GUIDELINES.md | /code/infra/dev-env-docs | Guidelines for markdown formatting | None |
| ai-agent-working-instructions.md | /code/infra/dev-env-docs | Instructions for AI agent operations | OPERATING_RULES.md |


## Windows Environment Components

The Windows environment contains some development components, primarily in the Documents directory:

### Core Directories

| Directory | Purpose | Status |
|-----------|---------|--------|
| C:\Users\RichardHart\Documents\dev-env-project | Development environment project | Active |
| C:\Users\RichardHart\Documents\wsl-links | Symbolic links to WSL directories | Inactive |


## GitHub Repositories

The following GitHub repositories are associated with the IDP:

| Repository | Purpose | Local Location | Status |
|------------|---------|----------------|--------|
| rhart696/dev-env-docs | Documentation for development environment | /code/infra/dev-env-docs | Active |
| rhart696/mcp-server | MCP server implementation | /code/infra/mcp-server | Active |
| rhart696/agent-orchestrator | Agent orchestration framework | /code/products/agent-orchestrator | Active |
| rhart696/dog-patio-vancouver | Directory website project | /code/products/dog-patio-vancouver | Active |
| rhart696/security-tooling | Security tools for development | /code/infra/security-tooling | Active |
| rhart696/code | Core code repository | /code | Active |
| rhart696/dev-env-cli | CLI for development environment | /code/infra/dev-env-cli | Active |
| rhart696/browser-use-web-ai | Browser AI integration | Unknown | Unknown |
| rhart696/WindSurf-demo | WindSurf demonstration | Unknown | Unknown |
| rhart696/silver-chainsaw | Test repository | Unknown | Unknown |
| rhart696/mcp | MCP implementation | Unknown | Unknown |


## Identified Redundancies and Inconsistencies

### Redundant Components

1. **MCP Server Hub**: Exists in both WSL (/code/infra/mcp-server-hub) and Windows (C:\Users\RichardHart\Documents\dev-env-project\mcp-server-hub)
2. **Environment Documentation**: Multiple locations for documentation including /code/infra/dev-env-docs and GitHub repositories
3. **MCP Implementations**: Multiple repositories and directories containing MCP-related code

### Inconsistencies

1. **WSL Access**: The symbolic links in C:\Users\RichardHart\Documents\wsl-links do not function correctly
2. **Directory Structure**: Inconsistent naming conventions and organization across repositories
3. **Configuration Files**: Multiple configuration files for similar components
4. **GitHub Synchronization**: Local directories not consistently synchronized with GitHub repositories


## Recommendations

Based on this inventory, the following recommendations are made:

1. **Consolidate Development Environment in WSL**: All development components should be centralized in the WSL environment to avoid redundancy and ensure consistent access.

2. **Standardize Directory Structure**: Implement the proposed directory structure outlined in the IDP Assessment and Implementation Plan, with clear separation of infrastructure components, projects, and governance.

3. **Resolve WSL Access Issues**: Implement reliable WSL access mechanisms for tools like Claude Desktop instead of using symbolic links.

4. **GitHub Repository Consolidation**: Create a mono-repository for core IDP components and establish clear relationships between repositories.

5. **Governance Implementation**: Continue implementing the IDP governance framework to ensure consistent standards and practices.

## Conclusion

This inventory provides a baseline for optimizing the Integrated Development Platform. The identified redundancies and inconsistencies will be addressed through the implementation of a standardized directory structure and clear governance framework.

Next steps include:

1. Implementing the standardized directory structure (OSAA 1.2)
2. Enhancing WSL access mechanisms (OSAA 1.3)
3. Consolidating governance documentation (OSAA 1.4)

---

*Inventory completed on May 6, 2025*

