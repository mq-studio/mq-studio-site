/**
 * Utilities for generating optimized publication summaries and descriptions
 */

/**
 * Extract key concepts from text using NLP-like patterns
 */
export function extractKeywords(text: string, maxKeywords: number = 5): string[] {
  if (!text) return [];

  // Common stop words to exclude
  const stopWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
    'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
    'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
    'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work',
    'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
    'give', 'day', 'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had',
    'were', 'said', 'did', 'getting', 'made', 'find', 'where', 'much', 'too',
    'very', 'still', 'being', 'going', 'why', 'before', 'never', 'here', 'more'
  ]);

  // Academic/research specific important terms
  const importantTerms = new Set([
    'governance', 'policy', 'urban', 'planning', 'design', 'landscape',
    'architecture', 'public', 'community', 'engagement', 'participatory',
    'framework', 'analysis', 'study', 'research', 'development', 'sustainable',
    'climate', 'resilience', 'infrastructure', 'methodology', 'approach',
    'strategy', 'implementation', 'evaluation', 'assessment', 'innovation',
    'collaborative', 'democratic', 'environmental', 'social', 'economic',
    'cultural', 'indigenous', 'knowledge', 'practice', 'theory', 'model',
    'system', 'process', 'transformation', 'adaptation', 'mitigation'
  ]);

  // Extract words and calculate frequency
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  // Count word frequencies
  const wordFreq = new Map<string, number>();
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });

  // Score words (frequency + importance bonus)
  const scoredWords = Array.from(wordFreq.entries())
    .map(([word, freq]) => ({
      word,
      score: freq * (importantTerms.has(word) ? 2 : 1)
    }))
    .sort((a, b) => b.score - a.score);

  // Return top keywords
  return scoredWords.slice(0, maxKeywords).map(item => item.word);
}

/**
 * Generate a compelling short summary for small view cards
 * Focus on impact and key contribution
 */
export function generateCompactSummary(publication: {
  title?: string;
  abstract?: string;
  description?: string;
  tags?: string[];
}, maxLength: number = 80): string {
  const source = publication.abstract || publication.description || '';

  if (!source) {
    // Fallback to tags if no abstract/description
    if (publication.tags && publication.tags.length > 0) {
      return `Research on ${publication.tags.slice(0, 3).join(', ')}`;
    }
    return 'Academic publication';
  }

  // Look for key phrases that indicate main contribution
  const impactPhrases = [
    /this (paper|study|research|article) (examines|explores|investigates|demonstrates|shows|presents)/i,
    /we (examine|explore|investigate|demonstrate|show|present|propose|develop|introduce)/i,
    /the (paper|study|research) (focuses on|addresses|tackles|solves)/i,
    /our (approach|method|framework|model|analysis)/i,
    /findings (suggest|indicate|show|demonstrate|reveal)/i,
    /results (suggest|indicate|show|demonstrate|reveal)/i,
  ];

  // Try to find a sentence with impact phrase
  const sentences = source.split(/[.!?]+/).filter(s => s.trim().length > 0);

  for (const pattern of impactPhrases) {
    const impactSentence = sentences.find(s => pattern.test(s));
    if (impactSentence) {
      const cleaned = impactSentence
        .replace(/^(this|the) (paper|study|research|article) /i, '')
        .replace(/^we /i, '')
        .trim();

      if (cleaned.length <= maxLength) {
        return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      }

      // Truncate intelligently
      return truncateAtWordBoundary(cleaned, maxLength);
    }
  }

  // Fallback: Use first sentence or generate from keywords
  const firstSentence = sentences[0]?.trim();
  if (firstSentence && firstSentence.length <= maxLength) {
    return firstSentence;
  }

  // Generate from keywords
  const keywords = extractKeywords(source, 4);
  if (keywords.length > 0) {
    const keywordSummary = `Study on ${keywords.join(', ')}`;
    if (keywordSummary.length <= maxLength) {
      return keywordSummary;
    }
  }

  // Last resort: truncate first sentence
  return truncateAtWordBoundary(firstSentence || source, maxLength);
}

