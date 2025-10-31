import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { contentService } from '@/lib/content/content-service';
import { isPublication, Publication } from '@/lib/types/content';
import PDFViewer from '@/components/publications/PDFViewer';
import CitationSection from '@/components/publications/CitationSection';
import { resolvePublisherLink, getPublisherButtonText } from '@/lib/utils/publisherResolver';

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const content = await contentService.getContentBySlug(params.slug);

  if (!content || !isPublication(content)) {
    return {
      title: 'Publication Not Found | MQ Studio',
    };
  }

  return {
    title: `${content.title} | MQ Studio`,
    description: content.abstract || content.description,
    authors: content.authors.map(author => ({ name: author })),
    openGraph: {
      title: content.title,
      description: content.abstract || content.description,
      type: 'article',
      publishedTime: content.date,
    },
  };
}

export default async function PublicationPage({ params }: PageProps) {
  const content = await contentService.getContentBySlug(params.slug);

  if (!content || !isPublication(content)) {
    notFound();
  }

  const publication: Publication = content;
  const relatedContent = await contentService.getRelatedContent(publication.id, 3);
  const relatedPublications = relatedContent.filter(isPublication);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[var(--rice-paper)]">
      {/* Header/Navigation */}
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4">
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

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Publication Type Badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-xs font-montserrat font-semibold text-[var(--scholar-blue)] bg-[var(--studio-cream)] rounded-full">
            PUBLICATION
          </span>
        </div>

        {/* Title */}
        <h1 className="font-montserrat text-4xl md:text-5xl font-bold text-[var(--ink-black)] mb-6 leading-tight">
          {publication.title}
        </h1>

        {/* Authors */}
        <div className="mb-6">
          <p className="font-lora text-lg text-[var(--charcoal-wash)]">
            {publication.authors.join(', ')}
          </p>
        </div>

        {/* Publication Metadata */}
        <div className="bg-[var(--studio-cream)] rounded-lg p-6 mb-8 border border-[var(--border)]">
          <dl className="grid md:grid-cols-2 gap-4 font-lora text-sm">
            {publication.journal && (
              <div>
                <dt className="font-montserrat font-semibold text-[var(--ink-black)] mb-1">Journal</dt>
                <dd className="text-[var(--charcoal-wash)]">{publication.journal}</dd>
              </div>
            )}
            {publication.date && (
              <div>
                <dt className="font-montserrat font-semibold text-[var(--ink-black)] mb-1">Published</dt>
                <dd className="text-[var(--charcoal-wash)]">{formatDate(publication.date)}</dd>
              </div>
            )}
            {(publication.volume || publication.issue) && (
              <div>
                <dt className="font-montserrat font-semibold text-[var(--ink-black)] mb-1">Volume/Issue</dt>
                <dd className="text-[var(--charcoal-wash)]">
                  {publication.volume && `Vol. ${publication.volume}`}
                  {publication.volume && publication.issue && ', '}
                  {publication.issue && `No. ${publication.issue}`}
                </dd>
              </div>
            )}
            {publication.pages && (
              <div>
                <dt className="font-montserrat font-semibold text-[var(--ink-black)] mb-1">Pages</dt>
                <dd className="text-[var(--charcoal-wash)]">{publication.pages}</dd>
              </div>
            )}
            {publication.doi && (
              <div className="md:col-span-2">
                <dt className="font-montserrat font-semibold text-[var(--ink-black)] mb-1">DOI</dt>
                <dd className="text-[var(--charcoal-wash)]">
                  <a
                    href={`https://doi.org/${publication.doi.replace(/['"]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--scholar-blue)] hover:text-[var(--moura-teal)] transition-colors underline"
                  >
                    {publication.doi.replace(/['"]/g, '')}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Abstract */}
        {publication.abstract && (
          <section className="mb-12">
            <h2 className="font-montserrat text-2xl font-semibold text-[var(--ink-black)] mb-4">
              Abstract
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="font-lora text-[var(--charcoal-wash)] leading-relaxed">
                {publication.abstract}
              </p>
            </div>
          </section>
        )}

        {/* PDF Viewer and Publisher Link */}
        <div className="mb-12">
          {publication.pdfUrl && (
            <PDFViewer
              pdfUrl={publication.pdfUrl}
              title={publication.title}
              pdfSize={publication.pdfSize}
            />
          )}

          {/* Publisher Link */}
          {(() => {
            const publisherInfo = resolvePublisherLink(publication);
            if (publisherInfo) {
              return (
                <div className={publication.pdfUrl ? 'mt-4' : ''}>
                  <a
                    href={publisherInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 border-2 border-[var(--scholar-blue)] text-[var(--scholar-blue)] font-montserrat font-medium rounded-lg hover:bg-[var(--scholar-blue)] hover:text-white transition-all"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {getPublisherButtonText(publisherInfo)}
                  </a>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Citations */}
        {publication.citations && (
          <CitationSection citations={publication.citations} />
        )}

        {/* Tags */}
        {publication.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="font-montserrat text-sm font-semibold text-[var(--ink-black)] mb-3">
              Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {publication.tags.map((tag) => (
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

        {/* Related Publications */}
        {relatedPublications.length > 0 && (
          <section className="pt-12 border-t border-[var(--border)]">
            <h2 className="font-montserrat text-2xl font-semibold text-[var(--ink-black)] mb-6">
              Related Publications
            </h2>
            <div className="space-y-4">
              {relatedPublications.map((related) => (
                <Link
                  key={related.id}
                  href={`/publications/${related.slug}`}
                  className="block p-6 bg-white rounded-lg border border-[var(--border)] hover:shadow-md transition-shadow"
                >
                  <h3 className="font-montserrat font-semibold text-[var(--ink-black)] mb-2 hover:text-[var(--scholar-blue)] transition-colors">
                    {related.title}
                  </h3>
                  {related.description && (
                    <p className="font-lora text-sm text-[var(--charcoal-wash)] line-clamp-2">
                      {related.description}
                    </p>
                  )}
                  <p className="font-lora text-xs text-[var(--muted-foreground)] mt-2">
                    {formatDate(related.date)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
