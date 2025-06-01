# E2B Code-Interpreter Setup Instructions

## Step 1: Sign Up for E2B Account

1. Go to [E2B Platform](https://e2b.dev/)
2. Click "Sign Up" and create an account
3. Verify your email address

## Step 2: Get Your API Key

1. After logging in, go to your dashboard
2. Navigate to "API Keys" section
3. Create a new API key
4. Copy the API key (starts with `e2b_`)

## Step 3: Update Environment Configuration

Add your E2B API key to the development environment:

```bash
# Edit the development.json file
nano /home/ichardart/code/infra/mcp-config/environments/development.json
```

Replace `"e2b-api-key-here"` with your actual API key:
```json
"E2B_API_KEY": "e2b_your_actual_api_key_here"
```

## Step 4: Apply Configuration

```bash
cd /home/ichardart/code/infra/mcp-config
./apply-config.sh development
```

## Step 5: Test E2B Integration

The E2B MCP server enables:
- Secure Python/JavaScript code execution
- Isolated sandboxes (sub-200ms startup)
- Real-time code interpretation
- Data analysis and visualization

## Features Available:

### Python Code Execution
```python
import pandas as pd
import matplotlib.pyplot as plt

# Your AI can now run this code safely!
data = pd.DataFrame({'x': [1,2,3], 'y': [4,5,6]})
plt.plot(data['x'], data['y'])
plt.show()
```

### JavaScript Code Execution
```javascript
// AI can execute JavaScript too
const fs = require('fs');
console.log('Hello from E2B sandbox!');
```

### Data Analysis
- Query your PostgreSQL database
- Process results with pandas/numpy
- Generate visualizations
- Export analysis results

## Security Features:
- Isolated Firecracker microVMs
- No access to host system
- Automatic cleanup after execution
- Resource limits and timeouts

## Free Tier:
- Limited compute hours per month
- Perfect for development and testing
- Upgrade available for production use

## Troubleshooting:

If you encounter issues:
1. Verify API key is correct
2. Check E2B account status
3. Ensure sufficient compute credits
4. Review logs in MCP server output

Your E2B integration will transform your IDP by adding secure code execution capabilities!