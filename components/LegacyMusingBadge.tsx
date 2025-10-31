/**
 * LegacyMusingBadge Component
 *
 * A subtle visual indicator for archived blog posts from 2009-2017.
 * Follows the project priority of "Great Aesthetic Design" while
 * maintaining visual harmony with current content.
 */

import React from 'react';

interface LegacyMusingBadgeProps {
  originalDate: string;
  originalUrl?: string;
  className?: string;
}

export const LegacyMusingBadge: React.FC<LegacyMusingBadgeProps> = ({
  originalDate,
  originalUrl,
  className = ''
}) => {
  // Parse year from date for era-specific styling
  const year = new Date(originalDate).getFullYear();
  const era = year <= 2011 ? 'early' : year <= 2014 ? 'middle' : 'late';

  return (
    <div className={`legacy-badge ${era} ${className}`}>
      {/* Subtle badge with archive icon */}
      <span className="archive-indicator">
        <svg
          className="archive-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
        </svg>
        <span className="archive-text">From the Archives</span>
      </span>

      {/* Original publication year */}
      <span className="archive-year">{year}</span>

      {/* Optional link to original */}
      {originalUrl && (
        <a
          href={originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="original-link"
          title="View original post on WordPress"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </a>
      )}

      <style jsx>{`
        .legacy-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.25rem 0.75rem;
          margin-bottom: 1rem;
          background: var(--muted, #FFF8F0);
          border-left: 3px solid var(--border, #D8D5CC);
          border-radius: 0 4px 4px 0;
          font-size: 0.875rem;
          color: var(--muted-foreground, #4A4A4A);
          transition: all 0.2s ease;
        }

        /* Era-specific accent colors */
        .legacy-badge.early {
          border-left-color: var(--secondary, #2C5985); /* Scholar Blue for academic period */
        }

        .legacy-badge.middle {
          border-left-color: var(--accent, #E91E63); /* Living Pink for personal period */
        }

        .legacy-badge.late {
          border-left-color: var(--primary, #00A8A8); /* Moura Teal for book period */
        }

        .archive-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .archive-icon {
          opacity: 0.7;
        }

        .archive-text {
          font-style: italic;
        }

        .archive-year {
          font-weight: 500;
          padding: 0 0.5rem;
          border-left: 1px solid var(--border, #D8D5CC);
        }

        .original-link {
          display: flex;
          align-items: center;
          opacity: 0.5;
          transition: opacity 0.2s ease;
        }

        .original-link:hover {
          opacity: 1;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .legacy-badge {
            font-size: 0.75rem;
            padding: 0.2rem 0.5rem;
          }

          .archive-text {
            display: none; /* Show only icon on mobile */
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Usage Example in a Musing component:
 *
 * ```tsx
 * import { LegacyMusingBadge } from '@/components/LegacyMusingBadge';
 *
 * export default function Musing({ musing }) {
 *   return (
 *     <article>
 *       {musing.legacy && (
 *         <LegacyMusingBadge
 *           originalDate={musing.originalDate}
 *           originalUrl={musing.originalUrl}
 *         />
 *       )}
 *       <h1>{musing.title}</h1>
 *       <div>{musing.content}</div>
 *     </article>
 *   );
 * }
 * ```
 */