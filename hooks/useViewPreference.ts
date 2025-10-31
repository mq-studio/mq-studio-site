'use client';

import { useState, useEffect } from 'react';
import { ViewMode, DEFAULT_VIEW_MODE } from '@/lib/types/publications';

const STORAGE_KEY = 'publicationViewMode';

interface UseViewPreferenceOptions {
  urlParam?: string;
}

export function useViewPreference(options: UseViewPreferenceOptions = {}) {
  const { urlParam } = options;
  const [viewMode, setViewMode] = useState<ViewMode>(DEFAULT_VIEW_MODE);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Check URL parameter first
    if (urlParam && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get('view') as ViewMode;

      if (urlView && ['full', 'moderate', 'compact'].includes(urlView)) {
        setViewMode(urlView);
        localStorage.setItem(STORAGE_KEY, urlView);
        return;
      }
    }

    // Check localStorage
    const saved = localStorage.getItem(STORAGE_KEY) as ViewMode;
    if (saved && ['full', 'moderate', 'compact'].includes(saved)) {
      setViewMode(saved);
    }
  }, [urlParam]);

  const updateViewMode = (mode: ViewMode) => {
    setViewMode(mode);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, mode);

      // Update URL parameter without page reload
      const url = new URL(window.location.href);
      url.searchParams.set('view', mode);
      window.history.replaceState({}, '', url.toString());
    }
  };

  return {
    viewMode,
    updateViewMode,
    isClient, // Useful for avoiding hydration mismatches
  };
}
