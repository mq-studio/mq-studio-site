'use client';

import Link from 'next/link';
import ImageGallery, { GalleryImage } from '@/components/media/ImageGallery';

/**
 * Gallery Test Page
 *
 * Demonstrates the ImageGallery component with sample watercolor artworks.
 * This page showcases:
 * - Responsive grid layout
 * - Lightbox functionality
 * - Zoom and pan capabilities
 * - Keyboard and touch navigation
 */
export default function GalleryPage() {
  // Sample gallery images - replace with actual artwork images
  const galleryImages: GalleryImage[] = [
    {
      id: '1',
      src: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=1000&fit=crop',
      alt: 'Watercolor landscape with mountains and lake',
      title: 'Mountain Serenity',
      description: 'Watercolor on cold-press paper, 2024',
      width: 800,
      height: 1000,
    },
    {
      id: '2',
      src: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=1000&fit=crop',
      alt: 'Abstract watercolor with flowing colors',
      title: 'Flow State',
      description: 'Mixed media watercolor, 2024',
      width: 800,
      height: 1000,
    },
    {
      id: '3',
      src: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=1000&fit=crop',
      alt: 'Botanical watercolor illustration',
      title: 'Garden Study',
      description: 'Watercolor botanical series, 2024',
      width: 800,
      height: 1000,
    },
    {
      id: '4',
      src: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&h=1000&fit=crop',
      alt: 'Watercolor portrait study',
      title: 'Portrait in Watercolor',
      description: 'Traditional watercolor technique, 2024',
      width: 800,
      height: 1000,
    },
    {
      id: '5',
      src: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=1000&fit=crop',
      alt: 'Urban landscape watercolor',
      title: 'City Sketches',
      description: 'Urban watercolor series, 2024',
      width: 800,
      height: 1000,
    },
    {
      id: '6',
      src: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&h=1000&fit=crop',
      alt: 'Abstract color study',
      title: 'Color Exploration',
      description: 'Abstract watercolor, 2024',
      width: 800,
      height: 1000,
    },
    {
      id: '7',
      src: 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=800&h=1000&fit=crop',
      alt: 'Seascape watercolor',
      title: 'Ocean Dreams',
      description: 'Watercolor seascape, 2024',
      width: 800,
      height: 1000,
    },
    {
      id: '8',
      src: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=1000&fit=crop',
      alt: 'Nature-inspired watercolor',
      title: 'Natural Forms',
      description: 'Organic watercolor study, 2024',
      width: 800,
      height: 1000,
    },
    {
      id: '9',
      src: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800&h=1000&fit=crop',
      alt: 'Minimalist watercolor composition',
      title: 'Simplicity',
      description: 'Minimalist watercolor, 2024',
      width: 800,
      height: 1000,
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--rice-paper)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-montserrat text-3xl md:text-4xl font-bold text-[var(--ink-black)] mb-2">
                Gallery Demo
              </h1>
              <p className="font-lora text-[var(--charcoal-wash)]">
                Interactive image gallery with zoom and navigation
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 text-sm font-montserrat text-[var(--vibrant-magenta)] hover:text-[var(--moura-teal)] transition-colors border border-[var(--border)] rounded-lg hover:border-[var(--moura-teal)]"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Studio
            </Link>
          </div>
        </div>
      </header>

      {/* Instructions */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-[var(--studio-cream)] rounded-lg p-6 border border-[var(--border)]">
          <h2 className="font-montserrat text-lg font-semibold text-[var(--ink-black)] mb-3">
            How to Use
          </h2>
          <div className="grid md:grid-cols-3 gap-6 font-lora text-sm text-[var(--charcoal-wash)]">
            <div>
              <h3 className="font-montserrat font-semibold text-[var(--ink-black)] mb-2">
                Desktop
              </h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Click any image to open lightbox</li>
                <li>Scroll to zoom in/out</li>
                <li>Click and drag to pan when zoomed</li>
                <li>Arrow keys to navigate</li>
                <li>ESC to close</li>
              </ul>
            </div>
            <div>
              <h3 className="font-montserrat font-semibold text-[var(--ink-black)] mb-2">
                Mobile/Touch
              </h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Tap any image to open lightbox</li>
                <li>Pinch to zoom in/out</li>
                <li>Drag to pan when zoomed</li>
                <li>Swipe or use buttons to navigate</li>
                <li>Tap X to close</li>
              </ul>
            </div>
            <div>
              <h3 className="font-montserrat font-semibold text-[var(--ink-black)] mb-2">
                Accessibility
              </h3>
              <ul className="space-y-1 list-disc list-inside">
                <li>Full keyboard navigation support</li>
                <li>ARIA labels for screen readers</li>
                <li>Focus indicators on all controls</li>
                <li>Clear visual feedback</li>
                <li>Alt text for all images</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid - 3 columns on desktop */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="font-montserrat text-2xl font-semibold text-[var(--ink-black)] mb-6">
          Sample Artworks
        </h2>
        <ImageGallery images={galleryImages} columns={3} gap={6} />
      </section>

      {/* Additional Gallery Example - 4 columns */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="font-montserrat text-2xl font-semibold text-[var(--ink-black)] mb-6">
          Alternative Layout (4 Columns)
        </h2>
        <ImageGallery images={galleryImages.slice(0, 8)} columns={4} gap={4} />
      </section>

      {/* Additional Gallery Example - 2 columns */}
      <section className="max-w-7xl mx-auto px-6 py-8 pb-16">
        <h2 className="font-montserrat text-2xl font-semibold text-[var(--ink-black)] mb-6">
          Portfolio Style (2 Columns)
        </h2>
        <ImageGallery images={galleryImages.slice(0, 6)} columns={2} gap={8} />
      </section>

      {/* Footer Note */}
      <footer className="border-t border-[var(--border)] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <p className="font-lora text-sm text-[var(--muted-foreground)] text-center">
            Gallery Component Demo • MQ Studio • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
