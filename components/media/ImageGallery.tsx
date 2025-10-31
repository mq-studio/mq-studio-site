'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  title?: string;
  description?: string;
  width?: number;
  height?: number;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: 1 | 2 | 3 | 4;
  gap?: number;
  className?: string;
}

/**
 * ImageGallery Component
 *
 * A responsive image gallery with lightbox and zoom capabilities.
 *
 * Features:
 * - Grid layout with configurable columns
 * - Click to open lightbox modal
 * - Pinch and scroll to zoom
 * - Keyboard navigation (arrows, escape)
 * - Touch-friendly mobile controls
 * - Smooth transitions and animations
 * - Accessible (ARIA labels, focus management)
 */
export default function ImageGallery({
  images,
  columns = 3,
  gap = 4,
  className = '',
}: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const imageRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0, distance: 0 });

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    document.body.style.overflow = 'hidden';
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    document.body.style.overflow = '';
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [images.length]);

  const handleZoom = useCallback((delta: number, centerX?: number, centerY?: number) => {
    setZoom((prevZoom) => {
      const newZoom = Math.max(1, Math.min(5, prevZoom + delta));

      // If zooming out to 1, reset position
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      } else if (centerX !== undefined && centerY !== undefined && imageRef.current) {
        // Adjust position to zoom towards cursor/touch point
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

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'ArrowLeft':
          goToPrevious();
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, closeLightbox, goToNext, goToPrevious, handleZoom]);

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
      // Pinch zoom
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current.distance = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 1 && zoom > 1) {
        // Pan
        const dx = e.touches[0].clientX - touchStartRef.current.x;
        const dy = e.touches[0].clientY - touchStartRef.current.y;
        setPosition({ x: dx, y: dy });
      } else if (e.touches.length === 2) {
        // Pinch zoom
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

  const currentImage = images[currentIndex];

  return (
    <>
      {/* Gallery Grid */}
      <div
        className={`grid gap-${gap} ${className}`}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => openLightbox(index)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-[var(--studio-cream)] border border-[var(--border)] hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--moura-teal)] focus:ring-offset-2"
            aria-label={`View ${image.alt}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes={`(max-width: 768px) 100vw, (max-width: 1200px) 50vw, ${100 / columns}vw`}
            />
            {image.title && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-montserrat text-white text-sm font-semibold">
                  {image.title}
                </p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

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
                src={currentImage.src}
                alt={currentImage.alt}
                width={currentImage.width || 1200}
                height={currentImage.height || 1600}
                className="max-w-full max-h-[90vh] w-auto h-auto object-contain"
                priority
                draggable={false}
              />
            </div>
          </div>

          {/* Image Info */}
          {(currentImage.title || currentImage.description) && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 max-w-2xl mx-auto text-center">
              {currentImage.title && (
                <h3 className="font-montserrat text-white text-lg font-semibold mb-1">
                  {currentImage.title}
                </h3>
              )}
              {currentImage.description && (
                <p className="font-lora text-white/80 text-sm">
                  {currentImage.description}
                </p>
              )}
            </div>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 font-montserrat text-white text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Hint Text */}
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 font-montserrat text-white/60 text-xs text-center">
            <p>Use arrow keys to navigate • Scroll or pinch to zoom • ESC to close</p>
          </div>
        </div>
      )}
    </>
  );
}
