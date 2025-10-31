import { Metadata } from 'next';
import Link from 'next/link';
import { contentService } from '@/lib/content/content-service';
import { isMusing } from '@/lib/types/content';
import MusingList from '@/components/musings/MusingList';
import SubscriptionForm from '@/components/musings/SubscriptionForm';

export const metadata: Metadata = {
  title: 'Musings | MQ Studio',
  description:
    'Reflections, thoughts, and video musings on design, governance, and creative practice by Moura Quayle.',
  openGraph: {
    title: 'Musings | MQ Studio',
    description:
      'Reflections, thoughts, and video musings on design, governance, and creative practice by Moura Quayle.',
    type: 'website',
  },
};

export default async function MusingsPage() {
  const allContent = await contentService.getAllContent();
  const musings = allContent
    .filter(isMusing)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="min-h-screen bg-[var(--rice-paper)]">
      {/* Header/Navigation */}
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-montserrat text-[var(--scholar-blue)] hover:text-[var(--moura-teal)] transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Studio
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="font-montserrat text-4xl md:text-5xl font-bold text-[var(--ink-black)] mb-4">
            Musings
          </h1>
          <p className="font-lora text-lg text-[var(--charcoal-wash)] max-w-3xl leading-relaxed">
            A space for reflections, observations, and evolving thoughts on design, governance, and
            creative practice. Shared in writing, video, and sometimes both.
          </p>
        </div>

        {/* Subscription Form */}
        <div className="mb-12">
          <SubscriptionForm />
        </div>

        {/* Musings List */}
        <MusingList musings={musings} />
      </main>
    </div>
  );
}
