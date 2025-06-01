#!/usr/bin/env node

/**
 * Test script for IDP Git MCP Server
 */

import { spawn } from 'child_process';
import { createWriteStream } from 'fs';

// Test messages to send to the MCP server
const testMessages = [
  // Initialize MCP protocol
  {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: true
      },
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  },
  
  // List available tools
  {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  },
  
  // Test git status
  {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'git_status',
      arguments: {}
    }
  },
  
  // Test git log
  {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'git_log',
      arguments: {
        maxCount: 5,
        oneline: true
      }
    }
  },
  
  // Test git branch list
  {
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'git_branch',
      arguments: {
        action: 'list'
      }
    }
  }
];

async function testGitMCPServer() {
  console.log('🧪 Testing IDP Git MCP Server...');
  console.log('=' * 40);
  
  // Set environment variables
  process.env.GIT_WORKSPACE = '/home/ichardart/code';
  process.env.GOVERNANCE_LOG = '/home/ichardart/code/infra/logs/git-mcp-test.log';
  
  // Spawn the MCP server
  const server = spawn('node', ['index.js'], {
    cwd: '/home/ichardart/code/infra/mcp-servers/git-mcp',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let responseCount = 0;
  let responses = [];
  
  // Handle server responses
  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      try {
        const response = JSON.parse(line);
        responses.push(response);
        responseCount++;
        
        console.log(`✅ Response ${responseCount}:`, JSON.stringify(response, null, 2));
        
        // If we've received all expected responses, close the server
        if (responseCount >= testMessages.length) {
          setTimeout(() => {
            server.kill();
          }, 1000);
        }
      } catch (error) {
        console.log('📋 Server output:', line);
      }
    }
  });
  
  // Handle errors
  server.stderr.on('data', (data) => {
    console.log('📋 Server stderr:', data.toString());
  });
  
  // Handle server exit
  server.on('close', (code) => {
    console.log(`\n🏁 Server exited with code ${code}`);
    
    // Analyze test results
    console.log('\n📊 Test Results Summary:');
    console.log(`• Total responses: ${responses.length}`);
    console.log(`• Expected responses: ${testMessages.length}`);
    
    const hasError = responses.some(r => r.error);
    const hasTools = responses.some(r => r.result && r.result.tools);
    const hasGitData = responses.some(r => r.result && r.result.content);
    
    console.log(`• Has errors: ${hasError ? '❌' : '✅'}`);
    console.log(`• Tools listed: ${hasTools ? '✅' : '❌'}`);
    console.log(`• Git operations: ${hasGitData ? '✅' : '❌'}`);
    
    if (!hasError && hasTools && hasGitData) {
      console.log('\n🎉 Git MCP Server test PASSED!');
      console.log('✅ Server is ready for Claude Desktop integration');
    } else {
      console.log('\n❌ Git MCP Server test FAILED');
      console.log('⚠️  Check server implementation and dependencies');
    }
  });
  
  // Send test messages with delays
  for (let i = 0; i < testMessages.length; i++) {
    setTimeout(() => {
      const message = JSON.stringify(testMessages[i]) + '\n';
      console.log(`📤 Sending message ${i + 1}:`, testMessages[i].method);
      server.stdin.write(message);
    }, i * 500); // 500ms delay between messages
  }
}

// Run the test
testGitMCPServer().catch(console.error);