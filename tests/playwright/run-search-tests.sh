#!/bin/bash

# Search Functionality Test Runner
# This script runs Playwright tests for the MQ Studio search functionality

set -e

echo "========================================"
echo "MQ Studio - Search Functionality Tests"
echo "========================================"
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

# Create screenshots directory
mkdir -p tests/playwright/screenshots

# Check if server is running
echo "Checking if development server is running on http://localhost:3100..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3100 | grep -q "200\|500"; then
    echo "✓ Server is running"
else
    echo "✗ Server is not running on port 3100"
    echo ""
    echo "Please start the development server first:"
    echo "  cd $PROJECT_ROOT"
    echo "  npm run dev"
    echo ""
    exit 1
fi

echo ""
echo "Installing Playwright browsers if needed..."
npx playwright install chromium --with-deps

echo ""
echo "Running search functionality tests..."
echo ""

# Run the tests
npx playwright test tests/playwright/search-functionality.spec.js --reporter=list

echo ""
echo "========================================"
echo "Test Results"
echo "========================================"
echo ""
echo "Screenshots saved to: tests/playwright/screenshots/"
echo ""
echo "To view the HTML report, run:"
echo "  npx playwright show-report"
echo ""
