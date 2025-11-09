/**
 * Sitemap Generation Script
 * 
 * Generates sitemap.xml for all static and dynamic pages
 * Run after content changes or as part of build process
 * 
 * Usage: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const SITE_URL = 'https://mq-studio-site.vercel.app';
const CONTENT_DIR = path.join(__dirname, '..', 'content');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

/**
 * Get all markdown files from a directory
 */
function getMarkdownFiles(dir) {
  const files = [];
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getMarkdownFiles(fullPath));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Extract metadata from markdown file
 */
function getFileMetadata(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(content);
  
  return {
    date: data.date || null,
    slug: path.basename(filePath, '.md')
  };
}

/**
 * Generate sitemap URLs
 */
function generateSitemap() {
  const urls = [];
  
  // Static pages
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/gallery/artworks', priority: '0.9', changefreq: 'weekly' },
    { loc: '/gallery/publications', priority: '0.9', changefreq: 'weekly' },
    { loc: '/musings', priority: '0.8', changefreq: 'weekly' },
    { loc: '/press', priority: '0.7', changefreq: 'monthly' },
    { loc: '/projects', priority: '0.8', changefreq: 'monthly' },
    { loc: '/search', priority: '0.6', changefreq: 'monthly' }
  ];
  
  for (const page of staticPages) {
    urls.push({
      loc: `${SITE_URL}${page.loc}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: page.changefreq,
      priority: page.priority
    });
  }
  
  // Dynamic content pages
  const contentTypes = {
    artworks: { priority: '0.8', changefreq: 'monthly' },
    publications: { priority: '0.8', changefreq: 'monthly' },
    musings: { priority: '0.7', changefreq: 'monthly' },
    projects: { priority: '0.7', changefreq: 'monthly' }
  };
  
  for (const [contentType, config] of Object.entries(contentTypes)) {
    const contentDir = path.join(CONTENT_DIR, contentType);
    
    if (!fs.existsSync(contentDir)) continue;
    
    const files = getMarkdownFiles(contentDir);
    
    for (const file of files) {
      const metadata = getFileMetadata(file);
      const slug = metadata.slug;
      
      urls.push({
        loc: `${SITE_URL}/${contentType}/${slug}`,
        lastmod: metadata.date || new Date().toISOString().split('T')[0],
        changefreq: config.changefreq,
        priority: config.priority
      });
    }
  }
  
  return urls;
}

/**
 * Create XML sitemap
 */
function createSitemapXML(urls) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  for (const url of urls) {
    xml += '  <url>\n';
    xml += `    <loc>${url.loc}</loc>\n`;
    xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
    xml += `    <priority>${url.priority}</priority>\n`;
    xml += '  </url>\n';
  }
  
  xml += '</urlset>';
  
  return xml;
}

/**
 * Main function
 */
function main() {
  console.log('🗺️  Generating sitemap...\n');
  
  const urls = generateSitemap();
  console.log(`Found ${urls.length} URLs\n`);
  
  const xml = createSitemapXML(urls);
  const outputPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  
  fs.writeFileSync(outputPath, xml, 'utf8');
  
  console.log(`✅ Sitemap generated: ${outputPath}`);
  console.log(`📍 ${urls.length} URLs included\n`);
  
  // Print sample URLs
  console.log('Sample URLs:');
  urls.slice(0, 5).forEach(url => {
    console.log(`  - ${url.loc}`);
  });
  
  if (urls.length > 5) {
    console.log(`  ... and ${urls.length - 5} more`);
  }
}

main();
