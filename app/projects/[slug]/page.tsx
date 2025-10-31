'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Project, Content } from '@/lib/types/content';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [project, setProject] = useState<Project | null>(null);
  const [relatedContent, setRelatedContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [slug]);

  const fetchProject = async () => {
    try {
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

      if (!data || data.type !== 'project') {
        router.push('/404');
        return;
      }

      setProject(data);

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
      console.error('Error fetching project:', error);
      router.push('/404');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'completed': 'bg-green-100 text-green-800',
      'ongoing': 'bg-blue-100 text-blue-800',
      'planned': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'completed': 'Completed',
      'ongoing': 'Ongoing',
      'planned': 'Planned',
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--rice-paper)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-[var(--moura-teal)] border-t-transparent rounded-full animate-spin"></div>
          <p className="font-lora text-[var(--charcoal-wash)] mt-4">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--rice-paper)]">
      {/* Header/Navigation */}
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-montserrat text-[var(--moura-teal)] hover:text-[var(--scholar-blue)] transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Studio
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Project Type Badge and Status */}
        <div className="flex items-center gap-3 mb-4">
          <span className="inline-block px-3 py-1 text-xs font-montserrat font-semibold text-[var(--moura-teal)] bg-[var(--studio-cream)] rounded-full">
            PROJECT
          </span>
          <span className={`inline-block px-3 py-1 text-xs font-montserrat font-semibold rounded-full ${getStatusColor(project.status)}`}>
            {getStatusLabel(project.status)}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-montserrat text-4xl md:text-5xl font-bold text-[var(--ink-black)] mb-6 leading-tight">
          {project.title}
        </h1>

        {/* Project Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Main Details Card */}
          <div className="md:col-span-2 bg-[var(--studio-cream)] rounded-lg p-6 border border-[var(--border)]">
            <dl className="grid md:grid-cols-2 gap-6 font-lora text-sm">
              {(project.startDate || project.endDate) && (
                <div>
                  <dt className="font-montserrat font-semibold text-[var(--ink-black)] mb-1">Timeline</dt>
                  <dd className="text-[var(--charcoal-wash)]">
                    {project.startDate && formatDate(project.startDate)}
                    {project.startDate && project.endDate && ' – '}
                    {project.endDate && formatDate(project.endDate)}
                    {project.status === 'ongoing' && !project.endDate && ' – Present'}
                  </dd>
                </div>
              )}

              {project.location && (
                <div>
                  <dt className="font-montserrat font-semibold text-[var(--ink-black)] mb-1">Location</dt>
                  <dd className="text-[var(--charcoal-wash)]">{project.location}</dd>
                </div>
              )}

              {project.role && (
                <div>
                  <dt className="font-montserrat font-semibold text-[var(--ink-black)] mb-1">Role</dt>
                  <dd className="text-[var(--charcoal-wash)]">{project.role}</dd>
                </div>
              )}

              {project.client && (
                <div>
                  <dt className="font-montserrat font-semibold text-[var(--ink-black)] mb-1">Client</dt>
                  <dd className="text-[var(--charcoal-wash)]">{project.client}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Collaborators Card */}
          {project.collaborators && project.collaborators.length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-[var(--border)]">
              <h3 className="font-montserrat font-semibold text-[var(--ink-black)] mb-3">
                Collaborators
              </h3>
              <ul className="space-y-2 text-sm font-lora text-[var(--charcoal-wash)]">
                {project.collaborators.map((collaborator, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-0.5 text-[var(--moura-teal)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {collaborator}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Description */}
        {project.description && (
          <section className="mb-12">
            <div className="prose prose-lg max-w-none">
              <p className="font-lora text-lg text-[var(--charcoal-wash)] leading-relaxed">
                {project.description}
              </p>
            </div>
          </section>
        )}

        {/* Project Images */}
        {project.images && project.images.length > 0 && (
          <section className="mb-12">
            <h2 className="font-montserrat text-2xl font-semibold text-[var(--ink-black)] mb-6">
              Gallery
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {project.images.map((image, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg overflow-hidden border border-[var(--border)]"
                >
                  <div className="aspect-[4/3] relative bg-[var(--studio-cream)]">
                    <Image
                      src={image.url}
                      alt={image.caption || `${project.title} image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {image.caption && (
                    <div className="p-4">
                      <p className="font-lora text-sm text-[var(--charcoal-wash)]">
                        {image.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Outcomes */}
        {project.outcomes && project.outcomes.length > 0 && (
          <section className="mb-12">
            <h2 className="font-montserrat text-2xl font-semibold text-[var(--ink-black)] mb-6">
              Outcomes & Impact
            </h2>
            <ul className="space-y-3">
              {project.outcomes.map((outcome, index) => (
                <li
                  key={index}
                  className="flex items-start bg-white rounded-lg p-4 border border-[var(--border)]"
                >
                  <svg className="w-5 h-5 mr-3 mt-0.5 text-[var(--moura-teal)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-lora text-[var(--charcoal-wash)]">{outcome}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid md:grid-cols-2 gap-12">
          {/* Documents */}
          {project.documents && project.documents.length > 0 && (
            <section>
              <h2 className="font-montserrat text-xl font-semibold text-[var(--ink-black)] mb-4">
                Related Documents
              </h2>
              <div className="space-y-3">
                {project.documents.map((doc, index) => (
                  <a
                    key={index}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-[var(--border)] hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-[var(--moura-teal)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="font-montserrat font-medium text-[var(--ink-black)] group-hover:text-[var(--moura-teal)] transition-colors">
                          {doc.title}
                        </p>
                        <p className="text-xs font-lora text-[var(--muted-foreground)]">
                          {doc.type}
                        </p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--moura-teal)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* External Links */}
          {project.externalLinks && project.externalLinks.length > 0 && (
            <section>
              <h2 className="font-montserrat text-xl font-semibold text-[var(--ink-black)] mb-4">
                External Links
              </h2>
              <div className="space-y-3">
                {project.externalLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-[var(--border)] hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-[var(--scholar-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <p className="font-montserrat font-medium text-[var(--ink-black)] group-hover:text-[var(--moura-teal)] transition-colors">
                        {link.title}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--moura-teal)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="mt-12">
            <h3 className="font-montserrat text-sm font-semibold text-[var(--ink-black)] mb-3">
              Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
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

        {/* Related Projects */}
        {relatedContent.length > 0 && (
          <section className="pt-12 mt-12 border-t border-[var(--border)]">
            <h2 className="font-montserrat text-2xl font-semibold text-[var(--ink-black)] mb-6">
              Related Projects
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedContent.map((related) => (
                <Link
                  key={related.id}
                  href={`/${related.type}s/${related.slug}`}
                  className="group block"
                >
                  <article className="bg-white rounded-lg p-6 border border-[var(--border)] hover:shadow-md transition-shadow h-full flex flex-col">
                    <div className="mb-2">
                      <span className="text-xs font-montserrat font-semibold text-[var(--moura-teal)]">
                        {related.type.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-montserrat font-semibold text-[var(--ink-black)] mb-2 group-hover:text-[var(--moura-teal)] transition-colors">
                      {related.title}
                    </h3>
                    {related.description && (
                      <p className="font-lora text-sm text-[var(--charcoal-wash)] line-clamp-3 flex-grow">
                        {related.description}
                      </p>
                    )}
                    <p className="font-lora text-xs text-[var(--muted-foreground)] mt-4">
                      {'startDate' in related && related.startDate
                        ? formatDate(related.startDate)
                        : formatDate(related.date)}
                    </p>
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
