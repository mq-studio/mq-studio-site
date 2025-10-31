// Content type definitions for MQ Studio

export type ContentType = 'publication' | 'artwork' | 'musing' | 'project';
export type ContentCategory = 'feeling' | 'thinking' | 'doing';

// Base content interface that all content types extend
export interface BaseContent {
  id: string;
  type: ContentType;
  category: ContentCategory;
  title: string;
  slug: string;
  description?: string;
  date: string; // ISO date string
  tags: string[];
  featured?: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Publication (Academic papers, books, policy documents)
export interface Publication extends BaseContent {
  type: 'publication';
  category: 'thinking' | 'feeling' | 'doing'; // TFD categories
  authors: string[];
  abstract?: string;
  year?: number;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  pdfUrl?: string;
  pdfSize?: number; // in bytes
  externalUrl?: string;
  publisherUrl?: string; // Direct publisher URL (alternative to externalUrl)
  citations?: {
    apa: string;
    mla: string;
    bibtex: string;
  };
  relatedPublications?: string[]; // IDs of related publications
}

// Artwork (Watercolors, calligraphy, mixed media)
export interface Artwork extends BaseContent {
  type: 'artwork';
  category: 'feeling';
  medium: 'watercolor' | 'calligraphy' | 'mixed-media' | 'other';
  dimensions?: {
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  imageUrl: string;
  thumbnailUrl?: string;
  highResUrl?: string;
  year?: number;
  location?: string; // Where the artwork is/was displayed
  availability?: 'available' | 'sold' | 'private-collection' | 'exhibition';
  price?: number;
  artistStatement?: string;
  exhibitionHistory?: Array<{
    venue: string;
    date: string;
    location: string;
  }>;
}

// Musing (Blog posts, reflections, thoughts)
export interface Musing extends BaseContent {
  type: 'musing';
  category: 'feeling' | 'thinking' | 'doing'; // Musings can be any category
  content: string; // Markdown content
  excerpt?: string;
  audioUrl?: string;
  audioDuration?: number; // in seconds
  videoUrl?: string; // YouTube video URL
  videoId?: string; // Extracted YouTube video ID
  readingTime?: number; // in minutes
  relatedContent?: string[]; // IDs of related content
  davidNote?: string; // Marginalia from David Fushtey
}

// Project (Landscape design, governance initiatives, collaborations)
export interface Project extends BaseContent {
  type: 'project';
  category: 'doing';
  status: 'completed' | 'ongoing' | 'planned';
  startDate?: string;
  endDate?: string;
  role?: string;
  collaborators?: string[];
  location?: string;
  client?: string;
  outcomes?: string[];
  images?: Array<{
    url: string;
    caption?: string;
  }>;
  documents?: Array<{
    title: string;
    url: string;
    type: string; // PDF, DOC, etc.
  }>;
  externalLinks?: Array<{
    title: string;
    url: string;
  }>;
}

// Union type for all content
export type Content = Publication | Artwork | Musing | Project;

// Search result interface
export interface SearchResult {
  content: Content;
  score: number;
  highlights?: {
    title?: string;
    description?: string;
    content?: string;
  };
}

// Collection interface for curated sets
export interface Collection {
  id: string;
  title: string;
  description: string;
  slug: string;
  items: string[]; // Content IDs
  coverImage?: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Helper type guards
export const isPublication = (content: Content): content is Publication =>
  content.type === 'publication';

export const isArtwork = (content: Content): content is Artwork =>
  content.type === 'artwork';

export const isMusing = (content: Content): content is Musing =>
  content.type === 'musing';

export const isProject = (content: Content): content is Project =>
  content.type === 'project';