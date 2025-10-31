'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import RecentContent from '@/components/content/RecentContent';
import SearchBar from '@/components/search/SearchBar';

export default function HomeV4() {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

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

      <main className="max-w-6xl mx-auto px-6">
        {/* Minimalist Typography Hero */}
        <section className="py-20 sm:py-32 relative">
          {/* Subtle Background Image */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 h-96 opacity-5 pointer-events-none hidden lg:block">
            <Image
              src="/background_assets/optimized/variants/hero-image-1-web.webp"
              alt=""
              fill
              className="object-cover"
              sizes="33vw"
            />
          </div>

          <div className="relative max-w-4xl">
            <p className="font-lora text-sm uppercase tracking-wider text-[var(--charcoal-wash)] mb-4">
              Studio
            </p>
            <h1 className="font-montserrat text-7xl sm:text-8xl md:text-9xl font-bold mb-8 tracking-tight leading-none text-[var(--ink-black)]">
              MOURA<br />QUAYLE
            </h1>
            <div className="max-w-2xl space-y-6">
              <p className="font-lora text-xl sm:text-2xl text-[var(--charcoal-wash)] leading-relaxed">
                Where governance meets watercolor, policy meets poetry, and decades of scholarship
                coexist with ongoing artistic exploration.
              </p>
              <p className="font-montserrat text-base text-[var(--muted-foreground)]">
                A workspace in motion—where thinking, feeling, and doing converge.
              </p>
            </div>
          </div>
        </section>

        {/* Minimalist Entry Points */}
        <section className="py-16 border-t border-[var(--border)]">
          <div className="space-y-1">
            {/* Thinking */}
            <Link
              href="/gallery/publications"
              className="group block py-8 border-b border-[var(--border)] hover:bg-[var(--studio-cream)] transition-all"
              onMouseEnter={() => setHoveredSection('thinking')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-baseline gap-4 mb-2">
                    <h2 className="font-montserrat text-4xl sm:text-5xl font-bold text-[var(--ink-black)] group-hover:text-[var(--scholar-blue)] transition-colors">
                      Thinking
                    </h2>
                    <span className="font-lora text-sm text-[var(--charcoal-wash)]">01</span>
                  </div>
                  <p className="font-lora text-lg text-[var(--charcoal-wash)] max-w-2xl">
                    Academic papers, research, and intellectual explorations
                  </p>
                </div>
                <div className="hidden sm:block">
                  {hoveredSection === 'thinking' && (
                    <div className="w-32 h-32 relative overflow-hidden rounded-lg">
                      <Image
                        src="/background_assets/optimized/variants/hero-image-1-thumb.webp"
                        alt="Thinking preview"
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                  )}
                </div>
                <div className="ml-8 text-[var(--scholar-blue)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Feeling */}
            <Link
              href="/gallery/artworks"
              className="group block py-8 border-b border-[var(--border)] hover:bg-[var(--studio-cream)] transition-all"
              onMouseEnter={() => setHoveredSection('feeling')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-baseline gap-4 mb-2">
                    <h2 className="font-montserrat text-4xl sm:text-5xl font-bold text-[var(--ink-black)] group-hover:text-[var(--vibrant-magenta)] transition-colors">
                      Feeling
                    </h2>
                    <span className="font-lora text-sm text-[var(--charcoal-wash)]">02</span>
                  </div>
                  <p className="font-lora text-lg text-[var(--charcoal-wash)] max-w-2xl">
                    Watercolors, calligraphy, and visual expressions
                  </p>
                </div>
                <div className="hidden sm:block">
                  {hoveredSection === 'feeling' && (
                    <div className="w-32 h-32 relative overflow-hidden rounded-lg">
                      <Image
                        src="/background_assets/optimized/variants/hero-image-2-thumb.webp"
                        alt="Feeling preview"
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                  )}
                </div>
                <div className="ml-8 text-[var(--vibrant-magenta)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>

            {/* Doing */}
            <Link
              href="/gallery/publications?category=landscape"
              className="group block py-8 border-b border-[var(--border)] hover:bg-[var(--studio-cream)] transition-all"
              onMouseEnter={() => setHoveredSection('doing')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-baseline gap-4 mb-2">
                    <h2 className="font-montserrat text-4xl sm:text-5xl font-bold text-[var(--ink-black)] group-hover:text-[var(--moura-teal)] transition-colors">
                      Doing
                    </h2>
                    <span className="font-lora text-sm text-[var(--charcoal-wash)]">03</span>
                  </div>
                  <p className="font-lora text-lg text-[var(--charcoal-wash)] max-w-2xl">
                    Leadership initiatives and collaborative ventures
                  </p>
                </div>
                <div className="hidden sm:block">
                  {hoveredSection === 'doing' && (
                    <div className="w-32 h-32 relative overflow-hidden rounded-lg">
                      <Image
                        src="/background_assets/optimized/variants/hero-image-3-thumb.webp"
                        alt="Doing preview"
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>
                  )}
                </div>
                <div className="ml-8 text-[var(--moura-teal)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Search Bar */}
        <section className="py-12">
          <div className="max-w-2xl">
            <h3 className="font-montserrat text-sm uppercase tracking-wider text-[var(--charcoal-wash)] mb-4">
              Search
            </h3>
            <SearchBar placeholder="Publications, artworks, musings..." />
          </div>
        </section>

        {/* Recent Additions - Minimal List View */}
        <section className="py-16 border-t border-[var(--border)]">
          <div className="flex items-baseline justify-between mb-12">
            <h2 className="font-montserrat text-3xl font-semibold text-[var(--ink-black)]">
              Recent Additions
            </h2>
            <Link href="/gallery/artworks" className="font-montserrat text-sm text-[var(--moura-teal)] hover:underline">
              View all →
            </Link>
          </div>
          <RecentContent />
        </section>

        {/* Quote Section - Minimalist */}
        <aside className="py-16 border-t border-[var(--border)]">
          <div className="max-w-3xl">
            <blockquote className="font-lora text-2xl sm:text-3xl text-[var(--ink-black)] leading-relaxed mb-6">
              &ldquo;The studio is not just a place but a practice—where the academic and the artistic
              refuse to be separated, where thinking and feeling inform doing.&rdquo;
            </blockquote>
            <p className="font-montserrat text-sm text-[var(--muted-foreground)] uppercase tracking-wider">
              — David Fushtey
            </p>
          </div>
        </aside>

        {/* Subtle Visual Accent */}
        <section className="py-12 border-t border-[var(--border)]">
          <div className="grid grid-cols-3 gap-4 opacity-30">
            <div className="aspect-square relative">
              <Image
                src="/background_assets/optimized/variants/hero-image-1-thumb.webp"
                alt=""
                fill
                className="object-cover grayscale"
                sizes="(max-width: 768px) 33vw, 200px"
              />
            </div>
            <div className="aspect-square relative">
              <Image
                src="/background_assets/optimized/variants/hero-image-2-thumb.webp"
                alt=""
                fill
                className="object-cover grayscale"
                sizes="(max-width: 768px) 33vw, 200px"
              />
            </div>
            <div className="aspect-square relative">
              <Image
                src="/background_assets/optimized/variants/hero-image-3-thumb.webp"
                alt=""
                fill
                className="object-cover grayscale"
                sizes="(max-width: 768px) 33vw, 200px"
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 mt-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="font-lora text-sm text-[var(--muted-foreground)]">
              © 2025 Moura Quayle
            </p>
            <nav className="font-montserrat text-sm text-[var(--muted-foreground)]">
              <a href="/about" className="hover:text-[var(--moura-teal)] transition-colors">About</a>
              <span className="mx-2">·</span>
              <a href="/contact" className="hover:text-[var(--moura-teal)] transition-colors">Contact</a>
              <span className="mx-2">·</span>
              <a href="/privacy" className="hover:text-[var(--moura-teal)] transition-colors">Privacy</a>
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
}
