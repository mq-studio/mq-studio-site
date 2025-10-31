'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';

interface ZoomableImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

/**
 * ZoomableImage Component
 *
 * A single image with advanced zoom capabilities for artwork detail pages.
 *
 * Features:
 * - Click to toggle between lightbox and inline view
 * - Pinch and scroll to zoom
 * - Drag to pan when zoomed
 * - Keyboard controls (ESC to close, +/- to zoom)
 * - Touch-friendly mobile controls
 * - Smooth transitions
 */
export default function ZoomableImage({
  src,
  alt,
  width = 800,
  height = 1000,
  className = '',
  priority = false,
}: ZoomableImageProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const imageRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0, distance: 0 });

  const openLightbox = useCallback(() => {
    setIsLightboxOpen(true);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    document.body.style.overflow = '';
  }, []);

  const handleZoom = useCallback((delta: number, centerX?: number, centerY?: number) => {
    setZoom((prevZoom) => {
      const newZoom = Math.max(1, Math.min(5, prevZoom + delta));

      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      } else if (centerX !== undefined && centerY !== undefined && imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const x = centerX - rect.left - rect.width / 2;
        const y = centerY - rect.top - rect.height / 2;

        setPosition((prev) => ({
          x: prev.x - x * (delta / prevZoom),
          y: prev.y - y * (delta / prevZoom),
        }));
      }

      return newZoom;
    });
  }, []);

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case '+':
        case '=':
          handleZoom(0.3);
          break;
        case '-':
        case '_':
          handleZoom(-0.3);
          break;
      }
    },
    [isLightboxOpen, closeLightbox, handleZoom]
  );

  // Register keyboard listener
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
  }

  // Mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      handleZoom(delta, e.clientX, e.clientY);
    },
    [handleZoom]
  );

  // Mouse drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      }
    },
    [zoom, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && zoom > 1) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current.x = e.touches[0].clientX;
      touchStartRef.current.y = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current.distance = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 1 && zoom > 1) {
        const dx = e.touches[0].clientX - touchStartRef.current.x;
        const dy = e.touches[0].clientY - touchStartRef.current.y;
        setPosition({ x: dx, y: dy });
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delta = (distance - touchStartRef.current.distance) / 100;

        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        handleZoom(delta, centerX, centerY);
        touchStartRef.current.distance = distance;
      }
    },
    [zoom, handleZoom]
  );

  return (
    <>
      {/* Inline Image - Click to open lightbox */}
      <div
        className={`relative bg-white rounded-lg border border-[var(--border)] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${className}`}
        onClick={openLightbox}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto"
          priority={priority}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors">
          <div className="bg-white/90 rounded-full p-3 opacity-0 hover:opacity-100 transition-opacity">
            <svg className="w-6 h-6 text-[var(--ink-black)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Image zoom view"
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close zoom view"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <button
              onClick={() => handleZoom(-0.3)}
              className="p-2 text-white hover:text-[var(--moura-teal)] transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded-full"
              aria-label="Zoom out"
              disabled={zoom <= 1}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="font-montserrat text-white text-sm min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.3)}
              className="p-2 text-white hover:text-[var(--moura-teal)] transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded-full"
              aria-label="Zoom in"
              disabled={zoom >= 5}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {zoom > 1 && (
              <button
                onClick={() => {
                  setZoom(1);
                  setPosition({ x: 0, y: 0 });
                }}
                className="ml-2 px-3 py-1 text-xs font-montserrat text-white hover:text-[var(--moura-teal)] transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded-full"
                aria-label="Reset zoom"
              >
                Reset
              </button>
            )}
          </div>

          {/* Image Container */}
          <div
            ref={imageRef}
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            <div
              className="relative max-w-[90vw] max-h-[90vh] transition-transform duration-200 ease-out"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
              }}
            >
              <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
                priority
                draggable={false}
              />
            </div>
          </div>

          {/* Hint Text */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 font-montserrat text-white/60 text-xs text-center">
            <p>Scroll or pinch to zoom • Drag to pan • ESC to close</p>
          </div>
        </div>
      )}
    </>
  );
}
