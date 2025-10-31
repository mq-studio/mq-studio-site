'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Artwork, Content } from '@/lib/types/content';
import ZoomableImage from '@/components/media/ZoomableImage';

export default function ArtworkPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [relatedContent, setRelatedContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtwork();
  }, [slug]);

  const fetchArtwork = async () => {
    try {
      // Fetch artwork by slug
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getBySlug', slug }),
      });

      if (!response.ok) {
        router.push('/404');
        return;
      }

      const data = await response.json();

      if (!data || data.type !== 'artwork') {
        router.push('/404');
        return;
      }

      setArtwork(data);

      // Fetch related content
      const relatedResponse = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getRelated', id: data.id, limit: 3 }),
      });

      if (relatedResponse.ok) {
        const relatedData = await relatedResponse.json();
        setRelatedContent(relatedData);
      }
    } catch (error) {
      console.error('Error fetching artwork:', error);
      router.push('/404');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getMediumLabel = (medium: string) => {
    const labels: Record<string, string> = {
      'watercolor': 'Watercolor',
      'calligraphy': 'Calligraphy',
      'mixed-media': 'Mixed Media',
      'other': 'Other',
    };
    return labels[medium] || medium;
  };

  const getAvailabilityLabel = (availability?: string) => {
    const labels: Record<string, string> = {
      'available': 'Available for Purchase',
      'sold': 'Sold',
      'private-collection': 'Private Collection',
      'exhibition': 'On Exhibition',
    };
    return availability ? labels[availability] || availability : 'Contact for Availability';
  };

  const getAvailabilityColor = (availability?: string) => {
    const colors: Record<string, string> = {
      'available': 'bg-green-100 text-green-800',
      'sold': 'bg-gray-100 text-gray-800',
      'private-collection': 'bg-blue-100 text-blue-800',
      'exhibition': 'bg-purple-100 text-purple-800',
    };
    return availability ? colors[availability] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--rice-paper)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[var(--vibrant-magenta)] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-lora text-[var(--charcoal-wash)] mt-4">Loading artwork...</p>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--rice-paper)]">
      {/* Header/Navigation */}
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-montserrat text-[var(--vibrant-magenta)] hover:text-[var(--moura-teal)] transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Studio
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Image */}
          <div className="space-y-4">
            {/* Main Image with Enhanced Zoom */}
            <ZoomableImage
              src={artwork.highResUrl || artwork.imageUrl}
              alt={artwork.title}
              width={800}
              height={1000}
              priority
            />

            {/* Zoom Hint */}
            <p className="text-xs font-montserrat text-[var(--muted-foreground)] text-center">
              Click image to open zoom view • Scroll or pinch to zoom • Drag to pan
            </p>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-8">
            {/* Type Badge */}
            <div>
              <span className="inline-block px-3 py-1 text-xs font-montserrat font-semibold text-[var(--vibrant-magenta)] bg-[var(--studio-cream)] rounded-full">
                ARTWORK
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="font-montserrat text-4xl md:text-5xl font-bold text-[var(--ink-black)] mb-4 leading-tight">
                {artwork.title}
              </h1>
              {artwork.year && (
                <p className="font-lora text-xl text-[var(--charcoal-wash)]">
                  {artwork.year}
                </p>
              )}
            </div>

            {/* Artwork Details */}
            <div className="bg-[var(--studio-cream)] rounded-lg p-6 border border-[var(--border)]">
              <dl className="space-y-4 font-lora text-sm">
                <div>
                  <dt className="font-montserrat font-semibold text-[var(--ink-black)] mb-1">Medium</dt>
                  <dd className="text-[var(--charcoal-wash)]">{getMediumLabel(artwork.medium)}</dd>
                </div>

                {artwork.dimensions && (
                  <div>
                    <dt className="font-montserrat font-semibold text-[var(--ink-black)] mb-1">Dimensions</dt>
                    <dd className="text-[var(--charcoal-wash)]">
                      {artwork.dimensions.width} × {artwork.dimensions.height} {artwork.dimensions.unit}
                    </dd>
                  </div>
                )}

                {artwork.location && (
                  <div>
                    <dt className="font-montserrat font-semibold text-[var(--ink-black)] mb-1">Location</dt>
                    <dd className="text-[var(--charcoal-wash)]">{artwork.location}</dd>
                  </div>
                )}

                <div>
                  <dt className="font-montserrat font-semibold text-[var(--ink-black)] mb-1">Availability</dt>
                  <dd>
                    <span className={`inline-block px-3 py-1 text-xs font-montserrat rounded-full ${getAvailabilityColor(artwork.availability)}`}>
                      {getAvailabilityLabel(artwork.availability)}
                    </span>
                  </dd>
                </div>

                {artwork.price && artwork.availability === 'available' && (
                  <div>
                    <dt className="font-montserrat font-semibold text-[var(--ink-black)] mb-1">Price</dt>
                    <dd className="text-[var(--charcoal-wash)] text-lg font-semibold">
                      ${artwork.price.toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Artist Statement */}
            {artwork.artistStatement && (
              <div>
                <h2 className="font-montserrat text-xl font-semibold text-[var(--ink-black)] mb-4">
                  Artist Statement
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="font-lora text-[var(--charcoal-wash)] leading-relaxed">
                    {artwork.artistStatement}
                  </p>
                </div>
              </div>
            )}

            {/* Exhibition History */}
            {artwork.exhibitionHistory && artwork.exhibitionHistory.length > 0 && (
              <div>
                <h2 className="font-montserrat text-xl font-semibold text-[var(--ink-black)] mb-4">
                  Exhibition History
                </h2>
                <div className="space-y-3">
                  {artwork.exhibitionHistory.map((exhibition, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-4 border border-[var(--border)]"
                    >
                      <h3 className="font-montserrat font-semibold text-[var(--ink-black)] mb-1">
                        {exhibition.venue}
                      </h3>
                      <p className="font-lora text-sm text-[var(--charcoal-wash)]">
                        {exhibition.location}
                      </p>
                      <p className="font-lora text-xs text-[var(--muted-foreground)] mt-1">
                        {formatDate(exhibition.date)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {artwork.tags.length > 0 && (
              <div>
                <h3 className="font-montserrat text-sm font-semibold text-[var(--ink-black)] mb-3">
                  Themes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {artwork.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm font-montserrat bg-[var(--studio-cream)] text-[var(--charcoal-wash)] rounded-full border border-[var(--border)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Artworks */}
        {relatedContent.length > 0 && (
          <section className="pt-12 mt-12 border-t border-[var(--border)]">
            <h2 className="font-montserrat text-2xl font-semibold text-[var(--ink-black)] mb-6">
              Related Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedContent.map((related) => (
                <Link
                  key={related.id}
                  href={`/${related.type}s/${related.slug}`}
                  className="group block"
                >
                  <article className="bg-white rounded-lg overflow-hidden border border-[var(--border)] hover:shadow-md transition-shadow">
                    {related.type === 'artwork' && 'imageUrl' in related && (
                      <div className="aspect-[4/5] relative bg-[var(--studio-cream)]">
                        <Image
                          src={related.thumbnailUrl || related.imageUrl}
                          alt={related.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-montserrat font-semibold text-[var(--ink-black)] group-hover:text-[var(--vibrant-magenta)] transition-colors">
                        {related.title}
                      </h3>
                      {related.description && (
                        <p className="font-lora text-sm text-[var(--charcoal-wash)] line-clamp-2 mt-2">
                          {related.description}
                        </p>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
