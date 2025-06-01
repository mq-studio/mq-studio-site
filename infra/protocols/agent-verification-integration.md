# 🤖 Agent Verification Integration Protocol
*Operationalized ACTION/OUTPUT/OUTCOME governance for AI agents*

## Overview

This protocol establishes how AI agents (Claude, Cline, Gemini, etc.) integrate with the IDP's multi-level verification framework to ensure optimal outcomes rather than just compliance.

## Integration Architecture

### 1. Pre-Action Planning
```bash
# Before any significant action, agents MUST:
# 1. Query inventory context
python3 /home/ichardart/code/infra/tools/simple-inventory-tracker.py context $(pwd)

# 2. Create operation metadata
/home/ichardart/code/infra/tools/verification-engine.sh create-metadata \
  "${operation_id}" \
  "${planned_command}" \
  "${expected_outputs}" \
  "${business_objective}"
```

### 2. Real-time Verification
```bash
# During action execution, agents MUST:
# 1. Record execution metadata
echo "EXIT_CODE=$?" >> "/tmp/verification_${operation_id}.metadata"
echo "EXECUTION_TIME=$(date +%s)" >> "/tmp/verification_${operation_id}.metadata"

# 2. Run verification immediately after
/home/ichardart/code/infra/tools/verification-engine.sh validate "${operation_id}"
```

### 3. Outcome Assessment
```bash
# After verification, agents MUST:
# 1. Check verification results
verification_result=$?

# 2. Report outcome status
if [[ $verification_result -eq 0 ]]; then
    echo "✅ OUTCOME ACHIEVED: ${business_objective}"
else
    echo "❌ OUTCOME FAILED: Level $verification_result verification failed"
    # Trigger remediation or rollback
fi
```

## Agent-Specific Integration

### Claude Code Integration
**Location**: This document serves as the protocol specification

**Usage in Prompts**:
```
I will use the IDP's 6-level verification framework for every significant action:

1. Pre-action: Query context and create operation metadata
2. Execution: Record detailed execution data
3. Verification: Run full 6-level validation
4. Outcome: Confirm business objective achievement
5. Optimization: Assess and improve based on results

For any installation, configuration, or infrastructure change, I will:
- Create unique operation_id
- Define clear business_objective
- Set expected_outputs
- Run verification-engine.sh validate
- Report ACTION/OUTPUT/OUTCOME status
```

### Cline Integration
**Configuration**: Update Cline's system prompts to include:
```
MANDATORY: Before executing any command that modifies the system:

1. Create operation metadata:
   operation_id="cline_$(date +%s)_$(basename $(pwd))"
   
2. Execute with verification:
   /home/ichardart/code/infra/tools/verification-engine.sh create-metadata \
     "$operation_id" "$command" "$expected_files" "$objective"
   
3. Run your command normally

4. Validate outcome:
   /home/ichardart/code/infra/tools/verification-engine.sh validate "$operation_id"

5. Report results: "✅ VERIFIED" or "❌ FAILED: Level X"
```

### Gemini Integration
**Prompt Addition**:
```
You are operating in an IDP with 6-level verification governance:
1. ACTION execution verified
2. ACTION correctness verified  
3. OUTPUT generation verified
4. OUTPUT correctness verified
5. OUTCOME achievement verified
6. OUTCOME optimality verified

For every non-trivial operation, you MUST:
- Call verification tools before/after actions
- Report verification level achieved
- Explain outcome alignment with business objectives
- Suggest optimizations for sub-optimal results
```

## Verification Profiles by Agent Task

### Software Installation Tasks
```yaml
profile: software_installation
business_objective: "software_installation"
verification_rules:
  - "command -v $INSTALLED_BINARY >/dev/null 2>&1"
  - "test -x $(which $INSTALLED_BINARY)"
  - "$INSTALLED_BINARY --version || $INSTALLED_BINARY -v || $INSTALLED_BINARY --help"
compliance_threshold: 90
```

### Development Environment Setup
```yaml
profile: development_tool_setup
business_objective: "development_tool_setup"
verification_rules:
  - "test -d $PROJECT_ROOT/.vscode || test -d $PROJECT_ROOT/.idea || test -f $PROJECT_ROOT/package.json"
  - "test -f $PROJECT_ROOT/README.md"
compliance_threshold: 85
```

### Infrastructure Changes
```yaml
profile: infrastructure_change
business_objective: "infrastructure_improvement"
verification_rules:
  - "systemctl is-active $SERVICE_NAME"
  - "curl -f $HEALTH_CHECK_URL"
  - "test -f $BACKUP_LOCATION/backup-$(date +%Y%m%d).tar.gz"
compliance_threshold: 95
```

## Real-World Application Examples

