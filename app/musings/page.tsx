/**
 * Musings Page with Archive Integration
 * Uses content service to ensure proper excerpt generation
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { contentService } from '@/lib/content/content-service';
import { isMusing } from '@/lib/types/content';

export const metadata: Metadata = {
  title: 'Musings | MQ Studio',
  description: 'A living archive of reflections, thoughts, and musings spanning 15+ years of design thinking and creative practice by Moura Quayle.',
};

// Load all musings using content service
async function getAllMusings() {
  await contentService.initialize();
  const allContent = await contentService.getAllContent();
  const musings = allContent.filter(isMusing);

  // Separate current and archive musings based on metadata
  const currentMusings = musings.filter(m => !m.metadata?.legacy);
  const archiveMusings = musings.filter(m => m.metadata?.legacy);

  return {
    current: currentMusings,
    archive: archiveMusings,
    all: musings
  };
}

// Musing Card Component
function MusingCard({ musing }: { musing: any }) {
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'unknown') return 'Date unknown';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const isLegacy = musing.metadata?.legacy || false;
  const archiveYear = musing.metadata?.archiveYear;

  const getEraColor = () => {
    if (!isLegacy) return '';
    const year = archiveYear ? parseInt(archiveYear) : 0;
    if (year <= 2011) return 'border-l-4 border-blue-500';
    if (year <= 2014) return 'border-l-4 border-pink-500';
    return 'border-l-4 border-teal-500';
  };

  return (
    <article className={`bg-white rounded-lg p-6 border hover:shadow-lg transition-shadow ${getEraColor()}`}>
      {isLegacy && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
            </svg>
            From the Archives • {archiveYear || 'Legacy'}
          </span>
        </div>
      )}

      <h2 className="text-xl font-bold mb-2">
        <Link href={`/musings/${musing.slug}`} className="hover:text-blue-600 transition-colors">
          {musing.title || 'Untitled'}
        </Link>
      </h2>

      <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
        <time>{formatDate(musing.date)}</time>
        {musing.category && (
          <>
            <span>•</span>
            <span>{musing.category}</span>
          </>
        )}
        {musing.audioUrl && (
          <>
            <span>•</span>
            <span>🎵 Audio</span>
          </>
        )}
      </div>

      <p className="text-gray-700 line-clamp-3">
        {(musing.excerpt && musing.excerpt.trim()) || (musing.description && musing.description.trim()) || (isLegacy ? 'Legacy post from WordPress archive' : 'No description available.')}
      </p>

      <Link href={`/musings/${musing.slug}`} className="inline-flex items-center mt-4 text-sm font-medium text-blue-600 hover:text-blue-800">
        Read more →
      </Link>
    </article>
  );
}

export default async function MusingsPageWithArchive() {
  // Load all musings using content service
  const { current: currentMusings, archive: archiveMusings, all: allContent } = await getAllMusings();

  // Sort by date
  const allMusings = [...allContent].sort((a, b) => {
    const dateA = new Date(a.date || '1900-01-01');
    const dateB = new Date(b.date || '1900-01-01');
    return dateB.getTime() - dateA.getTime();
  });

  // Calculate stats
  const uniqueYears = new Set(
    archiveMusings
      .map(m => m.metadata?.archiveYear)
      .filter((year): year is string => year !== undefined)
  );
  const stats = {
    total: allMusings.length,
    current: currentMusings.length,
    archive: archiveMusings.length,
    years: uniqueYears.size
  };

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
              <Link href="/" className="hover:text-[var(--moura-teal)]">Home</Link>
              <span className="mx-2">·</span>
              <Link href="/gallery/artworks" className="hover:text-[var(--moura-teal)]">Artworks</Link>
              <span className="mx-2">·</span>
              <Link href="/gallery/publications" className="hover:text-[var(--moura-teal)]">Publications</Link>
              <span className="mx-2">·</span>
              <Link href="/search" className="hover:text-[var(--moura-teal)]">Search</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-6 text-center">
        <h1 className="font-montserrat text-4xl font-bold text-[var(--ink-black)] mb-4">
          Musings
        </h1>
        <p className="font-lora text-lg text-[var(--charcoal-wash)] max-w-2xl mx-auto">
          A living archive spanning {stats.years} years of reflections, observations, and evolving thoughts
          on design, governance, and creative practice. From academic discourse (2009-2011) through personal
          explorations (2012-2014) to the Designed Leadership journey (2016-2017) and beyond.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-12">

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-12 p-6 bg-white rounded-lg border">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Musings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.current}</div>
            <div className="text-xs text-gray-600">Recent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.archive}</div>
            <div className="text-xs text-gray-600">Archive</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.years}</div>
            <div className="text-xs text-gray-600">Years Covered</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 border-b">
          <nav className="flex space-x-8">
            <button className="pb-4 font-medium border-b-2 border-blue-600 text-blue-600">
              All ({stats.total})
            </button>
            <button className="pb-4 text-gray-600 hover:text-gray-900">
              Recent ({stats.current})
            </button>
            <button className="pb-4 text-gray-600 hover:text-gray-900">
              Archive ({stats.archive})
            </button>
          </nav>
        </div>

        {/* Musings Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {allMusings.map((musing, index) => (
            <MusingCard key={musing.slug || index} musing={musing} />
          ))}
        </div>

        {allMusings.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-600">No musings found.</p>
          </div>
        )}
      </main>
    </div>
  );
}