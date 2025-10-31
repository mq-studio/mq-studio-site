// View mode types for publications
export type ViewMode = 'full' | 'moderate' | 'compact';

// Constants for view mode
export const VIEW_MODES = {
  FULL: 'full' as ViewMode,
  MODERATE: 'moderate' as ViewMode,
  COMPACT: 'compact' as ViewMode,
};

export const DEFAULT_VIEW_MODE: ViewMode = 'moderate';