### Example 1: Installing Shotgun Code (Corrected Approach)
```bash
# Step 1: Pre-action setup
operation_id="shotgun_install_$(date +%s)"
business_objective="software_installation"
expected_outputs="/usr/local/bin/shotgun-code,/home/ichardart/.config/shotgun-code"

# Step 2: Create metadata
/home/ichardart/code/infra/tools/verification-engine.sh create-metadata \
  "$operation_id" \
  "curl -L https://github.com/user/shotgun-code/releases/latest/download/shotgun-code-linux.tar.gz | tar -xz -C /usr/local/bin" \
  "$expected_outputs" \
  "$business_objective"

# Step 3: Add verification details
echo "INSTALLED_BINARY=shotgun-code" >> "/tmp/verification_${operation_id}.metadata"
echo "FUNCTIONAL_TESTS=shotgun-code --version" >> "/tmp/verification_${operation_id}.metadata"
echo "INTEGRATION_TESTS=which shotgun-code" >> "/tmp/verification_${operation_id}.metadata"

# Step 4: Execute with recording
start_time=$(date +%s)
curl -L https://github.com/user/shotgun-code/releases/latest/download/shotgun-code-linux.tar.gz | tar -xz -C /usr/local/bin
exit_code=$?
end_time=$(date +%s)

# Step 5: Record execution results
echo "EXIT_CODE=$exit_code" >> "/tmp/verification_${operation_id}.metadata"
echo "EXECUTION_TIME=$((end_time - start_time))" >> "/tmp/verification_${operation_id}.metadata"

# Step 6: Run full verification
/home/ichardart/code/infra/tools/verification-engine.sh validate "$operation_id"
verification_result=$?

# Step 7: Report outcome
if [[ $verification_result -eq 0 ]]; then
    echo "✅ OUTCOME ACHIEVED: Shotgun Code is installed and functional"
else
    echo "❌ OUTCOME FAILED: Verification failed at level $verification_result"
    echo "📋 REMEDIATION: Check logs and retry with corrected approach"
fi
```

### Example 2: Agent Onboarding
```bash
# For any new agent session
operation_id="agent_onboarding_$(date +%s)"
business_objective="agent_onboarding"

# Create metadata
/home/ichardart/code/infra/tools/verification-engine.sh create-metadata \
  "$operation_id" \
  "/home/ichardart/code/infra/tools/init-agent-session-v2.sh" \
  "/home/ichardart/code/CLAUDE.md,/home/ichardart/code/manifest.md" \
  "$business_objective"

# Execute onboarding
/home/ichardart/code/infra/tools/init-agent-session-v2.sh
echo "EXIT_CODE=$?" >> "/tmp/verification_${operation_id}.metadata"

# Verify outcome
/home/ichardart/code/infra/tools/verification-engine.sh validate "$operation_id"
```

## Continuous Improvement Integration

### Feedback Collection
After each verified operation, agents SHOULD:
1. Log lessons learned to `/home/ichardart/code/infra/logs/agent-lessons-$(date +%Y%m%d).log`
2. Update verification profiles based on effectiveness
3. Report optimization opportunities to human operators

### Performance Metrics
Track and optimize:
- **Verification Success Rate**: >95% target
- **Outcome Achievement Rate**: >90% target  
- **Optimization Score**: >85% target
- **Time to Resolution**: Minimize while maintaining quality

### Self-Healing Capabilities
For Level 1-3 failures (ACTION/OUTPUT), agents MAY attempt automatic remediation:
- Retry with corrected parameters
- Install missing dependencies
- Adjust permissions or paths

For Level 4-6 failures (OUTCOME), agents MUST request human guidance or alternative approaches.

## Integration Checklist

### For Each Agent Session:
- [ ] Read this protocol document
- [ ] Understand current project context via inventory query
- [ ] Identify appropriate verification profile for planned tasks
- [ ] Create operation metadata for significant actions
- [ ] Execute with real-time verification tracking
- [ ] Report ACTION/OUTPUT/OUTCOME status clearly
- [ ] Log lessons learned and optimization opportunities

### For Each Significant Operation:
- [ ] Pre-action: Context query + metadata creation
- [ ] Execution: Command execution + result recording
- [ ] Verification: 6-level validation run
- [ ] Outcome: Business objective assessment
- [ ] Optimization: Performance and quality evaluation
- [ ] Learning: Update knowledge and procedures

## Emergency Procedures

### If Verification Fails:
1. **STOP** all related operations immediately
2. Record failure details in metadata
3. Run diagnostic commands to understand failure
4. Consult with human operator if Level 4-6 failure
5. Implement remediation only after verification plan update

### If System Integrity Threatened:
1. Execute immediate rollback using recorded metadata
2. Activate backup systems if available
3. Escalate to human oversight immediately
4. Document incident for post-mortem analysis

## Success Metrics

**This protocol is successful when:**
- Agents consistently achieve intended business outcomes (not just technical compliance)
- Verification overhead is <10% of total operation time
- Failed operations are caught before causing downstream issues
- Continuous improvement leads to increasingly optimal results
- Human intervention is needed only for complex strategic decisions

---

*This protocol transforms AI agents from compliance-focused tools into outcome-optimized collaborators in the IDP ecosystem.*