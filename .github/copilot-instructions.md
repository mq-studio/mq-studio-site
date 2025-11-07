# GitHub Copilot Instructions for MQ Studio Website

This file provides repository-wide guidance for GitHub Copilot and other AI coding assistants working with the MQ Studio website codebase.

## 1. Repository Summary

**Purpose**: Portfolio website for Moura Quayle (MQ Studio) showcasing research, publications, artwork, and musings

**Tech Stack**:
- Next.js 14.2.5 (App Router)
- React 18.x
- TypeScript 5.9.2
- Tailwind CSS 3.4.1
- MDX for content (via gray-matter 4.0.3)

**Size**: ~50 pages, content-driven architecture with gallery and blog functionality

**Key Features**:
- Responsive design with mobile-first approach
- Image galleries with zoomable lightbox
- MDX-based blog posts (musings)
- Publications with tag-based filtering
- Search functionality
- Audio player for musings
- WCAG AA accessibility compliance

## 2. Build & Validation Steps

### Prerequisites
- Node.js 20+ (currently using 20.19.5)
- npm 9+ (currently using 10.8.2)

### Setup
```bash
npm install
```
**Timing**: ~30-60 seconds

### Development
```bash
npm run dev           # Start dev server on http://localhost:3100
```

### Production Build
```bash
npm run build         # Creates .next/ production build
npm run start         # Runs production build locally
```
**Timing**: ~45-90 seconds (may take longer on first build)

### Validation
```bash
npm run lint          # ESLint checks (must pass)
npx tsc --noEmit      # TypeScript type checking (must pass)
npm run test:unit     # Run Jest unit tests
npm run test:stagehand # Run browser automation tests
npm run test:all      # Run all tests (unit + stagehand)
```

### Important Notes
- Always run `npm install` after pulling changes to `package.json`
- Lint and type checking must pass before committing
- Build validation is required before pushing (may fail in restricted network environments due to Google Fonts)

## 3. Project Layout

```
/app                     # Next.js App Router pages and layouts
  /page.tsx             # Homepage with hero panels
  /artworks/            # Artwork gallery pages
    /[slug]/page.tsx    # Individual artwork page
  /musings/             # Blog listing and posts
    /page.tsx           # Musings index
    /[slug]/page.tsx    # Individual musing post
  /musings-archive/     # Historical musings archive
  /publications/        # Academic publications
    /page.tsx           # Publications index
    /[slug]/page.tsx    # Individual publication
  /projects/            # Projects showcase
  /gallery/             # Image galleries
  /search/              # Search functionality
  /api/                 # API routes
  /layout.tsx           # Root layout (header, footer, fonts)
  /globals.css          # Global styles and Tailwind imports

/components             # Shared React components
  /about/               # About page components
  /content/             # Content display components
  /effects/             # Visual effects (watercolor, etc.)
  /footer/              # Footer components
  /media/               # Media components (images, audio)
  /musings/             # Musings-specific components
  /publications/        # Publications components
  /search/              # Search components

/content                # MDX content files
  /musings/            # Blog posts
    /*.md              # Current musings (root level)
    /archive/          # Historical posts with year subdirs
      /2023/
      /2024/
  /publications/       # Academic publications
  /artworks/           # Artwork metadata
  /projects/           # Project descriptions

/public                # Static assets
  /images/
    /artworks/         # Gallery images (optimized WebP)
    /hero-*.webp       # Hero section images
  /publications/       # Publication PDFs and assets
  /background_assets/  # Background textures

/lib                   # Utility functions and helpers
  /mdx-utils.ts        # MDX content parsing utilities
  /search-utils.ts     # Search functionality

/tests                 # Test suites
  /unit/               # Jest unit tests
  /stagehand/          # Browser automation tests
  /e2e/                # End-to-end tests

/src                   # Design system and reusable code
  /components/         # Shared UI components
  /design/             # Design tokens and helpers
  /index.ts            # Exports

Key Config Files:
- next.config.js      # Next.js configuration
- tailwind.config.ts  # Tailwind customization (Bright Academia design system)
- tsconfig.json       # TypeScript config (strict mode disabled)
- .eslintrc.json      # Linting rules
- jest.config.unit.cjs # Jest unit test configuration
- jest.config.stagehand.js # Stagehand browser test configuration
- playwright.config.js # Playwright E2E configuration
```

## 4. CI/Workflow Checks

Currently using Git-based workflow:
- No automated CI/CD pipeline configured yet
- Manual validation required before commit

**Pre-commit validation checklist**:
1. `npm run lint` must pass
2. `npm run build` must complete without errors (may fail in restricted environments)
3. `npx tsc --noEmit` must show no type errors
4. `npm run test:unit` should pass (if tests exist for changed code)
5. Visual testing in dev mode for UI changes

**Deployment**:
- Target platform: Vercel
- Build command: `npm run build`
- Output directory: `.next`
- Framework preset: Next.js

## 5. Developer Conventions

