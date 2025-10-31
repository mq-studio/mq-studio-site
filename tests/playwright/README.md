# MQ Studio Search Functionality Testing

Comprehensive Playwright test suite for testing the search functionality of the MQ Studio website.

## Files in This Directory

### Test Files
- **`search-functionality.spec.js`** - Main test suite with 11 comprehensive tests
- **`run-search-tests.sh`** - Executable script to run the test suite

### Documentation
- **`SEARCH_TEST_REPORT.md`** - Detailed test report with findings and recommendations
- **`QUICK_START.md`** - Quick start guide for running tests
- **`README.md`** - This file

### Configuration
- **`playwright.config.js`** (in project root) - Playwright configuration

## Test Suite Overview

The test suite includes 11 tests covering:

1. **Search Bar Visibility** - Verifies search input appears on homepage
2. **Autocomplete** - Tests suggestion dropdown when typing "landscape" slowly
3. **Search Navigation** - Submits search and navigates to results page
4. **Result Grouping** - Checks for content type groups (Publications, Artworks, Musings, Projects)
5. **Result Structure** - Verifies cards show title, excerpt, and type badge
6. **Multiple Queries** - Tests "watercolor" search query
7. **Empty Search** - Tests graceful handling of empty submissions
8. **Special Characters** - Tests @#$%, quotes, slashes, etc.
9. **Long Queries** - Tests 500+ character queries
10. **Result Relevance** - Verifies results contain search query
11. **Test Summary** - Generates summary report

## Current Status

⚠️ **CRITICAL ISSUE FOUND**

The application is currently returning **HTTP 500 (Internal Server Error)**, preventing proper testing of search functionality.

### Test Results
- **Passed:** 2 tests
- **Failed:** 9 tests (due to server error)
- **Duration:** 5.6 minutes

## Quick Start

### 1. Fix Server Error
```bash
# Check server status
curl http://localhost:3100

# The server should return 200, not 500
# Fix the server-side error before running tests
```

### 2. Run Tests
```bash
cd /home/ichardart/code/clients/moura_quayle/website-mq-studio
./tests/playwright/run-search-tests.sh
```

### 3. View Results
```bash
# HTML report
npx playwright show-report

# Screenshots
ls -la test-results/

# Detailed report
cat tests/playwright/SEARCH_TEST_REPORT.md
```

## Screenshots Captured

All tests capture screenshots at key moments:
- Homepage with search bar
- Autocomplete suggestions
- Search results page
- Different query results
- Error states
- Edge case handling

Screenshots are saved to: `/home/ichardart/code/clients/moura_quayle/website-mq-studio/test-results/`

## Issues Documented

All issues found during testing are documented in `SEARCH_TEST_REPORT.md`, including:

### Critical Issues
1. Server 500 Error (BLOCKER)
2. Search input not accessible

### High Priority Issues
3. No content grouping found
4. Search results not relevant

### Medium Priority Issues
5. Test timeouts

## Next Steps

1. **Resolve Server Error** - Debug the Next.js application
2. **Verify Search Exists** - Manually test search functionality
3. **Update Test Selectors** - Adjust based on actual HTML structure
4. **Re-run Tests** - Execute suite after fixes
5. **Implement Missing Features** - Add any missing search capabilities

## Technology Stack

- **Test Framework:** Playwright (@playwright/test ^1.48.0)
- **Browser:** Chromium (headless)
- **Language:** JavaScript (Node.js)
- **Application:** Next.js 14.2.5
- **Test Environment:** WSL2 Linux

## Support

For questions or issues with the test suite:
1. Review `SEARCH_TEST_REPORT.md` for detailed findings
2. Check `QUICK_START.md` for troubleshooting steps
3. Examine test code in `search-functionality.spec.js`

---

**Created:** 2025-10-25
**Test Suite Version:** 1.0
**Status:** Ready to run (pending server fix)
