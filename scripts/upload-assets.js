#!/usr/bin/env node
/**
 * Script to upload assets to Vercel Blob Storage
 * Usage: node scripts/upload-assets.js <directory> <category>
 */

const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');

async function uploadDirectory(directory, category) {
  if (!fs.existsSync(directory)) {
    console.error(`Directory ${directory} does not exist`);
    process.exit(1);
  }

  console.log(`📤 Uploading assets from ${directory} to category: ${category}`);

  const files = fs.readdirSync(directory);
  const uploadPromises = [];

  for (const filename of files) {
    const filePath = path.join(directory, filename);
    const stat = fs.statSync(filePath);

    if (stat.isFile()) {
      const file = fs.readFileSync(filePath);
      const pathname = `assets/${category}/${filename}`;

      console.log(`⬆️  Uploading ${filename}...`);

      const uploadPromise = put(pathname, file, {
        access: 'public',
        addRandomSuffix: false,
      }).then(blob => {
        console.log(`✅ Uploaded: ${blob.url}`);
        return blob.url;
      }).catch(error => {
        console.error(`❌ Failed to upload ${filename}:`, error);
        return null;
      });

      uploadPromises.push(uploadPromise);
    }
  }

  const results = await Promise.all(uploadPromises);
  const successful = results.filter(url => url !== null);

  console.log(`\n🎉 Upload complete: ${successful.length}/${files.length} files uploaded successfully`);

  return successful;
}

// CLI usage
if (require.main === module) {
  const [,, directory, category] = process.argv;

  if (!directory || !category) {
    console.log('Usage: node scripts/upload-assets.js <directory> <category>');
    console.log('Categories: artwork, audio, publication, background, other');
    process.exit(1);
  }

  uploadDirectory(directory, category).catch(console.error);
}

module.exports = { uploadDirectory };