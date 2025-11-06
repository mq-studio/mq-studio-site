'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Artwork } from '@/lib/types/content';

function ArtworkGalleryContent() {
  const searchParams = useSearchParams();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtworks();
  }, []);

  // Read tag from URL query parameter
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedTag === 'all') {
      setFilteredArtworks(artworks);
    } else {
      setFilteredArtworks(
        artworks.filter(artwork =>
          artwork.tags?.includes(selectedTag) ||
          artwork.medium?.toLowerCase().includes(selectedTag.toLowerCase())
        )
      );
    }
  }, [selectedTag, artworks]);

  const fetchArtworks = async () => {
    try {
      const response = await fetch('/api/content?type=artwork', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setArtworks(data);
        setFilteredArtworks(data);
      }
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const tags = ['all', 'watercolour', 'shufa', 'calligraphy', 'landscape', 'abstract', 'mixed media'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--rice-paper)] to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 font-montserrat font-semibold text-lg hover:opacity-80">
              <span className="w-6 h-6 bg-gradient-to-br from-[var(--moura-teal)] to-[var(--scholar-blue)] rounded-full"></span>
              MQ STUDIO
            </Link>
            <nav className="font-montserrat text-sm">
              <Link href="/gallery/artworks" className="text-[var(--moura-teal)]">Artworks</Link>
              <span className="mx-2">·</span>
              <Link href="/gallery/publications" className="hover:text-[var(--moura-teal)]">Publications</Link>
              <span className="mx-2">·</span>
              <Link href="/musings" className="hover:text-[var(--moura-teal)]">Musings</Link>
              <span className="mx-2">·</span>
              <Link href="/press" className="hover:text-[var(--moura-teal)]">Press</Link>
              <span className="mx-2">·</span>
              <Link href="/projects" className="hover:text-[var(--moura-teal)]">Projects</Link>
              <span className="mx-2">·</span>
              <Link href="/search" className="hover:text-[var(--moura-teal)]">Search</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-6 text-center">
        <h1 className="font-montserrat text-4xl font-bold text-[var(--ink-black)] mb-4">
          Artwork Gallery
        </h1>
        <p className="font-lora text-lg text-[var(--charcoal-wash)] max-w-2xl mx-auto">
          Exploring the intersection of emotion and form through watercolour, shufa calligraphy, and mixed media
        </p>
      </section>

      {/* Filter Tags */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-6 py-2 rounded-full font-montserrat text-sm transition-all ${
                  selectedTag === tag
                    ? 'bg-[var(--vibrant-magenta)] text-white'
                    : 'bg-white border border-[var(--border)] hover:border-[var(--vibrant-magenta)] text-[var(--charcoal-wash)]'
                }`}
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 border border-[var(--border)] animate-pulse">
                  <div className="h-64 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredArtworks.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-lora text-[var(--charcoal-wash)]">
                No artworks found for this filter.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtworks.map(artwork => (
                <Link
                  key={artwork.slug}
                  href={`/artworks/${artwork.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg overflow-hidden border border-[var(--border)] hover:border-[var(--vibrant-magenta)] transition-all hover:shadow-lg h-full">
                    {/* Image Container */}
                    <div className="aspect-[4/3] relative bg-gradient-to-br from-[var(--studio-cream)] to-[var(--rice-paper)]">
                      {artwork.imageUrl ? (
                        <Image
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-lora text-[var(--muted-foreground)]">
                            {artwork.medium || 'Artwork'}
                          </span>
                        </div>
                      )}
                      {artwork.availability === 'available' && (
                        <span className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-montserrat">
                          Available
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-montserrat text-lg font-semibold text-[var(--ink-black)] mb-2 group-hover:text-[var(--vibrant-magenta)] transition-colors">
                        {artwork.title}
                      </h3>
                      <p className="font-lora text-sm text-[var(--charcoal-wash)] mb-3">
                        {artwork.medium} · {typeof artwork.dimensions === 'string'
                          ? artwork.dimensions
                          : artwork.dimensions ? `${artwork.dimensions.width} × ${artwork.dimensions.height} ${artwork.dimensions.unit}` : ''}
                      </p>
                      {artwork.price && (
                        <p className="font-montserrat text-[var(--vibrant-magenta)] font-semibold">
                          ${artwork.price}
                        </p>
                      )}
                      {artwork.tags && artwork.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {artwork.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-[var(--studio-cream)] text-xs font-montserrat text-[var(--charcoal-wash)] rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ArtworkGallery() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[var(--rice-paper)] to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--vibrant-magenta)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-lora text-[var(--charcoal-wash)]">Loading gallery...</p>
        </div>
      </div>
    }>
      <ArtworkGalleryContent />
    </Suspense>
  );
}