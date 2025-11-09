import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import RecentContent from '@/components/content/RecentContent';
import AboutSection from '@/components/about/AboutSection';
import { contentService } from '@/lib/content/content-service';

// Lazy-load SearchBar component to reduce initial bundle
const SearchBar = dynamic(() => import('@/components/search/SearchBar'), {
  loading: () => <SearchBarSkeleton />,
  ssr: false, // SearchBar has client-side interactions, load after hydration
});

// Server-side data fetching with ISR
async function getRecentContent() {
  try {
    const content = await contentService.getRecentContent(6);
    return content;
  } catch (error) {
    console.error('Error fetching recent content:', error);
    return [];
  }
}

export const revalidate = 3600; // ISR: Revalidate every hour (3600 seconds)

export default async function Home() {
  const recentContent = await getRecentContent();
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
              <Link href="/gallery/artworks" className="hover:text-[var(--moura-teal)] transition-colors">Artworks</Link>
              <span className="mx-2">·</span>
              <Link href="/gallery/publications" className="hover:text-[var(--moura-teal)] transition-colors">Publications</Link>
              <span className="mx-2">·</span>
              <Link href="/musings" className="hover:text-[var(--moura-teal)] transition-colors">Musings</Link>
              <span className="mx-2">·</span>
              <Link href="/press" className="hover:text-[var(--moura-teal)] transition-colors">Press</Link>
              <span className="mx-2">·</span>
              <Link href="/projects" className="hover:text-[var(--moura-teal)] transition-colors">Projects</Link>
              <span className="mx-2">·</span>
              <Link href="/search" className="hover:text-[var(--moura-teal)] transition-colors">Search</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* Three-Column Hero with Gradient Accents - V1 Design */}
        <section className="py-12">
          <div className="text-center mb-8">
            <p className="font-lora text-lg text-[var(--charcoal-wash)] mb-2">
              Welcome to the studio of
            </p>
            <h1 className="font-montserrat text-5xl sm:text-6xl font-bold mb-3 text-[var(--ink-black)]">
              MOURA QUAYLE
            </h1>
            <p className="font-montserrat text-lg text-[var(--scholar-blue)] tracking-wide">
              Academia · Leadership · Design
            </p>
          </div>

          {/* Three-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Thinking Column */}
            <div className="group relative overflow-hidden rounded-lg h-[500px] cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--scholar-blue)] via-blue-400 to-cyan-300 opacity-20"></div>
              <div className="relative h-full">
                <Image
                  src="/background_assets/optimized/variants/hero-image-2-web.webp"
                  alt="Thinking - Academic Research"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-auto">
                  <h2 className="font-montserrat text-3xl font-bold mb-2">Thinking</h2>
                  <p className="font-lora text-sm mb-4 opacity-90">
                    Academic papers, research, and intellectual explorations
                  </p>
                  <Link
                    href="/gallery/publications"
                    className="inline-block px-4 py-2 bg-[var(--scholar-blue)] text-white rounded-md hover:bg-opacity-90 transition-all text-sm font-montserrat"
                  >
                    Explore Publications →
                  </Link>
                </div>
              </div>
            </div>

            {/* Feeling Column */}
            <div className="group relative overflow-hidden rounded-lg h-[500px] cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--vibrant-magenta)] via-pink-400 to-purple-300 opacity-20"></div>
              <div className="relative h-full">
                <Image
                  src="/background_assets/optimized/variants/hero-image-1-web.webp"
                  alt="Feeling - Watercolor Art"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-auto">
                  <h2 className="font-montserrat text-3xl font-bold mb-2">Feeling</h2>
                  <p className="font-lora text-sm mb-4 opacity-90">
                    Watercolors, calligraphy, and visual expressions
                  </p>
                  <Link
                    href="/gallery/artworks"
                    className="inline-block px-4 py-2 bg-[var(--vibrant-magenta)] text-white rounded-md hover:bg-opacity-90 transition-all text-sm font-montserrat"
                  >
                    Explore Artworks →
                  </Link>
                </div>
              </div>
            </div>

            {/* Doing Column */}
            <div className="group relative overflow-hidden rounded-lg h-[500px] cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--moura-teal)] via-teal-400 to-green-300 opacity-20"></div>
              <div className="relative h-full">
                <Image
                  src="/background_assets/optimized/variants/hero-image-3-web.webp"
                  alt="Doing - Leadership & Design"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-auto">
                  <h2 className="font-montserrat text-3xl font-bold mb-2">Doing</h2>
                  <p className="font-lora text-sm mb-4 opacity-90">
                    Leadership initiatives and collaborative ventures
                  </p>
                  <Link
                    href="/gallery/publications?category=landscape"
                    className="inline-block px-4 py-2 bg-[var(--moura-teal)] text-white rounded-md hover:bg-opacity-90 transition-all text-sm font-montserrat"
                  >
                    Explore Projects →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            <p className="font-lora text-base text-[var(--charcoal-wash)] leading-relaxed">
              Where governance meets watercolor, policy meets poetry, and decades of scholarship
              coexist with ongoing artistic exploration. This is a workspace in motion—a place
              where thinking, feeling, and doing converge.
            </p>
          </div>
        </section>

        {/* About Section - Introduction to Moura */}
        <AboutSection />

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
          <Suspense fallback={<RecentContentSkeleton />}>
            <RecentContent content={recentContent} />
          </Suspense>
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
    </>
  );
}

// Loading skeleton for SearchBar
function SearchBarSkeleton() {
  return (
    <div className="relative">
      <div className="w-full pl-12 pr-4 py-4 rounded-lg border border-[var(--border)] bg-gray-100 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
}

// Loading skeleton for RecentContent
function RecentContentSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg p-6 border border-[var(--border)] animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-20 bg-gray-200 rounded mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
