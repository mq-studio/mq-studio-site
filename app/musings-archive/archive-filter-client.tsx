'use client';

import { useState, useMemo } from 'react';

type ArchivePost = {
  year: string;
  filename: string;
  title: string;
  date: string;
  slug: string;
  category?: string;
  legacy?: boolean;
};

type CategoryCounts = {
  thinking: number;
  feeling: number;
  doing: number;
};

type FilterCategory = 'all' | 'thinking' | 'feeling' | 'doing';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  thinking: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  feeling: {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    border: 'border-pink-200'
  },
  doing: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200'
  }
};

const CATEGORY_ICONS: Record<string, string> = {
  thinking: '🧠',
  feeling: '💭',
  doing: '✨'
};

export default function ArchiveFilterClient({
  posts,
  categoryCounts
}: {
  posts: ArchivePost[];
  categoryCounts: CategoryCounts;
}) {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  // Filter posts based on active category
  const filteredPosts = useMemo(() => {
    if (activeFilter === 'all') {
      return posts;
    }
    return posts.filter(post => post.category === activeFilter);
  }, [posts, activeFilter]);

  // Group filtered posts by year
  const postsByYear = useMemo(() => {
    return filteredPosts.reduce((acc, post) => {
      if (!acc[post.year]) acc[post.year] = [];
      acc[post.year].push(post);
      return acc;
    }, {} as Record<string, typeof filteredPosts>);
  }, [filteredPosts]);

  const filterButtons = [
    {
      id: 'all' as const,
      label: 'All',
      count: posts.length,
      icon: '📚'
    },
    {
      id: 'thinking' as const,
      label: 'Thinking',
      count: categoryCounts.thinking,
      icon: CATEGORY_ICONS.thinking
    },
    {
      id: 'feeling' as const,
      label: 'Feeling',
      count: categoryCounts.feeling,
      icon: CATEGORY_ICONS.feeling
    },
    {
      id: 'doing' as const,
      label: 'Doing',
      count: categoryCounts.doing,
      icon: CATEGORY_ICONS.doing
    }
  ];

  return (
    <div>
      {/* Category Filter Buttons */}
      <div className="mb-10 flex flex-wrap gap-3">
        {filterButtons.map(button => (
          <button
            key={button.id}
            onClick={() => setActiveFilter(button.id)}
            aria-pressed={activeFilter === button.id}
            aria-label={`Filter by ${button.label} category (${button.count} posts)`}
            className={`
              px-5 py-3 rounded-lg font-semibold text-sm transition-all duration-200
              flex items-center gap-2 whitespace-nowrap
              ${
                activeFilter === button.id
                  ? 'text-white shadow-md scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            style={
              activeFilter === button.id
                ? { backgroundColor: 'var(--moura-teal)' }
                : undefined
            }
          >
            <span className="text-lg">{button.icon}</span>
            {button.label}
            <span className="ml-1 bg-opacity-30 bg-black px-2 py-0.5 rounded text-xs font-mono">
              {button.count}
            </span>
          </button>
        ))}
      </div>

      {/* Results Summary */}
      <div className="mb-6 text-sm text-gray-600">
        {activeFilter === 'all' ? (
          <p>Showing all {filteredPosts.length} posts</p>
        ) : (
          <p>
            Showing {filteredPosts.length} {activeFilter} post{filteredPosts.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Posts organized by year */}
      {Object.entries(postsByYear)
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
        .map(([year, yearPosts]) => {
          const postsArray = Array.isArray(yearPosts) ? yearPosts : [];
          return (
            <div key={year} className="mb-10">
              <h2 className="text-2xl font-bold mb-5 text-gray-800 border-b-2 border-teal-200 pb-3">
                {year} <span className="text-lg text-gray-500">({postsArray.length})</span>
              </h2>
              <ul className="space-y-3">
                {postsArray.map(post => {
                  const colors = post.category ? CATEGORY_COLORS[post.category] : null;
                  return (
                    <li
                      key={post.slug}
                      className={`
                        p-4 rounded-lg border transition-all duration-200 hover:shadow-md
                        ${
                          colors
                            ? `${colors.bg} ${colors.border} border`
                            : 'bg-gray-50 border border-gray-200'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {post.date !== 'unknown' && (
                              <>
                                <time dateTime={post.date}>
                                  {new Date(post.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </time>
                                {' • '}
                              </>
                            )}
                            {post.category && CATEGORY_COLORS[post.category] && (
                              <>
                                <span
                                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                    CATEGORY_COLORS[post.category].text
                                  }`}
                                >
                                  {CATEGORY_ICONS[post.category]} {post.category}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                        {post.legacy && (
                          <span
                            className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full whitespace-nowrap"
                            aria-label="Legacy post"
                          >
                            Legacy
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}

      {/* Empty state */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No posts found in this category.</p>
        </div>
      )}
    </div>
  );
}
