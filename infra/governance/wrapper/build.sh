#\!/bin/bash
echo "Building governance wrapper..."
npm install --silent
npm run build --silent
npm run publish-local --silent
echo "✅ Governance wrapper ready at /tmp/@idp-governance-wrapper-*.tgz"
