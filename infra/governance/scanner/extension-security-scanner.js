#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

class SecurityScanner {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      extensions: {},
      summary: { critical: 0, high: 0, medium: 0, low: 0 }
    };
  }

  async scanAll() {
    console.log('🔍 Starting security scan of VS Code extensions...');
    
    const extensionsPath = path.join(process.env.HOME, '.vscode-server/extensions');
    
    try {
      const dirs = await fs.readdir(extensionsPath);
      const mcpExtensions = [];
      
      for (const dir of dirs) {
        if (dir.includes('claude') || dir.includes('cline') || dir.includes('anthropic')) {
          const packagePath = path.join(extensionsPath, dir, 'package.json');
          try {
            const pkg = JSON.parse(await fs.readFile(packagePath, 'utf8'));
            mcpExtensions.push({ name: dir, package: pkg });
          } catch (e) {
            // Skip if no package.json
          }
        }
      }
      
      for (const ext of mcpExtensions) {
        console.log(`Scanning ${ext.name}...`);
        const riskLevel = this.assessRisk(ext);
        this.results.extensions[ext.name] = { riskLevel };
        this.results.summary[riskLevel]++;
      }
      
    } catch (error) {
      console.error('Scan error:', error.message);
    }
    
    const reportPath = `/tmp/extension-security-report-${Date.now()}.json`;
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log('\n📊 Security Scan Summary:');
    console.log(`   Critical: ${this.results.summary.critical}`);
    console.log(`   High: ${this.results.summary.high}`);
    console.log(`   Medium: ${this.results.summary.medium}`);
    console.log(`   Low: ${this.results.summary.low}`);
    console.log(`\n📄 Full report: ${reportPath}`);
    
    return reportPath;
  }
  
  assessRisk(ext) {
    if (ext.name.includes('roo-cline') || ext.name.includes('kilo-code')) return 'critical';
    if (ext.name.includes('claude-dev')) return 'high';
    if (ext.name.includes('anthropic')) return 'medium';
    return 'low';
  }
}

if (require.main === module) {
  new SecurityScanner().scanAll().catch(console.error);
}
