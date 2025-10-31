import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { contentService } from '@/lib/content/content-service';
import { isMusing, Musing } from '@/lib/types/content';
import VideoPlayer from '@/components/musings/VideoPlayer';
import CommentSection from '@/components/musings/CommentSection';
import ShareButtons from '@/components/musings/ShareButtons';

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const content = await contentService.getContentBySlug(params.slug);

  if (!content || !isMusing(content)) {
    return {
      title: 'Musing Not Found | MQ Studio',
    };
  }

  return {
    title: `${content.title} | Musings | MQ Studio`,
    description: content.excerpt || content.description,
    authors: [{ name: 'Moura Quayle' }],
    openGraph: {
      title: content.title,
      description: content.excerpt || content.description,
      type: 'article',
      publishedTime: content.date,
    },
  };
}

export default async function MusingPage({ params }: PageProps) {
  const content = await contentService.getContentBySlug(params.slug);

  if (!content || !isMusing(content)) {
    notFound();
  }

  const musing: Musing = content;
  const relatedContent = await contentService.getRelatedContent(musing.id, 3);
  const relatedMusings = relatedContent.filter(isMusing);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'thinking':
        return 'var(--scholar-blue)';
      case 'feeling':
        return 'var(--living-pink)';
      case 'doing':
        return 'var(--moura-teal)';
      default:
        return 'var(--scholar-blue)';
    }
  };

  const getCategoryBgColor = (category: string) => {
    switch (category) {
      case 'thinking':
        return 'rgba(44, 89, 133, 0.1)';
      case 'feeling':
        return 'rgba(233, 30, 99, 0.1)';
      case 'doing':
        return 'rgba(0, 168, 168, 0.1)';
      default:
        return 'rgba(44, 89, 133, 0.1)';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--rice-paper)]">
      {/* Header/Navigation */}
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/musings"
            className="inline-flex items-center text-sm font-montserrat text-[var(--scholar-blue)] hover:text-[var(--moura-teal)] transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Musings
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Category Badge */}
        <div className="mb-4">
          <span
            className="inline-block px-3 py-1 text-xs font-montserrat font-semibold rounded-full uppercase tracking-wide"
            style={{
              backgroundColor: getCategoryBgColor(musing.category),
              color: getCategoryColor(musing.category),
            }}
          >
            {musing.category}
          </span>
          {musing.videoId && (
            <span className="ml-2 inline-block px-3 py-1 text-xs font-montserrat font-semibold rounded-full uppercase tracking-wide bg-[var(--studio-cream)] text-[var(--charcoal-wash)]">
              Video
            </span>
          )}
          {musing.audioUrl && (
            <span className="ml-2 inline-block px-3 py-1 text-xs font-montserrat font-semibold rounded-full uppercase tracking-wide bg-[var(--studio-cream)] text-[var(--charcoal-wash)]">
              Audio
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-montserrat text-4xl md:text-5xl font-bold text-[var(--ink-black)] mb-6 leading-tight">
          {musing.title}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-[var(--border)]">
          <time className="font-lora text-[var(--charcoal-wash)]">{formatDate(musing.date)}</time>
          {musing.readingTime && !musing.videoId && (
            <span className="font-montserrat text-sm text-[var(--muted-foreground)]">
              {musing.readingTime} min read
            </span>
          )}
        </div>

        {/* Video Player */}
        {musing.videoId && (
          <div className="mb-8">
            <VideoPlayer videoId={musing.videoId} title={musing.title} />
          </div>
        )}

        {/* Audio Player */}
        {musing.audioUrl && (
          <div className="mb-8">
            <audio
              controls
              className="w-full"
              style={{
                backgroundColor: 'var(--studio-cream)',
                borderRadius: '8px',
                padding: '12px',
              }}
            >
              <source src={musing.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Content */}
        <article className="prose prose-lg max-w-none mb-12">
          <div className="font-lora text-[var(--ink-black)] leading-relaxed">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="font-montserrat text-3xl font-bold text-[var(--ink-black)] mt-8 mb-4">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="font-montserrat text-2xl font-bold text-[var(--ink-black)] mt-6 mb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="font-montserrat text-xl font-semibold text-[var(--ink-black)] mt-4 mb-2">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 leading-relaxed text-[var(--charcoal-wash)]">{children}</p>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-[var(--moura-teal)] hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2 text-[var(--charcoal-wash)]">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 text-[var(--charcoal-wash)]">
                    {children}
                  </ol>
                ),
                blockquote: ({ children }) => (
                  <blockquote
                    className="border-l-4 pl-4 py-2 my-6 italic"
                    style={{ borderColor: getCategoryColor(musing.category) }}
                  >
                    {children}
                  </blockquote>
                ),
              }}
            >
              {musing.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* David's Note (Marginalia) */}
        {musing.davidNote && (
          <aside className="mb-12 p-6 rounded-lg border-l-4 bg-opacity-5" style={{
            borderColor: 'var(--scholar-blue)',
            backgroundColor: 'rgba(44, 89, 133, 0.05)'
          }}>
            <h3 className="font-montserrat text-sm font-semibold text-[var(--scholar-blue)] mb-2 uppercase tracking-wide">
              Marginalia
            </h3>
            <blockquote className="font-lora text-[var(--charcoal-wash)] italic leading-relaxed">
              {musing.davidNote}
            </blockquote>
            <cite className="block text-right mt-2 font-montserrat text-xs text-[var(--muted-foreground)]">
              — David Fushtey
            </cite>
          </aside>
        )}

        {/* Tags */}
        {musing.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="font-montserrat text-sm font-semibold text-[var(--ink-black)] mb-3">
              Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {musing.tags.map((tag) => (
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

        {/* Share Buttons */}
        <div className="mb-12 pb-12 border-b border-[var(--border)]">
          <h3 className="font-montserrat text-sm font-semibold text-[var(--ink-black)] mb-3">
            Share this musing
          </h3>
          <ShareButtons title={musing.title} />
        </div>

        {/* Comments Section */}
        <CommentSection slug={musing.slug} title={musing.title} />

        {/* Related Musings */}
        {relatedMusings.length > 0 && (
          <section className="mt-12 pt-12 border-t border-[var(--border)]">
            <h2 className="font-montserrat text-2xl font-semibold text-[var(--ink-black)] mb-6">
              Related Musings
            </h2>
            <div className="space-y-4">
              {relatedMusings.map((related) => (
                <Link
                  key={related.id}
                  href={`/musings/${related.slug}`}
                  className="block p-6 bg-white rounded-lg border border-[var(--border)] hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {related.videoId && (
                      <div className="relative w-24 h-18 flex-shrink-0">
                        <Image
                          src={`https://img.youtube.com/vi/${related.videoId}/default.jpg`}
                          alt=""
                          width={120}
                          height={90}
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-montserrat font-semibold text-[var(--ink-black)] mb-2 hover:text-[var(--moura-teal)] transition-colors">
                        {related.title}
                      </h3>
                      {related.excerpt && (
                        <p className="font-lora text-sm text-[var(--charcoal-wash)] line-clamp-2">
                          {related.excerpt}
                        </p>
                      )}
                      <p className="font-lora text-xs text-[var(--muted-foreground)] mt-2">
                        {formatDate(related.date)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
