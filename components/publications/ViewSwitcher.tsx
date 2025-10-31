'use client';

import { ViewMode } from '@/lib/types/publications';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div
      className="flex items-center gap-2 p-1 bg-white border border-[var(--border)] rounded-lg shadow-sm"
      role="group"
      aria-label="Publication view mode selector"
    >
      {/* Full View Button */}
      <button
        onClick={() => onViewChange('full')}
        className={`
          p-2 rounded transition-all duration-200
          ${currentView === 'full'
            ? 'bg-[var(--scholar-blue)] text-white'
            : 'text-[var(--charcoal-wash)] hover:bg-[var(--studio-cream)]'
          }
        `}
        aria-label="Full view - single column with all details"
        aria-pressed={currentView === 'full'}
        title="Full View"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
        </svg>
      </button>

      {/* Moderate View Button (Default) */}
      <button
        onClick={() => onViewChange('moderate')}
        className={`
          p-2 rounded transition-all duration-200
          ${currentView === 'moderate'
            ? 'bg-[var(--scholar-blue)] text-white'
            : 'text-[var(--charcoal-wash)] hover:bg-[var(--studio-cream)]'
          }
        `}
        aria-label="Moderate view - three columns grid"
        aria-pressed={currentView === 'moderate'}
        title="Moderate View"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>

      {/* Compact View Button */}
      <button
        onClick={() => onViewChange('compact')}
        className={`
          p-2 rounded transition-all duration-200
          ${currentView === 'compact'
            ? 'bg-[var(--scholar-blue)] text-white'
            : 'text-[var(--charcoal-wash)] hover:bg-[var(--studio-cream)]'
          }
        `}
        aria-label="Compact view - multiple columns with minimal details"
        aria-pressed={currentView === 'compact'}
        title="Compact View"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="4" height="4" rx="1" />
          <rect x="10" y="3" width="4" height="4" rx="1" />
          <rect x="17" y="3" width="4" height="4" rx="1" />
          <rect x="3" y="10" width="4" height="4" rx="1" />
          <rect x="10" y="10" width="4" height="4" rx="1" />
          <rect x="17" y="10" width="4" height="4" rx="1" />
          <rect x="3" y="17" width="4" height="4" rx="1" />
          <rect x="10" y="17" width="4" height="4" rx="1" />
          <rect x="17" y="17" width="4" height="4" rx="1" />
        </svg>
      </button>
    </div>
  );
}
