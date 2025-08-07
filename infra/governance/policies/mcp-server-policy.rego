# MCP Server Compliance Policy
# Open Policy Agent (OPA) rules for MCP server governance

package mcp.server.compliance

import future.keywords.if
import future.keywords.in

# Deny if container runs as root
deny[msg] {
    input.kind == "service"
    container := input.services[service_name]
    container.user == "0"
    msg := sprintf("Service %v runs as root user", [service_name])
}

# Deny if no resource limits defined
deny[msg] {
    input.kind == "service"
    container := input.services[service_name]
    not container.deploy.resources.limits.memory
    msg := sprintf("Service %v missing memory limits", [service_name])
}

deny[msg] {
    input.kind == "service"
    container := input.services[service_name]
    not container.deploy.resources.limits.cpu
    msg := sprintf("Service %v missing CPU limits", [service_name])
}

# Deny if no health check defined
deny[msg] {
    input.kind == "service"
    container := input.services[service_name]
    not container.healthcheck
    msg := sprintf("Service %v missing health check", [service_name])
}

# Deny if missing governance labels
deny[msg] {
    input.kind == "service"
    container := input.services[service_name]
    governance_labels := [label | label := container.labels[_]; startswith(label, "mcp.governance")]
    count(governance_labels) == 0
    msg := sprintf("Service %v missing governance labels", [service_name])
}

# Deny if using privileged mode
deny[msg] {
    input.kind == "service"
    container := input.services[service_name]
    container.privileged == true
    msg := sprintf("Service %v uses privileged mode", [service_name])
}

# Deny if mounting docker socket without justification
deny[msg] {
    input.kind == "service"
    container := input.services[service_name]
    volume := container.volumes[_]
    contains(volume, "/var/run/docker.sock")
    not has_docker_justification(container)
    msg := sprintf("Service %v mounts Docker socket without justification", [service_name])
}

# Helper function to check Docker socket justification
has_docker_justification(container) {
    label := container.labels[_]
    startswith(label, "mcp.docker.justification=")
}

# Warn for high resource limits
warn[msg] {
    input.kind == "service"
    container := input.services[service_name]
    memory_limit := container.deploy.resources.limits.memory
    memory_bytes := parse_memory(memory_limit)
    memory_bytes > 1073741824  # 1GB
    msg := sprintf("Service %v has high memory limit: %v", [service_name, memory_limit])
}

# Warn for missing restart policy
warn[msg] {
    input.kind == "service"
    container := input.services[service_name]
    not container.restart
    msg := sprintf("Service %v missing restart policy", [service_name])
}

# Helper function to parse memory strings
parse_memory(memory_str) = bytes {
    endswith(memory_str, "Mi")
    number_part := trim_suffix(memory_str, "Mi")
    bytes := to_number(number_part) * 1048576
}

parse_memory(memory_str) = bytes {
    endswith(memory_str, "Gi")
    number_part := trim_suffix(memory_str, "Gi")
    bytes := to_number(number_part) * 1073741824
}

parse_memory(memory_str) = bytes {
    endswith(memory_str, "m")
    number_part := trim_suffix(memory_str, "m")
    bytes := to_number(number_part) * 1000000
}

# Security-specific rules
# Deny if using latest tag in production
deny[msg] {
    input.kind == "service"
    container := input.services[service_name]
    image := container.image
    endswith(image, ":latest")
    is_production_environment
    msg := sprintf("Service %v uses 'latest' tag in production", [service_name])
}

# Check if this is a production environment
is_production_environment {
    input.environment == "production"
}

is_production_environment {
    # Default to production if not specified
    not input.environment
}

# MCP-specific governance rules
# Require audit logging for medium/high risk servers
deny[msg] {
    input.kind == "service"
    container := input.services[service_name]
    governance_level := get_governance_level(container)
    governance_level in ["medium", "high"]
    not has_audit_logging(container)
    msg := sprintf("Service %v (risk: %v) requires audit logging", [service_name, governance_level])
}

# Helper to extract governance level
get_governance_level(container) = level {
    label := container.labels[_]
    startswith(label, "mcp.governance.level=")
    level := substring(label, 21, -1)  # Remove "mcp.governance.level="
}

get_governance_level(container) = "medium" {
    # Default to medium if not specified
    not get_governance_level_from_labels(container)
}

get_governance_level_from_labels(container) {
    label := container.labels[_]
    startswith(label, "mcp.governance.level=")
}

# Check for audit logging configuration
has_audit_logging(container) {
    env_var := container.environment[_]
    startswith(env_var, "GOVERNANCE_LOG=")
}

has_audit_logging(container) {
    volume := container.volumes[_]
    contains(volume, "/logs")
}

# Network security rules
# Require internal network for high-risk servers
deny[msg] {
    input.kind == "service"
    container := input.services[service_name]
    governance_level := get_governance_level(container)
    governance_level == "high"
    not has_internal_network(container)
    msg := sprintf("High-risk service %v must use internal network", [service_name])
}

has_internal_network(container) {
    network := container.networks[_]
    network == "mcp-internal"
}

# Secrets management rules
# Deny hardcoded secrets in environment variables
deny[msg] {
    input.kind == "service"
    container := input.services[service_name]
    env_var := container.environment[_]
    contains(env_var, "password=")
    msg := sprintf("Service %v has hardcoded password in environment", [service_name])
}

deny[msg] {
    input.kind == "service"
    container := input.services[service_name]
    env_var := container.environment[_]
    contains(env_var, "secret=")
    msg := sprintf("Service %v has hardcoded secret in environment", [service_name])
}

deny[msg] {
    input.kind == "service"
    container := input.services[service_name]
    env_var := container.environment[_]
    contains(env_var, "token=")
    regex.match(`.*token=\w+`, env_var)  # Token with actual value, not variable reference
    msg := sprintf("Service %v has hardcoded token in environment", [service_name])
}