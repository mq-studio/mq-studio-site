#!/usr/bin/env node
/**
 * Comprehensive Security Test Suite for Shell MCP Server
 * 
 * Tests all security controls and validates governance compliance
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// Test configuration
const MCP_SERVER_PATH = './index.js';
const TEST_WORKSPACE = process.env.SHELL_WORKSPACE || '/home/ichardart/code';

// ANSI colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

/**
 * Test helper function
 */
function test(description, assertion) {
  testResults.total++;
  try {
    if (assertion) {
      console.log(`${colors.green}✅ PASS${colors.reset}: ${description}`);
      testResults.passed++;
      return true;
    } else {
      console.log(`${colors.red}❌ FAIL${colors.reset}: ${description}`);
      testResults.failed++;
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ ERROR${colors.reset}: ${description} - ${error.message}`);
    testResults.failed++;
    return false;
  }
}

/**
 * Test the MCP server with a specific input
 */
async function testMCPCall(tool, args) {
  const input = JSON.stringify({
    jsonrpc: '2.0',
    id: Math.random(),
    method: 'tools/call',
    params: {
      name: tool,
      arguments: args
    }
  });

  try {
    const { stdout, stderr } = await execAsync(`echo '${input}' | node ${MCP_SERVER_PATH}`, {
      timeout: 10000,
      cwd: path.dirname(MCP_SERVER_PATH)
    });
    
    if (stderr && !stderr.includes('MCP Server running')) {
      throw new Error(`Server error: ${stderr}`);
    }
    
    const lines = stdout.trim().split('\n').filter(line => line.trim());
    const response = JSON.parse(lines[lines.length - 1]);
    
    return response;
  } catch (error) {
    throw new Error(`MCP call failed: ${error.message}`);
  }
}

/**
 * Security Tests
 */
async function runSecurityTests() {
  console.log(`${colors.bold}${colors.cyan}🛡️  SECURITY VALIDATION TESTS${colors.reset}\n`);

  // Test 1: Command Validation - Allowed Commands
  console.log(`${colors.blue}📋 Testing Allowed Commands...${colors.reset}`);
  
  const allowedCommands = ['ls', 'cat', 'git status', 'npm --version', 'node --version'];
  for (const command of allowedCommands) {
    try {
      const response = await testMCPCall('check_command_status', { command });
      const isAllowed = response.result?.content?.[0]?.text?.includes('✅');
      test(`Command '${command}' should be allowed`, isAllowed);
    } catch (error) {
      test(`Command '${command}' validation failed`, false);
    }
  }

  // Test 2: Command Validation - Forbidden Commands
  console.log(`\n${colors.blue}🚫 Testing Forbidden Commands...${colors.reset}`);
  
  const forbiddenCommands = ['rm -rf', 'sudo rm', 'chmod 777', 'ssh user@host', 'dd if=/dev/zero'];
  for (const command of forbiddenCommands) {
    try {
      const response = await testMCPCall('check_command_status', { command });
      const isBlocked = response.result?.content?.[0]?.text?.includes('❌');
      test(`Command '${command}' should be blocked`, isBlocked);
    } catch (error) {
      test(`Command '${command}' blocking failed`, false);
    }
  }

  // Test 3: Pattern Detection
  console.log(`\n${colors.blue}🔍 Testing Dangerous Patterns...${colors.reset}`);
  
  const dangerousPatterns = [
    'ls && rm file.txt',
    'cat /etc/passwd',
    'echo `whoami`',
    'ls | sh',
    'eval "dangerous code"'
  ];
  
  for (const command of dangerousPatterns) {
    try {
      const response = await testMCPCall('check_command_status', { command });
      const isBlocked = response.result?.content?.[0]?.text?.includes('❌');
      test(`Dangerous pattern '${command}' should be blocked`, isBlocked);
    } catch (error) {
      test(`Pattern detection for '${command}' failed`, false);
    }
  }

  // Test 4: Workspace Validation
  console.log(`\n${colors.blue}📁 Testing Workspace Restrictions...${colors.reset}`);
  
  try {
    const response = await testMCPCall('get_workspace_info', {});
    const hasCorrectWorkspace = response.result?.content?.[0]?.text?.includes(TEST_WORKSPACE);
    test('Workspace information should show correct path', hasCorrectWorkspace);
    
    const isAccessible = response.result?.content?.[0]?.text?.includes('✅ Yes');
    test('Workspace should be accessible', isAccessible);
  } catch (error) {
    test('Workspace validation failed', false);
  }

  // Test 5: Safe Command Execution
  console.log(`\n${colors.blue}⚡ Testing Safe Command Execution...${colors.reset}`);
  
  try {
    const response = await testMCPCall('execute_command', { command: 'echo "Hello World"' });
    const hasOutput = response.result?.content?.[0]?.text?.includes('Hello World');
    test('Safe command execution should work', hasOutput);
  } catch (error) {
    test('Safe command execution failed', false);
  }

  // Test 6: Command List Retrieval
  console.log(`\n${colors.blue}📜 Testing Command List...${colors.reset}`);
  
  try {
    const response = await testMCPCall('list_allowed_commands', {});
    const hasAllowedCommands = response.result?.content?.[0]?.text?.includes('Allowed Commands');
    const hasForbiddenCommands = response.result?.content?.[0]?.text?.includes('Forbidden Commands');
    test('Command list should include allowed commands', hasAllowedCommands);
    test('Command list should include forbidden commands', hasForbiddenCommands);
  } catch (error) {
    test('Command list retrieval failed', false);
  }
}

/**
 * Functionality Tests
 */
async function runFunctionalityTests() {
  console.log(`\n${colors.bold}${colors.magenta}⚙️  FUNCTIONALITY TESTS${colors.reset}\n`);

  // Test basic file operations
  const functionalTests = [
    {
      name: 'Directory listing',
      command: 'ls -la',
      expectSuccess: true
    },
    {
      name: 'Git status check',
      command: 'git status',
      expectSuccess: true,
      workingDirectory: '.'
    },
    {
      name: 'Node version check',
      command: 'node --version',
      expectSuccess: true
    },
    {
      name: 'NPM version check',
      command: 'npm --version',
      expectSuccess: true
    }
  ];

  for (const testCase of functionalTests) {
    try {
      const args = { command: testCase.command };
      if (testCase.workingDirectory) {
        args.working_directory = testCase.workingDirectory;
      }
      
      const response = await testMCPCall('execute_command', args);
      const isSuccess = response.result?.content?.[0]?.text?.includes('✅');
      
      if (testCase.expectSuccess) {
        test(`${testCase.name} should succeed`, isSuccess);
      } else {
        test(`${testCase.name} should fail`, !isSuccess);
      }
    } catch (error) {
      test(`${testCase.name} test failed`, false);
    }
  }
}

/**
 * Performance Tests
 */
async function runPerformanceTests() {
  console.log(`\n${colors.bold}${colors.yellow}⚡ PERFORMANCE TESTS${colors.reset}\n`);

  // Test response time
  console.log(`${colors.blue}⏱️  Testing Response Times...${colors.reset}`);
  
  const start = Date.now();
  try {
    await testMCPCall('check_command_status', { command: 'ls' });
    const responseTime = Date.now() - start;
    test(`Response time under 1000ms (actual: ${responseTime}ms)`, responseTime < 1000);
  } catch (error) {
    test('Response time test failed', false);
  }

  // Test concurrent requests
  console.log(`\n${colors.blue}🔄 Testing Concurrent Requests...${colors.reset}`);
  
  try {
    const concurrentStart = Date.now();
    const promises = Array.from({ length: 5 }, () => 
      testMCPCall('check_command_status', { command: 'echo test' })
    );
    
    await Promise.all(promises);
    const concurrentTime = Date.now() - concurrentStart;
    test(`Concurrent requests under 2000ms (actual: ${concurrentTime}ms)`, concurrentTime < 2000);
  } catch (error) {
    test('Concurrent requests test failed', false);
  }
}

/**
 * Governance Tests
 */
async function runGovernanceTests() {
  console.log(`\n${colors.bold}${colors.green}📊 GOVERNANCE COMPLIANCE TESTS${colors.reset}\n`);

  // Test log file creation
  const logPath = process.env.GOVERNANCE_LOG || '/home/ichardart/code/infra/logs/shell-mcp.log';
  
  try {
    // Execute a command to generate log entries
    await testMCPCall('execute_command', { command: 'echo "governance test"' });
    
    // Wait a moment for log writing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if log file exists and has content
    try {
      const logContent = await fs.readFile(logPath, 'utf8');
      const hasLogEntries = logContent.includes('governance test') || logContent.includes('command_executed');
      test('Governance logging should create log entries', hasLogEntries);
      
      // Check log format
      const lines = logContent.trim().split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        const lastEntry = JSON.parse(lines[lines.length - 1]);
        const hasRequiredFields = lastEntry.timestamp && lastEntry.event && lastEntry.command;
        test('Log entries should have required fields', hasRequiredFields);
      }
    } catch (logError) {
      test('Governance log file should be accessible', false);
    }
  } catch (error) {
    test('Governance logging test setup failed', false);
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(`${colors.bold}${colors.cyan}🧪 IDP SHELL MCP SERVER - SECURITY TEST SUITE${colors.reset}\n`);
  console.log(`Testing workspace: ${TEST_WORKSPACE}\n`);

  try {
    await runSecurityTests();
    await runFunctionalityTests();
    await runPerformanceTests();
    await runGovernanceTests();
  } catch (error) {
    console.error(`${colors.red}Test suite error: ${error.message}${colors.reset}`);
  }

  // Print summary
  console.log(`\n${colors.bold}📊 TEST SUMMARY${colors.reset}`);
  console.log(`${colors.cyan}═══════════════${colors.reset}`);
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  
  const successRate = Math.round((testResults.passed / testResults.total) * 100);
  console.log(`Success Rate: ${successRate}%`);
  
  if (testResults.failed === 0) {
    console.log(`\n${colors.bold}${colors.green}🎉 ALL TESTS PASSED! Shell MCP Server is secure and operational.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`\n${colors.bold}${colors.red}⚠️  Some tests failed. Please review security configuration.${colors.reset}`);
    process.exit(1);
  }
}

// Run the test suite
runAllTests().catch(error => {
  console.error(`${colors.red}Fatal test error: ${error.message}${colors.reset}`);
  process.exit(1);
});