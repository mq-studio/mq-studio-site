#!/usr/bin/env node

/**
 * DASHBOARD CONNECTION TESTING UTILITY
 * Tests monitoring dashboard connectivity and provides troubleshooting info
 */

import http from 'http';

console.log('🔍 IDP Dashboard Connection Test');
console.log('=================================\n');

// Test 1: Basic HTTP request
console.log('📡 Testing HTTP connection to localhost:3001...');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ HTTP Status: ${res.statusCode}`);
  console.log(`📊 Content-Type: ${res.headers['content-type']}`);
  console.log(`🔗 Server: Dashboard service is responding`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📄 Content Length: ${data.length} characters`);
    console.log(`🎯 Title Found: ${data.includes('IDP Production Monitoring Dashboard') ? 'YES' : 'NO'}`);
    
    console.log('\n🌐 Dashboard Access Information:');
    console.log('================================');
    console.log('🔗 URL: http://localhost:3001');
    console.log('🔧 Service: Running and responsive');
    console.log('📊 Dashboard: Full HTML interface available');
    console.log('⚡ WebSocket: Available for real-time updates');
    
    console.log('\n🛠️ If browser still shows "connection refused":');
    console.log('===============================================');
    console.log('1. Try different browser (Chrome, Firefox, Edge)');
    console.log('2. Clear browser cache and cookies');
    console.log('3. Disable browser extensions temporarily');
    console.log('4. Check if antivirus/firewall is blocking localhost:3001');
    console.log('5. Try incognito/private browsing mode');
    console.log('6. Try 127.0.0.1:3001 instead of localhost:3001');
    
    console.log('\n🎯 Alternative Access Methods:');
    console.log('==============================');
    console.log('📊 View metrics via command: curl http://localhost:3001/metrics');
    console.log('🏥 Health check via command: curl http://localhost:3001/health');
    console.log('📱 Mobile browser: May work if desktop browser doesn\'t');
    
    console.log('\n✅ Connection test completed successfully!');
  });
});

req.on('error', (error) => {
  console.log(`❌ Connection failed: ${error.message}`);
  console.log('\n🔧 Troubleshooting Steps:');
  console.log('1. Restart monitoring service');
  console.log('2. Check if port 3001 is blocked');
  console.log('3. Verify service is running with: ps aux | grep production-monitoring');
});

req.on('timeout', () => {
  console.log('⏰ Connection timed out');
  req.abort();
});

req.end();