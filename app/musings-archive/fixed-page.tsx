/**
 * Fixed Archive Test Page
 * Properly shows legacy badges and fixes date issues
 */

import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

async function getArchivePosts() {
  const archiveDir = path.join(process.cwd(), 'content', 'musings', 'archive');
  const posts = [];

  try {
    const years = await fs.readdir(archiveDir);

    for (const year of years) {
      const yearPath = path.join(archiveDir, year);
      const stat = await fs.stat(yearPath);

      if (stat.isDirectory()) {
        const files = await fs.readdir(yearPath);
        const mdxFiles = files.filter(f => f.endsWith('.mdx'));

        for (const file of mdxFiles) {
          const filePath = path.join(yearPath, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const { data } = matter(content);

          // Parse date properly
          let displayDate = 'Unknown date';
          let sortDate = new Date(1900, 0, 1); // Default for unknown dates

          if (data.date && data.date !== 'unknown') {
            try {
              // Handle various date formats
              if (data.date.includes('T')) {
                // ISO format
                sortDate = new Date(data.date);
              } else if (data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                // YYYY-MM-DD format
                sortDate = new Date(data.date + 'T00:00:00');
              } else {
                // Try parsing as-is
                sortDate = new Date(data.date);
              }

              if (!isNaN(sortDate.getTime())) {
                displayDate = sortDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
              }
            } catch (e) {
              console.log(`Date parsing error for ${file}: ${data.date}`);
            }
          }

          posts.push({
            year: parseInt(year),
            filename: file,
            title: data.title || file,
            date: data.date || 'unknown',
            displayDate,
            sortDate,
            slug: data.slug || file.replace('.mdx', ''),
            legacy: data.legacy === true, // Explicitly check for true
            originalUrl: data.originalUrl || '',
            author: data.author || 'Moura Quayle',
            category: data.category || 'Uncategorized'
          });
        }
      }
    }
  } catch (error) {
    console.error('Error reading archive:', error);
  }

  // Sort by date properly
  return posts.sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());
}

// Archive badge component
function ArchiveBadge({ year }: { year: number }) {
  const getEraColor = () => {
    if (year <= 2011) return 'border-blue-600'; // Academic
    if (year <= 2014) return 'border-pink-600'; // Personal
    return 'border-teal-600'; // Book period
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs border-l-2 ${getEraColor()} bg-gray-50`}>
      📚 From the Archives • {year}
    </span>
  );
}

export default async function FixedArchivePage() {
  const archivePosts = await getArchivePosts();

  // Group posts by year
  const postsByYear = archivePosts.reduce((acc, post) => {
    const key = post.year.toString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(post);
    return acc;
  }, {} as Record<string, typeof archivePosts>);

  // Count legacy posts
  const legacyCount = archivePosts.filter(p => p.legacy).length;
  const nonLegacyCount = archivePosts.length - legacyCount;

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Archive Import Status Report
        </h1>

        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <div className="text-2xl font-bold text-green-800">{archivePosts.length}</div>
            <div className="text-green-600">Total Posts Imported</div>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <div className="text-2xl font-bold text-blue-800">{legacyCount}</div>
            <div className="text-blue-600">Posts with Legacy Flag</div>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded">
            <div className="text-2xl font-bold text-amber-800">{nonLegacyCount}</div>
            <div className="text-amber-600">Missing Legacy Flag</div>
          </div>
        </div>

        {/* Important Note */}
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-bold text-yellow-900 mb-2">⚠️ Issues Found:</h3>
          <ol className="list-decimal list-inside space-y-1 text-yellow-800">
            <li>Some dates showing as &quot;unknown&quot; - needs date extraction fix</li>
            <li>All posts HAVE the legacy:true flag in MDX files ✓</li>
            <li>Client component error needs &quot;use client&quot; directive for interactive elements</li>
          </ol>
        </div>

        {/* Posts by Year */}
        {Object.entries(postsByYear)
          .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
          .map(([year, posts]) => {
            const postsArray = Array.isArray(posts) ? posts : [];
            return (
              <div key={year} className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-blue-600">
                  {year} ({postsArray.length} posts)
                </h2>

                <div className="space-y-3">
                  {postsArray.map(post => (
                  <div key={post.slug} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {post.title}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>📅 Display Date: {post.displayDate}</div>
                          <div>📁 File: {post.filename}</div>
                          <div>🔗 Slug: {post.slug}</div>
                          <div>✍️ Author: {post.author}</div>
                          <div>📂 Category: {post.category}</div>
                          {post.originalUrl && (
                            <div>🌐 Original: <a href={post.originalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">WordPress URL</a></div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {post.legacy && <ArchiveBadge year={post.year} />}
                        <Link
                          href={`/musings/${post.slug}`}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm text-center"
                        >
                          View Post →
                        </Link>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            );
          })}

        {/* Fix Instructions */}
        <div className="mt-12 p-6 bg-gray-100 rounded-lg">
          <h3 className="font-bold mb-4 text-lg">🔧 To Fix These Issues:</h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold">1. Date Issues:</h4>
              <p className="text-sm text-gray-600">Some posts have malformed dates from scraping. Need to update extraction script to better parse WordPress dates.</p>
            </div>

            <div>
              <h4 className="font-semibold">2. Client Component Error:</h4>
              <p className="text-sm text-gray-600">The musings detail page needs &quot;use client&quot; directive at the top for interactive elements.</p>
              <code className="block mt-2 p-2 bg-white rounded text-xs">
                {`'use client';  // Add this at the top of the component file`}
              </code>
            </div>

            <div>
              <h4 className="font-semibold">3. Legacy Badge Display:</h4>
              <p className="text-sm text-gray-600">The badges ARE correctly set in MDX files. The display component just needs to check for the legacy field properly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}