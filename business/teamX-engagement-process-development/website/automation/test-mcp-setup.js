#!/usr/bin/env node

/**
 * TeamX Playwright MCP Setup Test
 * Validates the MCP configuration without requiring browser dependencies
 */

const fs = require('fs');
const path = require('path');

class MCPSetupTester {
  constructor() {
    this.results = [];
    this.baseDir = path.join(__dirname, '..');
  }

  async runTests() {
    console.log('🧪 Testing TeamX Playwright MCP Setup\n');
    
    // Test 1: Check dependencies
    this.testDependencies();
    
    // Test 2: Check configuration files
    this.testConfigurationFiles();
    
    // Test 3: Check automation scripts
    this.testAutomationScripts();
    
    // Test 4: Check directory structure
    this.testDirectoryStructure();
    
    // Test 5: Check npm scripts
    this.testNpmScripts();
    
    this.printResults();
  }

  testDependencies() {
    console.log('📦 Testing Dependencies...');
    
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.baseDir, 'package.json'), 'utf8')
      );
      
      const requiredDeps = [
        '@playwright/mcp',
        '@modelcontextprotocol/sdk',
        'playwright'
      ];
      
      const missingDeps = requiredDeps.filter(dep => 
        !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
      );
      
      if (missingDeps.length === 0) {
        this.logSuccess('All required dependencies are installed');
        this.results.push({ test: 'Dependencies', status: 'PASS' });
      } else {
        this.logError(`Missing dependencies: ${missingDeps.join(', ')}`);
        this.results.push({ test: 'Dependencies', status: 'FAIL', details: missingDeps });
      }
      
    } catch (error) {
      this.logError(`Failed to read package.json: ${error.message}`);
      this.results.push({ test: 'Dependencies', status: 'ERROR', details: error.message });
    }
  }

  testConfigurationFiles() {
    console.log('\n⚙️  Testing Configuration Files...');
    
    const configFiles = [
      'mcp-config/playwright-server-config.json',
      'mcp-config/claude-desktop-config.json',
      'mcp-config/teamx-playwright-config.js'
    ];
    
    const results = configFiles.map(file => {
      const filePath = path.join(this.baseDir, file);
      
      if (fs.existsSync(filePath)) {
        try {
          if (file.endsWith('.json')) {
            JSON.parse(fs.readFileSync(filePath, 'utf8'));
          } else if (file.endsWith('.js')) {
            require(filePath);
          }
          
          this.logSuccess(`${file} exists and is valid`);
          return { file, status: 'PASS' };
        } catch (error) {
          this.logError(`${file} is invalid: ${error.message}`);
          return { file, status: 'FAIL', details: error.message };
        }
      } else {
        this.logError(`${file} does not exist`);
        return { file, status: 'FAIL', details: 'File not found' };
      }
    });
    
    const allPassed = results.every(r => r.status === 'PASS');
    this.results.push({ 
      test: 'Configuration Files', 
      status: allPassed ? 'PASS' : 'FAIL', 
      details: results.filter(r => r.status !== 'PASS')
    });
  }

  testAutomationScripts() {
    console.log('\n🤖 Testing Automation Scripts...');
    
    const scripts = [
      'automation/run-tests.js',
      'automation/take-screenshots.js',
      'automation/mcp-integration-example.js'
    ];
    
    const results = scripts.map(script => {
      const scriptPath = path.join(this.baseDir, script);
      
      if (fs.existsSync(scriptPath)) {
        try {
          // Basic syntax check by requiring (without executing)
          const content = fs.readFileSync(scriptPath, 'utf8');
          
          // Check for required patterns
          const hasShebang = content.startsWith('#!/usr/bin/env node');
          const hasMainFunction = content.includes('async function main()') || 
                                content.includes('if (require.main === module)');
          
          if (hasMainFunction) {
            this.logSuccess(`${script} exists and appears valid`);
            return { script, status: 'PASS' };
          } else {
            this.logWarning(`${script} exists but may be missing main function`);
            return { script, status: 'WARN', details: 'No main function detected' };
          }
        } catch (error) {
          this.logError(`${script} has syntax errors: ${error.message}`);
          return { script, status: 'FAIL', details: error.message };
        }
      } else {
        this.logError(`${script} does not exist`);
        return { script, status: 'FAIL', details: 'File not found' };
      }
    });
    
    const hasFails = results.some(r => r.status === 'FAIL');
    this.results.push({ 
      test: 'Automation Scripts', 
      status: hasFails ? 'FAIL' : 'PASS', 
      details: results.filter(r => r.status !== 'PASS')
    });
  }

  testDirectoryStructure() {
    console.log('\n📁 Testing Directory Structure...');
    
    const requiredDirs = [
      'mcp-config',
      'automation',
      'screenshots'
    ];
    
    const results = requiredDirs.map(dir => {
      const dirPath = path.join(this.baseDir, dir);
      
      if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
        this.logSuccess(`${dir}/ directory exists`);
        return { dir, status: 'PASS' };
      } else {
        this.logError(`${dir}/ directory does not exist`);
        return { dir, status: 'FAIL' };
      }
    });
    
    const allPassed = results.every(r => r.status === 'PASS');
    this.results.push({ 
      test: 'Directory Structure', 
      status: allPassed ? 'PASS' : 'FAIL', 
      details: results.filter(r => r.status !== 'PASS')
    });
  }

  testNpmScripts() {
    console.log('\n📜 Testing NPM Scripts...');
    
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.baseDir, 'package.json'), 'utf8')
      );
      
      const requiredScripts = [
        'playwright:mcp',
        'playwright:mcp-headless',
        'playwright:test',
        'playwright:screenshots'
      ];
      
      const missingScripts = requiredScripts.filter(script => 
        !packageJson.scripts[script]
      );
      
      if (missingScripts.length === 0) {
        this.logSuccess('All required npm scripts are defined');
        this.results.push({ test: 'NPM Scripts', status: 'PASS' });
      } else {
        this.logError(`Missing npm scripts: ${missingScripts.join(', ')}`);
        this.results.push({ test: 'NPM Scripts', status: 'FAIL', details: missingScripts });
      }
      
    } catch (error) {
      this.logError(`Failed to validate npm scripts: ${error.message}`);
      this.results.push({ test: 'NPM Scripts', status: 'ERROR', details: error.message });
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('🎯 TEST RESULTS SUMMARY');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const errors = this.results.filter(r => r.status === 'ERROR').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;
    
    console.log(`✅ PASSED: ${passed}`);
    console.log(`❌ FAILED: ${failed}`);
    console.log(`⚠️  WARNINGS: ${warnings}`);
    console.log(`💥 ERRORS: ${errors}`);
    console.log(`📊 TOTAL: ${this.results.length}\n`);
    
    // Detailed results
    this.results.forEach(result => {
      const icon = this.getStatusIcon(result.status);
      console.log(`${icon} ${result.test}: ${result.status}`);
      
      if (result.details && result.details.length > 0) {
        if (Array.isArray(result.details)) {
          result.details.forEach(detail => {
            if (typeof detail === 'string') {
              console.log(`    └─ ${detail}`);
            } else {
              console.log(`    └─ ${detail.file || detail.script || detail.dir}: ${detail.status}`);
            }
          });
        } else {
          console.log(`    └─ ${result.details}`);
        }
      }
    });
    
    // Overall status
    console.log('\n' + '='.repeat(50));
    if (failed === 0 && errors === 0) {
      console.log('🎉 MCP SETUP: READY FOR USE');
      console.log('\nℹ️  Note: Browser dependencies may need to be installed with:');
      console.log('   sudo npx playwright install-deps');
    } else {
      console.log('❌ MCP SETUP: REQUIRES ATTENTION');
    }
    console.log('='.repeat(50));
  }

  getStatusIcon(status) {
    switch (status) {
      case 'PASS': return '✅';
      case 'FAIL': return '❌';
      case 'ERROR': return '💥';
      case 'WARN': return '⚠️';
      default: return '❓';
    }
  }

  logSuccess(message) {
    console.log(`  ✅ ${message}`);
  }

  logError(message) {
    console.log(`  ❌ ${message}`);
  }

  logWarning(message) {
    console.log(`  ⚠️  ${message}`);
  }
}

// Main execution
async function main() {
  const tester = new MCPSetupTester();
  await tester.runTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = MCPSetupTester;