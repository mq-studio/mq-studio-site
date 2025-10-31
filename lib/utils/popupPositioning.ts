/**
 * Smart popup positioning utility for ensuring tooltips/popups are fully visible
 */

import * as React from 'react';

export type PopupPosition = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

export interface PopupDimensions {
  width: number;
  height: number;
}

export interface AnchorRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface PositionResult {
  position: PopupPosition;
  x: number;
  y: number;
  maxHeight?: number;
  maxWidth?: number;
  arrowPosition?: {
    x: number;
    y: number;
    side: 'top' | 'bottom' | 'left' | 'right';
  };
}

/**
 * Calculate optimal popup position to ensure full visibility
 */
export function calculatePopupPosition(
  anchorRect: AnchorRect,
  popupDimensions: PopupDimensions,
  options: {
    preferredPosition?: PopupPosition;
    viewport?: { width: number; height: number };
    offset?: number;
    padding?: number;
    constrainToViewport?: boolean;
  } = {}
): PositionResult {
  const {
    preferredPosition = 'top',
    viewport = { width: window.innerWidth, height: window.innerHeight },
    offset = 8,
    padding = 16,
    constrainToViewport = true
  } = options;

  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  // Calculate available space in each direction
  const spaceAbove = anchorRect.top - scrollY - padding;
  const spaceBelow = viewport.height - (anchorRect.bottom - scrollY) - padding;
  const spaceLeft = anchorRect.left - scrollX - padding;
  const spaceRight = viewport.width - (anchorRect.right - scrollX) - padding;

  // Check if popup fits in preferred position
  const fitsAbove = popupDimensions.height <= spaceAbove;
  const fitsBelow = popupDimensions.height <= spaceBelow;
  const fitsLeft = popupDimensions.width <= spaceLeft;
  const fitsRight = popupDimensions.width <= spaceRight;

  // Calculate center positions
  const centerX = anchorRect.left + anchorRect.width / 2;
  const centerY = anchorRect.top + anchorRect.height / 2;

  let position: PopupPosition = preferredPosition;
  let x = 0;
  let y = 0;
  let maxHeight = popupDimensions.height;
  let maxWidth = popupDimensions.width;

  // Determine best position based on available space
  if (preferredPosition.startsWith('top') && !fitsAbove && fitsBelow) {
    position = preferredPosition.replace('top', 'bottom') as PopupPosition;
  } else if (preferredPosition.startsWith('bottom') && !fitsBelow && fitsAbove) {
    position = preferredPosition.replace('bottom', 'top') as PopupPosition;
  } else if (preferredPosition === 'left' && !fitsLeft && fitsRight) {
    position = 'right';
  } else if (preferredPosition === 'right' && !fitsRight && fitsLeft) {
    position = 'left';
  }

  // Calculate position based on final placement
  switch (position) {
    case 'top':
      x = centerX - popupDimensions.width / 2;
      y = anchorRect.top - popupDimensions.height - offset;
      break;

    case 'top-start':
      x = anchorRect.left;
      y = anchorRect.top - popupDimensions.height - offset;
      break;

    case 'top-end':
      x = anchorRect.right - popupDimensions.width;
      y = anchorRect.top - popupDimensions.height - offset;
      break;

    case 'bottom':
      x = centerX - popupDimensions.width / 2;
      y = anchorRect.bottom + offset;
      break;

    case 'bottom-start':
      x = anchorRect.left;
      y = anchorRect.bottom + offset;
      break;

    case 'bottom-end':
      x = anchorRect.right - popupDimensions.width;
      y = anchorRect.bottom + offset;
      break;

    case 'left':
      x = anchorRect.left - popupDimensions.width - offset;
      y = centerY - popupDimensions.height / 2;
      break;

    case 'right':
      x = anchorRect.right + offset;
      y = centerY - popupDimensions.height / 2;
      break;
  }

  // Constrain to viewport if requested
  if (constrainToViewport) {
    // Horizontal constraints
    if (x < scrollX + padding) {
      x = scrollX + padding;
    } else if (x + popupDimensions.width > scrollX + viewport.width - padding) {
      x = scrollX + viewport.width - padding - popupDimensions.width;
    }

    // Vertical constraints
    if (y < scrollY + padding) {
      y = scrollY + padding;
    } else if (y + popupDimensions.height > scrollY + viewport.height - padding) {
      y = scrollY + viewport.height - padding - popupDimensions.height;
    }

    // If popup doesn't fit, provide max dimensions
    if (!fitsAbove && !fitsBelow) {
      maxHeight = Math.max(spaceAbove, spaceBelow) - offset;
      if (spaceBelow > spaceAbove) {
        position = position.includes('top') ? position.replace('top', 'bottom') as PopupPosition : 'bottom';
        y = anchorRect.bottom + offset;
      } else {
        position = position.includes('bottom') ? position.replace('bottom', 'top') as PopupPosition : 'top';
        y = anchorRect.top - maxHeight - offset;
      }
    }

    if (!fitsLeft && !fitsRight) {
      maxWidth = Math.max(spaceLeft, spaceRight) - offset;
      if (spaceRight > spaceLeft) {
        position = 'right';
        x = anchorRect.right + offset;
      } else {
        position = 'left';
        x = anchorRect.left - maxWidth - offset;
      }
    }
  }

  // Calculate arrow position
  const arrowPosition = calculateArrowPosition(position, anchorRect, { x, y }, popupDimensions);

  return {
    position,
    x,
    y,
    maxHeight: maxHeight !== popupDimensions.height ? maxHeight : undefined,
    maxWidth: maxWidth !== popupDimensions.width ? maxWidth : undefined,
    arrowPosition
  };
}

