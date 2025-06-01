# Dynamic IDP Inventory System Architecture

## 🎯 Core Requirements

1. **Real-time Updates**: Filesystem changes trigger incremental inventory updates
2. **Agent Awareness**: All agents have standardized access to current inventory state
3. **Impact Analysis**: Changes assessed for cross-directory implications
4. **Guidance Protocol**: Inventory informs but doesn't dictate agent decisions
5. **Governance Integration**: Automated validations embedded in workflow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Dynamic Inventory System                 │
├─────────────────────────────────────────────────────────────┤
│  📊 Data Layer                                             │
│  ├── idp-inventory.db (SQLite - fast queries)             │
│  ├── inventory-cache.json (quick access)                  │
│  └── analysis-metrics.json (governance scores, risks)     │
├─────────────────────────────────────────────────────────────┤
│  🔄 Update Engine                                          │
│  ├── filesystem-watcher.py (inotify-based)               │
│  ├── git-hook-updater.sh (post-commit triggers)          │
│  └── scheduled-validator.py (integrity checks)           │
├─────────────────────────────────────────────────────────────┤
│  🔍 Analysis Engine                                        │
│  ├── impact-analyzer.py (cross-directory dependencies)   │
│  ├── governance-scorer.py (real-time readiness calc)     │
│  └── risk-assessor.py (change impact evaluation)         │
├─────────────────────────────────────────────────────────────┤
│  🌐 Access Layer                                          │
│  ├── inventory-mcp-server/ (standardized agent access)   │
│  ├── inventory-cli.py (manual queries/updates)           │
│  └── api-endpoints.py (integration points)               │
├─────────────────────────────────────────────────────────────┤
│  🏛️ Governance Integration                                │
│  ├── pre-commit-inventory-check.sh                       │
│  ├── agent-prompt-injector.py (context awareness)        │
│  └── compliance-validator.py (automated verification)    │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Implementation Priority

### Phase 1: Foundation (Critical Path)
1. **SQLite Database Schema** - Fast, local, ACID-compliant storage
2. **Filesystem Watcher** - Real-time change detection via inotify
3. **Basic MCP Server** - Agent access to inventory data
4. **Agent Awareness Protocol** - Standard queries agents must make

### Phase 2: Intelligence (High Value)
5. **Impact Analysis Engine** - Cross-directory dependency mapping
6. **Governance Integration** - Pre-commit hooks with inventory checks
7. **Cache Optimization** - Performance tuning for 13K+ directories

### Phase 3: Automation (Force Multiplier)
8. **Automated Validation** - Self-healing inventory system
9. **Predictive Analysis** - Change impact prediction
10. **Advanced Querying** - Complex governance queries via MCP

## 🔧 Technical Specifications

### Database Schema
```sql
-- Core inventory table
CREATE TABLE directories (
    path TEXT PRIMARY KEY,
    last_modified TIMESTAMP,
    governance_score INTEGER,
    project_type TEXT,
    activity_level TEXT,
    risk_level TEXT,
    dependencies TEXT, -- JSON array
    last_analyzed TIMESTAMP
);

-- Change tracking
CREATE TABLE inventory_changes (
    id INTEGER PRIMARY KEY,
    path TEXT,
    change_type TEXT, -- CREATE, DELETE, MODIFY
    timestamp TIMESTAMP,
    trigger_source TEXT -- watcher, git-hook, manual
);
```

### Agent Access Protocol
```python
# Standard agent inventory queries
inventory.get_context(current_path)          # Current location analysis
inventory.analyze_impact(proposed_changes)   # Impact assessment
inventory.get_dependencies(target_path)      # Cross-directory deps
inventory.trigger_update(path_list)          # Manual refresh
```

### Update Triggers
1. **Filesystem Events**: Directory creation/deletion, file modifications
2. **Git Operations**: Commits, merges, branch switches
3. **Manual Commands**: Agent-triggered updates, CLI operations
4. **Scheduled Tasks**: Integrity validation, deep analysis

## 🚨 Critical Design Decisions

### Performance Strategy
- **Incremental Updates**: Only changed paths, not full rescans
- **Smart Caching**: Tiered cache with TTL-based invalidation
- **Async Processing**: Non-blocking updates with queue management

### Agent Integration
- **Mandatory Queries**: Pre-action inventory consultation required
- **Impact Threshold**: High-impact changes require explicit confirmation
- **Fallback Protocol**: Inventory unavailable = conservative governance mode

### Data Integrity
- **Validation Checksums**: Detect corruption/inconsistency
- **Recovery Procedures**: Automated rebuild from filesystem
- **Audit Trail**: Complete change history for debugging

## 🎯 Success Metrics

1. **Response Time**: <100ms for standard agent queries
2. **Update Latency**: <5s from filesystem change to inventory update
3. **Coverage**: 100% of IDP directories tracked
4. **Accuracy**: >99% consistency between inventory and filesystem
5. **Agent Adoption**: All governance-compliant agents use inventory

This architecture transforms the IDP from reactive to proactive management while maintaining performance and reliability.