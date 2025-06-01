/**
 * Governance Tools Extension for Dynamic IDP Inventory MCP Server
 * Adds governance artifact classification and analysis capabilities
 */

import sqlite3 from 'sqlite3';
import { promises as fs } from 'fs';

const DB_PATH = '/home/ichardart/code/infra/data/idp-inventory.db';

export class GovernanceTools {
  constructor() {
    this.db = null;
  }

  async initDatabase() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async closeDatabase() {
    if (this.db) {
      return new Promise((resolve) => {
        this.db.close(() => resolve());
      });
    }
  }

  async queryDatabase(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Get governance artifacts for a specific path
   */
  async getGovernanceArtifacts(args) {
    const { path: targetPath, classification_filter, confidence_min } = args;
    
    try {
      await this.initDatabase();
      
      let sql = `
        SELECT path, filename, primary_classification, all_classifications, 
               confidence_level, confidence_scores, special_handling, content_summary,
               last_modified, file_size
        FROM governance_artifacts 
        WHERE 1=1
      `;
      const params = [];
      
      if (targetPath) {
        sql += ` AND (path LIKE ? OR directory_path LIKE ?)`;
        params.push(`%${targetPath}%`, `%${targetPath}%`);
      }
      
      if (classification_filter) {
        sql += ` AND primary_classification = ?`;
        params.push(classification_filter);
      }
      
      if (confidence_min) {
        const confidenceOrder = { 'high': 3, 'medium': 2, 'low': 1, 'none': 0 };
        const minLevel = confidenceOrder[confidence_min] || 0;
        sql += ` AND 
          CASE confidence_level 
            WHEN 'high' THEN 3 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 1 
            ELSE 0 
          END >= ?`;
        params.push(minLevel);
      }
      
      sql += ` ORDER BY confidence_level DESC, last_modified DESC`;
      
      const results = await this.queryDatabase(sql, params);
      
      // Parse JSON fields
      const artifacts = results.map(row => ({
        ...row,
        all_classifications: JSON.parse(row.all_classifications || '[]'),
        confidence_scores: JSON.parse(row.confidence_scores || '{}'),
        special_handling: JSON.parse(row.special_handling || '{}')
      }));
      
      return {
        success: true,
        artifacts,
        count: artifacts.length,
        query_params: { targetPath, classification_filter, confidence_min }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        artifacts: []
      };
    } finally {
      await this.closeDatabase();
    }
  }

  /**
   * Analyze governance impact of proposed changes
   */
  async analyzeGovernanceImpact(args) {
    const { paths, change_type } = args;
    
    try {
      await this.initDatabase();
      
      const impacts = [];
      
      for (const targetPath of paths) {
        // Get artifacts that would be affected
        const artifactSql = `
          SELECT path, primary_classification, confidence_level, special_handling
          FROM governance_artifacts 
          WHERE path LIKE ? OR directory_path LIKE ?
        `;
        const artifacts = await this.queryDatabase(artifactSql, [`%${targetPath}%`, `%${targetPath}%`]);
        
        // Get related directories
        const directorySql = `
          SELECT path, governance_artifacts_count, primary_governance_type, governance_confidence_avg
          FROM directories 
          WHERE path LIKE ? AND governance_artifacts_count > 0
        `;
        const directories = await this.queryDatabase(directorySql, [`%${targetPath}%`]);
        
        // Analyze impact
        let riskLevel = 'low';
        const riskFactors = [];
        
        // Check for high-importance artifacts
        const highImportanceArtifacts = artifacts.filter(a => {
          const special = JSON.parse(a.special_handling || '{}');
          return special.git_hook || special.project_manifest || special.high_importance;
        });
        
        if (highImportanceArtifacts.length > 0) {
          riskLevel = 'high';
          riskFactors.push(`${highImportanceArtifacts.length} high-importance governance artifacts affected`);
        }
        
        // Check for high-confidence governance artifacts
        const highConfidenceArtifacts = artifacts.filter(a => a.confidence_level === 'high');
        if (highConfidenceArtifacts.length > 5) {
          riskLevel = riskLevel === 'low' ? 'medium' : 'high';
          riskFactors.push(`${highConfidenceArtifacts.length} high-confidence governance artifacts affected`);
        }
        
        // Check for governance-heavy directories
        const highGovernanceDir = directories.find(d => d.governance_artifacts_count > 10);
        if (highGovernanceDir) {
          riskLevel = riskLevel === 'low' ? 'medium' : 'high';
          riskFactors.push(`Directory with ${highGovernanceDir.governance_artifacts_count} governance artifacts`);
        }
        
        impacts.push({
          path: targetPath,
          change_type,
          risk_level: riskLevel,
          risk_factors: riskFactors,
          affected_artifacts: artifacts.length,
          affected_directories: directories.length,
          high_importance_count: highImportanceArtifacts.length,
          high_confidence_count: highConfidenceArtifacts.length,
          recommendations: this.generateRecommendations(riskLevel, change_type, artifacts, directories)
        });
      }
      
      return {
        success: true,
        impacts,
        overall_risk: this.calculateOverallRisk(impacts)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        impacts: []
      };
    } finally {
      await this.closeDatabase();
    }
  }

  /**
   * Get governance context for a specific path
   */
  async getGovernanceContext(args) {
    const { path: targetPath } = args;
    
    try {
      await this.initDatabase();
      
      // Get directory governance info
      const directorySql = `
        SELECT path, governance_artifacts_count, primary_governance_type, governance_confidence_avg
        FROM directories 
        WHERE path = ? OR path LIKE ?
        ORDER BY governance_artifacts_count DESC
        LIMIT 5
      `;
      const directories = await this.queryDatabase(directorySql, [targetPath, `%${targetPath}%`]);
      
      // Get governance artifacts in and around this path
      const artifactSql = `
        SELECT primary_classification, confidence_level, COUNT(*) as count
        FROM governance_artifacts 
        WHERE path LIKE ? OR directory_path LIKE ?
        GROUP BY primary_classification, confidence_level
        ORDER BY count DESC
      `;
      const artifactSummary = await this.queryDatabase(artifactSql, [`%${targetPath}%`, `%${targetPath}%`]);
      
      // Get special handling requirements
      const specialSql = `
        SELECT path, filename, special_handling
        FROM governance_artifacts 
        WHERE (path LIKE ? OR directory_path LIKE ?) 
        AND special_handling != '{}'
      `;
      const specialArtifacts = await this.queryDatabase(specialSql, [`%${targetPath}%`, `%${targetPath}%`]);
      
      // Calculate governance score
      const governanceScore = this.calculateGovernanceScore(directories, artifactSummary);
      
      return {
        success: true,
        path: targetPath,
        governance_score: governanceScore,
        directories: directories,
        artifact_summary: artifactSummary,
        special_requirements: specialArtifacts.map(a => ({
          ...a,
          special_handling: JSON.parse(a.special_handling || '{}')
        })),
        recommendations: this.generateContextRecommendations(governanceScore, directories, artifactSummary)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      await this.closeDatabase();
    }
  }

  /**
   * Search governance artifacts by patterns and criteria
   */
  async searchGovernanceArtifacts(args) {
    const { patterns, classification, confidence_min, special_handling_type } = args;
    
    try {
      await this.initDatabase();
      
      let sql = `
        SELECT path, filename, primary_classification, confidence_level, 
               content_summary, special_handling, last_modified
        FROM governance_artifacts 
        WHERE 1=1
      `;
      const params = [];
      
      // Pattern matching
      if (patterns && patterns.length > 0) {
        const patternConditions = patterns.map(() => 
          `(filename LIKE ? OR path LIKE ? OR content_summary LIKE ?)`
        ).join(' OR ');
        sql += ` AND (${patternConditions})`;
        
        patterns.forEach(pattern => {
          const searchPattern = `%${pattern}%`;
          params.push(searchPattern, searchPattern, searchPattern);
        });
      }
      
      // Classification filter
      if (classification) {
        sql += ` AND primary_classification = ?`;
        params.push(classification);
      }
      
      // Confidence filter
      if (confidence_min) {
        const confidenceOrder = { 'high': 3, 'medium': 2, 'low': 1, 'none': 0 };
        const minLevel = confidenceOrder[confidence_min] || 0;
        sql += ` AND 
          CASE confidence_level 
            WHEN 'high' THEN 3 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 1 
            ELSE 0 
          END >= ?`;
        params.push(minLevel);
      }
      
      // Special handling filter
      if (special_handling_type) {
        sql += ` AND special_handling LIKE ?`;
        params.push(`%"${special_handling_type}": true%`);
      }
      
      sql += ` ORDER BY confidence_level DESC, last_modified DESC LIMIT 100`;
      
      const results = await this.queryDatabase(sql, params);
      
      // Parse and enrich results
      const artifacts = results.map(row => ({
        ...row,
        special_handling: JSON.parse(row.special_handling || '{}'),
        relevance_score: this.calculateRelevanceScore(row, patterns)
      }));
      
      return {
        success: true,
        artifacts,
        count: artifacts.length,
        search_params: { patterns, classification, confidence_min, special_handling_type }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        artifacts: []
      };
    } finally {
      await this.closeDatabase();
    }
  }

  /**
   * Get governance statistics and health metrics
   */
  async getGovernanceStats(args) {
    try {
      await this.initDatabase();
      
      // Total counts
      const totalArtifactsSql = `SELECT COUNT(*) as count FROM governance_artifacts`;
      const totalDirsSql = `SELECT COUNT(*) as count FROM directories WHERE governance_artifacts_count > 0`;
      
      const [totalArtifacts] = await this.queryDatabase(totalArtifactsSql);
      const [totalDirs] = await this.queryDatabase(totalDirsSql);
      
      // Classification breakdown
      const classificationSql = `
        SELECT primary_classification, COUNT(*) as count 
        FROM governance_artifacts 
        GROUP BY primary_classification 
        ORDER BY count DESC
      `;
      const classifications = await this.queryDatabase(classificationSql);
      
      // Confidence distribution
      const confidenceSql = `
        SELECT confidence_level, COUNT(*) as count 
        FROM governance_artifacts 
        GROUP BY confidence_level
      `;
      const confidenceLevels = await this.queryDatabase(confidenceSql);
      
      // Special handling summary
      const specialSql = `
        SELECT special_handling, COUNT(*) as count 
        FROM governance_artifacts 
        WHERE special_handling != '{}'
        GROUP BY special_handling
      `;
      const specialHandling = await this.queryDatabase(specialSql);
      
      // Top governance directories
      const topDirsSql = `
        SELECT path, governance_artifacts_count, primary_governance_type 
        FROM directories 
        WHERE governance_artifacts_count > 0 
        ORDER BY governance_artifacts_count DESC 
        LIMIT 10
      `;
      const topDirectories = await this.queryDatabase(topDirsSql);
      
      // Health metrics
      const healthMetrics = this.calculateHealthMetrics(classifications, confidenceLevels);
      
      return {
        success: true,
        total_artifacts: totalArtifacts.count,
        total_governance_directories: totalDirs.count,
        classifications,
        confidence_levels: confidenceLevels,
        special_handling: specialHandling.map(s => ({
          ...s,
          special_handling: JSON.parse(s.special_handling || '{}')
        })),
        top_directories: topDirectories,
        health_metrics: healthMetrics,
        generated_at: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      await this.closeDatabase();
    }
  }

  // Helper methods
  generateRecommendations(riskLevel, changeType, artifacts, directories) {
    const recommendations = [];
    
    if (riskLevel === 'high') {
      recommendations.push('🚨 High risk operation - require explicit approval');
      recommendations.push('📋 Review all affected governance artifacts before proceeding');
      recommendations.push('💾 Create backup of governance artifacts');
    }
    
    if (riskLevel === 'medium') {
      recommendations.push('⚠️ Medium risk - proceed with caution');
      recommendations.push('📝 Document changes to governance artifacts');
    }
    
    const gitHooks = artifacts.filter(a => {
      const special = JSON.parse(a.special_handling || '{}');
      return special.git_hook;
    });
    
    if (gitHooks.length > 0) {
      recommendations.push('🔧 Git hooks detected - verify functionality after changes');
    }
    
    return recommendations;
  }
  
  generateContextRecommendations(governanceScore, directories, artifactSummary) {
    const recommendations = [];
    
    if (governanceScore >= 80) {
      recommendations.push('✅ High governance coverage - proceed with standard protocols');
    } else if (governanceScore >= 50) {
      recommendations.push('⚠️ Moderate governance coverage - consider adding governance artifacts');
    } else {
      recommendations.push('❌ Low governance coverage - governance artifacts may be needed');
    }
    
    const highConfidenceArtifacts = artifactSummary.filter(a => a.confidence_level === 'high');
    if (highConfidenceArtifacts.length === 0) {
      recommendations.push('📝 Consider adding clear governance documentation');
    }
    
    return recommendations;
  }
  
  calculateGovernanceScore(directories, artifactSummary) {
    let score = 0;
    
    // Base score from artifact count
    const totalArtifacts = artifactSummary.reduce((sum, a) => sum + a.count, 0);
    score += Math.min(totalArtifacts * 5, 50); // Max 50 points for artifacts
    
    // Confidence bonus
    const highConfidence = artifactSummary.filter(a => a.confidence_level === 'high')
                                          .reduce((sum, a) => sum + a.count, 0);
    score += highConfidence * 3; // 3 points per high-confidence artifact
    
    // Directory coverage bonus
    const govDirs = directories.filter(d => d.governance_artifacts_count > 0);
    score += govDirs.length * 2; // 2 points per governance directory
    
    return Math.min(score, 100); // Cap at 100
  }
  
  calculateOverallRisk(impacts) {
    const riskLevels = impacts.map(i => i.risk_level);
    
    if (riskLevels.includes('high')) return 'high';
    if (riskLevels.includes('medium')) return 'medium';
    return 'low';
  }
  
  calculateRelevanceScore(artifact, patterns) {
    if (!patterns || patterns.length === 0) return 1.0;
    
    let score = 0;
    patterns.forEach(pattern => {
      if (artifact.filename.toLowerCase().includes(pattern.toLowerCase())) score += 0.4;
      if (artifact.path.toLowerCase().includes(pattern.toLowerCase())) score += 0.3;
      if (artifact.content_summary && artifact.content_summary.toLowerCase().includes(pattern.toLowerCase())) score += 0.3;
    });
    
    return Math.min(score, 1.0);
  }
  
  calculateHealthMetrics(classifications, confidenceLevels) {
    const totalArtifacts = classifications.reduce((sum, c) => sum + c.count, 0);
    const highConfidence = confidenceLevels.find(c => c.confidence_level === 'high')?.count || 0;
    const unclassified = classifications.find(c => c.primary_classification === 'unclassified')?.count || 0;
    
    return {
      classification_coverage: ((totalArtifacts - unclassified) / totalArtifacts * 100).toFixed(1),
      high_confidence_ratio: (highConfidence / totalArtifacts * 100).toFixed(1),
      total_artifacts: totalArtifacts,
      health_score: Math.round(((totalArtifacts - unclassified) / totalArtifacts * 0.6 + 
                               highConfidence / totalArtifacts * 0.4) * 100)
    };
  }

  /**
   * Get project type classification for directories and projects
   */
  async getProjectTypeClassification(args) {
    const { path, confidence_min = 0.0, project_type_filter } = args;
    
    try {
      await this.initDatabase();
      
      let sql = `
        SELECT path, name, project_type, project_confidence, project_reasoning,
               governance_artifacts_count, last_modified
        FROM directories 
        WHERE project_type IS NOT NULL AND project_confidence >= ?
      `;
      const params = [confidence_min];
      
      if (path) {
        sql += ` AND (path = ? OR path LIKE ?)`;
        params.push(path, `%${path}%`);
      }
      
      if (project_type_filter) {
        sql += ` AND project_type = ?`;
        params.push(project_type_filter);
      }
      
      sql += ` ORDER BY project_confidence DESC, governance_artifacts_count DESC`;
      
      const directories = await this.queryDatabase(sql, params);
      
      // Parse reasoning for each directory
      const enrichedDirectories = directories.map(dir => ({
        ...dir,
        project_reasoning: JSON.parse(dir.project_reasoning || '[]'),
        confidence_level: this.getConfidenceLevel(dir.project_confidence)
      }));
      
      return {
        success: true,
        directories: enrichedDirectories,
        total_classified: enrichedDirectories.length,
        generated_at: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        directories: []
      };
    } finally {
      await this.closeDatabase();
    }
  }

  /**
   * Analyze the overall project portfolio distribution and balance
   */
  async analyzeProjectPortfolio(args) {
    const { include_reasoning = false } = args;
    
    try {
      await this.initDatabase();
      
      // Get project type distribution
      const distributionSql = `
        SELECT project_type, COUNT(*) as count, 
               AVG(project_confidence) as avg_confidence,
               COUNT(CASE WHEN governance_artifacts_count > 0 THEN 1 END) as with_governance
        FROM directories 
        WHERE project_type IS NOT NULL AND project_type != 'unknown'
        GROUP BY project_type
        ORDER BY count DESC
      `;
      const distribution = await this.queryDatabase(distributionSql);
      
      // Get confidence level breakdown
      const confidenceSql = `
        SELECT 
          CASE 
            WHEN project_confidence >= 0.8 THEN 'high'
            WHEN project_confidence >= 0.5 THEN 'medium'
            WHEN project_confidence >= 0.2 THEN 'low'
            ELSE 'very_low'
          END as confidence_level,
          COUNT(*) as count
        FROM directories 
        WHERE project_type IS NOT NULL AND project_type != 'unknown'
        GROUP BY confidence_level
        ORDER BY count DESC
      `;
      const confidenceLevels = await this.queryDatabase(confidenceSql);
      
      // Get top projects by type
      const topProjectsSql = `
        SELECT path, name, project_type, project_confidence, governance_artifacts_count,
               ${include_reasoning ? 'project_reasoning,' : ''}
               last_modified
        FROM directories 
        WHERE project_type IS NOT NULL AND project_type != 'unknown'
        ORDER BY project_confidence DESC, governance_artifacts_count DESC
        LIMIT 20
      `;
      const topProjects = await this.queryDatabase(topProjectsSql);
      
      // Calculate portfolio balance metrics
      const totalProjects = distribution.reduce((sum, d) => sum + d.count, 0);
      const portfolioBalance = this.calculatePortfolioBalance(distribution, totalProjects);
      const healthMetrics = this.calculateProjectHealthMetrics(distribution, confidenceLevels, totalProjects);
      
      return {
        success: true,
        portfolio_summary: {
          total_classified_projects: totalProjects,
          project_types: distribution.length,
          avg_confidence: (distribution.reduce((sum, d) => sum + (d.avg_confidence * d.count), 0) / totalProjects).toFixed(3)
        },
        distribution,
        confidence_levels: confidenceLevels,
        top_projects: include_reasoning ? topProjects.map(p => ({
          ...p,
          project_reasoning: JSON.parse(p.project_reasoning || '[]')
        })) : topProjects,
        portfolio_balance: portfolioBalance,
        health_metrics: healthMetrics,
        recommendations: this.generatePortfolioRecommendations(portfolioBalance, distribution),
        generated_at: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      await this.closeDatabase();
    }
  }

  // Helper methods for project type analysis
  getConfidenceLevel(confidence) {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.5) return 'medium';
    if (confidence >= 0.2) return 'low';
    return 'very_low';
  }

  calculatePortfolioBalance(distribution, totalProjects) {
    const typeMap = {
      'idp_optimization': 'IDP Optimization',
      'business_optimization': 'Business Optimization', 
      'revenue_stream': 'Revenue Stream',
      'client_delivery': 'Client Delivery',
      'experimental': 'Experimental'
    };
    
    const balance = {};
    distribution.forEach(d => {
      const percentage = (d.count / totalProjects * 100).toFixed(1);
      balance[typeMap[d.project_type] || d.project_type] = {
        count: d.count,
        percentage: parseFloat(percentage),
        avg_confidence: parseFloat(d.avg_confidence.toFixed(3)),
        governance_coverage: ((d.with_governance / d.count) * 100).toFixed(1)
      };
    });
    
    return balance;
  }

  calculateProjectHealthMetrics(distribution, confidenceLevels, totalProjects) {
    const highConfidence = confidenceLevels.find(c => c.confidence_level === 'high')?.count || 0;
    const withGovernance = distribution.reduce((sum, d) => sum + d.with_governance, 0);
    
    return {
      high_confidence_ratio: (highConfidence / totalProjects * 100).toFixed(1),
      governance_coverage: (withGovernance / totalProjects * 100).toFixed(1),
      portfolio_diversity: distribution.length,
      balance_score: this.calculateBalanceScore(distribution, totalProjects)
    };
  }

  calculateBalanceScore(distribution, totalProjects) {
    // Calculate how evenly distributed projects are across types
    const expectedPerType = totalProjects / distribution.length;
    const variance = distribution.reduce((sum, d) => {
      const diff = d.count - expectedPerType;
      return sum + (diff * diff);
    }, 0) / distribution.length;
    
    // Lower variance = better balance, scale to 0-100
    const maxVariance = expectedPerType * expectedPerType;
    return Math.round((1 - (variance / maxVariance)) * 100);
  }

  generatePortfolioRecommendations(balance, distribution) {
    const recommendations = [];
    const totalCount = distribution.reduce((sum, d) => sum + d.count, 0);
    
    // Check for imbalanced portfolio
    const maxType = distribution.reduce((max, d) => d.count > max.count ? d : max, distribution[0]);
    if (maxType.count / totalCount > 0.6) {
      recommendations.push(`📊 Portfolio imbalance: ${maxType.project_type} projects dominate (${(maxType.count/totalCount*100).toFixed(1)}%)`);
    }
    
    // Check for missing revenue streams
    const hasRevenue = distribution.some(d => d.project_type === 'revenue_stream');
    if (!hasRevenue || distribution.find(d => d.project_type === 'revenue_stream')?.count < 2) {
      recommendations.push('💰 Consider developing more revenue stream projects for business growth');
    }
    
    // Check governance coverage
    const lowGovernance = distribution.filter(d => (d.with_governance / d.count) < 0.5);
    if (lowGovernance.length > 0) {
      recommendations.push(`📋 Low governance coverage in: ${lowGovernance.map(d => d.project_type).join(', ')}`);
    }
    
    return recommendations;
  }
}

// Tool definitions for MCP server
export const governanceToolDefinitions = [
  {
    name: 'get_governance_artifacts',
    description: 'Get governance artifacts for a specific path with filtering options',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Target path to search (optional)' },
        classification_filter: { type: 'string', description: 'Filter by classification type' },
        confidence_min: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Minimum confidence level' }
      }
    }
  },
  {
    name: 'analyze_governance_impact',
    description: 'Analyze the governance impact of proposed changes to paths',
    inputSchema: {
      type: 'object',
      required: ['paths', 'change_type'],
      properties: {
        paths: { type: 'array', items: { type: 'string' }, description: 'Paths that will be changed' },
        change_type: { type: 'string', enum: ['create', 'modify', 'delete', 'move'], description: 'Type of change' }
      }
    }
  },
  {
    name: 'get_governance_context',
    description: 'Get comprehensive governance context for a specific path',
    inputSchema: {
      type: 'object',
      required: ['path'],
      properties: {
        path: { type: 'string', description: 'Path to analyze for governance context' }
      }
    }
  },
  {
    name: 'search_governance_artifacts',
    description: 'Search governance artifacts by patterns and criteria',
    inputSchema: {
      type: 'object',
      properties: {
        patterns: { type: 'array', items: { type: 'string' }, description: 'Search patterns to match' },
        classification: { type: 'string', description: 'Filter by classification type' },
        confidence_min: { type: 'string', enum: ['high', 'medium', 'low'], description: 'Minimum confidence level' },
        special_handling_type: { type: 'string', description: 'Filter by special handling type (git_hook, config_file, etc.)' }
      }
    }
  },
  {
    name: 'get_governance_stats',
    description: 'Get comprehensive governance statistics and health metrics',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_project_type_classification',
    description: 'Get project type classification for directories and projects',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Specific path to classify' },
        confidence_min: { type: 'number', description: 'Minimum confidence threshold (0.0-1.0)' },
        project_type_filter: { type: 'string', enum: ['idp_optimization', 'business_optimization', 'revenue_stream', 'client_delivery', 'experimental'], description: 'Filter by project type' }
      }
    }
  },
  {
    name: 'analyze_project_portfolio',
    description: 'Analyze the overall project portfolio distribution and balance',
    inputSchema: {
      type: 'object',
      properties: {
        include_reasoning: { type: 'boolean', description: 'Include classification reasoning details' }
      }
    }
  }
];