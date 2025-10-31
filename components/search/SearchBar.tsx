'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SearchResult } from '@/lib/types/content';

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  showButton?: boolean;
  className?: string;
}

export default function SearchBar({
  placeholder = 'Search publications, artworks, musings...',
  autoFocus = false,
  showButton = true,
  className = '',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search function
  const debounceTimeout = useRef<NodeJS.Timeout>();

  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/content?search=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const results: SearchResult[] = await response.json();
        setSuggestions(results.slice(0, 5)); // Show top 5 suggestions
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout for debouncing (300ms)
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleSearch();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          const item = suggestions[selectedIndex].content;
          router.push(getContentLink(item));
          setShowSuggestions(false);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getContentLink = (item: SearchResult['content']) => {
    switch (item.type) {
      case 'publication':
        return `/publications/${item.slug}`;
      case 'artwork':
        return `/artworks/${item.slug}`;
      case 'musing':
        return `/musings/${item.slug}`;
      case 'project':
        return `/projects/${item.slug}`;
      default:
        // Exhaustive check - all cases should be handled above
        const _exhaustiveCheck: never = item;
        return `/${(item as any).type}s/${(item as any).slug}`;
    }
  };

  const getContentTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getContentColor = (category: string) => {
    switch (category) {
      case 'feeling':
        return 'text-[var(--vibrant-magenta)]';
      case 'thinking':
        return 'text-[var(--scholar-blue)]';
      case 'doing':
        return 'text-[var(--moura-teal)]';
      default:
        return 'text-[var(--muted-foreground)]';
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          {/* Search Icon */}
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full pl-12 pr-4 py-4 rounded-lg border border-[var(--border)] font-lora text-base focus:outline-none focus:ring-2 focus:ring-[var(--moura-teal)] focus:border-transparent"
            style={{ paddingRight: showButton ? '100px' : '1rem' }}
            aria-label="Search content"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
          />

          {/* Loading Spinner */}
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2" style={{ right: showButton ? '110px' : '1rem' }}>
              <div className="w-5 h-5 border-2 border-[var(--moura-teal)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Search Button */}
          {showButton && (
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--moura-teal)] text-white px-6 py-2 rounded-md font-montserrat font-medium hover:brightness-110 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--moura-teal)] focus:ring-offset-2"
              aria-label="Submit search"
            >
              Search
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          id="search-suggestions"
          className="absolute z-50 w-full mt-2 bg-white rounded-lg border border-[var(--border)] shadow-lg overflow-hidden"
          role="listbox"
        >
          {suggestions.map((result, index) => (
            <Link
              key={result.content.id}
              href={getContentLink(result.content)}
              onClick={() => setShowSuggestions(false)}
              className={`block px-4 py-3 hover:bg-[var(--studio-cream)] transition-colors ${
                index === selectedIndex ? 'bg-[var(--studio-cream)]' : ''
              } ${index !== suggestions.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-montserrat font-semibold ${getContentColor(
                        result.content.category
                      )}`}
                    >
                      {getContentTypeLabel(result.content.type)}
                    </span>
                  </div>
                  <h4
                    className="font-montserrat font-semibold text-sm text-[var(--ink-black)] truncate"
                    dangerouslySetInnerHTML={{
                      __html: result.highlights?.title || result.content.title,
                    }}
                  />
                  {result.highlights?.description && (
                    <p
                      className="font-lora text-xs text-[var(--charcoal-wash)] mt-1 line-clamp-1"
                      dangerouslySetInnerHTML={{
                        __html: result.highlights.description,
                      }}
                    />
                  )}
                </div>
                <svg
                  className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}

          {/* View All Results Link */}
          <button
            onClick={handleSearch}
            className="w-full px-4 py-3 text-center text-sm font-montserrat font-medium text-[var(--moura-teal)] hover:bg-[var(--studio-cream)] transition-colors border-t border-[var(--border)]"
          >
            View all results for &ldquo;{query}&rdquo;
          </button>
        </div>
      )}

      {/* No Results Message */}
      {showSuggestions && !loading && query.length >= 2 && suggestions.length === 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-lg border border-[var(--border)] shadow-lg p-4"
        >
          <p className="text-sm text-[var(--muted-foreground)] text-center">
            No results found for &ldquo;{query}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
