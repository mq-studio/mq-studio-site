#!/usr/bin/env node

/**
 * Validation Script for Musings Page Fixes
 * Tests all the issues that were reported and fixed
 */

const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'http://localhost:3100';

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

async function testEndpoint(url, testName) {
  try {
    const response = await fetch(url);
    const success = response.status === 200;
    console.log(`${success ? colors.green + '✓' : colors.red + '✗'} ${testName}: ${success ? 'PASSED' : 'FAILED'} (${response.status})${colors.reset}`);
    return { success, status: response.status };
  } catch (error) {
    console.log(`${colors.red}✗ ${testName}: FAILED (${error.message})${colors.reset}`);
    return { success: false, error: error.message };
  }
}

async function testContent(url, searchText, testName) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const found = text.includes(searchText);
    console.log(`${found ? colors.green + '✓' : colors.red + '✗'} ${testName}: ${found ? 'PASSED' : 'NOT FOUND'}${colors.reset}`);
    return found;
  } catch (error) {
    console.log(`${colors.red}✗ ${testName}: FAILED (${error.message})${colors.reset}`);
    return false;
  }
}

async function countArchivePosts() {
  const archiveDir = path.join(__dirname, 'content', 'musings', 'archive');
  let count = 0;

  try {
    const years = await fs.readdir(archiveDir);
    for (const year of years) {
      const yearPath = path.join(archiveDir, year);
      const stat = await fs.stat(yearPath);
      if (stat.isDirectory()) {
        const files = await fs.readdir(yearPath);
        count += files.filter(f => f.endsWith('.mdx')).length;
      }
    }
  } catch (error) {
    console.error('Error counting archive posts:', error);
  }

  return count;
}

async function runTests() {
  console.log('\n' + colors.yellow + '=== MUSINGS PAGE VALIDATION TESTS ===' + colors.reset + '\n');

  // Test 1: Main musings page loads
  console.log(colors.yellow + '1. TESTING PAGE LOAD:' + colors.reset);
  await testEndpoint(`${BASE_URL}/musings`, 'Musings page loads');

  // Test 2: Check for proper header
  console.log('\n' + colors.yellow + '2. TESTING HEADER CONSISTENCY:' + colors.reset);
  await testContent(`${BASE_URL}/musings`, 'MQ STUDIO', 'Header contains MQ STUDIO branding');
  await testContent(`${BASE_URL}/musings`, 'Feeling · Thinking · Doing', 'Header contains tagline');

  // Test 3: Test archive post URLs (no 404s)
  console.log('\n' + colors.yellow + '3. TESTING ARCHIVE POST URLS (404 FIXES):' + colors.reset);
  const testPosts = [
    'designed-leadership-by-moura-quayle',
    'the-joy-of-habit',
    'a-bright-green-future',
    'mq-reflections-on-city-life',
    'soft-power'
  ];

  for (const slug of testPosts) {
    await testEndpoint(`${BASE_URL}/musings/${slug}`, `Archive post: ${slug}`);
  }

  // Test 4: Check statistics
  console.log('\n' + colors.yellow + '4. TESTING STATISTICS DISPLAY:' + colors.reset);
  const archiveCount = await countArchivePosts();
  await testContent(`${BASE_URL}/musings`, `>${archiveCount}<`, `Archive count shows ${archiveCount}`);
  await testContent(`${BASE_URL}/musings`, '>7<', 'Recent posts count shows 7');

  // Test 5: Check categories are not "Uncategorized"
  console.log('\n' + colors.yellow + '5. TESTING CATEGORY MAPPING:' + colors.reset);
  const categoryTestPost = await fetch(`${BASE_URL}/musings/designed-leadership-by-moura-quayle`);
  const categoryHtml = await categoryTestPost.text();

  // Check that we have proper categories
  const hasProperCategory = categoryHtml.includes('thinking') ||
                           categoryHtml.includes('feeling') ||
                           categoryHtml.includes('doing');
  console.log(`${hasProperCategory ? colors.green + '✓' : colors.red + '✗'} Categories mapped to thinking/feeling/doing: ${hasProperCategory ? 'PASSED' : 'FAILED'}${colors.reset}`);

  // Test 6: Check for excerpts (no "No description available")
  console.log('\n' + colors.yellow + '6. TESTING EXCERPT GENERATION:' + colors.reset);
  const musingsPage = await fetch(`${BASE_URL}/musings`);
  const musingsHtml = await musingsPage.text();
  const noDescCount = (musingsHtml.match(/No description available/g) || []).length;
  const hasExcerpts = noDescCount < 5; // Allow a few, but not many
  console.log(`${hasExcerpts ? colors.green + '✓' : colors.yellow + '⚠'} Excerpts generated (${noDescCount} posts without descriptions): ${hasExcerpts ? 'MOSTLY PASSED' : 'NEEDS IMPROVEMENT'}${colors.reset}`);

  // Test 7: Archive indicator badges
  console.log('\n' + colors.yellow + '7. TESTING ARCHIVE INDICATORS:' + colors.reset);
  await testContent(`${BASE_URL}/musings`, 'From the Archives', 'Archive badges display');

  // Summary
  console.log('\n' + colors.yellow + '=== VALIDATION COMPLETE ===' + colors.reset + '\n');

  // Check server health
  const healthCheck = await fetch(`${BASE_URL}/musings`);
  if (healthCheck.status === 200) {
    console.log(colors.green + '✓ Development server is healthy and responsive' + colors.reset);
  } else {
    console.log(colors.red + '✗ Development server may have issues' + colors.reset);
  }
}

// Run tests
runTests().catch(console.error);