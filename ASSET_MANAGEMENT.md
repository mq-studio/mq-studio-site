# Asset Management Guide

## Overview

This project uses a hybrid approach for asset management:
- **Small assets** (<100KB): Stored in Git repository
- **Large assets**: Stored in Vercel Blob Storage with CDN delivery
- **Development assets**: Local placeholders for development

## Cost Optimization

### Vercel Blob Storage Pricing
- **Free tier**: 100GB storage, 1TB bandwidth
- **Pro tier**: $0.15/GB storage, $0.04/GB bandwidth
- **Estimated monthly cost**: ~$15-30 for typical art portfolio

### GitHub Costs Avoided
- **Large File Storage**: $5/month per 50GB (avoided)
- **Repository bloat**: Performance degradation (avoided)
- **Bandwidth costs**: GitHub Pages limitations (avoided)

## Directory Structure

```
├── public/assets/           # Small assets in Git (<100KB each)
│   ├── icons/              # UI icons, logos
│   └── placeholders/       # Development placeholders
├── assets/                 # Local asset processing (not in Git)
│   ├── originals/          # Source files for processing
│   └── processed/          # Optimized versions for upload
├── src/lib/assets/         # Asset management utilities
└── scripts/                # Asset upload and management scripts
```

## Usage Guide

### 1. Setup Asset Storage

```bash
# Run initial setup
./scripts/setup-asset-storage.sh

# Install dependencies
npm install @vercel/blob
```

### 2. Environment Configuration

Add to your 1Password vault:
- **Item**: "MQ Studio API Keys"
- **Field**: "blob_storage_token"
- **Value**: Your Vercel Blob Storage token

### 3. Upload Large Assets

```bash
# Upload artwork images
node scripts/upload-assets.js assets/originals/artwork/ artwork

# Upload audio files for musings
node scripts/upload-assets.js assets/originals/audio/ audio

# Upload publication PDFs
node scripts/upload-assets.js assets/originals/publications/ publication
```

### 4. Use Assets in Components

```tsx
import { getOptimizedImageUrl } from '@/lib/assets/blob-storage';

// For large images from Blob storage
const artworkUrl = 'https://blob.vercel-storage.com/assets/artwork/painting-2024.jpg';

// For small images from public folder
const iconUrl = '/assets/icons/logo.svg';

// With optimization (future enhancement)
const optimizedUrl = getOptimizedImageUrl(artworkUrl, {
  width: 800,
  format: 'webp',
  quality: 85
});
```

## Asset Categories

### 🎨 **Artwork** (`artwork/`)
- High-resolution paintings, watercolors
- Format: JPG, PNG, WebP
- Size: 1-10MB each
- Storage: Blob Storage

### 🎵 **Audio** (`audio/`)
- Musing recordings
- Format: MP3, M4A
- Size: 5-50MB each
- Storage: Blob Storage

### 📄 **Publications** (`publication/`)
- Research papers, governance documents
- Format: PDF
- Size: 1-20MB each
- Storage: Blob Storage

### 🖼️ **Backgrounds** (`background/`)
- Large background textures
- Format: JPG, WebP
- Size: 500KB-5MB each
- Storage: Blob Storage

### 🔧 **UI Assets** (`public/assets/`)
- Icons, logos, small graphics
- Format: SVG, PNG
- Size: <100KB each
- Storage: Git Repository

## Development Workflow

### 1. Local Development
```bash
# Use placeholder images for development
src="public/assets/placeholders/artwork-placeholder.jpg"

# Test with real assets when needed
npm run dev
```

### 2. Asset Processing
```bash
# Optimize images before upload
# (Add image optimization tools as needed)
```

### 3. Production Deployment
- Assets automatically served via Vercel's global CDN
- No additional configuration needed
- Automatic HTTPS and compression

## Security & Access Control

- **Public access**: All assets are publicly accessible (appropriate for website)
- **Token security**: BLOB_READ_WRITE_TOKEN kept in 1Password
- **Upload permissions**: Restricted to authenticated deployment

## Performance Optimization

### Image Optimization
- Serve WebP format when supported
- Responsive image sizes
- Lazy loading for large images
- CDN caching globally

### Audio Optimization
- Compress audio files appropriately
- Progressive loading for long recordings
- Preload metadata only

## Backup Strategy

- **Git repository**: Version controlled small assets
- **Blob storage**: Managed by Vercel with redundancy
- **Source files**: Keep originals in separate backup location

## Migration from Other Systems

If migrating from:
- **GitHub LFS**: Export and upload to Blob storage
- **Other CDNs**: Use upload scripts to transfer
- **Local storage**: Process and upload systematically

## Monitoring & Costs

### Track Usage
```bash
# List all uploaded assets
node -e "require('./src/lib/assets/blob-storage').listAssets().then(console.log)"

# Monitor via Vercel dashboard
# - Storage usage
# - Bandwidth consumption
# - Monthly costs
```

### Cost Alerts
- Set up Vercel billing alerts
- Monitor asset upload frequency
- Optimize large files when possible