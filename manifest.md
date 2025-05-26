# IDP Repository Manifest

## Repository Purpose
Integrated Development Platform (IDP) with active governance enforcement and multi-agent infrastructure.

## Last Updated
2025-05-25 21:05:00

## Key Infrastructure Changes
- **Active Governance Enforcement**: Pre-commit hooks and automated compliance validation
- **Repository Integration**: A2A protocol added as submodule, embedded repos resolved
- **MCP Server Compliance**: Automated enforcement disabled 2 high-risk servers
- **Log Management**: .gitignore updated to exclude 1.7K+ log/artifact files
- **Agent Onboarding**: Universal workflow for governance-compliant AI agent sessions

## Core Components
- `infra/idp-governance/` - Governance framework and policies
- `infra/tools/governance-enforcer.py` - Active compliance enforcement
- `.githooks/pre-commit` - Git-level governance validation
- `infra/A2A-upstream/` - Agent2Agent protocol (submodule)
- `CLAUDE.md` - AI agent context and governance status

## Governance Status
- **Framework**: Active enforcement (v1.0.1)
- **Compliance Score**: 25% (improving through active remediation)
- **MCP Servers**: 11 non-compliant servers identified, 2 high-risk disabled
- **Monitoring**: Continuous governance enforcement every 15 minutes
- **Agent Workflow**: Universal onboarding process active for all AI agents
- **State Tracking**: Real-time governance metrics and session monitoring

## Security Posture
- Secrets detection and blocking enabled
- 1Password CLI integration configured
- File structure governance enforced
- Pre-commit validation active

## Next Phase
- Complete repository organization for remaining 95 files
- Increase compliance score through continued enforcement
- Expand governance automation across all development workflows