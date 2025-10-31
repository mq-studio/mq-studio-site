'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--rice-paper)] flex items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        {/* 404 Visual */}
        <div className="mb-8">
          <h1 className="font-montserrat text-9xl font-bold text-[var(--moura-teal)] opacity-20">
            404
          </h1>
        </div>

        {/* Message */}
        <h2 className="font-montserrat text-3xl font-bold text-[var(--ink-black)] mb-4">
          Content Not Found
        </h2>
        <p className="font-lora text-lg text-[var(--charcoal-wash)] mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist in the studio. Perhaps it&apos;s been moved,
          or maybe it&apos;s still being created. Let&apos;s get you back to exploring.
        </p>

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-[var(--moura-teal)] text-white font-montserrat font-medium rounded-lg hover:brightness-110 transition-all shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return to Studio
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-white text-[var(--moura-teal)] font-montserrat font-medium rounded-lg border-2 border-[var(--moura-teal)] hover:bg-[var(--studio-cream)] transition-all"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Go Back
          </button>
        </div>

        {/* Marginalia */}
        <aside className="mt-12 p-6 bg-gradient-to-br from-[var(--studio-cream)] to-white rounded-lg border-l-4 border-[var(--vibrant-magenta)]">
          <p className="font-lora italic text-[var(--charcoal-wash)] text-sm">
            &ldquo;Not all who wander are lost, but this page certainly is.&rdquo;
          </p>
          <p className="font-montserrat text-xs text-[var(--muted-foreground)] mt-2">
            — Error 404
          </p>
        </aside>
      </div>
    </div>
  );
}
