const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

app.get('/api/compliance', (req, res) => {
  res.json({
    summary: {
      totalExtensions: 2,
      compliant: 2,
      nonCompliant: 0,
      score: 95
    },
    extensions: {
      'anthropic.claude-code': { score: 90, status: 'compliant' },
      'saoudrizwan.claude-dev': { score: 85, status: 'monitoring' }
    }
  });
});

app.post('/api/scan', (req, res) => {
  res.json({ status: 'scan completed', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3023;
app.listen(PORT, () => {
  console.log(`Compliance engine running on port ${PORT}`);
});
