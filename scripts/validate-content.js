/**
 * Content Validation Script
 * 
 * Validates all markdown content files in the content/ directory
 * Checks for:
 * - Valid YAML frontmatter syntax
 * - Required frontmatter fields
 * - Proper date formats
 * - Valid image paths
 * - Consistent tag formatting
 * 
 * Usage: node scripts/validate-content.js
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const CONTENT_DIR = path.join(__dirname, '..', 'content');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Required fields by content type
const REQUIRED_FIELDS = {
  artworks: ['title', 'date', 'image'],
  publications: ['title', 'date', 'type'],
  musings: ['title', 'date'],
  projects: ['title', 'date'],
  press: ['title', 'date', 'source']
};

// Validation results
const results = {
  totalFiles: 0,
  validFiles: 0,
  errors: [],
  warnings: []
};

/**
 * Add error to results
 */
function addError(file, message) {
  results.errors.push({ file, message, severity: 'error' });
}

/**
 * Add warning to results
 */
function addWarning(file, message) {
  results.warnings.push({ file, message, severity: 'warning' });
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDate(dateString) {
  if (!dateString) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Check if image file exists
 */
function imageExists(imagePath) {
  if (!imagePath) return false;
  
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const fullPath = path.join(PUBLIC_DIR, cleanPath);
  
  return fs.existsSync(fullPath);
}

/**
 * Validate a single markdown file
 */
function validateFile(filePath, contentType) {
  results.totalFiles++;
  
  const relativePath = path.relative(CONTENT_DIR, filePath);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Parse frontmatter
    let parsed;
    try {
      parsed = matter(fileContent);
    } catch (yamlError) {
      addError(relativePath, `YAML parsing failed: ${yamlError.message}`);
      return;
    }
    
    const { data: frontmatter, content } = parsed;
    
    // Check required fields
    const requiredFields = REQUIRED_FIELDS[contentType] || [];
    for (const field of requiredFields) {
      if (!frontmatter[field]) {
        addError(relativePath, `Missing required field: ${field}`);
      }
    }
    
    // Validate date format
    if (frontmatter.date && !isValidDate(frontmatter.date)) {
      addError(relativePath, `Invalid date format: ${frontmatter.date} (expected YYYY-MM-DD)`);
    }
    
    // Validate image path
    if (frontmatter.image && !imageExists(frontmatter.image)) {
      addWarning(relativePath, `Image file not found: ${frontmatter.image}`);
    }
    
    // Check for special characters in YAML values that should be quoted
    const specialChars = /[:{}\[\],&*#?|\-<>=!%@`]/;
    for (const [key, value] of Object.entries(frontmatter)) {
      if (typeof value === 'string' && specialChars.test(value)) {
        // Check if value contains unquoted colon (common YAML error)
        if (value.includes(':') && !value.match(/^["'].*["']$/)) {
          addWarning(relativePath, `Field '${key}' contains special characters and should be quoted: ${value}`);
        }
      }
    }
    
    // Validate tags (should be array)
    if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
      addWarning(relativePath, `Tags should be an array, got: ${typeof frontmatter.tags}`);
    }
    
    // Check content length
    if (content.trim().length === 0) {
      addWarning(relativePath, 'Content body is empty');
    }
    
    // If no errors for this file, count as valid
    const fileHasErrors = results.errors.some(e => e.file === relativePath);
    if (!fileHasErrors) {
      results.validFiles++;
    }
    
  } catch (error) {
    addError(relativePath, `Failed to read file: ${error.message}`);
  }
}

/**
 * Recursively find all markdown files
 */
function findMarkdownFiles(dir) {
  const files = [];
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Main validation function
 */
function validateContent() {
  console.log('🔍 Validating content files...\n');
  
  // Check if content directory exists
  if (!fs.existsSync(CONTENT_DIR)) {
    console.error('❌ Content directory not found:', CONTENT_DIR);
    process.exit(1);
  }
  
  // Find all content types
  const contentTypes = fs.readdirSync(CONTENT_DIR).filter(item => {
    const fullPath = path.join(CONTENT_DIR, item);
    return fs.statSync(fullPath).isDirectory();
  });
  
  console.log(`Found content types: ${contentTypes.join(', ')}\n`);
  
  // Validate each content type
  for (const contentType of contentTypes) {
    const contentDir = path.join(CONTENT_DIR, contentType);
    const files = findMarkdownFiles(contentDir);
    
    console.log(`📁 ${contentType}: ${files.length} files`);
    
    for (const file of files) {
      validateFile(file, contentType);
    }
  }
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 VALIDATION RESULTS');
  console.log('='.repeat(60));
  console.log(`Total files: ${results.totalFiles}`);
  console.log(`Valid files: ${results.validFiles}`);
  console.log(`Errors: ${results.errors.length}`);
  console.log(`Warnings: ${results.warnings.length}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    console.log('-'.repeat(60));
    for (const error of results.errors) {
      console.log(`\n${error.file}`);
      console.log(`  ❌ ${error.message}`);
    }
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    console.log('-'.repeat(60));
    for (const warning of results.warnings) {
      console.log(`\n${warning.file}`);
      console.log(`  ⚠️  ${warning.message}`);
    }
  }
  
  if (results.errors.length === 0 && results.warnings.length === 0) {
    console.log('\n✅ All content files are valid!');
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Exit with error code if there are errors
  if (results.errors.length > 0) {
    console.log('\n❌ Validation failed with errors.');
    process.exit(1);
  }
  
  console.log('\n✅ Validation completed successfully.');
  process.exit(0);
}

// Run validation
validateContent();
