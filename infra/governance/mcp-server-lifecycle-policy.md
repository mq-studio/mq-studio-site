# MCP Server Lifecycle Governance Policy

**Version**: 1.0  
**Effective Date**: June 15, 2025  
**Review Cycle**: Quarterly

## 1. Creation Standards

### Approval Process
- **Technical Review**: Infrastructure team approval required
- **Security Review**: Mandatory for medium/high risk servers
- **Business Justification**: Required documentation of purpose and value

### Mandatory Requirements
Before any MCP server can be deployed to production:

#### Security Requirements
- [ ] **Dockerfile Security Hardening**
  - Non-root user execution
  - Read-only root filesystem where possible
  - Minimal base image (Alpine/distroless preferred)
  - No hardcoded secrets

- [ ] **Resource Limits Defined**
  ```yaml
  deploy:
    resources:
      limits:
        memory: 128Mi
        cpu: 100m
      requests:
        memory: 64Mi
        cpu: 50m
  ```

- [ ] **Health Check Implementation**
  ```dockerfile
  HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1
  ```

#### Code Quality Requirements
- [ ] **Test Coverage ≥ 80%**
  - Unit tests for all core functionality
  - Integration tests for external dependencies
  - Security tests for input validation

- [ ] **Documentation Complete**
  - README.md with setup instructions
  - API documentation for all tools
  - Security considerations documented
  - Troubleshooting guide

- [ ] **Code Quality Standards**
  - ESLint configuration with security rules
  - Prettier formatting applied
  - No critical security vulnerabilities (Snyk/Trivy scan)

#### Governance Integration
- [ ] **Audit Logging**
  ```javascript
  // Required in all MCP servers
  const auditLogger = require('./governance/audit-logger');
  auditLogger.log('tool_call', { tool: toolName, user: userId, timestamp: Date.now() });
  ```

- [ ] **Compliance Metadata**
  ```yaml
  # docker-compose.yml labels
  labels:
    - "mcp.governance.level=medium"  # low/medium/high
    - "mcp.governance.audit=true"
    - "mcp.compliance.gdpr=required"
    - "mcp.owner=team-name"
  ```

## 2. Maintenance Responsibilities

### Ownership Model
- **Primary Owner**: Team/individual responsible for server
- **Security Contact**: Person responsible for security updates
- **Business Sponsor**: Stakeholder who requested the server

### Update SLA
- **Critical Security Patches**: 24 hours
- **High Priority Updates**: 7 days
- **Regular Updates**: 30 days
- **Dependency Updates**: Quarterly

### Review Cycle
**Quarterly Reviews** must assess:
- Usage metrics and value delivered
- Security posture and vulnerability status
- Performance characteristics
- User feedback and satisfaction
- Cost vs. benefit analysis

## 3. Decommission Process

### Automatic Triggers
- **No usage for 90 days**: Flagged for review
- **Critical vulnerability with no fix**: Emergency decommission
- **Superseded by catalog server**: Planned migration
- **Business requirement removed**: Planned decommission

### Decommission Workflow
1. **Usage Analysis** (7 days)
   - Review metrics from last 6 months
   - Identify active users and use cases
   - Document replacement solutions

2. **Stakeholder Notification** (30 days notice)
   - Email all identified users
   - Post deprecation notice in documentation
   - Provide migration path/alternatives

3. **Gradual Reduction** (14 days)
   - Reduce resource allocation
   - Add deprecation warnings to responses
   - Monitor for unexpected usage spikes

4. **Archive and Remove** (Final)
   - Export configuration and logs
   - Remove from production
   - Update documentation
   - Archive container images for 1 year

## 4. Risk Classification

### Low Risk Servers
- **Characteristics**: Read-only, public data, no sensitive operations
- **Examples**: Weather data, public API fetchers
- **Requirements**: Standard security hardening only

### Medium Risk Servers  
- **Characteristics**: Limited write access, API tokens, user data
- **Examples**: GitHub integration, file system access
- **Requirements**: Enhanced monitoring, input validation, rate limiting

### High Risk Servers
- **Characteristics**: Database access, command execution, sensitive data
- **Examples**: Database servers, shell execution, secrets management
- **Requirements**: Full security review, network isolation, extensive logging

## 5. Enforcement

### Automated Checks
All MCP servers must pass these automated validations:

```bash
# Security scan
trivy image --severity HIGH,CRITICAL localhost:5000/idp/server:latest

# Policy compliance
opa test policies/mcp-server-policy.rego

# Resource limits check
docker-compose config --quiet && echo "Resource limits verified"

# Health check validation
docker run --rm localhost:5000/idp/server:latest timeout 10 node healthcheck.js
```

### Manual Review Gates
- **Medium/High risk servers**: Security team review required
- **New patterns/technologies**: Architecture review required  
- **External dependencies**: Legal/compliance review if needed

### Violation Consequences
- **Non-compliant servers**: Blocked from deployment
- **Security violations**: Immediate quarantine
- **Repeated violations**: Owner re-training required
- **Critical violations**: Emergency shutdown authority

## 6. Metrics and KPIs

### Server Health Metrics
- **Availability**: 99.9% uptime target
- **Performance**: Response time under defined SLAs
- **Security**: Zero critical vulnerabilities in production
- **Compliance**: 100% policy adherence

### Portfolio Metrics
- **Total server count**: Trending down over time
- **Utilization rate**: >50% for all servers
- **Cost per transaction**: Decreasing trend
- **Security incidents**: Zero tolerance

### Governance Metrics
- **Policy violations**: <1% of deployments
- **Review completion**: 100% within SLA
- **Decommission success**: Clean removal without business impact

## 7. Continuous Improvement

### Feedback Loops
- **Monthly**: Automated metrics review
- **Quarterly**: Policy effectiveness assessment  
- **Annually**: Complete policy review and update

### Innovation Balance
While maintaining strict governance, the policy encourages:
- **Experimentation**: Sandbox environment for new ideas
- **Standardization**: Reuse of proven patterns
- **Automation**: Reducing manual oversight burden
- **Developer Experience**: Making compliance easy and natural

This policy ensures that the centralized MCP infrastructure maintains enterprise-grade standards while enabling innovation and preventing uncontrolled sprawl.