/**
 * Axe accessibility helper for Stagehand tests
 * Provides common accessibility testing utilities
 */

const { injectAxe, checkA11y } = require('axe-playwright');

/**
 * Injects axe-core into the page for accessibility testing
 * @param {Page} page - Playwright page instance
 */
async function injectAxeHelper(page) {
  await injectAxe(page);
}

/**
 * Runs accessibility checks on the current page
 * @param {Page} page - Playwright page instance
 * @param {Object} options - Axe configuration options
 * @returns {Promise<Object>} Accessibility results
 */
async function runA11yCheck(page, options = {}) {
  const defaultOptions = {
    detailedReport: true,
    detailedReportOptions: {
      html: true,
    },
    ...options
  };

  return await checkA11y(page, null, defaultOptions);
}

/**
 * Checks for critical accessibility violations
 * @param {Page} page - Playwright page instance
 * @returns {Promise<boolean>} True if no critical violations found
 */
async function hasNoCriticalA11yViolations(page) {
  try {
    const results = await runA11yCheck(page, {
      includedImpacts: ['critical', 'serious']
    });
    return results.violations.length === 0;
  } catch (error) {
    console.error('Accessibility check failed:', error);
    return false;
  }
}

module.exports = {
  injectAxeHelper,
  runA11yCheck,
  hasNoCriticalA11yViolations,
};