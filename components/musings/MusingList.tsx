'use client';

import { useState } from 'react';
import { Musing } from '@/lib/types/content';
import MusingCard from './MusingCard';

interface MusingListProps {
  musings: Musing[];
}

export default function MusingList({ musings }: MusingListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { value: 'all', label: 'All Musings' },
    { value: 'thinking', label: 'Thinking', color: 'var(--scholar-blue)' },
    { value: 'feeling', label: 'Feeling', color: 'var(--living-pink)' },
    { value: 'doing', label: 'Doing', color: 'var(--moura-teal)' },
  ];

  const filteredMusings = musings.filter((musing) => {
    const matchesCategory =
      selectedCategory === 'all' || musing.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      musing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      musing.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      musing.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-[var(--border)] p-6">
        {/* Category Filter */}
        <div className="mb-4">
          <label
            htmlFor="category-filter"
            className="block font-montserrat text-sm font-semibold text-[var(--ink-black)] mb-3"
          >
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg font-montserrat text-sm font-medium transition-all ${
                  selectedCategory === category.value
                    ? 'bg-[var(--moura-teal)] text-white shadow-md'
                    : 'bg-[var(--studio-cream)] text-[var(--charcoal-wash)] hover:bg-[var(--border)]'
                }`}
                style={
                  selectedCategory === category.value && category.color
                    ? { backgroundColor: category.color }
                    : undefined
                }
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div>
          <label
            htmlFor="search-musings"
            className="block font-montserrat text-sm font-semibold text-[var(--ink-black)] mb-3"
          >
            Search Musings
          </label>
          <input
            id="search-musings"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, content, or tags..."
            className="w-full px-4 py-3 border border-[var(--border)] rounded-lg font-lora focus:outline-none focus:ring-2 focus:ring-[var(--moura-teal)] focus:border-transparent"
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="font-lora text-[var(--charcoal-wash)]">
          {filteredMusings.length} {filteredMusings.length === 1 ? 'musing' : 'musings'} found
        </p>
        {(selectedCategory !== 'all' || searchQuery !== '') && (
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="text-sm font-montserrat text-[var(--moura-teal)] hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Musings Grid */}
      {filteredMusings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMusings.map((musing) => (
            <MusingCard key={musing.id} musing={musing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-[var(--border)]">
          <p className="font-lora text-[var(--charcoal-wash)] text-lg mb-2">No musings found</p>
          <p className="font-lora text-[var(--muted-foreground)] text-sm">
            Try adjusting your filters or search query
          </p>
        </div>
      )}
    </div>
  );
}
