# MQ Studio Website

Production Next.js website for Professor Moura Quayle's digital studio.

**Live Site:** [To be deployed on Vercel]

---

## 🎨 About

MQ Studio is a living, digital studio designed as a space where governance papers, watercolours, calligraphy, and musings coexist. The site reflects an interconnected practice of thinking, feeling, and doing.

## ✨ Features

- **HeroToday Block** - Dynamic homepage displaying latest artwork, publication, and musing
- **Marginalia Component** - Responsive quotes with desktop sidebar and mobile callouts
- **Musings Audio Player** - Custom accessible audio player with analytics
- **Filterable Publications** - Dynamic tag-based filtering system
- **Image Galleries** - Zoomable lightbox with keyboard navigation
- **Watercolor Texture** - Animated background texture
- **Accessibility** - WCAG AA compliance, keyboard navigation, screen reader support

## 🛠️ Tech Stack

- **Framework:** Next.js 14.2.5
- **UI Library:** React 18
- **Styling:** Tailwind CSS
- **Language:** TypeScript
- **Analytics:** Custom event tracking
- **Deployment:** Vercel

## 🏗️ Design System

**Bright Academia** - Academic rigor meets artistic vibrancy

**Colors:**
- Rice Paper (#FDFCF8) - Background
- Ink Black (#1A1A1A) - Primary text
- Moura Teal (#00A8A8) - Interactive elements
- Scholar Blue (#2C5985) - "Thinking"
- Living Pink (#E91E63) - "Feeling"

**Typography:**
- Headings: Montserrat
- Body: Lora

## 🚀 Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3100
```

### Available Scripts

```bash
npm run dev          # Development server (port 3100)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest unit tests
npm run test:e2e     # Run Playwright E2E tests
```

### Environment Variables

Create `.env.local` file:

```env
# Add any required environment variables
# See .env.example for template
```

## 📁 Project Structure

```
app/               # Next.js App Router pages
components/        # Reusable React components
content/           # Markdown content (publications, musings, etc.)
public/            # Static assets (images, fonts)
lib/               # Utility functions and helpers
styles/            # Global styles
tests/             # Test suites
```

## 🧪 Testing

```bash
# Unit tests
npm run test:unit

# E2E tests (requires site running)
npm run test:e2e

# All tests
npm run test:all
```

## 🚢 Deployment

### Vercel (Recommended)

1. Connect this repository to Vercel
2. Configure build settings:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Add environment variables in Vercel dashboard
4. Deploy!

### Manual Deployment

```bash
npm run build
npm run start
```

## 📚 Related Repositories

- [mq-studio-assets](https://github.com/mq-studio/mq-studio-assets) - Original media files
- [mq-studio-knowledge](https://github.com/mq-studio/mq-studio-knowledge) - Documentation & history

## 📄 Content Management

### Adding New Content

**Publications:**
```bash
# Add markdown file to content/publications/
# Include frontmatter: title, date, tags, pdfUrl
```

**Musings:**
```bash
# Add markdown file to content/musings/
# Include frontmatter: title, date, audioUrl (optional)
```

**Artworks:**
```bash
# 1. Add optimized image to public/images/artworks/
# 2. Original should be in mq-studio-assets repo
# 3. Add markdown file to content/artworks/
```

## 🔒 Security

- Environment variables never committed
- Dependencies regularly updated
- Dependabot alerts enabled
- Private repository

## 📞 Support

For issues or questions, please file an issue in this repository.

### Creating Issues

For guidance on creating specific issues, see:
- [How to Create "Set up Copilot Instructions" Issue](docs/CREATE_COPILOT_ISSUE.md)
- [Copilot Issue Template](docs/COPILOT_ISSUE_TEMPLATE.md)

---

**MQ Studio** - Living Digital Studio for Professor Moura Quayle

🤖 Repository structure powered by [Claude Code](https://claude.com/claude-code)
