'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Publication } from '@/lib/types/content';
import ViewSwitcher from '@/components/publications/ViewSwitcher';
import PublicationCard from '@/components/publications/PublicationCard';
import { useViewPreference } from '@/hooks/useViewPreference';

function PublicationGalleryContent() {
  const searchParams = useSearchParams();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { viewMode, updateViewMode, isClient } = useViewPreference({ urlParam: 'view' });

  const fetchPublications = async () => {
    console.log('[PublicationGallery] Fetching publications...');
    try {
      const response = await fetch('/api/content?type=publication', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('[PublicationGallery] Response status: ' + response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[PublicationGallery] Fetched ' + data.length + ' publications');
        setPublications(data);
        setFilteredPublications(data);
      } else {
        console.error('[PublicationGallery] Response not ok: ' + response.status + ' ' + response.statusText);
        const text = await response.text();
        console.error('[PublicationGallery] Response body: ' + text.substring(0, 500));
      }
    } catch (error) {
      console.error('[PublicationGallery] Fetch error:', error);
    } finally {
      console.log('[PublicationGallery] Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[PublicationGallery] useEffect: fetching publications');
    fetchPublications();
  }, []);

  // Read category from URL query parameter
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredPublications(publications);
    } else {
      setFilteredPublications(
        publications.filter(pub =>
          pub.category === selectedCategory ||
          pub.tags?.includes(selectedCategory)
        )
      );
    }
  }, [selectedCategory, publications]);

  const categories = ['all', 'academic', 'policy', 'book-chapter', 'landscape', 'governance', 'design'];

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
              <Link href="/gallery/artworks" className="hover:text-[var(--moura-teal)]">Artworks</Link>
              <span className="mx-2">·</span>
              <Link href="/gallery/publications" className="text-[var(--moura-teal)]">Publications</Link>
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
          Publications Archive
        </h1>
        <p className="font-lora text-lg text-[var(--charcoal-wash)] max-w-2xl mx-auto">
          Academic papers, policy documents, and thought leadership on landscape, governance, and design
        </p>
      </section>

      {/* Filter Categories & View Switcher */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            {/* Categories */}
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-montserrat text-sm transition-all ${
                    selectedCategory === category
                      ? 'bg-[var(--scholar-blue)] text-white'
                      : 'bg-white border border-[var(--border)] hover:border-[var(--scholar-blue)] text-[var(--charcoal-wash)]'
                  }`}
                >
                  {category.split('-').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </button>
              ))}
            </div>

            {/* View Switcher */}
            {isClient && (
              <div className="flex justify-center md:justify-end">
                <ViewSwitcher currentView={viewMode} onViewChange={updateViewMode} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Publications List */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div
              className={`publications-grid publications-grid--${viewMode} grid gap-6 transition-all duration-200 ${
                viewMode === 'full'
                  ? 'grid-cols-1'
                  : viewMode === 'moderate'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              }`}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-8 border border-[var(--border)] animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : filteredPublications.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-lora text-[var(--charcoal-wash)]">
                No publications found for this category.
              </p>
            </div>
          ) : (
            <div
              className={`publications-grid publications-grid--${viewMode} grid gap-6 transition-all duration-200 ${
                viewMode === 'full'
                  ? 'grid-cols-1 gap-8'
                  : viewMode === 'moderate'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              }`}
            >
              {filteredPublications.map((publication) => (
                <PublicationCard
                  key={publication.slug}
                  publication={publication}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function PublicationGallery() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PublicationGalleryContent />
    </Suspense>
  );
}