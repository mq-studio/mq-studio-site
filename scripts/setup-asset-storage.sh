#!/bin/bash
# Setup script for asset storage with Vercel Blob

set -e

echo "📦 Setting up asset storage for MQ Studio..."

# Install Vercel Blob Storage
echo "📥 Installing Vercel Blob Storage..."
npm install @vercel/blob

# Create asset management utilities
echo "🔧 Setting up asset management structure..."

# Create asset directories
mkdir -p public/assets/{icons,placeholders}
mkdir -p src/lib/assets
mkdir -p assets/{originals,processed}

# Add to .gitignore
echo "📝 Updating .gitignore for asset management..."
cat >> .gitignore << EOF

# Asset management
/assets/originals/
/assets/processed/
*.tmp
.vercel-blob-cache/
EOF

echo "✅ Asset storage setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set BLOB_READ_WRITE_TOKEN in your environment"
echo "2. Use scripts/upload-assets.js to upload large files"
echo "3. Store small assets (<100KB) in public/assets/"
echo "4. Store development placeholders in public/assets/placeholders/"