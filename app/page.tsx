import Image from 'next/image';
import RecentContent from '@/components/content/RecentContent';
import SearchBar from '@/components/search/SearchBar';

export default function Home() {
  return (
    <>
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-2 sm:mb-0">
              <div className="flex items-center gap-3 font-montserrat font-semibold text-lg">
                <span className="w-6 h-6 bg-gradient-to-br from-[var(--moura-teal)] to-[var(--scholar-blue)] rounded-full"></span>
                MQ STUDIO
              </div>
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
        {/* Scholarly Garden Hero - Split Screen */}
        <section className="py-12">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Side - Text */}
            <div className="text-center lg:text-left">
              <p className="font-lora text-lg text-[var(--charcoal-wash)] mb-3">
                Welcome to the studio of
              </p>
              <h1 className="font-montserrat text-5xl font-bold mb-4 text-[var(--ink-black)]">
                MOURA QUAYLE
              </h1>
              <p className="font-montserrat text-lg text-[var(--scholar-blue)] tracking-wide">
                Academia · Leadership · Design
              </p>
              <div className="mt-8">
                <p className="font-lora text-base text-[var(--charcoal-wash)] leading-relaxed">
                  Where governance meets watercolor, policy meets poetry, and decades of scholarship
                  coexist with ongoing artistic exploration. This is a workspace in motion—a place
                  where thinking, feeling, and doing converge.
                </p>
              </div>
            </div>

            {/* Right Side - Featured Artwork (Placeholder) */}
            <div className="bg-gradient-to-br from-[var(--rice-paper)] to-[var(--studio-cream)] rounded-lg p-8 min-h-[400px] flex items-center justify-center border border-[var(--border)]">
              <div className="text-center">
                <p className="font-lora text-[var(--charcoal-wash)] mb-2">Featured Artwork</p>
                <p className="font-montserrat text-sm text-[var(--muted-foreground)]">
                  Daily rotating selection
                </p>
                {/* This will be replaced with actual Image component when artwork is available */}
                <div className="mt-4 w-full h-64 bg-white/50 rounded flex items-center justify-center">
                  <span className="text-[var(--muted-foreground)]">[Watercolor/Artwork]</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search Bar - Prominent */}
        <section className="py-8 border-t border-b border-[var(--border)]">
          <div className="max-w-2xl mx-auto">
            <SearchBar placeholder="Search publications, artworks, musings..." />
          </div>
        </section>

        {/* Three Entry Points: Feeling, Thinking, Doing */}
        <section className="py-16">
          <h2 className="font-montserrat text-2xl font-semibold text-center mb-12 text-[var(--ink-black)]">
            Explore the Studio
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feeling - Art */}
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-[var(--studio-cream)] to-white rounded-lg p-8 h-full border border-[var(--border)] hover:border-[var(--vibrant-magenta)] transition-all hover:shadow-lg">
                <h3 className="font-montserrat text-xl font-semibold mb-3 text-[var(--vibrant-magenta)]">
                  Feeling
                </h3>
                <p className="font-lora text-[var(--charcoal-wash)] mb-4">
                  Watercolors, calligraphy, and visual expressions that capture emotion and beauty
                </p>
                <div className="space-y-2 text-sm">
                  <a href="/gallery/artworks?tag=watercolour" className="block hover:text-[var(--vibrant-magenta)] transition-colors">
                    → Watercolor Gallery
                  </a>
                  <a href="/gallery/artworks?tag=shufa" className="block hover:text-[var(--vibrant-magenta)] transition-colors">
                    → Shufa Calligraphy
                  </a>
                  <a href="/gallery/artworks?tag=mixed media" className="block hover:text-[var(--vibrant-magenta)] transition-colors">
                    → Mixed Media Works
                  </a>
                </div>
              </div>
            </div>

            {/* Thinking - Academia */}
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-[var(--studio-cream)] to-white rounded-lg p-8 h-full border border-[var(--border)] hover:border-[var(--scholar-blue)] transition-all hover:shadow-lg">
                <h3 className="font-montserrat text-xl font-semibold mb-3 text-[var(--scholar-blue)]">
                  Thinking
                </h3>
                <p className="font-lora text-[var(--charcoal-wash)] mb-4">
                  Academic papers, research, and intellectual explorations in governance and design
                </p>
                <div className="space-y-2 text-sm">
                  <a href="/gallery/publications?category=academic" className="block hover:text-[var(--scholar-blue)] transition-colors">
                    → Academic Papers
                  </a>
                  <a href="/gallery/publications?category=book-chapter" className="block hover:text-[var(--scholar-blue)] transition-colors">
                    → Book Chapters
                  </a>
                  <a href="/gallery/publications?category=policy" className="block hover:text-[var(--scholar-blue)] transition-colors">
                    → Policy Documents
                  </a>
                </div>
              </div>
            </div>

            {/* Doing - Leadership/Projects */}
            <div className="group cursor-pointer">
              <div className="bg-gradient-to-br from-[var(--studio-cream)] to-white rounded-lg p-8 h-full border border-[var(--border)] hover:border-[var(--moura-teal)] transition-all hover:shadow-lg">
                <h3 className="font-montserrat text-xl font-semibold mb-3 text-[var(--moura-teal)]">
                  Doing
                </h3>
                <p className="font-lora text-[var(--charcoal-wash)] mb-4">
                  Leadership initiatives, landscape design projects, and collaborative ventures
                </p>
                <div className="space-y-2 text-sm">
                  <a href="/gallery/publications?category=landscape" className="block hover:text-[var(--moura-teal)] transition-colors">
                    → Landscape Design
                  </a>
                  <a href="/gallery/publications?category=governance" className="block hover:text-[var(--moura-teal)] transition-colors">
                    → Governance Projects
                  </a>
                  <a href="/gallery/publications?category=design" className="block hover:text-[var(--moura-teal)] transition-colors">
                    → Collaborations
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Additions */}
        <section className="py-16 border-t border-[var(--border)]">
          <h2 className="font-montserrat text-2xl font-semibold text-center mb-12 text-[var(--ink-black)]">
            Recent Additions to the Studio
          </h2>
          <RecentContent />
        </section>

        {/* Marginalia Section - David's Voice */}
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