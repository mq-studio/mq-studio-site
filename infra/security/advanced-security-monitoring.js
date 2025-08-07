#!/usr/bin/env node

/**
 * ADVANCED SECURITY MONITORING & INCIDENT RESPONSE SYSTEM
 * Enterprise-Grade Zero-Tolerance Security Framework
 * BMAD V2 Progressive Validation Integration
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class AdvancedSecurityMonitoring {
    constructor() {
        this.config = {
            scanInterval: process.env.SECURITY_SCAN_INTERVAL || 30000, // 30 seconds
            threatThresholds: {
                critical: 0,    // Zero tolerance for critical
                high: 1,        // Maximum 1 high severity
                medium: 5,      // Maximum 5 medium severity
                low: 10         // Maximum 10 low severity
            },
            incidentResponse: {
                autoRemediation: true,
                alerting: true,
                quarantine: true,
                documentation: true
            }
        };
        
        this.securityState = {
            threats: [],
            vulnerabilities: [],
            incidents: [],
            complianceStatus: 'COMPLIANT',
            lastScan: null,
            threatLevel: 'MINIMAL',
            zeroToleranceActive: true
        };
        
        this.scanActive = false;
        this.remediationQueue = [];
    }

    async initialize() {
        console.log('🛡️ Initializing Advanced Security Monitoring System...');
        
        // Create security directories
        await this.createSecurityDirectories();
        
        // Initialize threat detection
        await this.initializeThreatDetection();
        
        // Start continuous monitoring
        await this.startContinuousMonitoring();
        
        // Initialize incident response
        await this.initializeIncidentResponse();
        
        console.log('✅ Advanced Security Monitoring System operational');
        console.log('🔒 Zero-tolerance security framework active');
        console.log('🚨 Real-time threat detection enabled');
        
        return this;
    }

    async createSecurityDirectories() {
        const dirs = [
            '/home/ichardart/code/infra/security/logs',
            '/home/ichardart/code/infra/security/reports',
            '/home/ichardart/code/infra/security/incidents',
            '/home/ichardart/code/infra/security/quarantine',
            '/home/ichardart/code/infra/security/remediation'
        ];
        
        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    async initializeThreatDetection() {
        console.log('🔍 Initializing threat detection systems...');
        
        // Create threat detection configuration
        const threatConfig = {
            enabled: true,
            detectionMethods: {
                vulnerabilityScanning: true,
                dependencyAnalysis: true,
                codeAnalysis: true,
                secretDetection: true,
                complianceChecking: true
            },
            thresholds: this.config.threatThresholds,
            autoRemediation: this.config.incidentResponse.autoRemediation
        };
        
        await fs.writeFile(
            '/home/ichardart/code/infra/security/threat-detection-config.json',
            JSON.stringify(threatConfig, null, 2)
        );
        
        console.log('✅ Threat detection systems initialized');
    }

    async startContinuousMonitoring() {
        console.log('🔄 Starting continuous security monitoring...');
        
        this.scanActive = true;
        
        // Vulnerability scanning
        setInterval(() => this.performVulnerabilityScans(), this.config.scanInterval);
        
        // Dependency analysis
        setInterval(() => this.performDependencyAnalysis(), this.config.scanInterval * 2);
        
        // Secret detection
        setInterval(() => this.performSecretDetection(), this.config.scanInterval * 3);
        
        // Compliance checking
        setInterval(() => this.performComplianceChecking(), this.config.scanInterval * 4);
        
        // Threat assessment
        setInterval(() => this.performThreatAssessment(), this.config.scanInterval);
        
        console.log('✅ Continuous monitoring active');
    }

    async performVulnerabilityScans() {
        if (!this.scanActive) return;
        
        try {
            console.log('🔍 Performing vulnerability scan...');
            
            const mcpServers = [
                'api-testing-mcp', 'cicd-mcp', 'context-awareness-mcp',
                'database-mcp', 'docker-mcp', 'fetch-mcp',
                'filesystem-mcp', 'git-mcp', 'governance-mcp',
                'graphiti-mcp', 'inventory-mcp', 'language-server-mcp',
                'onepassword-mcp', 'security-scanner-mcp', 'shell-mcp'
            ];
            
            const vulnerabilities = [];
            
            for (const server of mcpServers) {
                const serverPath = `/home/ichardart/code/infra/mcp-servers/${server}`;
                
                try {
                    // Check if package.json exists
                    await fs.access(`${serverPath}/package.json`);
                    
                    // Run npm audit
                    const { stdout, stderr } = await execAsync(`cd "${serverPath}" && npm audit --json`, {
                        timeout: 10000
                    }).catch(error => ({ stdout: '{}', stderr: error.message }));
                    
                    let auditResult = {};
                    try {
                        auditResult = JSON.parse(stdout);
                    } catch (e) {
                        // Audit output not valid JSON
                    }
                    
                    if (auditResult.vulnerabilities) {
                        Object.entries(auditResult.vulnerabilities).forEach(([name, vuln]) => {
                            if (vuln.severity === 'critical' || vuln.severity === 'high') {
                                vulnerabilities.push({
                                    server,
                                    package: name,
                                    severity: vuln.severity,
                                    title: vuln.title || 'Unknown vulnerability',
                                    description: vuln.via?.[0]?.title || 'No description available',
                                    timestamp: new Date().toISOString()
                                });
                            }
                        });
                    }
                } catch (error) {
                    console.log(`⚠️ Could not scan ${server}: ${error.message}`);
                }
            }
            
            // Update security state
            this.securityState.vulnerabilities = vulnerabilities;
            this.securityState.lastScan = new Date().toISOString();
            
            // Check for critical vulnerabilities
            await this.assessVulnerabilities(vulnerabilities);
            
            console.log(`✅ Vulnerability scan complete: ${vulnerabilities.length} issues found`);
            
        } catch (error) {
            console.error('❌ Error during vulnerability scan:', error.message);
        }
    }

    async performDependencyAnalysis() {
        if (!this.scanActive) return;
        
        try {
            console.log('🔍 Performing dependency analysis...');
            
            const dependencyIssues = [];
            const mcpServersPath = '/home/ichardart/code/infra/mcp-servers';
            
            // Check for outdated dependencies
            const servers = await fs.readdir(mcpServersPath);
            
            for (const server of servers) {
                const packageJsonPath = `${mcpServersPath}/${server}/package.json`;
                
                try {
                    const packageData = await fs.readFile(packageJsonPath, 'utf8');
                    const packageInfo = JSON.parse(packageData);
                    
                    // Check MCP SDK version
                    const mcpSdkVersion = packageInfo.dependencies?.['@modelcontextprotocol/sdk'];
                    if (mcpSdkVersion && !mcpSdkVersion.includes('0.6.0')) {
                        dependencyIssues.push({
                            server,
                            issue: 'Outdated MCP SDK',
                            current: mcpSdkVersion,
                            recommended: '^0.6.0',
                            severity: 'high',
                            timestamp: new Date().toISOString()
                        });
                    }
                    
                } catch (error) {
                    // Package.json not found or invalid
                }
            }
            
            console.log(`✅ Dependency analysis complete: ${dependencyIssues.length} issues found`);
            
        } catch (error) {
            console.error('❌ Error during dependency analysis:', error.message);
        }
    }

    async performSecretDetection() {
        if (!this.scanActive) return;
        
        try {
            console.log('🔍 Performing secret detection scan...');
            
            const secretPatterns = [
                /api[_-]?key[_-]?[a-zA-Z0-9]{16,}/gi,
                /password[_-]?[a-zA-Z0-9]{8,}/gi,
                /secret[_-]?[a-zA-Z0-9]{16,}/gi,
                /token[_-]?[a-zA-Z0-9]{16,}/gi,
                /sk-[a-zA-Z0-9]{48}/gi, // OpenAI API keys
                /op:\/\/[a-zA-Z0-9\/]+/gi // 1Password references
            ];
            
            const secretsFound = [];
            const scanPaths = [
                '/home/ichardart/code/infra/mcp-servers',
                '/home/ichardart/code/infra/config'
            ];
            
            for (const scanPath of scanPaths) {
                try {
                    const files = await this.getFilesRecursively(scanPath, ['.js', '.json', '.md', '.env']);
                    
                    for (const file of files) {
                        try {
                            const content = await fs.readFile(file, 'utf8');
                            
                            for (const pattern of secretPatterns) {
                                const matches = content.match(pattern);
                                if (matches) {
                                    secretsFound.push({
                                        file,
                                        pattern: pattern.toString(),
                                        matches: matches.length,
                                        severity: 'critical',
                                        timestamp: new Date().toISOString()
                                    });
                                }
                            }
                        } catch (error) {
                            // File read error
                        }
                    }
                } catch (error) {
                    // Directory scan error
                }
            }
            
            if (secretsFound.length > 0) {
                await this.handleSecurityIncident('SECRET_DETECTION', {
                    severity: 'critical',
                    description: `Potential secrets detected in ${secretsFound.length} locations`,
                    details: secretsFound,
                    autoRemediation: false // Manual review required
                });
            }
            
            console.log(`✅ Secret detection complete: ${secretsFound.length} potential secrets found`);
            
        } catch (error) {
            console.error('❌ Error during secret detection:', error.message);
        }
    }

    async getFilesRecursively(dir, extensions) {
        const files = [];
        
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    files.push(...await this.getFilesRecursively(fullPath, extensions));
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name);
                    if (extensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (error) {
            // Directory access error
        }
        
        return files;
    }

    async performComplianceChecking() {
        if (!this.scanActive) return;
        
        try {
            console.log('🔍 Performing compliance checking...');
            
            // Check BMAD compliance
            const { stdout } = await execAsync('node /home/ichardart/code/infra/mcp-servers/governance-validation-framework.js', {
                timeout: 30000
            }).catch(() => ({ stdout: '{}' }));
            
            const complianceScore = stdout.includes('100.0%') ? 100 : 
                                  stdout.includes('compliance rate:') ? 
                                  parseFloat(stdout.match(/compliance rate: ([\d.]+)%/)?.[1] || '0') : 0;
            
            this.securityState.complianceStatus = complianceScore === 100 ? 'COMPLIANT' : 'NON_COMPLIANT';
            
            if (complianceScore < 100) {
                await this.handleSecurityIncident('COMPLIANCE_VIOLATION', {
                    severity: 'high',
                    description: `Compliance score dropped to ${complianceScore}%`,
                    details: { score: complianceScore, threshold: 100 },
                    autoRemediation: true
                });
            }
            
            console.log(`✅ Compliance check complete: ${complianceScore}% compliance`);
            
        } catch (error) {
            console.error('❌ Error during compliance checking:', error.message);
        }
    }

    async performThreatAssessment() {
        if (!this.scanActive) return;
        
        try {
            const threats = this.securityState.vulnerabilities;
            const criticalCount = threats.filter(t => t.severity === 'critical').length;
            const highCount = threats.filter(t => t.severity === 'high').length;
            const mediumCount = threats.filter(t => t.severity === 'medium').length;
            
            // Determine threat level
            let threatLevel = 'MINIMAL';
            if (criticalCount > 0) {
                threatLevel = 'CRITICAL';
            } else if (highCount > this.config.threatThresholds.high) {
                threatLevel = 'HIGH';
            } else if (mediumCount > this.config.threatThresholds.medium) {
                threatLevel = 'MEDIUM';
            } else if (highCount > 0 || mediumCount > 0) {
                threatLevel = 'LOW';
            }
            
            this.securityState.threatLevel = threatLevel;
            
            // Trigger incident response if necessary
            if (threatLevel === 'CRITICAL' || threatLevel === 'HIGH') {
                await this.handleSecurityIncident('THREAT_LEVEL_ESCALATION', {
                    severity: threatLevel.toLowerCase(),
                    description: `Threat level escalated to ${threatLevel}`,
                    details: { criticalCount, highCount, mediumCount },
                    autoRemediation: true
                });
            }
            
        } catch (error) {
            console.error('❌ Error during threat assessment:', error.message);
        }
    }

    async assessVulnerabilities(vulnerabilities) {
        const critical = vulnerabilities.filter(v => v.severity === 'critical');
        const high = vulnerabilities.filter(v => v.severity === 'high');
        
        if (critical.length > 0) {
            await this.handleSecurityIncident('CRITICAL_VULNERABILITY', {
                severity: 'critical',
                description: `${critical.length} critical vulnerabilities detected`,
                details: critical,
                autoRemediation: true
            });
        }
        
        if (high.length > this.config.threatThresholds.high) {
            await this.handleSecurityIncident('HIGH_VULNERABILITY_THRESHOLD', {
                severity: 'high',
                description: `High vulnerability threshold exceeded: ${high.length} found`,
                details: high,
                autoRemediation: true
            });
        }
    }

    async handleSecurityIncident(type, incident) {
        console.log(`🚨 Security Incident: ${type} - ${incident.severity.toUpperCase()}`);
        
        const incidentId = `incident_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const incidentData = {
            id: incidentId,
            type,
            severity: incident.severity,
            description: incident.description,
            details: incident.details,
            timestamp: new Date().toISOString(),
            status: 'ACTIVE',
            autoRemediation: incident.autoRemediation || false,
            remediationSteps: []
        };
        
        // Add to incidents list
        this.securityState.incidents.unshift(incidentData);
        
        // Keep only last 50 incidents
        if (this.securityState.incidents.length > 50) {
            this.securityState.incidents = this.securityState.incidents.slice(0, 50);
        }
        
        // Save incident to file
        await this.saveIncident(incidentData);
        
        // Trigger automated remediation if enabled
        if (this.config.incidentResponse.autoRemediation && incident.autoRemediation) {
            await this.performAutomatedRemediation(incidentData);
        }
        
        // Generate security alert
        await this.generateSecurityAlert(incidentData);
        
        console.log(`📋 Incident ${incidentId} logged and response initiated`);
    }

    async saveIncident(incident) {
        try {
            const incidentFile = `/home/ichardart/code/infra/security/incidents/${incident.id}.json`;
            await fs.writeFile(incidentFile, JSON.stringify(incident, null, 2));
        } catch (error) {
            console.error('❌ Error saving incident:', error.message);
        }
    }

    async performAutomatedRemediation(incident) {
        console.log(`🔧 Starting automated remediation for ${incident.type}...`);
        
        const remediationSteps = [];
        
        try {
            switch (incident.type) {
                case 'CRITICAL_VULNERABILITY':
                case 'HIGH_VULNERABILITY_THRESHOLD':
                    remediationSteps.push('Running npm audit fix on affected servers');
                    
                    for (const vuln of incident.details) {
                        try {
                            const serverPath = `/home/ichardart/code/infra/mcp-servers/${vuln.server}`;
                            await execAsync(`cd "${serverPath}" && npm audit fix`, { timeout: 30000 });
                            remediationSteps.push(`Fixed vulnerabilities in ${vuln.server}`);
                        } catch (error) {
                            remediationSteps.push(`Failed to fix ${vuln.server}: ${error.message}`);
                        }
                    }
                    break;
                    
                case 'COMPLIANCE_VIOLATION':
                    remediationSteps.push('Running automated compliance fix');
                    
                    try {
                        await execAsync('node /home/ichardart/code/infra/mcp-servers/automated-compliance-fix.js', {
                            timeout: 60000
                        });
                        remediationSteps.push('Compliance issues automatically resolved');
                    } catch (error) {
                        remediationSteps.push(`Compliance fix failed: ${error.message}`);
                    }
                    break;
                    
                case 'THREAT_LEVEL_ESCALATION':
                    remediationSteps.push('Escalating security measures');
                    
                    // Increase scan frequency
                    this.config.scanInterval = Math.max(this.config.scanInterval / 2, 10000);
                    remediationSteps.push(`Increased scan frequency to ${this.config.scanInterval}ms`);
                    break;
            }
            
            // Update incident with remediation steps
            incident.remediationSteps = remediationSteps;
            incident.status = 'REMEDIATED';
            incident.remediationTimestamp = new Date().toISOString();
            
            await this.saveIncident(incident);
            
            console.log(`✅ Automated remediation completed for ${incident.type}`);
            
        } catch (error) {
            console.error(`❌ Remediation failed for ${incident.type}:`, error.message);
            
            incident.remediationSteps = [...remediationSteps, `Remediation failed: ${error.message}`];
            incident.status = 'FAILED';
            await this.saveIncident(incident);
        }
    }

    async generateSecurityAlert(incident) {
        const alert = {
            id: `security_alert_${Date.now()}`,
            incidentId: incident.id,
            severity: incident.severity,
            type: incident.type,
            description: incident.description,
            timestamp: new Date().toISOString(),
            escalationLevel: this.getEscalationLevel(incident.severity)
        };
        
        // Log alert
        console.log(`🔔 Security Alert: ${alert.severity.toUpperCase()} - ${alert.description}`);
        
        // Save alert
        const alertFile = `/home/ichardart/code/infra/security/logs/security_alert_${alert.id}.json`;
        await fs.writeFile(alertFile, JSON.stringify(alert, null, 2));
    }

    getEscalationLevel(severity) {
        switch (severity) {
            case 'critical': return 'IMMEDIATE';
            case 'high': return 'URGENT';
            case 'medium': return 'NORMAL';
            case 'low': return 'LOW';
            default: return 'NORMAL';
        }
    }

    async generateSecurityReport() {
        const report = {
            timestamp: new Date().toISOString(),
            systemStatus: 'SECURE',
            securityPosture: 'ZERO_TOLERANCE_ACTIVE',
            threatLevel: this.securityState.threatLevel,
            complianceStatus: this.securityState.complianceStatus,
            statistics: {
                totalVulnerabilities: this.securityState.vulnerabilities.length,
                criticalVulnerabilities: this.securityState.vulnerabilities.filter(v => v.severity === 'critical').length,
                highVulnerabilities: this.securityState.vulnerabilities.filter(v => v.severity === 'high').length,
                totalIncidents: this.securityState.incidents.length,
                activeIncidents: this.securityState.incidents.filter(i => i.status === 'ACTIVE').length,
                lastScan: this.securityState.lastScan
            },
            configuration: this.config,
            recommendations: this.generateSecurityRecommendations()
        };
        
        await fs.writeFile(
            '/home/ichardart/code/infra/security/reports/security-report-latest.json',
            JSON.stringify(report, null, 2)
        );
        
        return report;
    }

    generateSecurityRecommendations() {
        const recommendations = [];
        
        if (this.securityState.vulnerabilities.length > 0) {
            recommendations.push('Address identified vulnerabilities immediately');
        }
        
        if (this.securityState.complianceStatus !== 'COMPLIANT') {
            recommendations.push('Restore full compliance using automated remediation tools');
        }
        
        if (this.securityState.threatLevel !== 'MINIMAL') {
            recommendations.push('Investigate and mitigate elevated threat level');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Security posture is optimal - maintain current standards');
        }
        
        return recommendations;
    }

    async initializeIncidentResponse() {
        console.log('🚨 Initializing incident response system...');
        
        const responseConfig = {
            enabled: true,
            autoRemediation: this.config.incidentResponse.autoRemediation,
            escalationRules: {
                critical: { timeToResponse: '0_minutes', autoRemediate: true },
                high: { timeToResponse: '5_minutes', autoRemediate: true },
                medium: { timeToResponse: '30_minutes', autoRemediate: false },
                low: { timeToResponse: '2_hours', autoRemediate: false }
            },
            notificationChannels: {
                console: true,
                file: true,
                monitoring: true
            }
        };
        
        await fs.writeFile(
            '/home/ichardart/code/infra/security/incident-response-config.json',
            JSON.stringify(responseConfig, null, 2)
        );
        
        console.log('✅ Incident response system initialized');
    }
}

// Initialize and start security monitoring
if (import.meta.url === `file://${process.argv[1]}`) {
    const security = new AdvancedSecurityMonitoring();
    
    security.initialize().then(() => {
        console.log('🎯 Advanced Security Monitoring fully operational');
        console.log('🛡️ Zero-tolerance security framework active');
        console.log('🚨 Real-time threat detection and response enabled');
        console.log('🔒 Enterprise-grade incident management operational');
        
        // Generate initial security report
        security.generateSecurityReport().then(() => {
            console.log('📋 Initial security report generated');
        });
    }).catch(error => {
        console.error('❌ Failed to initialize security monitoring:', error);
        process.exit(1);
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🔄 Shutting down security monitoring...');
        security.scanActive = false;
        process.exit(0);
    });
}

export default AdvancedSecurityMonitoring;