# MCP Governance Extension Plan

## Executive Summary

This plan extends the existing MCP governance framework from `/home/ichardart/code` to cover the ungoverned MCP infrastructure in `/home/ichardart/idp-projects/servers/`. This addresses the critical security gap where 75% of MCP servers operate outside governance oversight.

## Current State Analysis

### Governed Infrastructure (✅ Compliant)
- **Location**: `/home/ichardart/code/infra/mcp-servers/`
- **Servers**: 4 governance-compliant servers
- **Status**: Active monitoring, policy enforcement, audit logging
- **Risk Level**: Low to Medium (controlled)

### Ungoverned Infrastructure (🚨 Critical Gap)
- **Location**: `/home/ichardart/idp-projects/servers/src/`
- **Servers**: 12+ active servers including prohibited types
- **Status**: No governance oversight, policy violations active
- **Risk Level**: Critical (uncontrolled)

## Governance Extension Strategy

### Phase 1: Emergency Containment (Week 1)

#### Immediate Actions
1. **Disable Critical Violations**
   ```bash
   # Disable prohibited servers immediately
   systemctl stop puppeteer-mcp || pkill -f puppeteer
   systemctl stop sequentialthinking-mcp || pkill -f sequentialthinking
   ```

2. **Deploy Emergency Monitoring**
   ```bash
   # Extend monitoring to ungoverned directory
   cp /home/ichardart/code/infra/logs/monitor-mcp.sh /home/ichardart/idp-projects/
   ./monitor-mcp.sh --emergency-mode --target=/home/ichardart/idp-projects/servers/
   ```

3. **Create Governance Boundary**
   - Add `/idp-projects/servers/` to governance scope
   - Update `.gitignore` to protect secrets across both locations
   - Implement emergency logging for all ungoverned servers

#### Emergency Configuration Template
```json
{
  "governance_mode": "emergency_extension",
  "target_directory": "/home/ichardart/idp-projects/servers/",
  "prohibited_servers": ["puppeteer", "sequentialthinking"],
  "action": "immediate_disable",
  "monitoring": "full_audit_mode",
  "compliance_deadline": "7_days"
}
```

### Phase 2: Federated Governance Implementation (Week 2-3)

#### Governance Architecture Extension

1. **Multi-Location Governance Config**
   ```yaml
   # governance-config.yaml
   governance_domains:
     primary:
       path: "/home/ichardart/code"
       status: "active"
       enforcement: "full"
     
     idp_projects:
       path: "/home/ichardart/idp-projects"
       status: "extending"
       enforcement: "emergency_then_full"
       inherits_from: "primary"
   ```

2. **Unified Monitoring Dashboard**
   - Aggregate status logs from both locations
   - Cross-domain compliance scoring
   - Policy violation alerting
   - Resource usage tracking

3. **Federated Audit Trail**
   ```bash
   # Unified audit logging
   /home/ichardart/code/infra/logs/unified-mcp-audit.log
   # Format: [timestamp] [domain] [server] [action] [user] [result]
   ```

#### Server Migration Strategy

**High-Value Servers → Immediate Compliance**
- `github`, `postgres`, `fetch`, `gdrive`, `slack`
- Apply security hardening measures
- Migrate to governance-compliant configurations
- Enable full audit logging

**Medium-Value Servers → Gradual Integration**
- `gitlab`, `aws-kb-retrieval`, `google-maps`, `brave-search`
- Assess business value vs security risk
- Implement controls based on risk classification
- Schedule compliance timeline

**Prohibited Servers → Replace/Disable**
- `puppeteer` → Security-hardened web scraper
- `sequentialthinking` → Bounded reasoning framework
- `filesystem` → Disable (redundant with Claude Code)

### Phase 3: Full Integration (Week 4)

#### Comprehensive Governance Coverage

1. **Unified Policy Enforcement**
   - Single governance framework across all MCP infrastructure
   - Consistent security classifications
   - Automated compliance checking
   - Pre-commit hooks for both locations

2. **Integrated Monitoring**
   ```bash
   # Unified status monitoring
   /home/ichardart/code/infra/scripts/check-all-mcp-status.sh
   # Covers: /code/infra/mcp-servers/ + /idp-projects/servers/
   ```

3. **Cross-Domain Security Controls**
   - Shared secret management (1Password integration)
   - Unified token rotation schedules
   - Consistent API rate limiting
   - Centralized audit log analysis

## Implementation Details

### Governance Extension Checklist

#### Week 1: Emergency Response
- [ ] Identify and disable all prohibited servers
- [ ] Deploy emergency monitoring to ungoverned locations
- [ ] Create governance boundary markers
- [ ] Implement basic audit logging
- [ ] Update security incident response procedures

#### Week 2: Framework Extension
- [ ] Extend governance framework configuration
- [ ] Deploy federated monitoring infrastructure
- [ ] Implement cross-domain policy enforcement
- [ ] Create unified compliance dashboard
- [ ] Begin high-value server migration

#### Week 3: Security Hardening
- [ ] Apply security measures to retained servers
- [ ] Deploy hardened alternatives for prohibited servers
- [ ] Implement resource usage monitoring
- [ ] Complete server classification updates
- [ ] Validate cross-domain communications

#### Week 4: Integration & Validation
- [ ] Complete unified governance deployment
- [ ] Validate end-to-end compliance
- [ ] Update agent onboarding procedures
- [ ] Deploy automated compliance reporting
- [ ] Conduct comprehensive security audit

### Success Metrics

#### Coverage Metrics
- **Before**: 25% of MCP infrastructure governed
- **Target**: 100% of MCP infrastructure governed
- **Measure**: Servers under active policy enforcement

#### Security Metrics
- **Policy Violations**: Reduce from 2 critical to 0
- **Compliance Score**: Increase from 30% to 95%
- **Monitoring Coverage**: Increase from 4 to 16+ servers

#### Operational Metrics
- **Response Time**: Sub-5 minute policy violation detection
- **Audit Coverage**: 100% of MCP operations logged
- **Resource Monitoring**: Real-time usage tracking

## Risk Mitigation

### Technical Risks
- **Governance Tool Compatibility**: Test all tools across both locations
- **Performance Impact**: Monitor resource usage during extension
- **Integration Complexity**: Phased rollout to minimize disruption

### Operational Risks
- **Service Disruption**: Maintain backup configurations
- **User Impact**: Clear communication of changes
- **Compliance Gaps**: Continuous monitoring during transition

## Resource Requirements

### Technical Resources
- Governance framework updates
- Monitoring infrastructure extension
- Audit logging system expansion
- Security control deployment

### Personnel Requirements
- Governance engineer: 20 hours/week for 4 weeks
- Security analyst: 10 hours/week for 4 weeks
- Testing/validation: 5 hours/week for 4 weeks

## Expected Outcomes

1. **100% Governance Coverage** of MCP infrastructure
2. **Zero Critical Policy Violations** maintained continuously
3. **Unified Security Controls** across entire IDP
4. **Comprehensive Audit Trail** for all MCP operations
5. **Automated Compliance Monitoring** with real-time alerting

This plan transforms the IDP from partially governed to fully governed MCP infrastructure while maintaining operational capability and business value.