const express = require('express');
const app = express();
app.use(express.json());

const CONFIG_DB = {
  'anthropic.claude-code': {
    approved: true,
    version: '>=1.0.24',
    mcpServers: ['fetch', 'github', 'memory'],
    riskLevel: 'moderate',
    governance: { auditLevel: 'basic', resourceLimits: { memory: '256Mi', cpu: '0.2' } }
  },
  'saoudrizwan.claude-dev': {
    approved: true,
    version: '>=3.17.12',
    mcpServers: ['fetch', 'filesystem'],
    riskLevel: 'high',
    governance: {
      auditLevel: 'detailed',
      resourceLimits: { memory: '512Mi', cpu: '0.5' },
      restrictions: { filesystem: 'workspace-only', network: 'localhost-only' }
    }
  }
};

app.get('/api/config/:extensionId', (req, res) => {
  const config = CONFIG_DB[req.params.extensionId];
  if (\!config) return res.status(404).json({ error: 'Extension not found' });
  res.json(config);
});

app.post('/api/policy/check', (req, res) => {
  const { extension, action } = req.body;
  const config = CONFIG_DB[extension];
  
  if (\!config || \!config.approved) {
    return res.json({ allowed: false, reason: 'Extension not approved' });
  }
  
  res.json({ allowed: true, config });
});

app.post('/api/audit', (req, res) => {
  console.log('Audit:', req.body);
  res.json({ received: true });
});

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

const PORT = process.env.PORT || 3022;
app.listen(PORT, () => {
  console.log(`Configuration service running on port ${PORT}`);
});
EOF < /dev/null
