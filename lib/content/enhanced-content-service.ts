/**
 * Enhanced Content Service with Archive Support
 *
 * Extends the existing content service to include the WordPress
 * blog archive (2009-2017) while maintaining backward compatibility.
 */

import { Content, ContentType } from '@/lib/types/content';
import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Type for legacy posts - extend the union with additional properties
export type LegacyContent = Content & {
  legacy?: boolean;
  originalUrl?: string;
  originalDate?: string;
  era?: 'early' | 'middle' | 'late';
};

const CONTENT_DIR = path.join(process.cwd(), 'content');
const ARCHIVE_DIR = path.join(CONTENT_DIR, 'musings', 'archive');

export class EnhancedContentService {
  private contentCache: Map<string, Content> = new Map();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await this.loadAllContent();
    this.initialized = true;
  }

  private async loadAllContent(): Promise<void> {
    // Load current content (existing functionality)
    await this.loadCurrentContent();

    // Load archive content (new functionality)
    await this.loadArchiveContent();
  }

  private async loadCurrentContent(): Promise<void> {
    const musingsDir = path.join(CONTENT_DIR, 'musings');

    try {
      const files = await fs.readdir(musingsDir);
      const mdFiles = files.filter(f =>
        (f.endsWith('.md') || f.endsWith('.mdx')) && f !== 'archive'
      );

      for (const file of mdFiles) {
        const content = await this.loadMusingFile(musingsDir, file, false);
        if (content) {
          this.contentCache.set(content.id, content);
        }
      }
    } catch (error) {
      console.warn('Error loading current musings:', error);
    }
  }

  private async loadArchiveContent(): Promise<void> {
    try {
      // Get year directories
      const years = await fs.readdir(ARCHIVE_DIR);

      for (const year of years) {
        const yearPath = path.join(ARCHIVE_DIR, year);
        const stat = await fs.stat(yearPath);

        if (stat.isDirectory()) {
          const files = await fs.readdir(yearPath);
          const mdFiles = files.filter(f =>
            f.endsWith('.md') || f.endsWith('.mdx')
          );

          for (const file of mdFiles) {
            const content = await this.loadMusingFile(
              yearPath,
              file,
              true,
              parseInt(year)
            );
            if (content) {
              this.contentCache.set(content.id, content);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Error loading archive musings:', error);
    }
  }

  private async loadMusingFile(
    dir: string,
    filename: string,
    isLegacy: boolean = false,
    year?: number
  ): Promise<LegacyContent | null> {
    const filePath = path.join(dir, filename);

    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      // Generate ID
      const id = isLegacy
        ? `archive-${year}-${filename.replace(/\.(md|mdx)$/, '')}`
        : filename.replace(/\.(md|mdx)$/, '');

      // Determine era for legacy posts
      let era: 'early' | 'middle' | 'late' | undefined;
      if (isLegacy && year) {
        if (year <= 2011) era = 'early';
        else if (year <= 2014) era = 'middle';
        else era = 'late';
      }

      // Create content object
      const musingContent = {
        id,
        type: 'musing' as const,
        slug: data.slug || filename.replace(/\.(md|mdx)$/, ''),
        title: data.title || 'Untitled',
        description: data.excerpt || content.substring(0, 200),
        date: data.date || new Date().toISOString(),
        tags: data.tags || [],
        featured: data.featured || false,
        category: (data.category || 'thinking') as 'feeling' | 'thinking' | 'doing',
        metadata: {
          ...data.metadata,
          author: data.author || 'Moura Quayle',
          audioUrl: data.audioUrl,
        },
        createdAt: data.date || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        content: content,
        excerpt: data.excerpt,
        audioUrl: data.audioUrl,
        // Add legacy fields if applicable
        ...(isLegacy && {
          legacy: true,
          originalUrl: data.originalUrl,
          originalDate: data.date,
          era
        })
      } as LegacyContent;

      return musingContent;
    } catch (error) {
      console.error(`Error loading ${filePath}:`, error);
      return null;
    }
  }

  async getAllContent(): Promise<Content[]> {
    await this.initialize();
    return Array.from(this.contentCache.values());
  }

  async getMusings(includeArchive: boolean = true): Promise<LegacyContent[]> {
    await this.initialize();

    const allContent = Array.from(this.contentCache.values());
    const musings = allContent.filter(c => c.type === 'musing') as LegacyContent[];

    if (!includeArchive) {
      return musings.filter(m => !m.legacy);
    }

    return musings;
  }

  async getArchiveMusings(): Promise<LegacyContent[]> {
    await this.initialize();

    const allContent = Array.from(this.contentCache.values());
    return allContent.filter(c =>
      c.type === 'musing' && (c as LegacyContent).legacy
    ) as LegacyContent[];
  }

  async getMusingsByEra(era: 'early' | 'middle' | 'late'): Promise<LegacyContent[]> {
    const archiveMusings = await this.getArchiveMusings();
    return archiveMusings.filter(m => m.era === era);
  }

  getMusingStats() {
    const allContent = Array.from(this.contentCache.values());
    const musings = allContent.filter(c => c.type === 'musing') as LegacyContent[];

    const current = musings.filter(m => !m.legacy);
    const archive = musings.filter(m => m.legacy);

    // Count by year
    const yearCounts: Record<string, number> = {};
    musings.forEach(musing => {
      if (musing.date) {
        const year = new Date(musing.date).getFullYear().toString();
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    });

    return {
      total: musings.length,
      current: current.length,
      archive: archive.length,
      byYear: yearCounts,
      eras: {
        early: archive.filter(m => m.era === 'early').length,
        middle: archive.filter(m => m.era === 'middle').length,
        late: archive.filter(m => m.era === 'late').length
      }
    };
  }
}

// Export singleton instance
export const enhancedContentService = new EnhancedContentService();