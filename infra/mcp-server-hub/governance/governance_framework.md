# MCP Governance Framework

## Overview

This document defines the governance framework for MCP (Model Context Protocol) integration in the Development Environment. It establishes standards, policies, and processes for ensuring that all MCP servers are developed, deployed, and maintained according to best practices for security, privacy, and ethics. This framework integrates with the overall IDP Governance Framework and OSAA Directive.

## Core Principles

1. **Security by Design**: All MCP servers must implement security controls from the earliest stages of development
2. **Least Privilege Access**: MCP servers should request and be granted only the minimum permissions needed
3. **Transparency**: All capabilities and data access patterns must be clearly documented
4. **Auditability**: Actions taken through MCP servers must be logged and traceable
5. **Risk-Based Approach**: Governance controls should be proportional to the risk level of each server

## Server Classification

MCP servers are classified based on their risk level:

| Risk Level | Description | Example Servers |
|------------|-------------|------------------|
| Low | Read-only access to non-sensitive data | Markdown Formatter, Documentation Reader |
| Medium | Write access to non-sensitive data or read access to sensitive data | Environment Validator, File Writer |
| High | Write access to sensitive data or system configuration | WSL Helper, Database Manager |
| Critical | Administrative access or access to credentials | Deployment Manager, Identity Services |

## Claude Code Integration

### OSAA Compliance

- Each MCP server interaction must follow the OSAA (One Single Atomized Action) Directive
- Server calls are atomic actions requiring validation before proceeding
- Multi-step operations involving MCP servers must use todo lists for tracking

### Agent Registration

- All MCP servers must register with the central hub for discovery
- Agent capabilities validated against organizational policies
- Registration includes security classification and risk assessment

### A2A Protocol Support

- Servers supporting Agent2Agent communication must implement governance checks
- Cross-agent communications logged and monitored
- Resource allocation managed centrally

## Security Classifications Update

### Prohibited Servers

The following server types are explicitly prohibited:

| Server Type | Risk | Reason |
|-------------|------|---------|
| Browser automation (puppeteer, browser-tools) | Critical | Unrestricted web access, potential for data exfiltration |
| Sequential thinking | High | Uncontrolled reasoning loops, resource exhaustion risk |
| Shell execution | Critical | Direct system access, privilege escalation risk |

### Approved Server Categories

- File system operations (read-only or sandboxed)
- Documentation and knowledge management
- Development environment configuration
- Monitoring and observability
- IDE integration and tooling

## Monitoring and Compliance

### Real-time Monitoring

- All MCP server interactions logged with timestamps
- Resource utilization tracking for performance optimization
- Security event detection and alerting

### Compliance Checks

- Regular audits of server configurations
- Automated vulnerability scanning
- Policy adherence verification

## Governance Extension Status

### Coverage Expansion (2025-05-26)
- **Extended to**: `/home/ichardart/idp-projects/servers/src/`
- **Emergency Actions Taken**:
  - Disabled prohibited servers: puppeteer, sequentialthinking
  - Deployed emergency monitoring for ungoverned servers
  - Created governance boundary markers
  - Applied security hardening to high-value servers (github, fetch, postgres, slack, gdrive)

### Current Governance Scope
- **Primary**: `/home/ichardart/code/infra/mcp-servers/` (4 servers)
- **Extended**: `/home/ichardart/idp-projects/servers/src/` (20 servers)
- **Total Coverage**: 24 MCP servers under governance

### Emergency Extension Results
- **Critical Violations Resolved**: 2 prohibited servers disabled
- **Security Configurations Applied**: 5 high-value servers hardened
- **Monitoring Coverage**: 100% of MCP infrastructure
- **Compliance Status**: Emergency extension active, full compliance pending

## Last Updated: 2025-05-26
