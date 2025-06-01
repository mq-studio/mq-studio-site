/**
 * Lifecycle Management Tools Extension for MCP Server
 * Provides agent-accessible governance lifecycle and maintenance capabilities
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export class LifecycleTools {
  constructor() {
    this.lifecycleScript = '/home/ichardart/code/infra/tools/governance-lifecycle-manager.py';
  }

  async executeLifecycleCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const process = spawn('python3', [this.lifecycleScript, ...args], {
        cwd: '/home/ichardart/code/infra/tools',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            output: stdout,
            error: stderr
          });
        } else {
          reject({
            success: false,
            output: stdout,
            error: stderr,
            exit_code: code
          });
        }
      });

      process.on('error', (error) => {
        reject({
          success: false,
          error: error.message
        });
      });
    });
  }

  /**
   * Detect deprecated governance components
   */
  async detectDeprecatedComponents(args) {
    try {
      const result = await this.executeLifecycleCommand('detect', ['--detect-only']);
      
      // Parse the output to extract structured data
      const output = result.output;
      const lines = output.split('\n');
      
      const deprecated = {
        scripts: [],
        data_files: [],
        total_count: 0
      };

      let currentSection = null;
      for (const line of lines) {
        if (line.includes('Found') && line.includes('deprecated components')) {
          const match = line.match(/Found (\d+) deprecated components/);
          if (match) {
            deprecated.total_count = parseInt(match[1]);
          }
        } else if (line.startsWith('📜 Script:')) {
          const scriptMatch = line.match(/📜 Script: (.+?) - (.+)/);
          if (scriptMatch) {
            deprecated.scripts.push({
              path: scriptMatch[1],
              reason: scriptMatch[2]
            });
          }
        } else if (line.startsWith('📁 Data:')) {
          const dataMatch = line.match(/📁 Data: (.+?) - (.+)/);
          if (dataMatch) {
            deprecated.data_files.push({
              path: dataMatch[1],
              reason: dataMatch[2]
            });
          }
        }
      }

      return {
        success: true,
        deprecated_components: deprecated,
        raw_output: output
      };

    } catch (error) {
      return {
        success: false,
        error: error.error || error.message,
        deprecated_components: { scripts: [], data_files: [], total_count: 0 }
      };
    }
  }

  /**
   * Analyze governance framework health
   */
  async analyzeGovernanceHealth(args) {
    try {
      const result = await this.executeLifecycleCommand('health', ['--health-only']);
      
      const output = result.output;
      const lines = output.split('\n');
      
      const health = {
        database_status: {},
        recommendations: [],
        overall_status: 'unknown'
      };

      for (const line of lines) {
        if (line.includes('Database:')) {
          const dbMatch = line.match(/Database: (\d+) artifacts, (\d+) stale/);
          if (dbMatch) {
            health.database_status = {
              total_artifacts: parseInt(dbMatch[1]),
              stale_artifacts: parseInt(dbMatch[2])
            };
          }
        } else if (line.includes('Recommendations:')) {
          const recMatch = line.match(/Recommendations: (\d+)/);
          if (recMatch) {
            health.recommendations_count = parseInt(recMatch[1]);
          }
        } else if (line.startsWith('🎯')) {
          const priorityMatch = line.match(/🎯 (.+?): (.+)/);
          if (priorityMatch) {
            health.recommendations.push({
              priority: priorityMatch[1],
              action: priorityMatch[2]
            });
          }
        }
      }

      // Determine overall status
      if (health.database_status.stale_artifacts === 0 && health.recommendations.length === 0) {
        health.overall_status = 'excellent';
      } else if (health.recommendations.length <= 2) {
        health.overall_status = 'good';
      } else if (health.recommendations.length <= 5) {
        health.overall_status = 'needs_attention';
      } else {
        health.overall_status = 'poor';
      }

      return {
        success: true,
        health_analysis: health,
        raw_output: output
      };

    } catch (error) {
      return {
        success: false,
        error: error.error || error.message,
        health_analysis: { overall_status: 'error', recommendations: [] }
      };
    }
  }

  /**
   * Run automated governance maintenance
   */
  async runAutomatedMaintenance(args) {
    const { dry_run = true } = args; // Default to dry run for safety
    
    try {
      const commandArgs = ['--full-maintenance'];
      if (dry_run) {
        commandArgs.push('--dry-run');
      }

      const result = await this.executeLifecycleCommand('maintenance', commandArgs);
      
      const output = result.output;
      const maintenance_results = {
        dry_run: dry_run,
        completed_successfully: output.includes('✅ Maintenance completed successfully'),
        report_generated: false,
        components_archived: 0,
        errors: []
      };

      // Parse results from output
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes('Archived') && line.includes('scripts')) {
          const match = line.match(/Archived (\d+) scripts/);
          if (match) {
            maintenance_results.components_archived += parseInt(match[1]);
          }
        } else if (line.includes('Report saved:') || line.includes('📊 Report:')) {
          maintenance_results.report_generated = true;
        } else if (line.includes('❌') || line.includes('ERROR')) {
          maintenance_results.errors.push(line);
        }
      }

      return {
        success: true,
        maintenance_results,
        raw_output: output
      };

    } catch (error) {
      return {
        success: false,
        error: error.error || error.message,
        maintenance_results: { 
          dry_run: dry_run, 
          completed_successfully: false, 
          errors: [error.error || error.message] 
        }
      };
    }
  }

  /**
   * Generate governance maintenance report
   */
  async generateMaintenanceReport(args) {
    try {
      const result = await this.executeLifecycleCommand('report', ['--report-only']);
      
      const output = result.output;
      let reportPath = null;
      
      // Extract report path from output
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.includes('Report saved:')) {
          reportPath = line.split('Report saved:')[1].trim();
          break;
        }
      }

      if (reportPath && await this.fileExists(reportPath)) {
        // Read the report content
        const reportContent = await fs.readFile(reportPath, 'utf8');
        
        return {
          success: true,
          report: {
            path: reportPath,
            content: reportContent,
            generated_at: new Date().toISOString(),
            size_kb: Math.round(reportContent.length / 1024)
          },
          raw_output: output
        };
      } else {
        return {
          success: false,
          error: 'Report generation failed or file not found',
          report: null,
          raw_output: output
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error.error || error.message,
        report: null
      };
    }
  }

  /**
   * Clean up governance artifacts
   */
  async cleanupGovernanceArtifacts(args) {
    const { 
      max_age_days = 30, 
      dry_run = true,
      cleanup_type = 'stale_data' // 'stale_data', 'deprecated_components', 'all'
    } = args;

    try {
      let commandArgs = [];
      
      if (cleanup_type === 'deprecated_components' || cleanup_type === 'all') {
        commandArgs.push('--full-maintenance');
      } else {
        // For stale data cleanup, we'll use the full maintenance but focus on data
        commandArgs.push('--full-maintenance');
      }

      if (dry_run) {
        commandArgs.push('--dry-run');
      }

      const result = await this.executeLifecycleCommand('cleanup', commandArgs);
      
      const cleanup_results = {
        dry_run: dry_run,
        cleanup_type: cleanup_type,
        max_age_days: max_age_days,
        items_processed: 0,
        space_saved_mb: 0,
        errors: []
      };

      // Parse cleanup results from output
      const output = result.output;
      const lines = output.split('\n');
      
      for (const line of lines) {
        if (line.includes('archived') || line.includes('cleaned')) {
          // Extract numbers from cleanup messages
          const numberMatch = line.match(/(\d+)/);
          if (numberMatch) {
            cleanup_results.items_processed += parseInt(numberMatch[1]);
          }
        } else if (line.includes('MB')) {
          const mbMatch = line.match(/([\d.]+)\s*MB/);
          if (mbMatch) {
            cleanup_results.space_saved_mb += parseFloat(mbMatch[1]);
          }
        } else if (line.includes('❌') || line.includes('ERROR')) {
          cleanup_results.errors.push(line);
        }
      }

      return {
        success: true,
        cleanup_results,
        raw_output: output
      };

    } catch (error) {
      return {
        success: false,
        error: error.error || error.message,
        cleanup_results: {
          dry_run: dry_run,
          cleanup_type: cleanup_type,
          items_processed: 0,
          errors: [error.error || error.message]
        }
      };
    }
  }

  /**
   * Get governance lifecycle status
   */
  async getLifecycleStatus(args) {
    try {
      // Run a quick status check
      const healthResult = await this.analyzeGovernanceHealth({});
      const deprecatedResult = await this.detectDeprecatedComponents({});

      const status = {
        last_check: new Date().toISOString(),
        governance_health: healthResult.health_analysis,
        deprecated_components: deprecatedResult.deprecated_components,
        maintenance_needed: false,
        recommendations: []
      };

      // Determine if maintenance is needed
      const totalDeprecated = deprecatedResult.deprecated_components.total_count;
      const healthRecommendations = healthResult.health_analysis.recommendations?.length || 0;

      if (totalDeprecated > 0) {
        status.maintenance_needed = true;
        status.recommendations.push({
          type: 'cleanup',
          priority: 'medium',
          action: `Archive ${totalDeprecated} deprecated components`,
          command: 'run_automated_maintenance'
        });
      }

      if (healthRecommendations > 0) {
        status.maintenance_needed = true;
        status.recommendations.push({
          type: 'health',
          priority: 'high',
          action: `Address ${healthRecommendations} governance health issues`,
          command: 'analyze_governance_health'
        });
      }

      return {
        success: true,
        lifecycle_status: status
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        lifecycle_status: {
          last_check: new Date().toISOString(),
          maintenance_needed: true,
          error: error.message
        }
      };
    }
  }

  // Helper method
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Tool definitions for MCP server
export const lifecycleToolDefinitions = [
  {
    name: 'detect_deprecated_components',
    description: 'Detect governance components that should be deprecated or archived',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'analyze_governance_health', 
    description: 'Analyze the overall health of the governance framework',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'run_automated_maintenance',
    description: 'Run automated governance maintenance and cleanup',
    inputSchema: {
      type: 'object',
      properties: {
        dry_run: { 
          type: 'boolean', 
          description: 'Preview changes without executing (default: true)',
          default: true
        }
      }
    }
  },
  {
    name: 'generate_maintenance_report',
    description: 'Generate comprehensive governance maintenance report',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'cleanup_governance_artifacts',
    description: 'Clean up stale or deprecated governance artifacts',
    inputSchema: {
      type: 'object',
      properties: {
        max_age_days: { 
          type: 'number', 
          description: 'Maximum age in days for artifacts to keep (default: 30)',
          default: 30
        },
        dry_run: { 
          type: 'boolean', 
          description: 'Preview changes without executing (default: true)',
          default: true
        },
        cleanup_type: {
          type: 'string',
          enum: ['stale_data', 'deprecated_components', 'all'],
          description: 'Type of cleanup to perform (default: stale_data)',
          default: 'stale_data'
        }
      }
    }
  },
  {
    name: 'get_lifecycle_status',
    description: 'Get current governance lifecycle status and maintenance recommendations',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];