'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Publication } from '@/lib/types/content';
import { ViewMode } from '@/lib/types/publications';
import { resolvePublisherLink, getPublisherButtonText } from '@/lib/utils/publisherResolver';
import {
  generateCompactSummary,
  generateModerateSummary,
  generateKeywordTagline,
  getPublicationType
} from '@/lib/utils/publicationSummary';
import {
  calculatePopupPosition,
  getPopupStyles,
  getArrowStyles,
  type PositionResult
} from '@/lib/utils/popupPositioning';

interface PublicationCardProps {
  publication: Publication;
  viewMode: ViewMode;
}

export default function PublicationCard({ publication, viewMode }: PublicationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [popupPosition, setPopupPosition] = useState<PositionResult | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Calculate smart popup position based on viewport
  useEffect(() => {
    if (!isHovered || !cardRef.current || !popupRef.current) return;

    const calculatePosition = () => {
      if (!cardRef.current || !popupRef.current) return;

      const cardRect = cardRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();

      const result = calculatePopupPosition(
        {
          top: cardRect.top + window.scrollY,
          left: cardRect.left + window.scrollX,
          right: cardRect.right + window.scrollX,
          bottom: cardRect.bottom + window.scrollY,
          width: cardRect.width,
          height: cardRect.height
        },
        { width: popupRect.width, height: popupRect.height },
        {
          preferredPosition: viewMode === 'compact' ? 'top' : 'bottom',
          offset: 12,
          padding: 20,
          constrainToViewport: true
        }
      );

      setPopupPosition(result);
    };

    // Initial calculation
    calculatePosition();

    // Recalculate on scroll or resize
    const handleUpdate = () => calculatePosition();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isHovered, viewMode]);

  // Get publisher link information
  const publisherInfo = resolvePublisherLink(publication);
  const publicationLink = publisherInfo?.url || null;
  const publisherButtonText = getPublisherButtonText(publisherInfo);

  // Format authors list
  const formatAuthors = (authors: string[], mode: ViewMode) => {
    if (!authors || authors.length === 0) return '';

    if (mode === 'compact') {
      return authors.length > 1 ? `${authors[0]} et al.` : authors[0];
    }

    if (mode === 'moderate' && authors.length > 3) {
      return `${authors.slice(0, 3).join(', ')} et al.`;
    }

    return authors.join(', ');
  };

  // Truncate abstract
  const truncateText = (text: string | undefined, maxLines: number) => {
    if (!text) return '';
    const words = text.split(' ');
    const approximateWordsPerLine = 15;
    const maxWords = maxLines * approximateWordsPerLine;

    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Full View - Single column, all details
  if (viewMode === 'full') {
    return (
      <article ref={cardRef} className="publication-card publication-card--full bg-white rounded-lg border border-[var(--border)] hover:border-[var(--scholar-blue)] transition-all hover:shadow-lg p-8">
        {/* Type Badge */}
        {publication.category && (
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 text-white text-xs font-montserrat rounded-full uppercase tracking-wide ${
              publication.category === 'thinking' ? 'bg-[var(--scholar-blue)]' :
              publication.category === 'feeling' ? 'bg-[var(--living-pink)]' :
              'bg-[var(--moura-teal)]'
            }`}>
              {publication.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h2 className="font-montserrat text-2xl font-bold text-[var(--ink-black)] mb-4">
          <Link
            href={`/publications/${publication.slug}`}
            className="hover:text-[var(--scholar-blue)] transition-colors"
          >
            {publication.title}
          </Link>
        </h2>

        {/* Authors with affiliations */}
        {publication.authors && publication.authors.length > 0 && (
          <p className="font-montserrat text-base text-[var(--charcoal-wash)] mb-4">
            <span className="font-semibold">Authors:</span> {formatAuthors(publication.authors, 'full')}
          </p>
        )}

        {/* Full Publication Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 text-sm font-lora text-[var(--muted-foreground)]">
          {publication.journal && (
            <div>
              <span className="font-semibold text-[var(--ink-black)]">Journal:</span> {publication.journal}
            </div>
          )}
          {publication.year && (
            <div>
              <span className="font-semibold text-[var(--ink-black)]">Year:</span> {publication.year}
            </div>
          )}
          {publication.volume && (
            <div>
              <span className="font-semibold text-[var(--ink-black)]">Volume:</span> {publication.volume}
              {publication.issue && ` (${publication.issue})`}
            </div>
          )}
          {publication.pages && (
            <div>
              <span className="font-semibold text-[var(--ink-black)]">Pages:</span> {publication.pages}
            </div>
          )}
          {publication.doi && (
            <div className="md:col-span-2">
              <span className="font-semibold text-[var(--ink-black)]">DOI:</span>{' '}
              {publicationLink && publicationLink.includes('doi.org') ? (
                <a
                  href={publicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--scholar-blue)] hover:underline"
                >
                  {publication.doi}
                </a>
              ) : (
                <span className="text-[var(--charcoal-wash)]">{publication.doi}</span>
              )}
            </div>
          )}
        </div>

        {/* Full Abstract */}
        {(publication.abstract || publication.description) && (
          <div className="mb-6">
            <h3 className="font-montserrat text-sm font-semibold text-[var(--ink-black)] mb-2 uppercase tracking-wide">
              Abstract
            </h3>
            <p className="font-lora text-[var(--charcoal-wash)] leading-relaxed text-justify">
              {publication.abstract || publication.description}
            </p>
          </div>
        )}

        {/* Keywords */}
        {publication.tags && publication.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="font-montserrat text-sm font-semibold text-[var(--ink-black)] mb-2 uppercase tracking-wide">
              Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {publication.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-[var(--studio-cream)] text-xs font-montserrat text-[var(--charcoal-wash)] rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-6 border-t border-[var(--border)]">
          <Link
            href={`/publications/${publication.slug}`}
            className="px-6 py-2 bg-[var(--scholar-blue)] text-white rounded font-montserrat text-sm hover:brightness-110 transition-all"
          >
            Read Full Paper
          </Link>

          {publication.pdfUrl && (
            <a
              href={publication.pdfUrl}
              download
              className="px-6 py-2 border border-[var(--scholar-blue)] text-[var(--scholar-blue)] rounded font-montserrat text-sm hover:bg-[var(--scholar-blue)] hover:text-white transition-all"
            >
              Download PDF
            </a>
          )}

          {publicationLink && (
            <a
              href={publicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 border border-[var(--border)] text-[var(--charcoal-wash)] rounded font-montserrat text-sm hover:border-[var(--scholar-blue)] transition-all"
            >
              {publisherButtonText}
            </a>
          )}

          <button
            type="button"
            className="px-6 py-2 border border-[var(--border)] text-[var(--charcoal-wash)] rounded font-montserrat text-sm hover:border-[var(--scholar-blue)] transition-all"
            onClick={(e) => {
              e.preventDefault();
              const citation = publication.citations?.apa || `${publication.authors?.join(', ')} (${publication.year}). ${publication.title}.`;
              navigator.clipboard.writeText(citation);
            }}
          >
            Copy Citation
          </button>
        </div>
      </article>
    );
  }

  // Moderate View - Three column grid (current default)
  if (viewMode === 'moderate') {
    return (
      <article
        ref={cardRef}
        className="publication-card publication-card--moderate bg-white rounded-lg border border-[var(--border)] hover:border-[var(--scholar-blue)] transition-all hover:shadow-lg p-6 relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Type Badge */}
        {publication.category && (
          <div className="mb-3">
            <span className={`inline-block px-3 py-1 text-white text-xs font-montserrat rounded-full uppercase tracking-wide ${
              publication.category === 'thinking' ? 'bg-[var(--scholar-blue)]' :
              publication.category === 'feeling' ? 'bg-[var(--living-pink)]' :
              'bg-[var(--moura-teal)]'
            }`}>
              {publication.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h2 className="font-montserrat text-lg font-bold text-[var(--ink-black)] mb-3">
          <Link
            href={`/publications/${publication.slug}`}
            className="hover:text-[var(--scholar-blue)] transition-colors"
          >
            {publication.title}
          </Link>
        </h2>

        {/* Authors (first 3) */}
        {publication.authors && publication.authors.length > 0 && (
          <p className="font-montserrat text-sm text-[var(--charcoal-wash)] mb-3">
            <span className="font-semibold">Authors:</span> {formatAuthors(publication.authors, 'moderate')}
          </p>
        )}

        {/* Publication Info */}
        <div className="flex flex-wrap gap-2 text-xs font-lora text-[var(--muted-foreground)] mb-4">
          {publication.journal && <span>{publication.journal}</span>}
          {publication.year && <span>• {publication.year}</span>}
        </div>

        {/* Optimized Brief Description */}
        <p className="font-lora text-sm text-[var(--charcoal-wash)] leading-relaxed mb-4 line-clamp-3 min-h-[3.6rem]">
          {generateModerateSummary(publication, 120)}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--border)]">
          <Link
            href={`/publications/${publication.slug}`}
            className="px-4 py-2 bg-[var(--scholar-blue)] text-white rounded font-montserrat text-xs hover:brightness-110 transition-all"
          >
            Read Paper
          </Link>

          {publication.pdfUrl && (
            <a
              href={publication.pdfUrl}
              download
              className="px-4 py-2 border border-[var(--border)] text-[var(--charcoal-wash)] rounded font-montserrat text-xs hover:border-[var(--scholar-blue)] transition-all"
            >
              PDF
            </a>
          )}

          {publicationLink && (
            <a
              href={publicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-[var(--border)] text-[var(--charcoal-wash)] rounded font-montserrat text-xs hover:border-[var(--scholar-blue)] transition-all"
            >
              {publisherButtonText}
            </a>
          )}
        </div>

        {/* Enhanced Hover Overlay with Smart Positioning */}
        {isHovered && (publication.abstract || publication.description) && popupPosition && (
          <div
            ref={popupRef}
            className="w-[450px] max-w-[90vw] p-6 bg-white border-2 border-[var(--scholar-blue)] rounded-lg shadow-2xl pointer-events-none"
            style={getPopupStyles(popupPosition)}
          >
            {/* Abstract */}
            <div className="mb-4">
              <h4 className="font-montserrat text-sm font-semibold text-[var(--ink-black)] mb-2 uppercase tracking-wide">
                Abstract
              </h4>
              <p className="font-lora text-sm text-[var(--charcoal-wash)] leading-relaxed">
                {truncateText(publication.abstract || publication.description, 8)}
              </p>
            </div>

            {/* Full author list if truncated */}
            {publication.authors && publication.authors.length > 3 && (
              <div className="mb-4 pb-4 border-b border-[var(--border)]">
                <p className="font-montserrat text-sm text-[var(--charcoal-wash)]">
                  <span className="font-semibold">All Authors:</span> {publication.authors.join(', ')}
                </p>
              </div>
            )}

            {/* Tags */}
            {publication.tags && publication.tags.length > 0 && (
              <div>
                <h4 className="font-montserrat text-xs font-semibold text-[var(--ink-black)] mb-2 uppercase tracking-wide">
                  Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {publication.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-[var(--studio-cream)] text-xs font-montserrat text-[var(--charcoal-wash)] rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Arrow Positioning */}
            {popupPosition.arrowPosition && (
              <div
                className="absolute w-0 h-0 border-[var(--scholar-blue)]"
                style={getArrowStyles(popupPosition) || {}}
              />
            )}
          </div>
        )}
      </article>
    );
  }

  // Compact View - Multiple per row with hover
  return (
    <article
      ref={cardRef}
      className="publication-card publication-card--compact bg-white rounded-lg border border-[var(--border)] hover:border-[var(--scholar-blue)] transition-all hover:shadow-lg p-5 relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Type Badge */}
      {publication.category && (
        <div className="mb-3">
          <span className={`inline-block px-2 py-1 text-white text-xs font-montserrat rounded-full uppercase tracking-wide ${
            publication.category === 'thinking' ? 'bg-[var(--scholar-blue)]' :
            publication.category === 'feeling' ? 'bg-[var(--living-pink)]' :
            'bg-[var(--moura-teal)]'
          }`}>
            {publication.category}
          </span>
        </div>
      )}

      {/* Title (2 lines max) */}
      <h2 className="font-montserrat text-base font-bold text-[var(--ink-black)] mb-2 line-clamp-2 min-h-[3rem]">
        <Link
          href={`/publications/${publication.slug}`}
          className="hover:text-[var(--scholar-blue)] transition-colors"
        >
          {publication.title}
        </Link>
      </h2>

      {/* First Author */}
      <p className="font-montserrat text-sm text-[var(--charcoal-wash)] mb-1">
        {formatAuthors(publication.authors || [], 'compact')}
      </p>

      {/* Year and Journal */}
      <div className="flex flex-wrap gap-2 text-xs font-lora text-[var(--muted-foreground)] mb-3">
        {publication.year && <span>{publication.year}</span>}
        {publication.journal && publication.year && <span>•</span>}
        {publication.journal && <span className="line-clamp-1">{publication.journal}</span>}
      </div>

      {/* Optimized Keyword-based Description */}
      <p className="font-lora text-sm text-[var(--charcoal-wash)] line-clamp-2 mb-4 leading-relaxed italic">
        {generateKeywordTagline(publication)}
      </p>

      {/* Icon Buttons */}
      <div className="flex gap-2">
        <Link
          href={`/publications/${publication.slug}`}
          className="p-2 bg-[var(--scholar-blue)] text-white rounded hover:brightness-110 transition-all"
          title="Read Paper"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </Link>

        {publication.pdfUrl && (
          <a
            href={publication.pdfUrl}
            download
            className="p-2 border border-[var(--border)] text-[var(--charcoal-wash)] rounded hover:border-[var(--scholar-blue)] transition-all"
            title="Download PDF"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </a>
        )}

        {publicationLink && (
          <a
            href={publicationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-[var(--border)] text-[var(--charcoal-wash)] rounded hover:border-[var(--scholar-blue)] transition-all"
            title={publisherButtonText}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}
      </div>

      {/* Enhanced Hover Overlay with Smart Positioning */}
      {isHovered && popupPosition && (
        <div
          ref={popupRef}
          className="w-[400px] max-w-[90vw] p-6 bg-white border-2 border-[var(--scholar-blue)] rounded-lg shadow-2xl pointer-events-none"
          style={getPopupStyles(popupPosition)}
        >
          {/* Category Badge */}
          {publication.category && (
            <div className="mb-3">
              <span className={`inline-block px-3 py-1 text-white text-xs font-montserrat rounded-full uppercase tracking-wide ${
                publication.category === 'thinking' ? 'bg-[var(--scholar-blue)]' :
                publication.category === 'feeling' ? 'bg-[var(--living-pink)]' :
                'bg-[var(--moura-teal)]'
              }`}>
                {publication.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="font-montserrat text-lg font-bold text-[var(--ink-black)] mb-3">
            {publication.title}
          </h3>

          {/* Authors */}
          {publication.authors && publication.authors.length > 0 && (
            <p className="font-montserrat text-sm text-[var(--charcoal-wash)] mb-3">
              <span className="font-semibold">Authors:</span> {formatAuthors(publication.authors, 'moderate')}
            </p>
          )}

          {/* Publication Info */}
          <div className="flex flex-wrap gap-2 text-xs font-lora text-[var(--muted-foreground)] mb-4">
            {publication.journal && <span>{publication.journal}</span>}
            {publication.year && <span>• {publication.year}</span>}
          </div>

          {/* Abstract (truncated) */}
          {(publication.abstract || publication.description) && (
            <div className="mb-4">
              <h4 className="font-montserrat text-xs font-semibold text-[var(--ink-black)] mb-2 uppercase tracking-wide">
                Abstract
              </h4>
              <p className="font-lora text-sm text-[var(--charcoal-wash)] leading-relaxed">
                {truncateText(publication.abstract || publication.description, 5)}
              </p>
            </div>
          )}

          {/* Tags */}
          {publication.tags && publication.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {publication.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-[var(--studio-cream)] text-xs font-montserrat text-[var(--charcoal-wash)] rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Smart Arrow Positioning */}
          {popupPosition.arrowPosition && (
            <div
              className="absolute w-0 h-0 border-[var(--scholar-blue)]"
              style={getArrowStyles(popupPosition) || {}}
            />
          )}
        </div>
      )}
    </article>
  );
}
