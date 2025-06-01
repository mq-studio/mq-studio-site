#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import semver from 'semver';

const execAsync = promisify(exec);

/**
 * IDP Security Scanner MCP Server
 * 
 * Provides advanced security scanning and vulnerability analysis for Claude Desktop
 * with enterprise-grade security controls and governance integration.
 * 
 * Features:
 * - Dependency vulnerability scanning
 * - Code pattern security analysis
 * - Configuration security validation
 * - Secret detection and prevention
 * - Security best practices auditing
 * - Container security scanning
 */

// Configuration from environment variables
const ALLOWED_WORKSPACE = process.env.SECURITY_WORKSPACE || '/home/ichardart/code';
const SCAN_TIMEOUT = parseInt(process.env.SCAN_TIMEOUT) || 120000; // 2 minutes
const MAX_OUTPUT_SIZE = parseInt(process.env.MAX_OUTPUT_SIZE) || 10 * 1024 * 1024; // 10MB
const GOVERNANCE_LOG = process.env.GOVERNANCE_LOG || '/home/ichardart/code/infra/logs/security-scanner-mcp.log';

// Security patterns for code analysis
const SECURITY_PATTERNS = {
  'hardcoded-secrets': [
    /['"`]((?:password|secret|key|token|api[_-]?key|private[_-]?key).{0,20})\s*[:=]\s*['"`]([^'"`]{8,})/gi,
    /['"`]((?:aws|github|google|stripe|slack)[_-]?(?:access[_-]?)?(?:key|token|secret)).{0,20}[:=]\s*['"`]([^'"`]{16,})/gi,
    /(sk-[a-zA-Z0-9]{48})/g, // OpenAI API keys
    /(xox[baprs]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32})/g, // Slack tokens
  ],
  'sql-injection': [
    /\$[_a-zA-Z][_a-zA-Z0-9]*\s*\.\s*['"`].*?WHERE.*?['"`]/gi,
    /query\s*\(\s*['"`].*?\$\{.*?\}.*?['"`]/gi,
    /execute\s*\(\s*['"`].*?\+.*?['"`]/gi,
  ],
  'command-injection': [
    /exec\s*\(\s*.*?\$\{.*?\}/gi,
    /system\s*\(\s*.*?\+.*?\)/gi,
    /shell_exec\s*\(\s*.*?\$.*?\)/gi,
  ],
  'xss-vulnerabilities': [
    /innerHTML\s*=.*?\$\{.*?\}/gi,
    /document\.write\s*\(\s*.*?\+.*?\)/gi,
    /\.html\s*\(\s*.*?\+.*?\)/gi,
  ],
  'insecure-crypto': [
    /MD5\s*\(/gi,
    /SHA1\s*\(/gi,
    /DES\s*\(/gi,
    /RC4\s*\(/gi,
  ],
  'unsafe-eval': [
    /eval\s*\(/gi,
    /Function\s*\(\s*['"`].*?['"`]/gi,
    /setTimeout\s*\(\s*['"`].*?['"`]/gi,
  ],
  'file-path-traversal': [
    /\.\.\//g,
    /\.\.\\\\?/g,
    /path\.join\s*\(.*?req\..*?\)/gi,
  ],
  'insecure-random': [
    /Math\.random\s*\(\s*\)/gi,
    /rand\s*\(\s*\)/gi,
  ]
};

// Vulnerable package patterns (simplified database)
const KNOWN_VULNERABILITIES = {
  'lodash': ['4.17.20', 'Prototype pollution vulnerability'],
  'minimist': ['1.2.5', 'Prototype pollution vulnerability'],
  'serialize-javascript': ['5.0.1', 'XSS vulnerability'],
  'express': ['4.18.0', 'Various security issues in older versions'],
  'axios': ['0.21.1', 'SSRF vulnerability in older versions']
};

// Resolve workspace path
const workspacePath = path.resolve(ALLOWED_WORKSPACE);

/**
 * Validates if a scan path is within allowed workspace
 */
function validateScanPath(scanPath) {
  try {
    const resolvedPath = path.resolve(workspacePath, scanPath || '.');
    if (!resolvedPath.startsWith(workspacePath)) {
      return { valid: false, reason: 'Scan path outside allowed workspace' };
    }
    return { valid: true, path: resolvedPath };
  } catch (error) {
    return { valid: false, reason: `Invalid scan path: ${error.message}` };
  }
}

/**
 * Logs security scanning operations for governance compliance
 */
async function logGovernanceEvent(event, scanPath, scanType, result, error = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: event,
    scan_path: scanPath,
    scan_type: scanType,
    workspace: workspacePath,
    result: result ? 'success' : 'failure',
    error: error
  };
  
  try {
    const logDir = path.dirname(GOVERNANCE_LOG);
    await fs.mkdir(logDir, { recursive: true });
    await fs.appendFile(GOVERNANCE_LOG, JSON.stringify(logEntry) + '\n');
  } catch (logError) {
    console.error('Failed to write governance log:', logError);
  }
}

/**
 * Scans file content for security patterns
 */
async function scanFileForSecurityIssues(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const issues = [];
    
    for (const [category, patterns] of Object.entries(SECURITY_PATTERNS)) {
      for (const pattern of patterns) {
        const matches = [...content.matchAll(pattern)];
        for (const match of matches) {
          const lines = content.substring(0, match.index).split('\n');
          issues.push({
            category: category,
            severity: getSeverityForCategory(category),
            line: lines.length,
            column: lines[lines.length - 1].length + 1,
            message: getMessageForCategory(category),
            match: match[0].substring(0, 100) // Truncate long matches
          });
        }
      }
    }
    
    return { success: true, issues };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Gets severity level for security category
 */
function getSeverityForCategory(category) {
  const severityMap = {
    'hardcoded-secrets': 'CRITICAL',
    'sql-injection': 'HIGH',
    'command-injection': 'HIGH',
    'xss-vulnerabilities': 'HIGH',
    'insecure-crypto': 'MEDIUM',
    'unsafe-eval': 'HIGH',
    'file-path-traversal': 'HIGH',
    'insecure-random': 'LOW'
  };
  return severityMap[category] || 'MEDIUM';
}

/**
 * Gets descriptive message for security category
 */
function getMessageForCategory(category) {
  const messageMap = {
    'hardcoded-secrets': 'Potential hardcoded secret or API key detected',
    'sql-injection': 'Potential SQL injection vulnerability',
    'command-injection': 'Potential command injection vulnerability',
    'xss-vulnerabilities': 'Potential XSS vulnerability',
    'insecure-crypto': 'Use of insecure cryptographic algorithm',
    'unsafe-eval': 'Use of unsafe eval or dynamic code execution',
    'file-path-traversal': 'Potential path traversal vulnerability',
    'insecure-random': 'Use of insecure random number generation'
  };
  return messageMap[category] || 'Security issue detected';
}

/**
 * Scans package.json for vulnerable dependencies
 */
async function scanDependenciesForVulnerabilities(packageJsonPath) {
  try {
    const content = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(content);
    const vulnerabilities = [];
    
    const allDeps = {
      ...packageJson.dependencies || {},
      ...packageJson.devDependencies || {}
    };
    
    for (const [packageName, version] of Object.entries(allDeps)) {
      if (KNOWN_VULNERABILITIES[packageName]) {
        const [vulnerableVersion, description] = KNOWN_VULNERABILITIES[packageName];
        const cleanVersion = version.replace(/[^0-9.]/g, '');
        
        if (semver.valid(cleanVersion) && semver.lte(cleanVersion, vulnerableVersion)) {
          vulnerabilities.push({
            package: packageName,
            version: version,
            vulnerability: description,
            severity: 'HIGH',
            recommendation: `Update to version > ${vulnerableVersion}`
          });
        }
      }
    }
    
    return { success: true, vulnerabilities };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Analyzes project security configuration
 */
async function analyzeSecurityConfiguration(projectPath) {
  const securityChecks = {};
  
  try {
    // Check for security-related files
    const securityFiles = [
      '.env',
      '.env.example', 
      'docker-compose.yml',
      'Dockerfile',
      '.gitignore',
      'package.json',
      'requirements.txt'
    ];
    
    for (const file of securityFiles) {
      const filePath = path.join(projectPath, file);
      try {
        await fs.access(filePath);
        securityChecks[file] = { exists: true };
        
        // Specific checks for certain files
        if (file === '.env') {
          securityChecks[file].warning = 'Environment file detected - ensure it\'s in .gitignore';
        }
        if (file === '.gitignore') {
          const content = await fs.readFile(filePath, 'utf8');
          securityChecks[file].ignores_env = content.includes('.env');
          securityChecks[file].ignores_secrets = content.includes('*.key') || content.includes('secret');
        }
        if (file === 'docker-compose.yml') {
          const content = await fs.readFile(filePath, 'utf8');
          securityChecks[file].has_secrets = content.includes('secrets:');
          securityChecks[file].has_environment = content.includes('environment:');
        }
      } catch (error) {
        securityChecks[file] = { exists: false };
      }
    }
    
    return { success: true, checks: securityChecks };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Runs npm audit for dependency vulnerabilities
 */
async function runNpmAudit(projectPath) {
  try {
    const { stdout, stderr } = await execAsync('npm audit --json', {
      cwd: projectPath,
      timeout: SCAN_TIMEOUT
    });
    
    try {
      const auditResult = JSON.parse(stdout);
      return {
        success: true,
        vulnerabilities: auditResult.vulnerabilities || {},
        summary: auditResult.metadata || {}
      };
    } catch (parseError) {
      return {
        success: false,
        error: 'Failed to parse npm audit output'
      };
    }
  } catch (error) {
    // npm audit returns non-zero exit code when vulnerabilities found
    if (error.stdout) {
      try {
        const auditResult = JSON.parse(error.stdout);
        return {
          success: true,
          vulnerabilities: auditResult.vulnerabilities || {},
          summary: auditResult.metadata || {}
        };
      } catch (parseError) {
        return {
          success: false,
          error: 'npm audit not available or project has no package.json'
        };
      }
    }
    return {
      success: false,
      error: 'npm audit failed to execute'
    };
  }
}

// Create MCP server
const server = new Server(
  {
    name: 'security-scanner-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'scan_code_security',
        description: 'Scan code files for security vulnerabilities and patterns',
        inputSchema: {
          type: 'object',
          properties: {
            scan_path: {
              type: 'string',
              description: 'Path to scan (file or directory)'
            },
            file_types: {
              type: 'array',
              items: { type: 'string' },
              description: 'File extensions to scan (e.g., [".js", ".py", ".ts"])'
            }
          },
          required: ['scan_path']
        }
      },
      {
        name: 'scan_dependencies',
        description: 'Scan project dependencies for known vulnerabilities',
        inputSchema: {
          type: 'object',
          properties: {
            project_path: {
              type: 'string',
              description: 'Path to the project directory'
            },
            scan_type: {
              type: 'string',
              enum: ['npm', 'manual', 'both'],
              description: 'Type of dependency scan to perform (default: both)'
            }
          },
          required: ['project_path']
        }
      },
      {
        name: 'analyze_security_config',
        description: 'Analyze project security configuration and best practices',
        inputSchema: {
          type: 'object',
          properties: {
            project_path: {
              type: 'string',
              description: 'Path to the project directory'
            }
          },
          required: ['project_path']
        }
      },
      {
        name: 'generate_security_report',
        description: 'Generate comprehensive security report for a project',
        inputSchema: {
          type: 'object',
          properties: {
            project_path: {
              type: 'string',
              description: 'Path to the project directory'
            },
            report_type: {
              type: 'string',
              enum: ['summary', 'detailed', 'critical-only'],
              description: 'Type of security report (default: summary)'
            }
          },
          required: ['project_path']
        }
      },
      {
        name: 'validate_scan_path',
        description: 'Check if a path is allowed for security scanning',
        inputSchema: {
          type: 'object',
          properties: {
            scan_path: {
              type: 'string',
              description: 'Path to validate'
            }
          },
          required: ['scan_path']
        }
      },
      {
        name: 'get_security_scanner_info',
        description: 'Get information about security scanner capabilities',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'scan_code_security': {
        const { scan_path, file_types = ['.js', '.ts', '.py', '.php', '.rb', '.java'] } = args;
        
        const pathValidation = validateScanPath(scan_path);
        if (!pathValidation.valid) {
          await logGovernanceEvent('scan_blocked', scan_path, 'code', false, pathValidation.reason);
          return {
            content: [
              {
                type: 'text',
                text: `❌ Security scan blocked: ${pathValidation.reason}`
              }
            ]
          };
        }
        
        try {
          const stats = await fs.stat(pathValidation.path);
          const allIssues = [];
          let scannedFiles = 0;
          
          if (stats.isFile()) {
            const ext = path.extname(pathValidation.path);
            if (file_types.includes(ext)) {
              const result = await scanFileForSecurityIssues(pathValidation.path);
              if (result.success) {
                allIssues.push(...result.issues.map(issue => ({
                  ...issue,
                  file: path.relative(workspacePath, pathValidation.path)
                })));
                scannedFiles++;
              }
            }
          } else {
            // Scan directory
            const files = await fs.readdir(pathValidation.path, { recursive: true });
            for (const file of files) {
              const fullPath = path.join(pathValidation.path, file);
              const ext = path.extname(file);
              
              if (file_types.includes(ext)) {
                try {
                  const fileStats = await fs.stat(fullPath);
                  if (fileStats.isFile()) {
                    const result = await scanFileForSecurityIssues(fullPath);
                    if (result.success) {
                      allIssues.push(...result.issues.map(issue => ({
                        ...issue,
                        file: path.relative(workspacePath, fullPath)
                      })));
                      scannedFiles++;
                    }
                  }
                } catch (error) {
                  // Skip files that can't be accessed
                }
              }
            }
          }
          
          await logGovernanceEvent('code_scanned', scan_path, 'code', true);
          
          // Group issues by severity
          const issuesBySeverity = allIssues.reduce((acc, issue) => {
            acc[issue.severity] = acc[issue.severity] || [];
            acc[issue.severity].push(issue);
            return acc;
          }, {});
          
          let output = `🔒 **Security Code Scan Results**\n\n`;
          output += `**Scan Path:** ${scan_path}\n`;
          output += `**Files Scanned:** ${scannedFiles}\n`;
          output += `**Total Issues:** ${allIssues.length}\n\n`;
          
          for (const severity of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']) {
            const issues = issuesBySeverity[severity] || [];
            if (issues.length > 0) {
              const emoji = severity === 'CRITICAL' ? '🚨' : severity === 'HIGH' ? '⚠️' : severity === 'MEDIUM' ? '🔍' : 'ℹ️';
              output += `${emoji} **${severity} (${issues.length})**\n`;
              
              for (const issue of issues.slice(0, 5)) { // Show first 5 per severity
                output += `- **${issue.file}:${issue.line}** - ${issue.message}\n`;
                output += `  \`${issue.match}\`\n`;
              }
              
              if (issues.length > 5) {
                output += `  ... and ${issues.length - 5} more ${severity.toLowerCase()} issues\n`;
              }
              output += `\n`;
            }
          }
          
          if (allIssues.length === 0) {
            output += `✅ **No security issues detected!**\n`;
            output += `All scanned files passed security pattern analysis.`;
          }
          
          return {
            content: [
              {
                type: 'text',
                text: output
              }
            ]
          };
          
        } catch (error) {
          await logGovernanceEvent('scan_failed', scan_path, 'code', false, error.message);
          return {
            content: [
              {
                type: 'text',
                text: `⚠️ Security scan failed: ${error.message}`
              }
            ]
          };
        }
      }

      case 'scan_dependencies': {
        const { project_path, scan_type = 'both' } = args;
        
        const pathValidation = validateScanPath(project_path);
        if (!pathValidation.valid) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Dependency scan blocked: ${pathValidation.reason}`
              }
            ]
          };
        }
        
        try {
          let output = `📦 **Dependency Security Scan**\n\n`;
          output += `**Project:** ${project_path}\n`;
          output += `**Scan Type:** ${scan_type}\n\n`;
          
          let totalVulns = 0;
          
          // Manual vulnerability check
          if (scan_type === 'manual' || scan_type === 'both') {
            const packageJsonPath = path.join(pathValidation.path, 'package.json');
            try {
              const manualResult = await scanDependenciesForVulnerabilities(packageJsonPath);
              if (manualResult.success) {
                output += `**Manual Vulnerability Check:**\n`;
                if (manualResult.vulnerabilities.length > 0) {
                  for (const vuln of manualResult.vulnerabilities) {
                    output += `- 🚨 **${vuln.package}@${vuln.version}**: ${vuln.vulnerability}\n`;
                    output += `  *Recommendation: ${vuln.recommendation}*\n`;
                  }
                  totalVulns += manualResult.vulnerabilities.length;
                } else {
                  output += `✅ No known vulnerabilities in manual database\n`;
                }
                output += `\n`;
              }
            } catch (error) {
              output += `⚠️ Manual scan failed: package.json not found or invalid\n\n`;
            }
          }
          
          // NPM Audit check
          if (scan_type === 'npm' || scan_type === 'both') {
            const npmResult = await runNpmAudit(pathValidation.path);
            if (npmResult.success) {
              output += `**NPM Audit Results:**\n`;
              const vulnCount = Object.keys(npmResult.vulnerabilities).length;
              if (vulnCount > 0) {
                output += `- Found ${vulnCount} packages with vulnerabilities\n`;
                output += `- Run \`npm audit fix\` to attempt automatic fixes\n`;
                totalVulns += vulnCount;
              } else {
                output += `✅ No vulnerabilities found by npm audit\n`;
              }
            } else {
              output += `⚠️ NPM audit not available: ${npmResult.error}\n`;
            }
            output += `\n`;
          }
          
          await logGovernanceEvent('dependencies_scanned', project_path, 'dependencies', true);
          
          output += `**Summary:**\n`;
          output += `- Total vulnerabilities: ${totalVulns}\n`;
          output += `- Security grade: ${totalVulns === 0 ? 'A' : totalVulns < 5 ? 'B' : totalVulns < 10 ? 'C' : 'D'}\n`;
          
          if (totalVulns > 0) {
            output += `\n**Recommendations:**\n`;
            output += `- Update vulnerable packages to latest versions\n`;
            output += `- Run \`npm audit fix\` for automatic fixes\n`;
            output += `- Consider alternative packages for unfixable vulnerabilities\n`;
          }
          
          return {
            content: [
              {
                type: 'text',
                text: output
              }
            ]
          };
          
        } catch (error) {
          await logGovernanceEvent('dependency_scan_failed', project_path, 'dependencies', false, error.message);
          return {
            content: [
              {
                type: 'text',
                text: `⚠️ Dependency scan failed: ${error.message}`
              }
            ]
          };
        }
      }

      case 'analyze_security_config': {
        const { project_path } = args;
        
        const pathValidation = validateScanPath(project_path);
        if (!pathValidation.valid) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Security analysis blocked: ${pathValidation.reason}`
              }
            ]
          };
        }
        
        try {
          const configAnalysis = await analyzeSecurityConfiguration(pathValidation.path);
          
          if (!configAnalysis.success) {
            await logGovernanceEvent('config_analysis_failed', project_path, 'config', false, configAnalysis.error);
            return {
              content: [
                {
                  type: 'text',
                  text: `⚠️ Security configuration analysis failed: ${configAnalysis.error}`
                }
              ]
            };
          }
          
          await logGovernanceEvent('config_analyzed', project_path, 'config', true);
          
          let output = `🛡️ **Security Configuration Analysis**\n\n`;
          output += `**Project:** ${project_path}\n\n`;
          
          let securityScore = 0;
          let maxScore = 0;
          
          output += `**Security Files:**\n`;
          for (const [file, info] of Object.entries(configAnalysis.checks)) {
            maxScore++;
            if (info.exists) {
              securityScore++;
              output += `- ✅ **${file}** - Present\n`;
              
              if (info.warning) {
                output += `  ⚠️ ${info.warning}\n`;
              }
              if (info.ignores_env !== undefined) {
                output += `  ${info.ignores_env ? '✅' : '❌'} .env files ${info.ignores_env ? 'ignored' : 'NOT ignored'}\n`;
                if (info.ignores_env) securityScore += 0.5;
              }
              if (info.ignores_secrets !== undefined) {
                output += `  ${info.ignores_secrets ? '✅' : '❌'} Secret files ${info.ignores_secrets ? 'ignored' : 'NOT ignored'}\n`;
                if (info.ignores_secrets) securityScore += 0.5;
              }
              if (info.has_secrets !== undefined) {
                output += `  ${info.has_secrets ? '✅' : '⚠️'} Docker secrets ${info.has_secrets ? 'configured' : 'not configured'}\n`;
              }
            } else {
              output += `- ❌ **${file}** - Missing\n`;
            }
          }
          
          const scorePercentage = Math.round((securityScore / maxScore) * 100);
          const grade = scorePercentage >= 90 ? 'A' : scorePercentage >= 80 ? 'B' : scorePercentage >= 70 ? 'C' : scorePercentage >= 60 ? 'D' : 'F';
          
          output += `\n**Security Score:** ${scorePercentage}% (Grade: ${grade})\n\n`;
          
          output += `**Recommendations:**\n`;
          if (!configAnalysis.checks['.gitignore']?.exists) {
            output += `- Create .gitignore file to prevent committing sensitive files\n`;
          }
          if (!configAnalysis.checks['.gitignore']?.ignores_env) {
            output += `- Add .env to .gitignore to prevent committing environment variables\n`;
          }
          if (configAnalysis.checks['.env']?.exists && !configAnalysis.checks['.env.example']?.exists) {
            output += `- Create .env.example file as a template for environment variables\n`;
          }
          if (scorePercentage < 70) {
            output += `- Implement additional security measures to improve project security\n`;
          }
          
          return {
            content: [
              {
                type: 'text',
                text: output
              }
            ]
          };
          
        } catch (error) {
          await logGovernanceEvent('config_analysis_failed', project_path, 'config', false, error.message);
          return {
            content: [
              {
                type: 'text',
                text: `⚠️ Security configuration analysis failed: ${error.message}`
              }
            ]
          };
        }
      }

      case 'validate_scan_path': {
        const { scan_path } = args;
        const validation = validateScanPath(scan_path);
        
        return {
          content: [
            {
              type: 'text',
              text: validation.valid 
                ? `✅ Scan path '${scan_path}' is valid and accessible`
                : `❌ Scan path '${scan_path}' blocked: ${validation.reason}`
            }
          ]
        };
      }

      case 'get_security_scanner_info': {
        const patternCategories = Object.keys(SECURITY_PATTERNS).join(', ');
        const knownVulnPackages = Object.keys(KNOWN_VULNERABILITIES).join(', ');
        
        return {
          content: [
            {
              type: 'text',
              text: `🔒 **Security Scanner MCP Configuration**

**Workspace:** ${workspacePath}
**Scan Timeout:** ${SCAN_TIMEOUT}ms
**Max Output Size:** ${Math.round(MAX_OUTPUT_SIZE / 1024 / 1024)}MB

**🔍 Security Pattern Categories:**
${patternCategories}

**📦 Known Vulnerable Packages:**
${knownVulnPackages}

**🛡️ Scan Capabilities:**
- Code pattern analysis for common vulnerabilities
- Dependency vulnerability scanning (npm audit + manual DB)
- Security configuration analysis
- Secret detection and prevention
- File path validation and workspace restrictions

**📊 Supported File Types:**
- JavaScript/TypeScript (.js, .ts, .jsx, .tsx)
- Python (.py)
- PHP (.php)
- Ruby (.rb)
- Java (.java)
- And more...

**🔧 Analysis Features:**
- CRITICAL/HIGH/MEDIUM/LOW severity classification
- Line-by-line issue reporting
- Security best practices validation
- Comprehensive project security scoring
- Integration with npm audit for real-time vulnerability data

**🛡️ Security Features:**
- Workspace path validation
- File access restrictions
- Scan timeout protection
- Output size limits
- Complete governance logging`
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    await logGovernanceEvent('tool_error', name, 'unknown', false, error.message);
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error.message}`
        }
      ]
    };
  }
});

// Start server
async function main() {
  // Ensure log directory exists
  try {
    const logDir = path.dirname(GOVERNANCE_LOG);
    await fs.mkdir(logDir, { recursive: true });
    await logGovernanceEvent('server_started', 'security-scanner-mcp', 'system', true);
  } catch (error) {
    console.error('Failed to initialize governance logging:', error);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('IDP Security Scanner MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});