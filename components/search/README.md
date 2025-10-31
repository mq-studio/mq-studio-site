# Search Functionality Documentation

## Overview

The MQ Studio website includes a comprehensive search system that allows users to search across all content types (Publications, Artworks, Musings, and Projects) with real-time suggestions and a dedicated search results page.

## Components

### SearchBar Component
**Location:** `/components/search/SearchBar.tsx`

A reusable search bar component with the following features:

#### Features
- **Debounced Search**: 300ms debounce prevents excessive API calls
- **Auto-suggestions**: Shows top 5 results as user types (minimum 2 characters)
- **Keyboard Navigation**: Arrow keys to navigate suggestions, Enter to select, Escape to close
- **Search Highlighting**: Highlights matching terms in suggestions
- **Loading States**: Visual feedback during search operations
- **Accessibility**: Proper ARIA labels and keyboard support
- **Responsive Design**: Works on mobile and desktop

#### Props
```typescript
interface SearchBarProps {
  placeholder?: string;      // Default: "Search publications, artworks, musings..."
  autoFocus?: boolean;       // Default: false
  showButton?: boolean;      // Default: true (show search button)
  className?: string;        // Additional CSS classes
}
```

#### Usage Example
```tsx
import SearchBar from '@/components/search/SearchBar';

// Basic usage
<SearchBar />

// Custom placeholder, no button
<SearchBar
  placeholder="Search MQ Studio..."
  showButton={false}
/>

// Auto-focus for search pages
<SearchBar autoFocus={true} />
```

### Search Results Page
**Location:** `/app/search/page.tsx`

A dedicated page for displaying search results with the following features:

#### Features
- **URL Query Parameters**: Supports `?q=search+term` for shareable links
- **Grouped Results**: Results grouped by content type (Publications, Artworks, Musings, Projects)
- **Result Count**: Shows total results per type and overall
- **Highlighted Text**: Search terms highlighted in results
- **Rich Metadata**: Displays dates, tags, and type-specific information
- **Loading States**: Skeleton loaders during search
- **Error Handling**: Graceful error messages with retry option
- **Empty States**: Clear messaging when no results found

#### URL Structure
```
/search?q=governance          # Search for "governance"
/search?q=watercolor+garden   # Search for "watercolor garden"
/search                       # Empty search page
```

## API Integration

The search functionality uses the existing `/api/content` endpoint:

### Search Endpoint
```
GET /api/content?search={query}
```

**Response Format:**
```typescript
SearchResult[] = [
  {
    content: Content,          // Full content object
    score: number,             // Relevance score
    highlights: {              // Optional highlighted snippets
      title?: string,          // Title with <mark> tags
      description?: string,    // Description with <mark> tags
      content?: string         // Content excerpt with <mark> tags
    }
  }
]
```

### Search Algorithm

The search service (`/lib/content/content-service.ts`) uses a weighted scoring system:

- **Title Match**: 10 points (highest priority)
- **Description Match**: 5 points
- **Tags Match**: 3 points per tag
- **Abstract Match** (publications): 4 points
- **Content Match** (musings): 2 points

Results are sorted by score (highest first).

## Styling

### CSS Variables Used
- `--moura-teal`: Primary interactive color
- `--scholar-blue`: Thinking category
- `--vibrant-magenta`: Feeling category
- `--ink-black`: Primary text
- `--charcoal-wash`: Secondary text
- `--studio-cream`: Hover states
- `--border`: Borders
- `--spring-yellow`: Search highlighting (with transparency)

### Search Highlighting
```css
mark {
  background-color: rgba(244, 185, 66, 0.3);
  color: var(--ink-black);
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 600;
}
```

## Accessibility Features

1. **ARIA Labels**: All interactive elements properly labeled
2. **Keyboard Navigation**:
   - Tab to navigate between elements
   - Arrow keys for suggestion selection
   - Enter to submit or select
   - Escape to close suggestions
3. **Focus Management**: Clear focus indicators
4. **Screen Reader Support**: Proper ARIA roles and states
5. **Semantic HTML**: Proper heading hierarchy and structure

## Performance Optimizations

1. **Debouncing**: 300ms delay prevents excessive API calls
2. **Result Limiting**: Suggestions limited to 5 items
3. **Lazy Loading**: Search results page uses Suspense
4. **Click Outside**: Efficient event listener cleanup
5. **Memoization**: Prevents unnecessary re-renders

## Testing the Search

### Sample Queries
- `governance` - Should return publications and projects
- `watercolor` - Should return artworks
- `design` - Should return musings, publications, and projects
- `garden` - Should return artworks and projects
- `calligraphy` - Should return artworks
- `policy` - Should return publications

### Test Cases
1. **Empty Query**: Should show empty state
2. **No Results**: Should show "no results" message
3. **Single Character**: Should not trigger search (minimum 2 chars)
4. **Special Characters**: Should handle gracefully
5. **Long Queries**: Should work with multi-word searches
6. **Navigation**: Keyboard navigation should work smoothly

## Future Enhancements

### Planned Features
1. **Advanced Filters**: Filter by type, category, date range, tags
2. **Faceted Search**: Show filter counts and allow refinement
3. **Search History**: Store recent searches (localStorage)
4. **Autocomplete**: Suggest common search terms
5. **Full-Text Search**: Implement Elasticsearch or Algolia for better search
6. **Voice Search**: Add speech recognition support
7. **Search Analytics**: Track popular searches and no-result queries

### Performance Improvements
1. **Server-Side Caching**: Cache common search queries
2. **Index Optimization**: Build search index for faster lookups
3. **Progressive Enhancement**: Show cached results immediately
4. **Infinite Scroll**: Load more results as user scrolls

## Troubleshooting

### Search Not Working
1. Check API endpoint is accessible: `/api/content?search=test`
2. Verify content files exist in `/content/` directories
3. Check browser console for errors
4. Ensure JavaScript is enabled

### Suggestions Not Showing
1. Verify query length (minimum 2 characters)
2. Check network tab for API responses
3. Verify SearchBar component is mounted
4. Check for CSS z-index conflicts

### Highlighting Not Working
1. Verify `mark` CSS is loaded
2. Check API returns highlights object
3. Ensure dangerouslySetInnerHTML is used correctly

## File Structure

```
website-mq-studio/
├── app/
│   ├── search/
│   │   └── page.tsx           # Search results page
│   ├── page.tsx                # Homepage (uses SearchBar)
│   └── globals.css             # Global styles (includes mark styles)
├── components/
│   └── search/
│       ├── SearchBar.tsx       # Reusable search bar component
│       └── README.md           # This file
├── lib/
│   ├── content/
│   │   └── content-service.ts # Search implementation
│   └── types/
│       └── content.ts          # Type definitions
└── content/                    # Content files (markdown)
    ├── publications/
    ├── artworks/
    ├── musings/
    └── projects/
```

## Related Documentation

- [Content Service](/lib/content/content-service.ts) - Search algorithm implementation
- [Content Types](/lib/types/content.ts) - Type definitions
- [API Routes](/app/api/content/route.ts) - API endpoint documentation
