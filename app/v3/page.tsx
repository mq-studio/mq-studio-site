'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import RecentContent from '@/components/content/RecentContent';
import SearchBar from '@/components/search/SearchBar';

const heroImages = [
  '/background_assets/optimized/variants/hero-image-1-web.webp',
  '/background_assets/optimized/variants/hero-image-2-web.webp',
  '/background_assets/optimized/variants/hero-image-3-web.webp'
];

export default function HomeV3() {
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % heroImages.length);
    }, 7000);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <Link href="/" className="flex items-center gap-3 font-montserrat font-semibold text-lg">
                <span className="w-6 h-6 bg-gradient-to-br from-[var(--moura-teal)] to-[var(--scholar-blue)] rounded-full"></span>
                <span className={scrolled ? 'text-[var(--ink-black)]' : 'text-white'}>MQ STUDIO</span>
              </Link>
            </div>
            <nav className={`font-montserrat text-sm ${scrolled ? 'text-[var(--ink-black)]' : 'text-white'}`}>
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

      <main>
        {/* Full-Width Hero with Overlay */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Background Images with Crossfade */}
          {heroImages.map((img, index) => (
            <div
              key={img}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBgIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={img}
                alt={`Hero background ${index + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={index === 0}
              />
            </div>
          ))}

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>

          {/* Content Overlay */}
          <div className="relative z-10 text-center text-white px-6 max-w-5xl mx-auto">
            <p className="font-lora text-xl sm:text-2xl mb-4 opacity-90 animate-fade-in">
              Welcome to the studio of
            </p>
            <h1 className="font-montserrat text-6xl sm:text-7xl md:text-8xl font-bold mb-6 tracking-tight animate-fade-in-up">
              MOURA QUAYLE
            </h1>
            <p className="font-montserrat text-xl sm:text-2xl tracking-wider mb-8 opacity-90 animate-fade-in-delay">
              Academia · Leadership · Design
            </p>
            <div className="max-w-3xl mx-auto mb-12 animate-fade-in-delay-2">
              <p className="font-lora text-lg sm:text-xl leading-relaxed opacity-90">
                Where governance meets watercolor, policy meets poetry, and decades of scholarship
                coexist with ongoing artistic exploration.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-3">
              <Link
                href="/gallery/artworks"
                className="px-8 py-3 bg-[var(--vibrant-magenta)] text-white rounded-lg font-montserrat font-semibold hover:bg-opacity-90 transition-all hover:scale-105 hover:shadow-xl"
              >
                Explore Artworks
              </Link>
              <Link
                href="/gallery/publications"
                className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-montserrat font-semibold border-2 border-white/50 hover:bg-white/30 transition-all hover:scale-105"
              >
                View Publications
              </Link>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
                <div className="w-1 h-3 bg-white/80 rounded-full"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Three Entry Points Section */}
        <section className="py-20 bg-[var(--rice-paper)]">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-montserrat text-3xl font-semibold text-center mb-16 text-[var(--ink-black)]">
              Explore the Studio
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Thinking */}
              <div className="group">
                <div className="bg-gradient-to-br from-[var(--studio-cream)] to-white rounded-xl p-8 h-full border border-[var(--border)] hover:border-[var(--scholar-blue)] transition-all hover:shadow-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--scholar-blue)] to-blue-400 rounded-lg mb-4"></div>
                  <h3 className="font-montserrat text-2xl font-semibold mb-3 text-[var(--scholar-blue)]">
                    Thinking
                  </h3>
                  <p className="font-lora text-[var(--charcoal-wash)] mb-6 leading-relaxed">
                    Academic papers, research, and intellectual explorations in governance and design
                  </p>
                  <Link
                    href="/gallery/publications"
                    className="inline-flex items-center text-[var(--scholar-blue)] font-montserrat font-semibold hover:gap-2 transition-all"
                  >
                    View Publications <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>

              {/* Feeling */}
              <div className="group">
                <div className="bg-gradient-to-br from-[var(--studio-cream)] to-white rounded-xl p-8 h-full border border-[var(--border)] hover:border-[var(--vibrant-magenta)] transition-all hover:shadow-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--vibrant-magenta)] to-pink-400 rounded-lg mb-4"></div>
                  <h3 className="font-montserrat text-2xl font-semibold mb-3 text-[var(--vibrant-magenta)]">
                    Feeling
                  </h3>
                  <p className="font-lora text-[var(--charcoal-wash)] mb-6 leading-relaxed">
                    Watercolors, calligraphy, and visual expressions that capture emotion and beauty
                  </p>
                  <Link
                    href="/gallery/artworks"
                    className="inline-flex items-center text-[var(--vibrant-magenta)] font-montserrat font-semibold hover:gap-2 transition-all"
                  >
                    Explore Artworks <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>

              {/* Doing */}
              <div className="group">
                <div className="bg-gradient-to-br from-[var(--studio-cream)] to-white rounded-xl p-8 h-full border border-[var(--border)] hover:border-[var(--moura-teal)] transition-all hover:shadow-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-[var(--moura-teal)] to-teal-400 rounded-lg mb-4"></div>
                  <h3 className="font-montserrat text-2xl font-semibold mb-3 text-[var(--moura-teal)]">
                    Doing
                  </h3>
                  <p className="font-lora text-[var(--charcoal-wash)] mb-6 leading-relaxed">
                    Leadership initiatives, landscape design projects, and collaborative ventures
                  </p>
                  <Link
                    href="/gallery/publications?category=landscape"
                    className="inline-flex items-center text-[var(--moura-teal)] font-montserrat font-semibold hover:gap-2 transition-all"
                  >
                    Explore Projects <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Bar */}
        <section className="py-12 bg-white border-t border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <SearchBar placeholder="Search publications, artworks, musings..." />
            </div>
          </div>
        </section>

        {/* Recent Additions */}
        <section className="py-20 bg-[var(--rice-paper)]">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-montserrat text-3xl font-semibold text-center mb-16 text-[var(--ink-black)]">
              Recent Additions to the Studio
            </h2>
            <RecentContent />
          </div>
        </section>

        {/* Marginalia Section */}
        <aside className="py-12 bg-white border-t border-[var(--border)]">
          <div className="max-w-4xl mx-auto px-8 border-l-4 border-[var(--vibrant-magenta)]">
            <p className="font-lora italic text-lg text-[var(--charcoal-wash)]">
              &ldquo;The studio is not just a place but a practice—where the academic and the artistic
              refuse to be separated, where thinking and feeling inform doing.&rdquo;
            </p>
            <p className="font-montserrat text-sm text-[var(--muted-foreground)] mt-3">
              — David Fushtey, Partner in Dialogue
            </p>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-8 bg-[var(--rice-paper)]">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="font-lora text-sm text-[var(--muted-foreground)]">
            © 2025 Moura Quayle. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out 0.2s both;
        }
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.4s both;
        }
        .animate-fade-in-delay-2 {
          animation: fade-in-up 1s ease-out 0.6s both;
        }
        .animate-fade-in-delay-3 {
          animation: fade-in-up 1s ease-out 0.8s both;
        }
      `}</style>
    </>
  );
}
