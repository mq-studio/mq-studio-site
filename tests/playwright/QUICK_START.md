# Quick Start Guide - Search Functionality Tests

## Prerequisites

1. **Server must be running:**
   ```bash
   cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
   npm run dev
   ```
   Server should be accessible at http://localhost:3100

2. **Fix current server error:**
   - Currently returning HTTP 500 (Internal Server Error)
   - Must be resolved before tests can run successfully

## Running the Tests

### Method 1: Using the Test Script
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
./tests/playwright/run-search-tests.sh
```

### Method 2: Direct Playwright Command
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
npx playwright test tests/playwright/search-functionality.spec.js --reporter=list
```

### Method 3: Run Specific Test
```bash
npx playwright test tests/playwright/search-functionality.spec.js -g "should display search bar"
```

## Viewing Results

### View HTML Report
```bash
npx playwright show-report
```

### View Screenshots
Screenshots are saved to:
```
/home/ichardart/code/clients/moura_quayle/website-mq-studio/test-results/
```

### View Videos
Test videos (for failures) are in the same directory as screenshots.

## Test Coverage

The test suite covers:
- ✓ Search bar visibility on homepage
- ✓ Autocomplete suggestions when typing slowly
- ✓ Search submission and navigation to results page
- ✓ Results grouped by type (Publications, Artworks, Musings, Projects)
- ✓ Result cards with title, excerpt, and type badge
- ✓ Multiple search queries (landscape, watercolor)
- ✓ Empty search handling
- ✓ Special characters handling (@#$%, quotes, slashes, etc.)
- ✓ Very long query handling (500+ characters)
- ✓ Result relevance verification

## Current Status

**Last Test Run:** 2025-10-25
**Result:** 2 passed, 9 failed (server error blocking tests)
**Issue:** Application returning HTTP 500 error

## Troubleshooting

### Server Error (500)
```bash
# Check if server is running
curl http://localhost:3100

# Check server logs in terminal where npm run dev is running

# Try restarting server
# Ctrl+C to stop, then:
npm run dev
```

### Tests Timeout
```bash
# Increase timeout in playwright.config.js
# Change timeout value in test file
# Check network/server performance
```

### Screenshots Not Captured
```bash
# Ensure directory exists
mkdir -p tests/playwright/screenshots

# Check permissions
ls -la tests/playwright/
```

## Next Steps After Server Fix

1. Restart the development server
2. Verify http://localhost:3100 loads without error
3. Re-run test suite
4. Review results and screenshots
5. Address any failing tests related to actual search functionality

---

For detailed test results, see: `SEARCH_TEST_REPORT.md`
