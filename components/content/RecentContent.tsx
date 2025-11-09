'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Content } from '@/lib/types/content';

interface RecentContentProps {
  content?: Content[]; // Optional - for server component usage
}

export default function RecentContent({ content: propContent }: RecentContentProps) {
  const [fetchedContent, setFetchedContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(!propContent);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if content wasn't provided as prop (client component usage)
    if (!propContent) {
      fetchRecentContent();
    }
  }, [propContent]);

  const fetchRecentContent = async () => {
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recent', limit: 6 }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      setFetchedContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Use prop content if provided, otherwise use fetched content
  const content = propContent || fetchedContent;

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'publication':
        return 'PUBLICATION';
      case 'artwork':
        return 'ARTWORK';
      case 'musing':
        return 'MUSING';
      case 'project':
        return 'PROJECT';
      default:
        return type.toUpperCase();
    }
  };

  const getContentColor = (category: string) => {
    switch (category) {
      case 'feeling':
        return 'text-[var(--vibrant-magenta)]';
      case 'thinking':
        return 'text-[var(--scholar-blue)]';
      case 'doing':
        return 'text-[var(--moura-teal)]';
      default:
        return 'text-[var(--muted-foreground)]';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getContentLink = (item: Content) => {
    switch (item.type) {
      case 'publication':
        return `/publications/${item.slug}`;
      case 'artwork':
        return `/artworks/${item.slug}`;
      case 'musing':
        return `/musings/${item.slug}`;
      case 'project':
        return `/projects/${item.slug}`;
      default:
        // Exhaustive check - all cases should be handled above
        const _exhaustiveCheck: never = item;
        return `/${(item as any).type}s/${(item as any).slug}`;
    }
  };

  // Loading state (only for client-side fetching)
  if (loading && !propContent) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg p-6 border border-[var(--border)] animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-20 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  // Error state (only for client-side fetching)
  if (error && !propContent) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--muted-foreground)]">
          Unable to load recent content. Please try again later.
        </p>
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--muted-foreground)]">
          No content available yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {content.map((item) => (
        <Link
          key={item.id}
          href={getContentLink(item)}
          className="group block"
        >
          <article className="bg-white rounded-lg p-6 border border-[var(--border)] hover:shadow-md transition-shadow h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-montserrat font-semibold ${getContentColor(
                  item.category
                )}`}
              >
                {getContentTypeLabel(item.type)}
              </span>
              {item.featured && (
                <span className="text-xs bg-[var(--moura-teal)] text-white px-2 py-1 rounded">
                  FEATURED
                </span>
              )}
            </div>

            <h3 className="font-montserrat font-semibold mb-2 text-[var(--ink-black)] group-hover:text-[var(--moura-teal)] transition-colors">
              {item.title}
            </h3>

            <div className="font-lora text-sm text-[var(--charcoal-wash)] line-clamp-3 flex-grow">
              {item.description ||
               ('abstract' in item ? item.abstract :
                'excerpt' in item ? item.excerpt :
                'artistStatement' in item ? item.artistStatement :
                'Brief description coming soon...')}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-[var(--muted-foreground)]">
              <span>{formatDate(item.date)}</span>
              {item.tags.length > 0 && (
                <span className="text-xs">
                  {item.tags[0]}
                  {item.tags.length > 1 && ` +${item.tags.length - 1}`}
                </span>
              )}
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}