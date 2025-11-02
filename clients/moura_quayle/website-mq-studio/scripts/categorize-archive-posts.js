#!/usr/bin/env node
/**
 * Phase 3: Categorize Archive Posts
 *
 * Analyzes content of archive blog posts and assigns them to
 * thinking/feeling/doing categories based on content analysis.
 */

import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Category detection keywords and patterns
const CATEGORY_PATTERNS = {
  thinking: {
    keywords: [
      'policy', 'research', 'analysis', 'study', 'theory', 'framework',
      'governance', 'planning', 'strategy', 'concept', 'model',
      'academic', 'report', 'whitepaper', 'paper', 'publication',
      'climate change', 'sustainability', 'resilience', 'urban planning',
      'landscape architecture', 'design thinking', 'innovation',
      'environmental', 'ecological', 'systems thinking'
    ],
    weight: 1.0
  },
  feeling: {
    keywords: [
      'art', 'beauty', 'creative', 'expression', 'inspiration',
      'reflection', 'personal', 'journey', 'experience', 'story',
      'watercolor', 'painting', 'calligraphy', 'meditation',
      'nature', 'wonder', 'appreciation', 'gratitude', 'mindful'
    ],
    weight: 1.0
  },
  doing: {
    keywords: [
      'project', 'implementation', 'practice', 'action', 'initiative',
      'workshop', 'community', 'engagement', 'collaboration', 'partnership',
      'design', 'development', 'construction', 'build', 'create',
      'program', 'event', 'conference', 'symposium', 'meeting',
      'tools', 'methods', 'process', 'execution', 'delivery'
    ],
    weight: 1.0
  }
};

// Analyze content and determine best category
function analyzeContent(title, content, excerpt) {
  const text = `${title} ${excerpt} ${content}`.toLowerCase();
  const scores = { thinking: 0, feeling: 0, doing: 0 };

  // Count keyword matches for each category
  for (const [category, config] of Object.entries(CATEGORY_PATTERNS)) {
    for (const keyword of config.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = (text.match(regex) || []).length;
      scores[category] += matches * config.weight;
    }
  }

  // Additional heuristics

  // If title contains "conference", "workshop", "event" -> likely doing
  if (/\b(conference|workshop|event|symposium|meeting)\b/i.test(title)) {
    scores.doing += 5;
  }

  // If has academic/research tone -> thinking
  if (/\b(research|study|analysis|framework|policy|report)\b/i.test(title)) {
    scores.thinking += 3;
  }

  // If mentions specific cities/places and action -> doing
  if (/\b(vancouver|seattle|portland|city of|municipality)\b/i.test(text) &&
      /\b(project|initiative|program|action plan)\b/i.test(text)) {
    scores.doing += 3;
  }

  // Find highest score
  const maxScore = Math.max(scores.thinking, scores.feeling, scores.doing);

  // If all scores are 0 or very low, default to thinking (most archive posts are thought pieces)
  if (maxScore === 0 || maxScore < 2) {
    return { category: 'thinking', confidence: 'low', scores };
  }

  // Find category with highest score
  const category = Object.entries(scores)
    .reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];

  const confidence = maxScore > 10 ? 'high' : maxScore > 5 ? 'medium' : 'low';

  return { category, confidence, scores };
}

// Process a single MDX file
async function processFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data, content: body } = matter(content);

    // Skip if already categorized (not Uncategorized)
    if (data.category && data.category !== 'Uncategorized' && data.category !== '"Uncategorized"') {
      return { skipped: true, reason: 'already_categorized', category: data.category };
    }

    // Analyze content
    const analysis = analyzeContent(
      data.title || '',
      body || '',
      data.excerpt || ''
    );

    // Update frontmatter
    data.category = analysis.category;

    // Write updated file
    const updated = matter.stringify(body, data);
    await fs.writeFile(filePath, updated, 'utf-8');

    return {
      skipped: false,
      title: data.title,
      oldCategory: 'Uncategorized',
      newCategory: analysis.category,
      confidence: analysis.confidence,
      scores: analysis.scores
    };
  } catch (error) {
    return {
      error: true,
      message: error.message,
      file: filePath
    };
  }
}

// Main execution
async function main() {
  const rootDir = path.join(__dirname, '..');
  const archiveDir = path.join(rootDir, 'content/musings/archive');

  console.log('Phase 3: Archive Post Categorization');
  console.log('=====================================\n');

  const results = {
    processed: 0,
    skipped: 0,
    errors: 0,
    categories: { thinking: 0, feeling: 0, doing: 0 },
    details: []
  };

  // Process each year directory
  const years = await fs.readdir(archiveDir);

  for (const year of years) {
    const yearPath = path.join(archiveDir, year);
    const stat = await fs.stat(yearPath);

    if (!stat.isDirectory()) continue;

    console.log(`\nProcessing ${year}...`);

    const files = await fs.readdir(yearPath);
    const mdxFiles = files.filter(f => f.endsWith('.mdx') && !f.endsWith('.bak'));

    for (const file of mdxFiles) {
      const filePath = path.join(yearPath, file);
      const result = await processFile(filePath);

      if (result.error) {
        console.log(`  ❌ ERROR: ${file} - ${result.message}`);
        results.errors++;
      } else if (result.skipped) {
        console.log(`  ⏭️  SKIP: ${file} (${result.reason}: ${result.category})`);
        results.skipped++;
      } else {
        const emoji = result.confidence === 'high' ? '✅' :
                     result.confidence === 'medium' ? '🔸' : '⚠️';
        console.log(`  ${emoji} ${result.title}`);
        console.log(`     ${result.oldCategory} → ${result.newCategory} (${result.confidence})`);

        results.processed++;
        results.categories[result.newCategory]++;
        results.details.push(result);
      }
    }
  }

  // Summary report
  console.log('\n\n=====================================');
  console.log('Summary Report');
  console.log('=====================================');
  console.log(`Total processed: ${results.processed}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Errors: ${results.errors}`);
  console.log('\nCategory Distribution:');
  console.log(`  Thinking: ${results.categories.thinking}`);
  console.log(`  Feeling: ${results.categories.feeling}`);
  console.log(`  Doing: ${results.categories.doing}`);

  // Save detailed report
  const reportPath = path.join(rootDir, 'PHASE3_CATEGORIZATION_REPORT.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nDetailed report saved to: ${reportPath}`);

  // Low confidence items for manual review
  const lowConfidence = results.details.filter(r => r.confidence === 'low');
  if (lowConfidence.length > 0) {
    console.log(`\n⚠️  ${lowConfidence.length} items have low confidence - consider manual review:`);
    lowConfidence.forEach(item => {
      console.log(`   - ${item.title} (${item.newCategory})`);
    });
  }
}

main().catch(console.error);