### Content Structure
**Blog posts (Musings)**:
- Location: `/content/musings/{filename}.md` or `/content/musings/archive/{year}/{filename}.md`
- Required frontmatter: `title`, `date`, `category`, `description`
- Optional frontmatter: `audioUrl`, `tags`
- Categories: "thinking", "feeling", "doing"

**Publications**:
- Location: `/content/publications/{filename}.md`
- Required frontmatter: `title`, `date`, `description`
- Optional frontmatter: `pdfUrl`, `tags`, `authors`

**Artworks**:
- Location: `/content/artworks/{filename}.md`
- Images: `/public/images/artworks/`
- Required frontmatter: `title`, `date`, `medium`, `description`

### Code Style
- **TypeScript**: TypeScript enabled (strict mode currently disabled), type annotations recommended
- **Styling**: Tailwind CSS for all styling (avoid inline styles and custom CSS unless necessary)
- **Component Architecture**: Component-first, functional components with hooks
- **File Naming**: 
  - Components: PascalCase (e.g., `HeroSection.tsx`)
  - Utilities: camelCase (e.g., `mdx-utils.ts`)
  - Test files: `*.test.tsx` or `*.test.ts`
- **Responsive Design**: Mobile-first approach, use Tailwind responsive prefixes
- **Indentation**: 2 spaces (existing codebase standard)

### Commit Conventions
- Use semantic commit prefixes: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`
- Examples:
  - `feat: Add audio player component`
  - `fix: Correct publication date sorting`
  - `docs: Update README with setup instructions`
- Include "🤖 Generated with Claude Code" footer when AI-assisted
- Keep commits focused and atomic

### Testing Philosophy
- **Unit Tests**: Co-located in `tests/unit/` using Jest and Testing Library
- **Browser Tests**: Stagehand tests in `tests/stagehand/` for user flows
- **Accessibility**: Use `jest-axe` for a11y assertions
- **Visual Testing**: Manual verification in development mode
- **Pre-push**: Run `npm run test:all` before pushing changes

### PR Requirements (when applicable)
- All lint and type checks pass
- Production build succeeds (or document known issues)
- Visual review on `localhost:3100`
- No breaking changes to existing content structure
- Tests added/updated for new features
- Accessibility maintained or improved

## 6. Special Considerations

### MDX Content
- Posts use `gray-matter` for frontmatter parsing
- Content files are loaded at build time (static generation)
- Archive posts maintain historical metadata and structure
- Categories for musings: "thinking", "feeling", "doing"
- Frontmatter validation happens at build time

### Image Handling
- **Format**: WebP preferred for performance
- **Location**: `/public/images/` (subfolders by type)
- **Optimization**: Use Next.js `Image` component for automatic optimization
- **Alt text**: Required for all images (accessibility)
- **Responsive**: Provide appropriate sizes for different viewports

### Environment Variables
- Currently: Contact/social URLs configured directly in components
- Future: May migrate to `.env.local` for configuration
- `.env.example` provides template for any required variables
- Never commit secrets or credentials

### Design System
**Bright Academia** theme:
- **Primary Colors**: 
  - Rice Paper (#FDFCF8) - Background
  - Ink Black (#1A1A1A) - Primary text
  - Moura Teal (#00A8A8) - Interactive elements
- **Category Colors**:
  - Scholar Blue (#2C5985) - "Thinking" category
  - Living Pink (#E91E63) - "Feeling" category
  - Vibrant Magenta (#D33479) - Accents
- **Additional Palette**:
  - Shufa Red (#8D2305) - Calligraphy accents
  - Studio Cream (#FFF8F0) - Neutral background
  - Charcoal Wash (#4A4A4A) - Secondary text
  - Light Gray (#D8D5CC) - Borders
  - Spring Yellow (#F4B942) - Highlights
  - Sage Wisdom (#7A9A82) - Natural elements
- **Typography**: Montserrat (headings), Lora (body)
- **Configuration Files**:
  - `tailwind.config.ts` - Tailwind font configuration
  - `src/design/tokens.ts` - TypeScript design tokens (colors, spacing, borders)
  - `app/globals.css` - CSS custom properties (color variables)

### Accessibility Requirements
- WCAG AA compliance mandatory
- Keyboard navigation for all interactive elements
- Screen reader support (proper ARIA labels)
- Color contrast ratios must meet standards
- Focus indicators visible and clear

### Performance Considerations
- Static generation preferred over SSR when possible
- Images must be optimized (WebP, proper sizing)
- Lazy loading for below-the-fold content
- Minimize client-side JavaScript

### When to Search vs. Trust Instructions
**Trust these instructions for**:
- Build commands and scripts
- Project structure and file locations
- Tech stack versions
- General conventions

**Search/verify for**:
- Specific component implementations
- Content schema details
- Styling patterns and design tokens
- Recent dependency changes

**Always verify**:
- Changes to `package.json` or dependency versions
- Configuration file modifications
- Breaking changes in frameworks or libraries

---

**Note**: This repository is actively developed. Always check the latest code and documentation for the most current patterns and conventions.
