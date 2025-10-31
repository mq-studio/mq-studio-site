// Content service for managing MQ Studio content
import { Content, ContentType, ContentCategory, SearchResult } from '@/lib/types/content';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Content directory structure
const CONTENT_DIR = path.join(process.cwd(), 'content');
const CONTENT_PATHS = {
  publications: path.join(CONTENT_DIR, 'publications'),
  artworks: path.join(CONTENT_DIR, 'artworks'),
  musings: path.join(CONTENT_DIR, 'musings'),
  projects: path.join(CONTENT_DIR, 'projects'),
};

export class ContentService {
  private contentCache: Map<string, Content> = new Map();
  private initialized = false;

  // Initialize the service and load all content
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Ensure content directories exist
    await this.ensureDirectories();

    // Load all content into cache
    await this.loadAllContent();

    this.initialized = true;
  }

  // Ensure all content directories exist
  private async ensureDirectories(): Promise<void> {
    for (const dir of Object.values(CONTENT_PATHS)) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  // Load all content from the file system
  private async loadAllContent(): Promise<void> {
    const types: ContentType[] = ['publication', 'artwork', 'musing', 'project'];

    for (const type of types) {
      const dir = CONTENT_PATHS[`${type}s`];
      try {
        const files = await fs.readdir(dir);
        const mdFiles = files.filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

        for (const file of mdFiles) {
          const content = await this.loadContentFile(type, file);
          if (content) {
            this.contentCache.set(content.id, content);
          }
        }

        // Load archive musings from subdirectories
        if (type === 'musing') {
          const archiveDir = path.join(dir, 'archive');
          try {
            const years = await fs.readdir(archiveDir);
            for (const year of years) {
              const yearPath = path.join(archiveDir, year);
              const stat = await fs.stat(yearPath);

              if (stat.isDirectory()) {
                const archiveFiles = await fs.readdir(yearPath);
                const archiveMdFiles = archiveFiles.filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

                for (const file of archiveMdFiles) {
                  const content = await this.loadContentFile(type, file, yearPath, year);
                  if (content) {
                    this.contentCache.set(content.id, content);
                  }
                }
              }
            }
          } catch (error) {
            console.warn(`No archive content found for musings:`, error);
          }
        }
      } catch (error) {
        console.warn(`No content found for type ${type}:`, error);
      }
    }
  }

  // Map WordPress categories to MQ Studio categories
  private mapCategory(wpCategory: string | undefined, isLegacy: boolean): ContentCategory {
    if (!wpCategory || wpCategory === 'Uncategorized') {
      // Default to 'thinking' for legacy uncategorized posts
      return isLegacy ? 'thinking' : 'thinking';
    }

    const lowerCat = wpCategory.toLowerCase();

    // Direct matches
    if (lowerCat === 'thinking' || lowerCat === 'feeling' || lowerCat === 'doing') {
      return lowerCat as ContentCategory;
    }

    // WordPress category mappings based on content analysis
    const categoryMap: Record<string, ContentCategory> = {
      // Thinking categories
      'governance': 'thinking',
      'leadership': 'thinking',
      'design': 'thinking',
      'academic': 'thinking',
      'research': 'thinking',
      'innovation': 'thinking',
      'climate': 'thinking',
      'sustainability': 'thinking',
      'urban design': 'thinking',
      'policy': 'thinking',
      'green/sustainable cities': 'thinking',
      'sustainable cities': 'thinking',
      'green cities': 'thinking',

      // Feeling categories
      'art': 'feeling',
      'travel': 'feeling',
      'culture': 'feeling',
      'personal': 'feeling',
      'reflection': 'feeling',
      'food + design': 'feeling',
      'food': 'feeling',
      'food design': 'feeling',

      // Doing categories
      'project': 'doing',
      'implementation': 'doing',
      'practice': 'doing',
      'conference': 'doing',
      'event': 'doing',
    };

    return categoryMap[lowerCat] || 'thinking';
  }

  // Generate excerpt from content
  private generateExcerpt(content: string, existingExcerpt: string | undefined): string {
    if (existingExcerpt && existingExcerpt.trim().length > 0) {
      return existingExcerpt;
    }

    // Remove markdown formatting
    let text = content
      .replace(/^---[\s\S]*?---/, '') // Remove frontmatter
      .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Replace links with text
      .replace(/#{1,6}\s/g, '') // Remove headings
      .replace(/[*_~`]/g, '') // Remove formatting
      .trim();

    // Get first substantial paragraph
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 50);
    if (paragraphs.length > 0) {
      let excerpt = paragraphs[0].substring(0, 300);
      if (excerpt.length === 300) {
        excerpt = excerpt.substring(0, excerpt.lastIndexOf(' ')) + '...';
      }
      return excerpt;
    }

    // Fallback to first 200 chars
    const fallback = text.substring(0, 200);
    return fallback.length === 200 ? fallback.substring(0, fallback.lastIndexOf(' ')) + '...' : fallback;
  }

  // Load a single content file
  private async loadContentFile(
    type: ContentType,
    filename: string,
    customDir?: string,
    archiveYear?: string
  ): Promise<Content | null> {
    const dir = customDir || CONTENT_PATHS[`${type}s`];
    const filePath = path.join(dir, filename);

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      // Generate ID from filename
      const id = filename.replace(/\.(md|mdx)$/, '');

      // Base content properties
      const baseContent = {
        id,
        type,
        slug: data.slug || id,
        title: data.title || 'Untitled',
        description: data.description,
        date: data.date || new Date().toISOString(),
        tags: data.tags || [],
        featured: data.featured || false,
        metadata: data.metadata || {},
        createdAt: data.createdAt || data.date || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      };

      // Type-specific properties
      switch (type) {
        case 'publication':
          return {
            ...baseContent,
            type: 'publication',
            category: 'thinking',
            authors: data.authors || ['Moura Quayle'],
            abstract: data.abstract || content.substring(0, 500),
            journal: data.journal,
            volume: data.volume,
            issue: data.issue,
            pages: data.pages,
            doi: data.doi,
            pdfUrl: data.pdfUrl,
            pdfSize: data.pdfSize,
            citations: data.citations,
            relatedPublications: data.relatedPublications,
          } as Content;

        case 'artwork':
          return {
            ...baseContent,
            type: 'artwork',
            category: 'feeling',
            medium: data.medium || 'watercolor',
            dimensions: data.dimensions,
            imageUrl: data.imageUrl || `/images/artworks/${id}.jpg`,
            thumbnailUrl: data.thumbnailUrl,
            highResUrl: data.highResUrl,
            year: data.year,
            location: data.location,
            availability: data.availability,
            price: data.price,
            artistStatement: data.artistStatement || content,
            exhibitionHistory: data.exhibitionHistory,
          } as Content;

        case 'musing':
          // Extract YouTube video ID if videoUrl is provided
          let videoId = data.videoId;
          if (data.videoUrl && !videoId) {
            const match = data.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
            videoId = match ? match[1] : undefined;
          }

          const isLegacy = data.legacy || !!archiveYear;
          const mappedCategory = this.mapCategory(data.category, isLegacy);
          const generatedExcerpt = this.generateExcerpt(content, data.excerpt);

          return {
            ...baseContent,
            type: 'musing',
            category: mappedCategory,
            content,
            excerpt: generatedExcerpt,
            audioUrl: data.audioUrl,
            audioDuration: data.audioDuration,
            videoUrl: data.videoUrl,
            videoId,
            readingTime: Math.ceil(content.split(' ').length / 200),
            relatedContent: data.relatedContent,
            davidNote: data.davidNote,
            metadata: {
              ...data.metadata,
              legacy: isLegacy,
              archiveYear: archiveYear,
              originalCategory: data.category,
            },
          } as Content;

        case 'project':
          return {
            ...baseContent,
            type: 'project',
            category: 'doing',
            status: data.status || 'completed',
            startDate: data.startDate,
            endDate: data.endDate,
            role: data.role,
            collaborators: data.collaborators,
            location: data.location,
            client: data.client,
            outcomes: data.outcomes,
            images: data.images,
            documents: data.documents,
            externalLinks: data.externalLinks,
          } as Content;

        default:
          return null;
      }
    } catch (error) {
      console.error(`Error loading content file ${filename}:`, error);
      return null;
    }
  }

  // Get all content
  async getAllContent(): Promise<Content[]> {
    await this.initialize();
    return Array.from(this.contentCache.values());
  }

  // Get content by ID
  async getContentById(id: string): Promise<Content | null> {
    await this.initialize();
    return this.contentCache.get(id) || null;
  }

  // Get content by slug
  async getContentBySlug(slug: string): Promise<Content | null> {
    await this.initialize();
    const content = Array.from(this.contentCache.values());
    return content.find(c => c.slug === slug) || null;
  }

  // Get content by type
  async getContentByType(type: ContentType): Promise<Content[]> {
    await this.initialize();
    const content = Array.from(this.contentCache.values());
    return content.filter(c => c.type === type);
  }

  // Get content by category
  async getContentByCategory(category: ContentCategory): Promise<Content[]> {
    await this.initialize();
    const content = Array.from(this.contentCache.values());
    return content.filter(c => c.category === category);
  }

  // Get featured content
  async getFeaturedContent(): Promise<Content[]> {
    await this.initialize();
    const content = Array.from(this.contentCache.values());
    return content.filter(c => c.featured);
  }

  // Get recent content
  async getRecentContent(limit = 6): Promise<Content[]> {
    await this.initialize();
    const content = Array.from(this.contentCache.values());
    return content
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  // Search content (basic implementation - replace with Algolia/Elasticsearch later)
  async searchContent(query: string): Promise<SearchResult[]> {
    await this.initialize();
    const content = Array.from(this.contentCache.values());
    const lowerQuery = query.toLowerCase();

    const results: SearchResult[] = [];

    for (const item of content) {
      let score = 0;
      const highlights: any = {};

      // Search in title (highest weight)
      if (item.title.toLowerCase().includes(lowerQuery)) {
        score += 10;
        highlights.title = this.highlightText(item.title, query);
      }

      // Search in description
      if (item.description?.toLowerCase().includes(lowerQuery)) {
        score += 5;
        highlights.description = this.highlightText(item.description, query);
      }

      // Search in tags
      if (item.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        score += 3;
      }

      // Type-specific searches
      if ('content' in item && item.content?.toLowerCase().includes(lowerQuery)) {
        score += 2;
        highlights.content = this.highlightText(item.content.substring(0, 200), query);
      }

      if ('abstract' in item && item.abstract?.toLowerCase().includes(lowerQuery)) {
        score += 4;
        highlights.description = this.highlightText(item.abstract.substring(0, 200), query);
      }

      if (score > 0) {
        results.push({ content: item, score, highlights });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  // Helper to highlight search terms
  private highlightText(text: string, query: string): string {
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // Get related content (basic implementation)
  async getRelatedContent(contentId: string, limit = 4): Promise<Content[]> {
    await this.initialize();
    const source = this.contentCache.get(contentId);
    if (!source) return [];

    const content = Array.from(this.contentCache.values());
    const related: Array<{ content: Content; score: number }> = [];

    for (const item of content) {
      if (item.id === contentId) continue;

      let score = 0;

      // Same type
      if (item.type === source.type) score += 2;

      // Same category
      if (item.category === source.category) score += 3;

      // Shared tags
      const sharedTags = item.tags.filter(tag => source.tags.includes(tag));
      score += sharedTags.length * 2;

      if (score > 0) {
        related.push({ content: item, score });
      }
    }

    return related
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(r => r.content);
  }
}

// Singleton instance
export const contentService = new ContentService();