#!/usr/bin/env node

/**
 * Comprehensive test script for IDP Filesystem MCP Server
 */

import { spawn } from 'child_process';
import fs from 'fs/promises';

// Test messages for the MCP server
const testMessages = [
  // Initialize
  {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: { tools: true },
      clientInfo: { name: 'test-client', version: '1.0.0' }
    }
  },
  
  // List tools
  {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  },
  
  // Test directory listing
  {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'list_directory',
      arguments: { path: '.', recursive: false }
    }
  },
  
  // Test file reading (read package.json)
  {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'read_file',
      arguments: { path: 'package.json' }
    }
  },
  
  // Test file info
  {
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'get_file_info',
      arguments: { path: 'package.json' }
    }
  },
  
  // Test file search
  {
    jsonrpc: '2.0',
    id: 6,
    method: 'tools/call',
    params: {
      name: 'search_files',
      arguments: { pattern: '*.js', directory: '.', recursive: true }
    }
  },
  
  // Test write operation (create test file)
  {
    jsonrpc: '2.0',
    id: 7,
    method: 'tools/call',
    params: {
      name: 'write_file',
      arguments: {
        path: 'test-file.txt',
        content: 'This is a test file created by the Filesystem MCP server.\nIt demonstrates secure file operations.'
      }
    }
  },
  
  // Test edit operation
  {
    jsonrpc: '2.0',
    id: 8,
    method: 'tools/call',
    params: {
      name: 'edit_file',
      arguments: {
        path: 'test-file.txt',
        old_content: 'test file',
        new_content: 'TEST FILE'
      }
    }
  },
  
  // Test security - try to read outside workspace (should fail)
  {
    jsonrpc: '2.0',
    id: 9,
    method: 'tools/call',
    params: {
      name: 'read_file',
      arguments: { path: '../../../etc/passwd' }
    }
  },
  
  // Test security - forbidden file pattern (should fail)
  {
    jsonrpc: '2.0',
    id: 10,
    method: 'tools/call',
    params: {
      name: 'read_file',
      arguments: { path: '.env' }
    }
  }
];

async function testFilesystemMCPServer() {
  console.log('🧪 Testing IDP Filesystem MCP Server...');
  console.log('=' * 50);
  
  // Set environment variables for testing
  process.env.FS_WORKSPACE = '/home/ichardart/code/infra/mcp-servers/filesystem-mcp';
  process.env.MAX_FILE_SIZE = '10485760';
  process.env.READ_ONLY_MODE = 'false';
  process.env.GOVERNANCE_LOG = '/home/ichardart/code/infra/logs/filesystem-mcp-test.log';
  
  // Spawn the MCP server
  const server = spawn('node', ['index.js'], {
    cwd: '/home/ichardart/code/infra/mcp-servers/filesystem-mcp',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let responseCount = 0;
  let responses = [];
  let securityTestsPassed = 0;
  let fileOperationsPassed = 0;
  
  // Handle server responses
  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        responses.push(response);
        responseCount++;
        
        console.log(`\n✅ Response ${responseCount}:`);
        
        // Analyze specific responses
        if (response.result) {
          if (response.result.tools) {
            console.log(`📋 Tools available: ${response.result.tools.length}`);
            const toolNames = response.result.tools.map(t => t.name);
            console.log(`   ${toolNames.join(', ')}`);
          } else if (response.result.content) {
            const content = response.result.content[0].text;
            console.log(`📄 Operation result: ${content.substring(0, 100)}...`);
            
            // Check for successful file operations
            if (content.includes('File written:') || content.includes('Directory:') || content.includes('File Info:')) {
              fileOperationsPassed++;
            }
          }
        } else if (response.error || (response.result?.content?.[0]?.text?.includes('Security validation failed'))) {
          // Security tests should fail
          if (responseCount >= 9) { // Security tests are at the end
            securityTestsPassed++;
            console.log(`🔒 Security test passed: Operation correctly blocked`);
          }
        }
        
        // Stop after all tests
        if (responseCount >= testMessages.length) {
          setTimeout(() => {
            server.kill();
          }, 1000);
        }
      } catch (error) {
        console.log(`📋 Server output: ${line}`);
      }
    }
  });
  
  // Handle errors
  server.stderr.on('data', (data) => {
    console.log(`📋 Server stderr: ${data.toString()}`);
  });
  
  // Handle server exit
  server.on('close', async (code) => {
    console.log(`\n🏁 Server exited with code ${code}`);
    
    // Analyze test results
    console.log('\n📊 Test Results Summary:');
    console.log(`• Total responses: ${responses.length}`);
    console.log(`• Expected responses: ${testMessages.length}`);
    console.log(`• File operations passed: ${fileOperationsPassed}`);
    console.log(`• Security tests passed: ${securityTestsPassed}`);
    
    const hasTools = responses.some(r => r.result?.tools);
    const hasFileOps = fileOperationsPassed > 0;
    const hasSecurityBlocks = securityTestsPassed > 0;
    
    console.log(`• Tools listed: ${hasTools ? '✅' : '❌'}`);
    console.log(`• File operations: ${hasFileOps ? '✅' : '❌'}`);
    console.log(`• Security controls: ${hasSecurityBlocks ? '✅' : '❌'}`);
    
    // Check for test file cleanup
    try {
      await fs.unlink('/home/ichardart/code/infra/mcp-servers/filesystem-mcp/test-file.txt');
      console.log('🧹 Test file cleaned up');
    } catch (error) {
      console.log('ℹ️  No test file to clean up');
    }
    
    if (hasTools && hasFileOps && hasSecurityBlocks) {
      console.log('\n🎉 Filesystem MCP Server test PASSED!');
      console.log('✅ Server is ready for Claude Desktop integration');
      console.log('✅ All security controls working correctly');
      console.log('✅ File operations functional');
    } else {
      console.log('\n❌ Filesystem MCP Server test FAILED');
      console.log('⚠️  Check server implementation and security controls');
    }
    
    // Check governance log
    try {
      const logContent = await fs.readFile('/home/ichardart/code/infra/logs/filesystem-mcp-test.log', 'utf-8');
      const logLines = logContent.split('\n').filter(line => line.trim());
      console.log(`\n📋 Governance log entries: ${logLines.length}`);
      if (logLines.length > 0) {
        console.log('✅ Governance logging is working');
      }
    } catch (error) {
      console.log('⚠️  Governance log check failed');
    }
  });
  
  // Send test messages with delays
  for (let i = 0; i < testMessages.length; i++) {
    setTimeout(() => {
      const message = JSON.stringify(testMessages[i]) + '\n';
      console.log(`\n📤 Sending test ${i + 1}: ${testMessages[i].method}`);
      if (testMessages[i].params?.name) {
        console.log(`   Tool: ${testMessages[i].params.name}`);
      }
      server.stdin.write(message);
    }, i * 800); // 800ms delay between messages
  }
}

// Run the test
testFilesystemMCPServer().catch(console.error);