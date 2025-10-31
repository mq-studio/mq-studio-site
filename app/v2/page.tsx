'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import RecentContent from '@/components/content/RecentContent';
import SearchBar from '@/components/search/SearchBar';

const artworkImages = [
  {
    src: '/background_assets/optimized/variants/hero-image-1-web.webp',
    alt: 'Academic Research Artwork 1',
    category: 'Thinking'
  },
  {
    src: '/background_assets/optimized/variants/hero-image-2-web.webp',
    alt: 'Watercolor Artwork 2',
    category: 'Feeling'
  },
  {
    src: '/background_assets/optimized/variants/hero-image-3-web.webp',
    alt: 'Calligraphy Artwork 3',
    category: 'Doing'
  }
];

export default function HomeV2() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % artworkImages.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentImage = artworkImages[currentImageIndex];

  return (
    <>
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <Link href="/" className="flex items-center gap-3 font-montserrat font-semibold text-lg">
                <span className="w-6 h-6 bg-gradient-to-br from-[var(--moura-teal)] to-[var(--scholar-blue)] rounded-full"></span>
                MQ STUDIO
              </Link>
              <div className="font-lora text-sm text-[var(--charcoal-wash)] mt-1">
                Feeling · Thinking · Doing
              </div>
            </div>
            <nav className="font-montserrat text-sm">
              <a href="/gallery/artworks" className="hover:text-[var(--moura-teal)] transition-colors">Artworks</a>
              <span className="mx-2">·</span>
              <a href="/gallery/publications" className="hover:text-[var(--moura-teal)] transition-colors">Publications</a>
              <span className="mx-2">·</span>
              <a href="/musings" className="hover:text-[var(--moura-teal)] transition-colors">Musings</a>
              <span className="mx-2">·</span>
              <a href="/search" className="hover:text-[var(--moura-teal)] transition-colors">Search</a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* Split-Screen Hero with Rotating Artwork */}
        <section className="py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">
            {/* Left Side - Text Content */}
            <div className="text-center lg:text-left space-y-6">
              <div>
                <p className="font-lora text-lg text-[var(--charcoal-wash)] mb-3">
                  Welcome to the studio of
                </p>
                <h1 className="font-montserrat text-5xl sm:text-6xl font-bold mb-4 text-[var(--ink-black)]">
                  MOURA QUAYLE
                </h1>
                <p className="font-montserrat text-lg text-[var(--scholar-blue)] tracking-wide">
                  Academia · Leadership · Design
                </p>
              </div>

              <div className="max-w-xl mx-auto lg:mx-0">
                <p className="font-lora text-base text-[var(--charcoal-wash)] leading-relaxed mb-8">
                  Where governance meets watercolor, policy meets poetry, and decades of scholarship
                  coexist with ongoing artistic exploration. This is a workspace in motion—a place
                  where thinking, feeling, and doing converge.
                </p>
              </div>

              {/* Entry Points */}
              <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto lg:mx-0">
                <Link
                  href="/gallery/artworks"
                  className="group p-4 bg-gradient-to-br from-[var(--studio-cream)] to-white rounded-lg border border-[var(--border)] hover:border-[var(--vibrant-magenta)] transition-all hover:shadow-lg text-center"
                >
                  <h3 className="font-montserrat font-semibold text-[var(--vibrant-magenta)] mb-1">Feeling</h3>
                  <p className="font-lora text-xs text-[var(--charcoal-wash)]">Artworks</p>
                </Link>

                <Link
                  href="/gallery/publications"
                  className="group p-4 bg-gradient-to-br from-[var(--studio-cream)] to-white rounded-lg border border-[var(--border)] hover:border-[var(--scholar-blue)] transition-all hover:shadow-lg text-center"
                >
                  <h3 className="font-montserrat font-semibold text-[var(--scholar-blue)] mb-1">Thinking</h3>
                  <p className="font-lora text-xs text-[var(--charcoal-wash)]">Publications</p>
                </Link>

                <Link
                  href="/gallery/publications?category=landscape"
                  className="group p-4 bg-gradient-to-br from-[var(--studio-cream)] to-white rounded-lg border border-[var(--border)] hover:border-[var(--moura-teal)] transition-all hover:shadow-lg text-center"
                >
                  <h3 className="font-montserrat font-semibold text-[var(--moura-teal)] mb-1">Doing</h3>
                  <p className="font-lora text-xs text-[var(--charcoal-wash)]">Projects</p>
                </Link>
              </div>
            </div>

            {/* Right Side - Rotating Featured Artwork */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[3/4] max-h-[700px]">
                <div
                  className={`relative w-full h-full transition-opacity duration-500 ${
                    isTransitioning ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <Image
                    src={currentImage.src}
                    alt={currentImage.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                    <p className="text-white font-montserrat text-sm mb-1 opacity-80">Featured from</p>
                    <p className="text-white font-montserrat text-xl font-semibold">{currentImage.category}</p>
                  </div>
                </div>
              </div>

              {/* Rotation Indicators */}
              <div className="flex justify-center gap-2 mt-4">
                {artworkImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setCurrentImageIndex(index);
                        setIsTransitioning(false);
                      }, 300);
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex
                        ? 'bg-[var(--moura-teal)] w-8'
                        : 'bg-[var(--light-gray)] hover:bg-[var(--charcoal-wash)]'
                    }`}
                    aria-label={`View artwork ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <section className="py-8 border-t border-b border-[var(--border)]">
          <div className="max-w-2xl mx-auto">
            <SearchBar placeholder="Search publications, artworks, musings..." />
          </div>
        </section>

        {/* Recent Additions */}
        <section className="py-16">
          <h2 className="font-montserrat text-2xl font-semibold text-center mb-12 text-[var(--ink-black)]">
            Recent Additions to the Studio
          </h2>
          <RecentContent />
        </section>

        {/* Marginalia Section */}
        <aside className="py-8 border-t border-[var(--border)]">
          <div className="max-w-4xl mx-auto px-8 border-l-4 border-[var(--vibrant-magenta)]">
            <p className="font-lora italic text-[var(--charcoal-wash)]">
              &ldquo;The studio is not just a place but a practice—where the academic and the artistic
              refuse to be separated, where thinking and feeling inform doing.&rdquo;
            </p>
            <p className="font-montserrat text-sm text-[var(--muted-foreground)] mt-2">
              — David Fushtey, Partner in Dialogue
            </p>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-[var(--border)] py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="font-lora text-sm text-[var(--muted-foreground)]">
            © 2025 Moura Quayle. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
