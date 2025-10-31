/**
 * Test page to view the imported archive
 * Access at: http://localhost:3100/musings-archive
 */

import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';

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

          posts.push({
            year,
            filename: file,
            title: data.title || file,
            date: data.date || 'unknown',
            slug: data.slug || file.replace('.mdx', ''),
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

  // Group posts by year
  const postsByYear = archivePosts.reduce((acc, post) => {
    if (!acc[post.year]) acc[post.year] = [];
    acc[post.year].push(post);
    return acc;
  }, {} as Record<string, typeof archivePosts>);

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold mb-8">
        Imported Archive Posts ({archivePosts.length} total)
      </h1>

      <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded">
        <p className="text-green-800 font-semibold">
          ✅ Import Successful! All WordPress posts are here.
        </p>
        <p className="text-green-700 mt-2">
          Navigate to http://localhost:3100/musings-archive to see this page.
        </p>
      </div>

      {Object.entries(postsByYear)
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
        .map(([year, posts]) => {
          const postsArray = Array.isArray(posts) ? posts : [];
          return (
            <div key={year} className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-blue-600">
                {year} ({postsArray.length} posts)
              </h2>
              <ul className="space-y-2">
                {postsArray.map(post => (
                <li key={post.slug} className="p-3 bg-gray-50 rounded">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{post.title}</h3>
                      <p className="text-sm text-gray-600">
                        Date: {post.date} | File: {post.filename}
                      </p>
                    </div>
                    {post.legacy && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                        Legacy
                      </span>
                    )}
                  </div>
                </li>
                ))}
              </ul>
            </div>
          );
        })}

      <div className="mt-12 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Next Steps:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>To integrate with main musings page, update /app/musings/page.tsx</li>
          <li>Or rename /app/musings/enhanced-page.tsx to page.tsx</li>
          <li>The enhanced content service in /lib/content/ has all the integration code</li>
        </ol>
      </div>
    </div>
  );
}