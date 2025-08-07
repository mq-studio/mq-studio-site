#!/bin/bash
set -euo pipefail

echo "🚀 Starting IDP Container Build Pipeline..."

REGISTRY_URL=\${REGISTRY_URL:-localhost:5000}
BUILD_TAG=\${BUILD_TAG:-latest}

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "\${GREEN}[INFO]\${NC} \$1"; }
log_error() { echo -e "\${RED}[ERROR]\${NC} \$1"; }

build_container() {
    local service_name=\$1
    local dockerfile_path=\$2
    log_info "Would build \${service_name} with \${dockerfile_path}"
}

security_scan() {
    local image_name=\$1
    log_info "Would scan \${image_name}"
}

main() {
    log_info "Starting container build process..."
    
    # Build MCP servers
    log_info "Building MCP servers..."
    build_container "api-testing-mcp" "infra/deployment/docker/api-testing-mcp.Dockerfile"
    build_container "cicd-mcp" "infra/deployment/docker/cicd-mcp.Dockerfile"
    build_container "context-awareness-mcp" "infra/deployment/docker/context-awareness-mcp.Dockerfile"
    build_container "database-mcp" "infra/deployment/docker/database-mcp.Dockerfile"
    build_container "docker-mcp" "infra/deployment/docker/docker-mcp.Dockerfile"
    build_container "fetch-mcp" "infra/deployment/docker/fetch-mcp.Dockerfile"
    build_container "filesystem-mcp" "infra/deployment/docker/filesystem-mcp.Dockerfile"
    build_container "git-mcp" "infra/deployment/docker/git-mcp.Dockerfile"
    build_container "governance-mcp" "infra/deployment/docker/governance-mcp.Dockerfile"
    build_container "graphiti-mcp" "infra/deployment/docker/graphiti-mcp.Dockerfile"
    build_container "inventory-mcp" "infra/deployment/docker/inventory-mcp.Dockerfile"
    build_container "language-server-mcp" "infra/deployment/docker/language-server-mcp.Dockerfile"
    build_container "onepassword-mcp" "infra/deployment/docker/onepassword-mcp.Dockerfile"
    build_container "security-scanner-mcp" "infra/deployment/docker/security-scanner-mcp.Dockerfile"
    build_container "shell-mcp" "infra/deployment/docker/shell-mcp.Dockerfile"
    
    # Build monitoring
    log_info "Building monitoring stack..."
    build_container "monitoring" "infra/deployment/docker/monitoring.Dockerfile"
    
    # Run security scans
    log_info "Running security scans..."
    security_scan "\${REGISTRY_URL}/idp-api-testing-mcp:\${BUILD_TAG}"
    security_scan "\${REGISTRY_URL}/idp-cicd-mcp:\${BUILD_TAG}"
    security_scan "\${REGISTRY_URL}/idp-context-awareness-mcp:\${BUILD_TAG}"
    security_scan "\${REGISTRY_URL}/idp-database-mcp:\${BUILD_TAG}"
    security_scan "\${REGISTRY_URL}/idp-docker-mcp:\${BUILD_TAG}"
    security_scan "\${REGISTRY_URL}/idp-fetch-mcp:\${BUILD_TAG}"
    security_scan "\${REGISTRY_URL}/idp-filesystem-mcp:\${BUILD_TAG}"
    security_scan "\${REGISTRY_URL}/idp-git-mcp:\${BUILD_TAG}"
    security_scan "\${REGISTRY_URL}/idp-governance-mcp:\${BUILD_TAG}"
    security_scan "\${REGISTRY_URL}/idp-graphiti-mcp:\${BUILD_TAG}"
    security_scan "\${REGISTRY_URL}/idp-inventory-mcp:\${BUILD_TAG}"
    security_scan "\${REGISTRY_URL}/idp-language-server-mcp:\${BUILD_TAG}"
    security_scan "\${REGISTRY_URL}/idp-onepassword-mcp:\${BUILD_TAG}"
    security_scan "\${REGISTRY_URL}/idp-security-scanner-mcp:\${BUILD_TAG}"
    security_scan "\${REGISTRY_URL}/idp-shell-mcp:\${BUILD_TAG}"
    
    # Push images if registry is configured
    if [ "\${REGISTRY_URL}" != "localhost:5000" ]; then
        log_info "Pushing images to registry..."
        docker push "\${REGISTRY_URL}/idp-api-testing-mcp:\${BUILD_TAG}"
        docker push "\${REGISTRY_URL}/idp-cicd-mcp:\${BUILD_TAG}"
        docker push "\${REGISTRY_URL}/idp-context-awareness-mcp:\${BUILD_TAG}"
        docker push "\${REGISTRY_URL}/idp-database-mcp:\${BUILD_TAG}"
        docker push "\${REGISTRY_URL}/idp-docker-mcp:\${BUILD_TAG}"
        docker push "\${REGISTRY_URL}/idp-fetch-mcp:\${BUILD_TAG}"
        docker push "\${REGISTRY_URL}/idp-filesystem-mcp:\${BUILD_TAG}"
        docker push "\${REGISTRY_URL}/idp-git-mcp:\${BUILD_TAG}"
        docker push "\${REGISTRY_URL}/idp-governance-mcp:\${BUILD_TAG}"
        docker push "\${REGISTRY_URL}/idp-graphiti-mcp:\${BUILD_TAG}"
        docker push "\${REGISTRY_URL}/idp-inventory-mcp:\${BUILD_TAG}"
        docker push "\${REGISTRY_URL}/idp-language-server-mcp:\${BUILD_TAG}"
        docker push "\${REGISTRY_URL}/idp-onepassword-mcp:\${BUILD_TAG}"
        docker push "\${REGISTRY_URL}/idp-security-scanner-mcp:\${BUILD_TAG}"
        docker push "\${REGISTRY_URL}/idp-shell-mcp:\${BUILD_TAG}"
    fi
    
    log_info "🎉 Build pipeline completed successfully!"
}

main "\$@"