/**
 * Generate an engaging medium-length summary for moderate view cards
 * Should be 2-3 lines, focusing on problem/solution or key findings
 */
export function generateModerateSummary(publication: {
  title?: string;
  abstract?: string;
  description?: string;
  tags?: string[];
}, maxLength: number = 150): string {
  const source = publication.abstract || publication.description || '';

  if (!source) {
    if (publication.tags && publication.tags.length > 0) {
      return `This publication explores ${publication.tags.slice(0, 4).join(', ')}, providing insights and analysis for researchers and practitioners.`;
    }
    return 'An academic publication providing research insights and analysis.';
  }

  // Split into sentences
  const sentences = source.split(/[.!?]+/).filter(s => s.trim().length > 10);

  if (sentences.length === 0) {
    return truncateAtWordBoundary(source, maxLength);
  }

  // Try to get problem statement + solution/approach
  const problemPatterns = [
    /challenge|problem|issue|gap|limitation|difficulty|concern/i,
    /fail|lack|insufficient|inadequate|missing/i,
    /need|require|demand/i,
  ];

  const solutionPatterns = [
    /propose|develop|introduce|present|offer|provide/i,
    /approach|method|framework|model|system|strategy/i,
    /demonstrate|show|reveal|indicate|suggest/i,
  ];

  let summary = '';

  // Find problem statement
  const problemSentence = sentences.find(s => problemPatterns.some(p => p.test(s)));
  if (problemSentence) {
    summary = truncateSentence(problemSentence, maxLength * 0.5);
  }

  // Find solution statement
  const solutionSentence = sentences.find(s => solutionPatterns.some(p => p.test(s)));
  if (solutionSentence && summary.length + solutionSentence.length < maxLength) {
    summary += summary ? ' ' + truncateSentence(solutionSentence, maxLength - summary.length - 1) : truncateSentence(solutionSentence, maxLength);
  }

  // If no pattern matches, use first two sentences
  if (!summary) {
    const firstTwo = sentences.slice(0, 2).join(' ');
    summary = truncateAtWordBoundary(firstTwo, maxLength);
  }

  return summary;
}

/**
 * Truncate text at word boundary with ellipsis
 */
function truncateAtWordBoundary(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.substr(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    return truncated.substr(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Truncate a sentence intelligently
 */
function truncateSentence(sentence: string, maxLength: number): string {
  const cleaned = sentence.trim();
  if (cleaned.length <= maxLength) return cleaned;

  // Remove parenthetical expressions if too long
  const withoutParens = cleaned.replace(/\([^)]*\)/g, '').trim();
  if (withoutParens.length <= maxLength) return withoutParens;

  return truncateAtWordBoundary(cleaned, maxLength);
}

/**
 * Generate keyword-based tagline
 */
export function generateKeywordTagline(publication: {
  abstract?: string;
  description?: string;
  tags?: string[];
  category?: string;
}): string {
  const keywords = extractKeywords(
    (publication.abstract || publication.description || ''),
    3
  );

  if (keywords.length > 0) {
    const categoryPrefix = publication.category === 'thinking' ? 'Theory:' :
                          publication.category === 'doing' ? 'Practice:' :
                          publication.category === 'feeling' ? 'Experience:' : '';

    return `${categoryPrefix} ${keywords.map(k =>
      k.charAt(0).toUpperCase() + k.slice(1)
    ).join(' • ')}`;
  }

  if (publication.tags && publication.tags.length > 0) {
    return publication.tags.slice(0, 3).map(t =>
      t.charAt(0).toUpperCase() + t.slice(1)
    ).join(' • ');
  }

  return 'Research Publication';
}

/**
 * Format publication type for display
 */
export function getPublicationType(publication: {
  journal?: string;
  tags?: string[];
}): string {
  // Check tags for publication type
  const typeTags = ['book-chapter', 'journal-article', 'conference-paper', 'report', 'thesis', 'working-paper'];
  const foundType = publication.tags?.find(tag => typeTags.includes(tag.toLowerCase()));

  if (foundType) {
    return foundType.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  // Default based on journal presence
  return publication.journal ? 'Journal Article' : 'Publication';
}