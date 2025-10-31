'use client';

import { useState } from 'react';

interface CitationSectionProps {
  citations: {
    apa?: string;
    mla?: string;
    bibtex?: string;
  };
}

export default function CitationSection({ citations }: CitationSectionProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const copyCitation = async (format: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedFormat(format);
        setTimeout(() => setCopiedFormat(null), 2000);
      } catch (err) {
        console.error('Failed to copy citation:', err);
      }
    }
  };

  if (!citations.apa && !citations.mla && !citations.bibtex) {
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="font-montserrat text-2xl font-semibold text-[var(--ink-black)] mb-6">
        Cite This Publication
      </h2>

      {/* APA Citation */}
      {citations.apa && (
        <div className="mb-6 bg-white rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-montserrat font-semibold text-[var(--ink-black)]">APA</h3>
            <button
              onClick={() => copyCitation('APA', citations.apa!)}
              className="text-xs font-montserrat text-[var(--scholar-blue)] hover:text-[var(--moura-teal)] transition-colors px-3 py-1 rounded hover:bg-[var(--studio-cream)]"
            >
              {copiedFormat === 'APA' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="font-lora text-sm text-[var(--charcoal-wash)] leading-relaxed">
            {citations.apa}
          </p>
        </div>
      )}

      {/* MLA Citation */}
      {citations.mla && (
        <div className="mb-6 bg-white rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-montserrat font-semibold text-[var(--ink-black)]">MLA</h3>
            <button
              onClick={() => copyCitation('MLA', citations.mla!)}
              className="text-xs font-montserrat text-[var(--scholar-blue)] hover:text-[var(--moura-teal)] transition-colors px-3 py-1 rounded hover:bg-[var(--studio-cream)]"
            >
              {copiedFormat === 'MLA' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="font-lora text-sm text-[var(--charcoal-wash)] leading-relaxed">
            {citations.mla}
          </p>
        </div>
      )}

      {/* BibTeX Citation */}
      {citations.bibtex && (
        <div className="mb-6 bg-white rounded-lg p-6 border border-[var(--border)]">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-montserrat font-semibold text-[var(--ink-black)]">BibTeX</h3>
            <button
              onClick={() => copyCitation('BibTeX', citations.bibtex!)}
              className="text-xs font-montserrat text-[var(--scholar-blue)] hover:text-[var(--moura-teal)] transition-colors px-3 py-1 rounded hover:bg-[var(--studio-cream)]"
            >
              {copiedFormat === 'BibTeX' ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="font-mono text-xs text-[var(--charcoal-wash)] leading-relaxed whitespace-pre-wrap overflow-x-auto">
            {citations.bibtex}
          </pre>
        </div>
      )}
    </section>
  );
}
