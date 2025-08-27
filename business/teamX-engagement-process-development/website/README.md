# TeamX Healthcare Consulting Website

A professional, production-ready website for TeamX healthcare consulting services built with Next.js 15, TypeScript, and modern web technologies.

![TeamX Healthcare Consulting](https://via.placeholder.com/800x400/1e3c72/ffffff?text=TeamX+Healthcare+Consulting)

## 🚀 Features

- ⚡ **Next.js 15** with App Router and Turbopack
- 🔷 **TypeScript** for type safety and better development experience
- 🎨 **Tailwind CSS** with custom professional healthcare color scheme
- 📱 **Fully Responsive** design optimized for all devices
- 🔍 **SEO Optimized** with comprehensive meta tags, Open Graph, and sitemap
- ♿ **Accessibility** focused with ARIA labels and semantic HTML
- 🎭 **Smooth Animations** with Framer Motion and performance optimization
- 🐳 **Docker Ready** with multi-stage builds and development environment
- 🛡️ **Production Ready** with health checks, error handling, and monitoring
- 📊 **Performance Optimized** with lazy loading, image optimization, and caching

## 🏥 Pages & Sections

### Main Pages
- **Home** - Hero section, services overview, testimonials, and CTAs
- **About** - Company mission, values, timeline, and impact statistics
- **Services** - Detailed service offerings with features and benefits
- **Process** - 6-phase consulting methodology and approach
- **Frameworks** - Proprietary consulting frameworks and tools
- **Case Studies** - Success stories and client transformations
- **Team** - Expert consultants and their expertise
- **Investors** - Investment opportunities and partnership information
- **Resources** - Whitepapers, insights, and downloadable content
- **Contact** - Multi-channel contact options and consultation requests

### Special Pages
- **404 Error Page** - Custom error page with navigation and helpful links
- **Sitemap** - SEO-optimized sitemap for search engines
- **Health Check** - API endpoint for monitoring and load balancers

## 🛠️ Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | Next.js | 15.5.1 |
| **Language** | TypeScript | 5.9.2 |
| **Styling** | Tailwind CSS | 4.1.12 |
| **Animations** | Framer Motion | 12.23.12 |
| **Icons** | Heroicons & Lucide React | 2.2.0 / 0.542.0 |
| **Runtime** | Node.js | 20+ |
| **Container** | Docker | Latest |

## 📁 Project Structure

```
website/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # Root layout with metadata
│   ├── page.tsx                   # Home page
│   ├── not-found.tsx             # Custom 404 page
│   ├── sitemap.ts                # Dynamic sitemap generation
│   ├── robots.ts                 # Robots.txt configuration
│   ├── api/
│   │   └── health/               # Health check endpoint
│   └── [pages]/                  # Individual page routes
│       ├── layout.tsx            # Page-specific metadata
│       └── page.tsx              # Page content
├── components/
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx           # Navigation header
│   │   ├── Footer.tsx           # Site footer
│   │   └── Layout.tsx           # Main layout wrapper
│   ├── sections/                # Page sections
│   │   ├── Hero.tsx             # Landing hero section
│   │   ├── Services.tsx         # Services overview
│   │   ├── About.tsx            # About section
│   │   ├── ProcessOverview.tsx  # Process methodology
│   │   ├── Team.tsx             # Team showcase
│   │   ├── Testimonials.tsx     # Client testimonials
│   │   ├── CTABanner.tsx        # Call-to-action banners
│   │   └── Contact.tsx          # Contact forms
│   ├── frameworks/              # Framework components
│   │   ├── FrameworkGallery.tsx # Framework showcase
│   │   └── FrameworkViewer.tsx  # Framework detail viewer
│   └── ui/                      # Reusable UI components
│       ├── Loading.tsx          # Loading states
│       ├── PageTransition.tsx   # Page transitions
│       ├── ScrollProgress.tsx   # Scroll indicator
│       └── OptimizedImage.tsx   # Performance-optimized images
├── lib/                         # Utility libraries
│   ├── metadata.ts             # SEO metadata utilities
│   └── performance.ts          # Performance optimization
├── public/                     # Static assets
│   ├── frameworks/            # Framework HTML files
│   ├── images/               # Image assets
│   └── icons/                # Icon assets
├── styles/                    # Additional styles
├── types/                     # TypeScript definitions
├── Dockerfile                 # Production Docker image
├── Dockerfile.dev            # Development Docker image
├── docker-compose.yml        # Docker Compose configuration
├── .dockerignore             # Docker ignore rules
└── next.config.js            # Next.js configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.0.0 or higher
- **npm** 9.0.0 or higher
- **Docker** (optional, for containerized development)

### Local Development (npm)

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd website
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Local Development (Docker)

1. **Development with hot reloading:**
   ```bash
   npm run deploy:dev
   # or
   docker-compose --profile dev up
   ```

2. **Production build:**
   ```bash
   npm run deploy:local
   # or
   docker-compose up
   ```

## 📜 Available Scripts

### Development Scripts
```bash
npm run dev              # Start development server with Turbopack
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint code analysis
```

### Docker Scripts
```bash
npm run docker:build       # Build production Docker image
npm run docker:build-dev   # Build development Docker image
npm run docker:run         # Run production container
npm run docker:run-dev     # Run development container
npm run docker:stop        # Stop all containers
npm run docker:clean       # Remove all containers
npm run docker:logs        # View container logs
```

### Docker Compose Scripts
```bash
npm run compose:up         # Start production environment
npm run compose:up-dev     # Start development environment
npm run compose:down       # Stop all services
npm run compose:logs       # View all service logs
npm run compose:build      # Build all images
```

### Deployment Scripts
```bash
npm run deploy:local       # Full local production deployment
npm run deploy:dev         # Full development deployment
npm run health-check       # Check application health
```

## 🐳 Docker Usage

### Production Deployment

The production Docker setup uses multi-stage builds for optimal image size and security:

```bash
# Build and run production container
npm run deploy:local

# Or manually:
docker build -t teamx-website .
docker run -p 3000:3000 teamx-website
```

### Development Environment

Development environment includes hot reloading and debugging tools:

```bash
# Run development environment
npm run deploy:dev

# Or manually:
docker-compose --profile dev up -d
```

### Environment Variables

Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
```

For production, update the environment variables in `docker-compose.yml` or your deployment platform.

## 🎨 Customization

### Color Scheme

The website uses a professional healthcare-focused color palette defined in `tailwind.config.js`:

```javascript
colors: {
  teamx: {
    // Primary colors
    'navy': '#1e3c72',
    'blue': '#2a5298',
    'light-blue': '#3b82f6',
    
    // Trust & health colors
    'health-teal': '#14b8a6',
    'trust-green': '#10b981',
    
    // Professional neutrals
    'charcoal': '#374151',
    'warm-gray': '#475569',
    'light-gray': '#94a3b8',
    
    // Accent colors
    'accent-blue': '#60a5fa',
    'background': '#f8fafc'
  }
}
```

### Adding New Pages

1. **Create page directory:**
   ```bash
   mkdir app/new-page
   ```

2. **Add layout with metadata:**
   ```typescript
   // app/new-page/layout.tsx
   import { Metadata } from 'next'
   import { generateMetadata, pageMetadata } from '@/lib/metadata'

   export const metadata: Metadata = generateMetadata({
     title: 'New Page - TeamX',
     description: 'Description of the new page',
     path: '/new-page'
   })
   ```

3. **Create page component:**
   ```typescript
   // app/new-page/page.tsx
   export default function NewPage() {
     return <div>New Page Content</div>
   }
   ```

4. **Update navigation:**
   Add the new page to `components/layout/Header.tsx` and update the sitemap in `app/sitemap.ts`.

### Modifying Components

All components follow a modular structure:
- **Layout components** in `components/layout/`
- **Page sections** in `components/sections/`
- **Reusable UI** in `components/ui/`

### SEO & Metadata

Update page metadata in `lib/metadata.ts`:

```typescript
export const pageMetadata: Record<string, PageMetadata> = {
  'new-page': {
    title: 'New Page Title',
    description: 'New page description for SEO',
    keywords: 'relevant, keywords, for, seo',
    path: '/new-page',
  },
}
```

## 🚀 Deployment

### Production Checklist

Before deploying to production:

- [ ] Update `NEXT_PUBLIC_SITE_URL` environment variable
- [ ] Add proper SSL certificates
- [ ] Configure CDN for static assets
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Test all pages and functionality
- [ ] Verify SEO meta tags and sitemap
- [ ] Run performance audits
- [ ] Test mobile responsiveness
- [ ] Verify accessibility compliance

### Deployment Platforms

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Docker-based Platforms
Use the provided `Dockerfile` for deployment on:
- **AWS ECS/EKS**
- **Google Cloud Run**
- **Digital Ocean App Platform**
- **Heroku Container Registry**

#### Traditional Hosting
```bash
npm run build
npm run start
```

## 📊 Performance

The website is optimized for performance with:

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for LCP, FID, and CLS
- **Image Optimization**: Lazy loading and WebP format
- **Code Splitting**: Automatic code splitting by Next.js
- **Caching**: Aggressive caching strategies
- **Compression**: Gzip/Brotli compression enabled

## 🔒 Security

Security features include:

- **HTTPS Only**: Redirects and security headers
- **Content Security Policy**: XSS protection
- **OWASP Compliance**: Following security best practices
- **Dependencies**: Regular security audits with `npm audit`
- **Docker**: Non-root user and minimal attack surface

## 🐛 Troubleshooting

### Common Issues

**Development server won't start:**
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

**Docker build fails:**
```bash
# Clear Docker cache
docker system prune -a
npm run docker:build
```

**Styling issues:**
```bash
# Rebuild Tailwind CSS
npm run build
```

### Health Checks

Monitor application health:
```bash
# Local health check
curl http://localhost:3000/api/health

# Or use npm script
npm run health-check
```

### Logs

View application logs:
```bash
# Docker logs
npm run compose:logs

# Development logs
npm run dev
```

## 📈 Analytics & Monitoring

For production deployment, consider integrating:

- **Google Analytics** for user behavior tracking
- **Hotjar** for user experience insights
- **Sentry** for error monitoring
- **New Relic** for performance monitoring
- **LogRocket** for session replay

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Commit changes:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Ensure all components are accessible
- Write meaningful tests
- Update documentation for new features

## 📞 Support

For technical support or questions:

- **Email**: development@teamx-healthcare.com
- **Documentation**: Check this README and inline code comments
- **Issues**: Create GitHub issues for bugs or feature requests

## 📄 License

© 2024 TeamX Healthcare Consulting. All rights reserved.

This project is proprietary software. Unauthorized copying, modification, or distribution is prohibited.

---

**Built with ❤️ by the TeamX development team**

*Ready to transform healthcare organizations with cutting-edge technology and proven methodologies.*