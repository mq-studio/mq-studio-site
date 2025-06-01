# Pull Request: [Brief Description]

## 📋 BMAD Validation Checklist

### ACTION Validation
- [ ] **Clear Objective**: This PR has a specific, measurable goal
- [ ] **Scope Defined**: Changes are focused and don't introduce unrelated modifications
- [ ] **Dependencies Identified**: All prerequisites and dependencies are documented

### OUTPUT Validation  
- [ ] **Functionality Verified**: All new/modified functionality works as intended
- [ ] **Tests Included**: Appropriate tests are included and passing
- [ ] **Documentation Updated**: Relevant documentation has been updated
- [ ] **No Breaking Changes**: Or breaking changes are clearly documented with migration path

### OUTCOME Validation
- [ ] **Business Value Delivered**: This PR provides measurable value to users/maintainers
- [ ] **Performance Impact**: Performance impact has been considered and measured
- [ ] **Security Assessment**: Security implications have been evaluated

## 🛡️ Security & Governance Compliance

### Security Checklist
- [ ] **No Hardcoded Secrets**: All credentials use environment variables
- [ ] **Sensitive Data Removed**: No API keys, passwords, or personal data in code/comments
- [ ] **Security Best Practices**: Code follows security-by-design principles
- [ ] **Vulnerability Assessment**: No new security vulnerabilities introduced

### IDP Governance Compliance
- [ ] **Manifest Updated**: Changes documented in `manifest.md` (if infrastructure changes)
- [ ] **CLAUDE.md Current**: Agent context file updated if relevant
- [ ] **Governance Policies**: All changes comply with IDP governance framework
- [ ] **Commit Standards**: Commits follow established message format

## 📊 Change Summary

### Type of Change
<!-- Check all that apply -->
- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality) 
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation only changes
- [ ] 🔧 Refactoring (no functional changes, no api changes)
- [ ] ⚡ Performance improvements
- [ ] 🔒 Security improvements
- [ ] 🏗️ Infrastructure/configuration changes
- [ ] 🧪 Test additions or modifications

### Components Modified
<!-- Check all that apply -->
- [ ] MCP Servers
- [ ] GitHub Actions / CI/CD
- [ ] Security Framework  
- [ ] Documentation
- [ ] Configuration Management
- [ ] Python Infrastructure
- [ ] Node.js Infrastructure
- [ ] Governance System

## 📝 Detailed Description

### Problem Statement
<!-- What problem does this PR solve? What was the motivation? -->

### Solution Approach
<!-- How did you solve the problem? What approach did you take? -->

### Key Changes
<!-- List the main changes made -->
- 
- 
- 

## 🧪 Testing Strategy

### Test Coverage
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated  
- [ ] Manual testing completed
- [ ] Edge cases tested
- [ ] Performance testing (if applicable)

### Test Results
<!-- Provide evidence that tests pass -->
```
# Include relevant test output or screenshots
```

## 📊 Performance Impact

### Measurements
<!-- If applicable, provide before/after metrics -->
- **Before**: 
- **After**: 
- **Improvement**: 

### Resource Usage
- [ ] Memory usage assessed
- [ ] CPU usage assessed
- [ ] Network impact assessed (if applicable)
- [ ] Storage impact assessed (if applicable)

## 🔄 Deployment Considerations

### Deployment Requirements
- [ ] No special deployment steps required
- [ ] Environment variables need to be updated
- [ ] Database migrations required
- [ ] Configuration changes required
- [ ] Documentation deployment needed

### Rollback Plan
<!-- How can this change be safely rolled back if needed? -->

## 📚 Documentation

### Documentation Updates
- [ ] Code comments added/updated
- [ ] README.md updated (if applicable)
- [ ] API documentation updated (if applicable)
- [ ] Architecture documentation updated (if applicable)
- [ ] Security documentation updated (if applicable)

### Knowledge Transfer
<!-- Any special knowledge needed to understand or maintain this change? -->

## 🔗 Related Issues

<!-- Link to related issues, feature requests, or discussions -->
- Closes #
- Related to #
- Addresses #

## 🖼️ Screenshots/Evidence

<!-- If applicable, add screenshots to help explain your changes -->

## ⚠️ Breaking Changes

<!-- If this introduces breaking changes, document them here -->
### Migration Guide
<!-- Provide step-by-step instructions for migrating existing usage -->

## 🤝 Collaboration

### Review Focus Areas
<!-- Guide reviewers on what to focus on -->
- [ ] Security implications
- [ ] Performance impact
- [ ] Code quality and maintainability
- [ ] Documentation completeness
- [ ] Test coverage

### Additional Context
<!-- Any additional context that reviewers should know -->

---

## 📋 Final Verification

Before merging, confirm:
- [ ] All CI/CD checks pass
- [ ] Code review completed and approved
- [ ] Security review completed (if applicable)
- [ ] Documentation review completed
- [ ] Performance benchmarks meet requirements (if applicable)
- [ ] Governance compliance verified

**Reviewer:** Please ensure all checkboxes are completed before approving.

**Author:** Please complete all relevant sections and checkboxes before requesting review.