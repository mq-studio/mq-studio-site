#!/usr/bin/env node

/**
 * Stagehand Test Runner
 * 
 * Runs all Stagehand tests with proper environment setup
 * Supports both local and CI environments
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if .env exists, if not try to create it
if (!fs.existsSync('.env')) {
  console.log('⚠️  No .env file found.');
  console.log('Run: ./scripts/setup-env.sh to set up environment variables with 1Password');
  process.exit(1);
}

// Load environment variables
require('dotenv').config();

// Validate required environment variables
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('❌ Missing ANTHROPIC_API_KEY in environment');
  console.log('Run: ./scripts/setup-env.sh to fetch from 1Password');
  process.exit(1);
}

console.log('🎭 Starting Stagehand Tests...\n');

// Determine test files to run
const testDir = path.join(__dirname);
const testFiles = fs.readdirSync(testDir)
  .filter(file => file.endsWith('.test.js'))
  .map(file => path.join(testDir, file));

if (testFiles.length === 0) {
  console.log('No test files found');
  process.exit(0);
}

console.log(`Found ${testFiles.length} test file(s):`);
testFiles.forEach(file => console.log(`  - ${path.basename(file)}`));
console.log('');

// Run tests with Jest
const jest = spawn('npx', ['jest', '--config', 'jest.config.stagehand.js', ...testFiles], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'test'
  }
});

jest.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ All Stagehand tests passed!');
  } else {
    console.log(`\n❌ Tests failed with code ${code}`);
  }
  process.exit(code);
});