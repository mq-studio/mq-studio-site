# Search Functionality Architecture

## Component Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
    ┌───────────────────────┐       ┌──────────────────────┐
    │   Homepage (/)        │       │  Search Page         │
    │   app/page.tsx        │       │  /search?q={query}   │
    │                       │       │  app/search/page.tsx │
    │  ┌─────────────────┐  │       │                      │
    │  │   SearchBar     │  │       │  ┌─────────────────┐ │
    │  │   Component     │  │       │  │   SearchBar     │ │
    │  └─────────────────┘  │       │  │   Component     │ │
    └───────────────────────┘       │  └─────────────────┘ │
                │                   │         │            │
                │                   │  ┌──────▼──────────┐ │
                │                   │  │  Results View   │ │
                │                   │  │  - Grouped      │ │
                │                   │  │  - Highlighted  │ │
                │                   │  └─────────────────┘ │
                │                   └──────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │  components/search/   │
    │  SearchBar.tsx        │
    ├───────────────────────┤
    │  Features:            │
    │  • Debouncing (300ms) │
    │  • Suggestions (top 5)│
    │  • Keyboard nav       │
    │  • Highlighting       │
    │  • Loading states     │
    │  • Click outside      │
    └───────────────────────┘
                │
                ▼
    ┌───────────────────────────────────────────────────┐
    │         API Layer                                  │
    │  GET /api/content?search={query}                   │
    │  app/api/content/route.ts                          │
    └───────────────────────────────────────────────────┘
                │
                ▼
    ┌───────────────────────────────────────────────────┐
    │  Content Service                                   │
    │  lib/content/content-service.ts                    │
    ├───────────────────────────────────────────────────┤
    │  searchContent(query: string): SearchResult[]      │
    │                                                    │
    │  Scoring System:                                   │
    │  • Title match:       10 points                    │
    │  • Description:        5 points                    │
    │  • Abstract:           4 points                    │
    │  • Tags (per tag):     3 points                    │
    │  • Content:            2 points                    │
    │                                                    │
    │  Returns: Sorted by score (highest first)          │
    └───────────────────────────────────────────────────┘
                │
                ▼
    ┌───────────────────────────────────────────────────┐
    │  Content Storage                                   │
    │  content/                                          │
    ├───────────────────────────────────────────────────┤
    │  ├── publications/  (6 files)                      │
    │  ├── artworks/      (6 files)                      │
    │  ├── musings/       (4 files)                      │
    │  └── projects/      (3 files)                      │
    │                                                    │
    │  Format: Markdown with frontmatter                 │
    └───────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Types in SearchBar
```
User Input → Debounce (300ms) → API Call → Results → Display Suggestions
                                               ↓
                                        Cache in State
```

### 2. User Submits Search
```
Submit → Navigate to /search?q={query} → Fetch Results → Display Grouped
```

### 3. User Selects Suggestion
```
Click/Enter → Navigate to Content Page → /[type]/[slug]
```

## State Management

### SearchBar Component State
```typescript
{
  query: string,              // Current search input
  suggestions: SearchResult[], // Top 5 suggestions
  showSuggestions: boolean,   // Dropdown visibility
  loading: boolean,           // API call in progress
  selectedIndex: number       // Keyboard selection (-1 = none)
}
```

### Search Page State
```typescript
{
  results: SearchResult[],    // All search results
  loading: boolean,           // Initial fetch
  error: string | null        // Error message if any
}
```

## Performance Characteristics

### Debouncing
- **Delay:** 300ms
- **Benefit:** Reduces API calls by ~80%
- **User Experience:** Smooth, responsive typing

### Suggestion Limiting
- **Limit:** 5 items
- **Benefit:** Fast rendering, reduced payload
- **Fallback:** "View all results" button

### Search Algorithm
- **Complexity:** O(n) where n = total content items
- **Current Scale:** ~20 items (instant)
- **Future Scale:** Consider indexing at 1000+ items

## Accessibility Tree

```
<div> SearchBar Container
  └── <form> Search Form
      ├── <input> Search Input [role=searchbox, aria-autocomplete=list]
      │   └── [aria-controls="search-suggestions"]
      ├── <button> Search Button [type=submit]
      └── <div> Suggestions Dropdown [role=listbox]
          ├── <a> Suggestion Item 1 [role=option]
          ├── <a> Suggestion Item 2 [role=option]
          └── <button> View All Results
```

## CSS Architecture

### Global Styles (app/globals.css)
```css
:root {
  /* Colors */
  --moura-teal: #00A8A8;
  --scholar-blue: #2C5985;
  --vibrant-magenta: #D33479;
  --spring-yellow: #F4B942;
  
  /* Typography */
  --font-montserrat: Montserrat;
  --font-lora: Lora;
}

/* Search Highlighting */
mark {
  background: rgba(244, 185, 66, 0.3);
  color: var(--ink-black);
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 600;
}
```

### Component Styles
- **SearchBar:** Inline Tailwind classes
- **Search Results:** Inline Tailwind classes
- **Responsive:** Mobile-first breakpoints

## File Dependencies

```
SearchBar.tsx
  ├── next/navigation (useRouter)
  ├── next/link (Link)
  ├── react (useState, useEffect, useRef, useCallback)
  └── @/lib/types/content (SearchResult)

page.tsx (search)
  ├── next/navigation (useSearchParams, useRouter)
  ├── next/link (Link)
  ├── react (useEffect, useState, Suspense)
  ├── @/components/search/SearchBar
  └── @/lib/types/content (SearchResult, Content)

content-service.ts
  ├── fs/promises (File system)
  ├── path (Path utilities)
  ├── gray-matter (Frontmatter parsing)
  └── @/lib/types/content (Content types)
```

## Future Scalability

### Current Implementation
- ✅ Good for: < 1,000 items
- ✅ In-memory search
- ✅ Simple scoring algorithm
- ✅ No external dependencies

### Recommended for Scale
- 🔄 1,000-10,000 items: Add search index
- 🔄 10,000+ items: Elasticsearch or Algolia
- 🔄 Real-time updates: WebSocket support
- 🔄 Multi-language: i18n support
- 🔄 Personalization: User preferences

## Security Considerations

### Input Sanitization
- ✅ URL encoding for query parameters
- ✅ React's built-in XSS protection
- ✅ No eval() or innerHTML (except controlled highlights)

### API Security
- ✅ GET requests only (no mutations)
- ✅ No authentication required (public content)
- 🔄 Consider rate limiting in production

### Content Security
- ✅ Server-side content loading
- ✅ No user-generated content
- ✅ Markdown parsing with gray-matter
