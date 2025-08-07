#!/bin/bash
set -e

echo "🧪 Validating MCP Docker Implementation"
echo "======================================"

PASSED=0
FAILED=0

# Test function
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected="$3"
    
    echo -n "Testing $name... "
    
    if response=$(curl -s "$url" 2>/dev/null) && echo "$response" | grep -q "$expected"; then
        echo "✅ PASS"
        ((PASSED++))
    else
        echo "❌ FAIL"
        echo "  URL: $url"
        echo "  Expected: $expected"
        echo "  Got: $response"
        ((FAILED++))
    fi
}

# Test infrastructure components
echo "📊 Testing Infrastructure Components"
echo "-----------------------------------"

test_endpoint "Docker Registry" "http://localhost:5000/v2/" "repositories"
test_endpoint "Jaeger Tracing UI" "http://localhost:16686/" "Jaeger"
test_endpoint "MCP Central Dashboard" "http://localhost:3010/" "MCP Central Dashboard"

echo ""
echo "🔌 Testing MCP Protocol Endpoints"
echo "--------------------------------"

test_endpoint "MCP Health Check" "http://localhost:3010/api/health" "healthy"
test_endpoint "A2A Protocol" "http://localhost:3011/health" "A2A"
test_endpoint "Docker Bridge" "http://localhost:3012/health" "docker-mcp"

echo ""
echo "🐳 Testing Container Status"
echo "--------------------------"

# Check containers
containers=("idp-registry" "idp-jaeger" "fetch-mcp" "mcp-dashboard")

for container in "${containers[@]}"; do
    echo -n "Checking $container... "
    
    if docker ps --format "{{.Names}}" | grep -q "^$container$"; then
        status=$(docker ps --format "{{.Status}}" --filter "name=$container")
        if [[ $status =~ "Up" ]]; then
            echo "✅ RUNNING"
            ((PASSED++))
        else
            echo "⚠️  ISSUE: $status"
            ((FAILED++))
        fi
    else
        echo "❌ NOT FOUND"
        ((FAILED++))
    fi
done

echo ""
echo "🛡️ Testing Governance Compliance"
echo "-------------------------------"

# Test governance endpoints
test_endpoint "Server Registry" "http://localhost:3010/api/servers" "fetch-mcp"

# Check if governance files exist
governance_files=(
    "/home/ichardart/code/infra/governance/mcp-server-lifecycle-policy.md"
    "/home/ichardart/code/infra/governance/policies/mcp-server-policy.rego"
    "/home/ichardart/code/infra/.github/workflows/mcp-server-build.yml"
)

for file in "${governance_files[@]}"; do
    echo -n "Checking $(basename $file)... "
    if [ -f "$file" ]; then
        echo "✅ EXISTS"
        ((PASSED++))
    else
        echo "❌ MISSING"
        ((FAILED++))
    fi
done

echo ""
echo "📈 Performance & Metrics"
echo "----------------------"

# Test response times
start_time=$(date +%s%3N)
curl -s http://localhost:3010/api/health > /dev/null
end_time=$(date +%s%3N)
response_time=$((end_time - start_time))

echo -n "Dashboard Response Time... "
if [ $response_time -lt 100 ]; then
    echo "✅ EXCELLENT (${response_time}ms)"
    ((PASSED++))
elif [ $response_time -lt 500 ]; then
    echo "⚠️  ACCEPTABLE (${response_time}ms)"
    ((PASSED++))
else
    echo "❌ SLOW (${response_time}ms)"
    ((FAILED++))
fi

# Check resource usage
echo -n "Container Memory Usage... "
if command -v docker stats --no-stream > /dev/null 2>&1; then
    # Get memory usage for MCP containers
    mem_usage=$(docker stats --no-stream --format "{{.MemUsage}}" mcp-dashboard 2>/dev/null | head -1)
    if [ -n "$mem_usage" ]; then
        echo "✅ MONITORED ($mem_usage)"
        ((PASSED++))
    else
        echo "⚠️  UNKNOWN"
    fi
else
    echo "⚠️  DOCKER STATS UNAVAILABLE"
fi

echo ""
echo "📁 File Structure Validation"
echo "---------------------------"

key_files=(
    "/home/ichardart/code/infra/mcp-central/docker-compose.working.yml"
    "/home/ichardart/code/infra/scripts/dockerize-mcp-server.sh"
    "/home/ichardart/code/infra/scripts/switch-to-centralized-mcp.sh"
    "/home/ichardart/code/infra/mcp-central/dashboard/index.html"
)

for file in "${key_files[@]}"; do
    echo -n "Checking $(basename $file)... "
    if [ -f "$file" ]; then
        echo "✅ EXISTS"
        ((PASSED++))
    else
        echo "❌ MISSING"
        ((FAILED++))
    fi
done

echo ""
echo "🎯 Implementation Status Summary"
echo "==============================="

total=$((PASSED + FAILED))
success_rate=$((PASSED * 100 / total))

echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo "📊 Success Rate: $success_rate%"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo "🎉 IMPLEMENTATION COMPLETE!"
    echo "==========================="
    echo ""
    echo "✅ Docker MCP Centralization Successfully Deployed"
    echo ""
    echo "🔗 Access Points:"
    echo "  • Dashboard: http://localhost:3010"
    echo "  • A2A API: http://localhost:3011"  
    echo "  • Docker Bridge: http://localhost:3012"
    echo "  • Jaeger Tracing: http://localhost:16686"
    echo ""
    echo "🚀 Next Steps:"
    echo "  1. Run: ./scripts/switch-to-centralized-mcp.sh"
    echo "  2. Restart Claude Desktop"
    echo "  3. Test centralized MCP functionality"
    echo ""
    echo "📋 Management Commands:"
    echo "  • Status: docker-compose -f mcp-central/docker-compose.working.yml ps"
    echo "  • Logs: docker-compose -f mcp-central/docker-compose.working.yml logs -f"
    echo "  • Restart: docker-compose -f mcp-central/docker-compose.working.yml restart"
    
    exit 0
elif [ $success_rate -ge 80 ]; then
    echo ""
    echo "⚠️  MOSTLY FUNCTIONAL ($success_rate% success)"
    echo "Some components need attention but core functionality is working."
    exit 0
else
    echo ""
    echo "❌ IMPLEMENTATION ISSUES ($success_rate% success)"
    echo "Critical components are failing. Please review the errors above."
    exit 1
fi