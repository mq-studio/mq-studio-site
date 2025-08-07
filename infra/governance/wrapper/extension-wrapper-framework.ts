import * as vscode from 'vscode';

interface GovernanceConfig {
  endpoint: string;
  extensionId: string;
  riskLevel: 'low'  < /dev/null |  'medium' | 'high';
  allowedServers: string[];
}

export class GovernanceWrapper {
  private auditLog: any[] = [];
  
  constructor(private config: GovernanceConfig) {}
  
  async wrapExtension(originalActivate: Function): Promise<Function> {
    return async (context: vscode.ExtensionContext) => {
      const approved = await this.checkActivationPolicy();
      if (\!approved) {
        throw new Error('Extension blocked by governance policy');
      }
      
      const start = Date.now();
      try {
        const result = await originalActivate(context);
        await this.audit('activation', 'success', Date.now() - start);
        return result;
      } catch (error) {
        await this.audit('activation', 'failure', Date.now() - start, error);
        throw error;
      }
    };
  }
  
  private async checkActivationPolicy(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.endpoint}/api/policy/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extension.activate',
          extension: this.config.extensionId,
          context: { user: process.env.USER, time: new Date().toISOString() }
        })
      });
      const result = await response.json();
      return result.allowed;
    } catch (error) {
      return this.config.riskLevel === 'low';
    }
  }
  
  private async audit(action: string, result: string, duration: number, error?: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      extension: this.config.extensionId,
      action, result, duration,
      error: error?.message
    };
    
    this.auditLog.push(entry);
    
    try {
      await fetch(`${this.config.endpoint}/api/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (e) {
      console.error('Audit logging failed:', e);
    }
  }
}

export function createGovernanceWrapper(config: GovernanceConfig) {
  return new GovernanceWrapper(config);
}
