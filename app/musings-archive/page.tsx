/**
 * Archive musings page with category filtering
 * Access at: http://localhost:3100/musings-archive
 */

import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ArchiveFilterClient from './archive-filter-client';

type ArchivePost = {
  year: string;
  filename: string;
  title: string;
  date: string;
  slug: string;
  category?: string;
  legacy?: boolean;
};

async function getArchivePosts() {
  const archiveDir = path.join(process.cwd(), 'content', 'musings', 'archive');
  const posts: ArchivePost[] = [];

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

          posts.push({
            year,
            filename: file,
            title: data.title || file,
            date: data.date || 'unknown',
            slug: data.slug || file.replace('.mdx', ''),
            category: data.category || undefined,
            legacy: data.legacy || false
          });
        }
      }
    }
  } catch (error) {
    console.error('Error reading archive:', error);
  }

  return posts.sort((a, b) => {
    if (a.date === 'unknown') return 1;
    if (b.date === 'unknown') return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export default async function MusingsArchivePage() {
  const archivePosts = await getArchivePosts();

  // Count categories
  const categoryCounts = {
    thinking: archivePosts.filter(p => p.category === 'thinking').length,
    feeling: archivePosts.filter(p => p.category === 'feeling').length,
    doing: archivePosts.filter(p => p.category === 'doing').length,
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Musings Archive</h1>
        <p className="text-gray-600 mb-8">
          {archivePosts.length} posts spanning {new Set(archivePosts.map(p => p.year)).size} years
        </p>

        <ArchiveFilterClient
          posts={archivePosts}
          categoryCounts={categoryCounts}
        />
      </div>
    </div>
  );
}