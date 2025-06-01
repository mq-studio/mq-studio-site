# IDP Directory Migration Plan

## Migration Strategy

To standardize the IDP directory structure, the following migrations will be performed:

1. **Documentation Migration**
   - Move /home/ichardart/code/infra/dev-env-docs → /home/ichardart/code/infra/docs

2. **MCP Consolidation**
   - Create /home/ichardart/code/infra/mcp-core for core MCP components
   - Move relevant MCP components to centralized location

3. **Agent Framework Migration**
   - Move agent-related components to /home/ichardart/code/infra/agents

4. **Project Organization**
   - Move templates to /home/ichardart/code/projects/templates
   - Organize web projects in /home/ichardart/code/projects/web
   - Organize automation projects in /home/ichardart/code/projects/automations


## Implementation Approach

Each migration will be performed following the OSAA methodology:

1. Each migration step will be discrete and independently verifiable
2. Validation will be performed after each step
3. Dependencies will be updated to reflect new paths
4. Functionality will be tested after each migration

## Validation Criteria

After each migration step, the following validation criteria will be checked:

1. All files and directories successfully migrated
2. No broken links or references
3. Configuration files updated to reflect new paths
4. Functionality preserved

## Timeline

The migration will be performed in phases, with each phase focusing on a specific component category.

---

*Last updated: May 6, 2025*
