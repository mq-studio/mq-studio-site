'use client';

import { useState } from 'react';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  pdfSize?: number;
}

export default function PDFViewer({ pdfUrl, title, pdfSize }: PDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const handleViewPDF = () => {
    setShowViewer(true);
    setLoadError(false);
  };

  const handleClose = () => {
    setShowViewer(false);
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = () => {
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-12">
        <button
          onClick={handleViewPDF}
          className="inline-flex items-center px-6 py-3 bg-[var(--scholar-blue)] text-white font-montserrat font-medium rounded-lg hover:brightness-110 transition-all shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Read Paper
        </button>

        <a
          href={pdfUrl}
          download
          className="inline-flex items-center px-6 py-3 border-2 border-[var(--scholar-blue)] text-[var(--scholar-blue)] font-montserrat font-medium rounded-lg hover:bg-[var(--scholar-blue)] hover:text-white transition-all"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
          {pdfSize && (
            <span className="ml-2 text-sm opacity-80">
              ({(pdfSize / 1024 / 1024).toFixed(1)} MB)
            </span>
          )}
        </a>
      </div>

      {/* PDF Viewer Modal */}
      {showViewer && (
        <div className={`fixed inset-0 z-50 ${isFullscreen ? '' : 'p-4 md:p-8'}`}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-75"
            onClick={handleClose}
          />

          {/* Viewer Container */}
          <div className={`relative bg-white rounded-lg shadow-2xl ${
            isFullscreen ? 'w-full h-full' : 'w-full h-full max-w-7xl mx-auto'
          }`}>
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b border-[var(--border)] rounded-t-lg">
              <div className="flex items-center justify-between px-6 py-4">
                <h3 className="font-montserrat text-lg font-semibold text-[var(--ink-black)] truncate pr-4">
                  {title}
                </h3>
                <div className="flex items-center gap-2">
                  {/* Fullscreen Toggle */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 text-[var(--charcoal-wash)] hover:text-[var(--scholar-blue)] transition-colors rounded hover:bg-[var(--studio-cream)]"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  >
                    {isFullscreen ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    )}
                  </button>

                  {/* Download Button */}
                  <button
                    onClick={handleDownload}
                    className="p-2 text-[var(--charcoal-wash)] hover:text-[var(--scholar-blue)] transition-colors rounded hover:bg-[var(--studio-cream)]"
                    title="Download PDF"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={handleClose}
                    className="p-2 text-[var(--charcoal-wash)] hover:text-red-600 transition-colors rounded hover:bg-[var(--studio-cream)]"
                    title="Close"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* PDF Content */}
            <div className={`${isFullscreen ? 'h-full pt-[73px]' : 'h-full pt-[73px]'} bg-gray-100`}>
              {!loadError ? (
                <iframe
                  src={`${pdfUrl}#view=FitH`}
                  className="w-full h-full rounded-b-lg"
                  title={`PDF: ${title}`}
                  onError={() => setLoadError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <svg className="w-16 h-16 text-[var(--charcoal-wash)] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="font-montserrat text-xl font-semibold text-[var(--ink-black)] mb-2">
                    Unable to Load PDF
                  </h3>
                  <p className="font-lora text-[var(--charcoal-wash)] mb-6 max-w-md">
                    The PDF viewer couldn&apos;t load the document. You can still download it to view offline.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-[var(--scholar-blue)] text-white font-montserrat font-medium rounded-lg hover:brightness-110 transition-all"
                  >
                    Download PDF Instead
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}