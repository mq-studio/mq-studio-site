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
- **Context-Aware Initialization**: v2.0 agent workflows adapt to working directory

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

## Critical Discovery: Governance Gap Analysis
🚨 **Scope Limitation Confirmed**: Current governance covers only `/home/ichardart/code` 
- **Scale**: Comprehensive analysis of 13,417 directories across entire IDP
- **Gap**: 15+ active projects in `/home/ichardart/idp-projects/` completely ungoverned
- **Impact**: Major MCP server development hub outside governance scope
- **Analysis**: Complete findings in `IDP_GOVERNANCE_EXPANSION_PLAN.md`
- **Data**: Detailed analysis in `IDP_DIRECTORY_ANALYSIS_SUMMARY_*.md`

## Next Phase
- **Priority 1**: Design federated governance architecture for IDP-wide coverage
- **Priority 2**: Implement path-agnostic governance tooling
- Complete repository organization for remaining files
- Increase compliance score through continued enforcement