/**
 * Calculate arrow position for the popup
 */
function calculateArrowPosition(
  position: PopupPosition,
  anchorRect: AnchorRect,
  popupPosition: { x: number; y: number },
  popupDimensions: PopupDimensions
): PositionResult['arrowPosition'] {
  const arrowSize = 8;
  let x = 0;
  let y = 0;
  let side: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

  switch (position) {
    case 'top':
    case 'top-start':
    case 'top-end':
      side = 'bottom';
      x = anchorRect.left + anchorRect.width / 2 - popupPosition.x;
      y = popupDimensions.height - arrowSize / 2;
      break;

    case 'bottom':
    case 'bottom-start':
    case 'bottom-end':
      side = 'top';
      x = anchorRect.left + anchorRect.width / 2 - popupPosition.x;
      y = -arrowSize / 2;
      break;

    case 'left':
      side = 'right';
      x = popupDimensions.width - arrowSize / 2;
      y = anchorRect.top + anchorRect.height / 2 - popupPosition.y;
      break;

    case 'right':
      side = 'left';
      x = -arrowSize / 2;
      y = anchorRect.top + anchorRect.height / 2 - popupPosition.y;
      break;
  }

  // Constrain arrow position to popup bounds
  const margin = arrowSize * 1.5;
  if (side === 'top' || side === 'bottom') {
    x = Math.max(margin, Math.min(x, popupDimensions.width - margin));
  } else {
    y = Math.max(margin, Math.min(y, popupDimensions.height - margin));
  }

  return { x, y, side };
}

/**
 * Get CSS styles for positioning the popup
 */
export function getPopupStyles(result: PositionResult): React.CSSProperties {
  return {
    position: 'fixed',
    left: `${result.x}px`,
    top: `${result.y}px`,
    maxHeight: result.maxHeight ? `${result.maxHeight}px` : undefined,
    maxWidth: result.maxWidth ? `${result.maxWidth}px` : undefined,
    overflow: result.maxHeight || result.maxWidth ? 'auto' : undefined
  };
}

/**
 * Get CSS styles for the arrow element
 */
export function getArrowStyles(result: PositionResult): React.CSSProperties | null {
  if (!result.arrowPosition) return null;

  const { x, y, side } = result.arrowPosition;
  const baseStyles: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid'
  };

  switch (side) {
    case 'top':
      return {
        ...baseStyles,
        left: `${x}px`,
        top: `${y}px`,
        borderWidth: '0 6px 8px 6px',
        borderColor: 'transparent transparent var(--rice-paper) transparent'
      };

    case 'bottom':
      return {
        ...baseStyles,
        left: `${x}px`,
        bottom: `${-y}px`,
        borderWidth: '8px 6px 0 6px',
        borderColor: 'var(--rice-paper) transparent transparent transparent'
      };

    case 'left':
      return {
        ...baseStyles,
        left: `${x}px`,
        top: `${y}px`,
        borderWidth: '6px 8px 6px 0',
        borderColor: 'transparent var(--rice-paper) transparent transparent'
      };

    case 'right':
      return {
        ...baseStyles,
        right: `${-x}px`,
        top: `${y}px`,
        borderWidth: '6px 0 6px 8px',
        borderColor: 'transparent transparent transparent var(--rice-paper)'
      };
  }
}

/**
 * Hook for managing popup positioning
 */
export function usePopupPosition(
  isOpen: boolean,
  anchorRef: React.RefObject<HTMLElement>,
  popupRef: React.RefObject<HTMLElement>,
  options: Parameters<typeof calculatePopupPosition>[2] = {}
): PositionResult | null {
  const [position, setPosition] = React.useState<PositionResult | null>(null);

  React.useEffect(() => {
    if (!isOpen || !anchorRef.current || !popupRef.current) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      if (!anchorRef.current || !popupRef.current) return;

      const anchorRect = anchorRef.current.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();

      const result = calculatePopupPosition(
        {
          top: anchorRect.top + window.scrollY,
          left: anchorRect.left + window.scrollX,
          right: anchorRect.right + window.scrollX,
          bottom: anchorRect.bottom + window.scrollY,
          width: anchorRect.width,
          height: anchorRect.height
        },
        { width: popupRect.width, height: popupRect.height },
        options
      );

      setPosition(result);
    };

    // Initial position
    updatePosition();

    // Update on scroll or resize
    const handleUpdate = () => updatePosition();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isOpen, anchorRef, popupRef, options]);

  return position;
}