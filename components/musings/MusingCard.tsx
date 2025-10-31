'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Musing } from '@/lib/types/content';

interface MusingCardProps {
  musing: Musing;
}

export default function MusingCard({ musing }: MusingCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'thinking':
        return 'var(--scholar-blue)';
      case 'feeling':
        return 'var(--living-pink)';
      case 'doing':
        return 'var(--moura-teal)';
      default:
        return 'var(--scholar-blue)';
    }
  };

  const getCategoryBgColor = (category: string) => {
    switch (category) {
      case 'thinking':
        return 'rgba(44, 89, 133, 0.1)';
      case 'feeling':
        return 'rgba(233, 30, 99, 0.1)';
      case 'doing':
        return 'rgba(0, 168, 168, 0.1)';
      default:
        return 'rgba(44, 89, 133, 0.1)';
    }
  };

  return (
    <article className="bg-white rounded-lg border border-[var(--border)] hover:border-[var(--moura-teal)] transition-all hover:shadow-lg overflow-hidden">
      <Link href={`/musings/${musing.slug}`} className="block">
        {/* Video Thumbnail or Category Header */}
        {musing.videoId ? (
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <Image
              src={`https://img.youtube.com/vi/${musing.videoId}/maxresdefault.jpg`}
              alt={musing.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition-all">
              <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[var(--scholar-blue)] ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="h-32 flex items-center justify-center"
            style={{
              backgroundColor: getCategoryBgColor(musing.category),
              borderBottom: `3px solid ${getCategoryColor(musing.category)}`,
            }}
          >
            <span
              className="text-2xl font-montserrat font-bold uppercase tracking-wide"
              style={{ color: getCategoryColor(musing.category) }}
            >
              {musing.category}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Category Badge */}
          <div className="mb-3">
            <span
              className="inline-block px-3 py-1 text-xs font-montserrat font-semibold rounded-full uppercase tracking-wide"
              style={{
                backgroundColor: getCategoryBgColor(musing.category),
                color: getCategoryColor(musing.category),
              }}
            >
              {musing.category}
            </span>
            {musing.videoId && (
              <span className="ml-2 inline-block px-3 py-1 text-xs font-montserrat font-semibold rounded-full uppercase tracking-wide bg-[var(--studio-cream)] text-[var(--charcoal-wash)]">
                Video
              </span>
            )}
            {musing.audioUrl && (
              <span className="ml-2 inline-block px-3 py-1 text-xs font-montserrat font-semibold rounded-full uppercase tracking-wide bg-[var(--studio-cream)] text-[var(--charcoal-wash)]">
                Audio
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="font-montserrat text-xl font-bold text-[var(--ink-black)] mb-3 hover:text-[var(--moura-teal)] transition-colors">
            {musing.title}
          </h2>

          {/* Excerpt */}
          {musing.excerpt && (
            <p className="font-lora text-[var(--charcoal-wash)] leading-relaxed mb-4 line-clamp-3">
              {musing.excerpt}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
            <time className="font-lora">{formatDate(musing.date)}</time>
            {musing.readingTime && !musing.videoId && (
              <span className="font-montserrat">{musing.readingTime} min read</span>
            )}
          </div>

          {/* Tags */}
          {musing.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[var(--border)]">
              {musing.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs font-montserrat bg-[var(--studio-cream)] text-[var(--charcoal-wash)] rounded"
                >
                  {tag}
                </span>
              ))}
              {musing.tags.length > 3 && (
                <span className="px-2 py-1 text-xs font-montserrat text-[var(--muted-foreground)]">
                  +{musing.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
