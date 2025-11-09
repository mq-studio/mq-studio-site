# MQ Studio CMS: Technical Architecture

**Version:** V01
**Date:** 2025-11-09
**Status:** Complete
**Audience:** Development Team

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [System Components](#system-components)
4. [API Design](#api-design)
5. [Data Flow Architecture](#data-flow-architecture)
6. [File Storage & Management](#file-storage--management)
7. [Authentication & Authorization](#authentication--authorization)
8. [Database Schema](#database-schema)
9. [Frontend Architecture](#frontend-architecture)
10. [Performance Optimization](#performance-optimization)
11. [Deployment & CI/CD](#deployment--cicd)
12. [Error Handling & Recovery](#error-handling--recovery)

---

## Architecture Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          MOURA'S BROWSER                             │
│                    (Next.js Client - React 18)                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    CMS Interface (SPA)                       │  │
│  │ ┌────────────┐ ┌────────────┐ ┌────────────┐               │  │
│  │ │ Dashboard  │ │  Editors   │ │   Media    │  (UI Layer)   │  │
│  │ │   View     │ │ (Musings,  │ │  Library   │               │  │
│  │ └────────────┘ │  Artworks) │ └────────────┘               │  │
│  │      ↕             ↕             ↕                          │  │
│  │ ┌──────────────────────────────────────────────────────┐  │  │
│  │ │       Frontend State Management (Context API)        │  │  │
│  │ │  ├── AuthContext       ├── EditorContext            │  │  │
│  │ │  ├── ContentContext    ├── MediaContext             │  │  │
│  │ └──────────────────────────────────────────────────────┘  │  │
│  │      ↕                                                   │  │
│  │ ┌──────────────────────────────────────────────────────┐  │  │
│  │ │     API Client Layer (Fetch + Error Handling)        │  │  │
│  │ └──────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↕                                       │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
          ┌────────────────────────────────────────┐
          │      Next.js API Routes (Backend)      │
          ├────────────────────────────────────────┤
          │ /api/auth/*              (Auth)        │
          │ /api/content/*           (CRUD)        │
          │ /api/media/*             (Upload)      │
          │ /api/tags/*              (Taxonomy)    │
          │ /api/settings/*          (Config)      │
          └────────────────────────────────────────┘
                              ↕
          ┌────────────────────────────────────────┐
          │         Service Layer                   │
          ├────────────────────────────────────────┤
          │ ├── AuthService         │              │
          │ ├── ContentService      │  Business   │
          │ ├── MediaService        │  Logic      │
          │ ├── FileService         │              │
          │ └── ValidationService   │              │
          └────────────────────────────────────────┘
                              ↕
          ┌────────────────────────────────────────┐
          │       Data Layer (File System)          │
          ├────────────────────────────────────────┤
          │ /content/musings/*      (MDX files)    │
          │ /content/artworks/*     (MDX files)    │
          │ /public/uploads/*       (Images/Media) │
          │ .env.local              (Secrets)      │
          └────────────────────────────────────────┘
                              ↕
          ┌────────────────────────────────────────┐
          │          Git Repository                 │
          │  (Automatic commit on publish)          │
          │  ├── mq-studio-dev                      │
          │  └── mq-studio-site (production)        │
          └────────────────────────────────────────┘
                              ↓
          ┌────────────────────────────────────────┐
          │   Vercel (Auto-deploy from Git)        │
          │   Live Site: mq-studio-site.vercel.app │
          └────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **File-based Content Storage** (Not database)
   - MDX files in `/content/` directory
   - Simple Git versioning
   - Easy for non-technical backup
   - Integrates with existing site architecture

2. **Next.js API Routes for Backend**
   - No separate API server needed
   - Serverless functions on Vercel
   - Built-in by Next.js, minimal setup

3. **Client-side State Management with React Context**
   - Lightweight alternative to Redux
   - Sufficient for CMS scope
   - Lower bundle size

4. **Git-based Publishing Workflow**
   - Auto-commit changes on publish
   - Maintains audit trail
   - Aligns with existing deployment process
   - Easy rollback capability

---

## Technology Stack

### Frontend

```
Next.js 14 (App Router)
├── Framework: React 18
├── Language: TypeScript
├── Styling: Tailwind CSS + Custom CSS
├── Rich Text Editor: TipTap or Slate
├── Form Management: React Hook Form
├── State Management: Context API
├── Data Fetching: Fetch API + SWR (optional)
├── Testing: Jest + React Testing Library
└── UI Components: Headless UI / Radix UI (optional)
```

### Backend

```
Next.js 14 API Routes
├── Runtime: Node.js (Vercel)
├── Authentication: NextAuth.js (or similar)
├── File System: Node.js fs module
├── File Upload: Multer or similar middleware
├── Validation: Zod or Joi
├── Git Integration: simple-git library
├── Image Processing: Sharp for optimization
└── Environment: .env.local
```

### Infrastructure

```
Deployment
├── Hosting: Vercel
├── Git Repository: GitHub (mq-studio-dev + mq-studio-site)
├── CDN: Vercel Edge Network
├── Storage: File system (public/ and content/)
└── Secrets: Environment variables

Development
├── Version Control: Git
├── Package Manager: npm or yarn
├── Code Quality: ESLint + Prettier
├── Testing: Playwright (E2E), Jest (Unit)
└── Development Server: Next.js dev server
```

### Libraries (Key Dependencies)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "next-mdx-remote": "^4.4.0",
    "next-auth": "^4.24.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "sharp": "^0.32.0",
    "simple-git": "^3.20.0",
    "@tiptap/react": "^2.0.0",
    "axios": "^1.6.0",
    "swr": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "tailwindcss": "^3.3.0",
    "eslint": "^8.52.0",
    "prettier": "^3.0.0",
    "jest": "^29.7.0",
    "@playwright/test": "^1.40.0"
  }
}
```

---

## System Components

### Frontend Components

#### 1. Authentication Module
```
/src/components/auth/
├── LoginForm.tsx
├── LogoutButton.tsx
├── ProtectedRoute.tsx
└── SessionManager.tsx

Responsibilities:
- User login/logout
- Session management
- Route protection
- Token refresh
```

#### 2. Content Editors
```
/src/components/editors/
├── MusingEditor.tsx
├── ArtworkEditor.tsx
├── PublicationEditor.tsx
├── ProjectEditor.tsx
├── RichTextEditor.tsx
├── MetadataPanel.tsx
└── PreviewPanel.tsx

Responsibilities:
- Form rendering
- Content editing
- Metadata management
- Preview generation
```

#### 3. List Views
```
/src/components/lists/
├── MusingList.tsx
├── ArtworkList.tsx
├── PublicationList.tsx
├── ProjectList.tsx
├── FilterBar.tsx
├── SearchInput.tsx
└── Pagination.tsx

Responsibilities:
- Display content
- Filtering/searching
- Sorting
- Pagination
- Bulk actions
```

#### 4. Media Management
```
/src/components/media/
├── MediaLibrary.tsx
├── UploadZone.tsx
├── MediaGrid.tsx
├── MediaDetail.tsx
└── ImageOptimizer.tsx

Responsibilities:
- File upload
- Media organization
- Image optimization
- Usage tracking
```

#### 5. Dashboard
```
/src/components/dashboard/
├── DashboardView.tsx
├── StatsWidget.tsx
├── RecentActivityWidget.tsx
├── DraftsWidget.tsx
└── QuickCreateWidget.tsx

Responsibilities:
- Overview display
- Quick statistics
- Recent activity
- Quick actions
```

### Backend API Routes

#### 1. Authentication Routes
```
/pages/api/auth/
├── login.ts              POST - User login
├── logout.ts             POST - User logout
├── me.ts                 GET  - Current user info
└── refresh-token.ts      POST - Token refresh
```

#### 2. Content Routes
```
/pages/api/content/
├── musings/
│   ├── index.ts          GET  - List, POST - Create
│   ├── [id].ts           GET  - Read, PUT - Update, DELETE
│   ├── [id]/publish.ts   POST - Publish/unpublish
│   └── [id]/preview.ts   GET  - Preview HTML
├── artworks/
├── publications/
└── projects/
   (Same structure as musings)
```

#### 3. Media Routes
```
/pages/api/media/
├── upload.ts             POST - Upload file
├── delete.ts             DELETE - Delete file
├── index.ts              GET  - List media
├── [id].ts               GET  - Media details, PUT - Update
└── optimize.ts           POST - Optimize image
```

#### 4. Tag Routes
```
/pages/api/tags/
├── index.ts              GET  - List tags, POST - Create
├── [id].ts               GET  - Read, PUT - Update, DELETE
└── merge.ts              POST - Merge tags
```

#### 5. Settings Routes
```
/pages/api/settings/
├── index.ts              GET  - Get settings, PUT - Update
├── menu.ts               GET  - Get nav menu, PUT - Update
└── pages.ts              GET  - Get pages, PUT - Update
```

### Service Layer

#### 1. Content Service
```typescript
// /src/lib/services/content-service.ts
export class ContentService {
  async getMusings(filters?: Filter): Promise<Musing[]>
  async getMusing(id: string): Promise<Musing>
  async createMusing(data: MusingInput): Promise<Musing>
  async updateMusing(id: string, data: MusingInput): Promise<Musing>
  async deleteMusing(id: string): Promise<void>
  async publishMusing(id: string): Promise<void>
  async unpublishMusing(id: string): Promise<void>
  async archiveMusing(id: string): Promise<void>
  async restoreMusing(id: string): Promise<void>
  async generatePreview(id: string): Promise<string>
  // ... Similar for Artworks, Publications, Projects
}
```

#### 2. Media Service
```typescript
// /src/lib/services/media-service.ts
export class MediaService {
  async uploadFile(file: File, metadata?: Metadata): Promise<MediaAsset>
  async deleteFile(id: string): Promise<void>
  async getMediaAssets(filters?: Filter): Promise<MediaAsset[]>
  async getMediaAsset(id: string): Promise<MediaAsset>
  async updateMediaAsset(id: string, data: Partial<MediaAsset>): Promise<MediaAsset>
  async optimizeImage(id: string, options?: ImageOptimizeOptions): Promise<void>
  async getUsageInfo(id: string): Promise<UsageInfo>
}
```

#### 3. File Service
```typescript
// /src/lib/services/file-service.ts
export class FileService {
  async readFile(path: string): Promise<string>
  async writeFile(path: string, content: string): Promise<void>
  async deleteFile(path: string): Promise<void>
  async fileExists(path: string): Promise<boolean>
  async listFiles(dir: string): Promise<string[]>
  async ensureDir(dir: string): Promise<void>
}
```

#### 4. Git Service
```typescript
// /src/lib/services/git-service.ts
export class GitService {
  async commit(message: string, files: string[]): Promise<void>
  async push(remote: string = 'origin'): Promise<void>
  async getCommitHistory(limit?: number): Promise<Commit[]>
  async getCurrentBranch(): Promise<string>
  async hasChanges(): Promise<boolean>
}
```

#### 5. Auth Service
```typescript
// /src/lib/services/auth-service.ts
export class AuthService {
  async login(email: string, password: string): Promise<AuthToken>
  async logout(): Promise<void>
  async getCurrentUser(): Promise<User>
  async validateToken(token: string): Promise<boolean>
  async refreshToken(token: string): Promise<AuthToken>
}
```

---

## API Design

### REST API Principles

```
Resource-based URLs:
- /api/content/musings
- /api/content/musings/[id]
- /api/media
- /api/tags

HTTP Methods:
- GET    - Retrieve data (safe, idempotent)
- POST   - Create new resource
- PUT    - Update entire resource
- PATCH  - Partial update
- DELETE - Remove resource

HTTP Status Codes:
- 200 OK              - Success
- 201 Created         - Resource created
- 204 No Content      - Success, no body
- 400 Bad Request     - Validation error
- 401 Unauthorized    - Auth required
- 403 Forbidden       - Permission denied
- 404 Not Found       - Resource not found
- 409 Conflict        - Duplicate/conflict
- 422 Unprocessable   - Semantic error
- 500 Server Error    - Internal error
- 503 Unavailable     - Service unavailable
```

### Request/Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { /* resource */ },
  "timestamp": "2025-11-09T10:30:00Z"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Title is required",
    "details": [
      { "field": "title", "message": "Required" }
    ]
  },
  "timestamp": "2025-11-09T10:30:00Z"
}

// List Response (with Pagination)
{
  "success": true,
  "data": [{ /* items */ }],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 48,
    "pages": 3
  },
  "timestamp": "2025-11-09T10:30:00Z"
}
```

### API Endpoint Specifications

#### Content Endpoints

```
GET /api/content/musings
  Query: ?status=published&category=thinking&page=1&limit=20&search=design
  Response: { data: Musing[], pagination: {...} }
  Auth: Required

POST /api/content/musings
  Body: { title, category, content, ... }
  Response: { data: Musing }
  Auth: Required

GET /api/content/musings/[id]
  Response: { data: Musing }
  Auth: Required

PUT /api/content/musings/[id]
  Body: { title, category, content, ... }
  Response: { data: Musing }
  Auth: Required

DELETE /api/content/musings/[id]
  Response: { success: true }
  Auth: Required

POST /api/content/musings/[id]/publish
  Body: { publish: true|false }
  Response: { data: Musing }
  Auth: Required
```

#### Media Endpoints

```
GET /api/media
  Query: ?type=image&page=1&limit=20&search=watercolor
  Response: { data: MediaAsset[], pagination: {...} }
  Auth: Required

POST /api/media/upload
  Body: FormData { file, metadata: {...} }
  Response: { data: MediaAsset }
  Auth: Required
  Max File Size: 50 MB

DELETE /api/media/[id]
  Query: ?confirm=true (if in use)
  Response: { success: true }
  Auth: Required

PUT /api/media/[id]
  Body: { altText, caption, ... }
  Response: { data: MediaAsset }
  Auth: Required
```

#### Tag Endpoints

```
GET /api/tags
  Query: ?sort=usage&type=tag
  Response: { data: Tag[] }
  Auth: Required

POST /api/tags
  Body: { slug, name, color, ... }
  Response: { data: Tag }
  Auth: Required

PUT /api/tags/[id]
  Body: { name, color, description, ... }
  Response: { data: Tag }
  Auth: Required

DELETE /api/tags/[id]
  Body: { mergeInto?: string }  // If merging
  Response: { success: true }
  Auth: Required
```

---

## Data Flow Architecture

### Create Musing Flow

```
1. User fills form in MusingEditor
   ↓
2. Click "Publish" button
   ↓
3. Frontend validates form (client-side)
   - Check required fields
   - Validate content length
   - Check duplicate slug
   ↓
4. POST /api/content/musings/[id]/publish
   ↓
5. Backend service layer processes
   ├── Server-side validation
   ├── Generate slug (if needed)
   ├── Check permissions
   ├── Generate MDX frontmatter
   └── Write to file system
   ↓
6. Git service auto-commits
   ├── Create commit message
   ├── Stage file
   └── Commit to Git
   ↓
7. Response with success
   ↓
8. Frontend updates state
   ├── Show success message
   ├── Redirect to content list
   └── Trigger Git push (optional)
   ↓
9. Vercel auto-deploys (via GitHub webhook)
   ↓
10. Site updates with new content
```

### Edit & Auto-Save Flow

```
1. User types in editor
   ↓
2. Debounce timer (1000ms)
   ↓
3. POST /api/content/musings/[id]/auto-save (Draft only)
   - Write to file system
   - Update status as "draft"
   - NO Git commit
   ↓
4. Response with status
   ↓
5. Frontend shows "✓ Saved 30 seconds ago"
   ↓
6. Next change triggers debounce again
```

### Media Upload Flow

```
1. User selects or drags file
   ↓
2. Frontend validates
   ├── File type check
   ├── File size check (max 50MB)
   └── Duplicate check (optional)
   ↓
3. POST /api/media/upload (FormData)
   ↓
4. Backend processes
   ├── Validate again
   ├── Optimize image (if image)
   │  └── Resize, compress, convert format
   ├── Generate thumbnails
   ├── Save to public/uploads/
   └── Record in manifest
   ↓
5. Return MediaAsset with URL
   ↓
6. Frontend shows uploaded file
   ├── Display in media library
   └── Available for insertion in editor
```

### Publish & Deploy Flow

```
1. User clicks "Publish"
   ↓
2. Confirmation dialog
   ↓
3. POST /api/content/musings/[id]/publish
   ↓
4. Backend service
   ├── Update status to "published"
   ├── Set publication date
   ├── Write MDX file
   └── Commit to Git
   ↓
5. Git push to origin (dev) and production
   ↓
6. GitHub webhook triggers Vercel
   ↓
7. Vercel builds and deploys
   ├── Build: npm run build
   ├── Test: npm run test (if configured)
   └── Deploy: Vercel Edge Network
   ↓
8. Live site updates
   ↓
9. Frontend shows "Published! View your post" link
```

---

## File Storage & Management

### Directory Structure

```
project-root/
├── /content/                           # Content source files
│   ├── /musings/
│   │   ├── 2025/
│   │   │   ├── reflection-on-design.mdx
│   │   │   └── ...
│   │   └── archive/
│   │       └── ...
│   ├── /artworks/
│   │   ├── 2025/
│   │   │   ├── morning-mist.mdx
│   │   │   └── ...
│   │   └── archive/
│   ├── /publications/
│   │   ├── 2025/
│   │   └── archive/
│   └── /projects/
│       ├── 2025/
│       └── archive/
│
├── /public/                            # Static assets
│   ├── /uploads/                       # User-uploaded media
│   │   ├── /images/
│   │   │   ├── watercolor01.jpg
│   │   │   ├── watercolor01.thumb.jpg
│   │   │   └── ...
│   │   ├── /audio/
│   │   │   └── musing-audio.mp3
│   │   ├── /video/
│   │   ├── /pdfs/
│   │   └── /manifest.json              # Upload tracking
│   └── /fonts/
│
├── /src/
│   ├── /components/
│   │   ├── /auth/
│   │   ├── /editors/
│   │   ├── /lists/
│   │   ├── /media/
│   │   ├── /dashboard/
│   │   └── /common/
│   │
│   ├── /pages/
│   │   ├── /studio/                    # CMS interface
│   │   │   ├── index.tsx               # Dashboard
│   │   │   ├── musings.tsx             # List view
│   │   │   ├── musings/[id].tsx        # Editor
│   │   │   ├── artworks.tsx
│   │   │   ├── media.tsx
│   │   │   ├── tags.tsx
│   │   │   └── settings.tsx
│   │   │
│   │   ├── /api/                       # Backend routes
│   │   │   ├── /content/
│   │   │   ├── /media/
│   │   │   ├── /tags/
│   │   │   ├── /auth/
│   │   │   └── /settings/
│   │   │
│   │   ├── /index.tsx                  # Public site
│   │   └── /[slug].tsx                 # Dynamic pages
│   │
│   ├── /lib/
│   │   ├── /services/
│   │   │   ├── content-service.ts
│   │   │   ├── media-service.ts
│   │   │   ├── file-service.ts
│   │   │   ├── git-service.ts
│   │   │   ├── auth-service.ts
│   │   │   └── validation-service.ts
│   │   │
│   │   ├── /utils/
│   │   │   ├── api-client.ts
│   │   │   ├── slug-generator.ts
│   │   │   ├── date-formatter.ts
│   │   │   └── image-optimizer.ts
│   │   │
│   │   ├── /hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useContent.ts
│   │   │   ├── useMedia.ts
│   │   │   └── useForm.ts
│   │   │
│   │   └── /types/
│   │       ├── content.ts
│   │       ├── media.ts
│   │       ├── auth.ts
│   │       └── api.ts
│   │
│   └── /context/
│       ├── AuthContext.tsx
│       ├── ContentContext.tsx
│       └── MediaContext.tsx
│
├── .env.local                          # Secrets & config
├── .env.example                        # Template
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── package.json
```

### Content File Format (MDX)

```markdown
---
title: "Reflections on Design Thinking"
slug: "reflections-on-design-thinking"
date: "2025-11-08"
category: "thinking"
tags: ["design", "creativity", "process"]
excerpt: "Design thinking is a powerful approach to problem-solving..."
featured: true
featuredImage: "/uploads/images/design-thinking.jpg"
author: "moura"
status: "published"
davidNotes: "Internal note from David about this post"
audio: "/uploads/audio/musing-audio.mp3"
---

# Reflections on Design Thinking

Design thinking is a mindset that...

When we approach problems with a design lens...

## Benefits of Design Thinking

1. Empathy
2. Iteration
3. Collaboration

> This is a quote from someone important.

[Links work normally](https://example.com)

![Alt text for image](/uploads/images/image.jpg)
```

### Media Manifest File

```json
{
  "assets": [
    {
      "id": "uuid-1",
      "filename": "watercolor01.jpg",
      "originalName": "Watercolor 01.jpg",
      "type": "image",
      "mimeType": "image/jpeg",
      "size": 2457600,
      "url": "/uploads/images/watercolor01.jpg",
      "thumbnail": "/uploads/images/watercolor01.thumb.jpg",
      "altText": "Watercolor sunset study",
      "caption": "Evening study in warm tones",
      "metadata": {
        "width": 4000,
        "height": 3000,
        "uploadedAt": "2025-11-08T10:30:00Z"
      },
      "usedIn": [
        { "contentId": "musing-1", "contentType": "musing" },
        { "contentId": "artwork-5", "contentType": "artwork" }
      ]
    }
  ]
}
```

---

## Authentication & Authorization

### Authentication Strategy

1. **Login Method:** Email + Password
   - Simple, no OAuth complexity for V01
   - Stored securely in .env.local
   - Hash with bcrypt

2. **Session Management:** NextAuth.js
   - JWT tokens
   - Session stored in httpOnly cookies
   - Auto-refresh on page load
   - Logout clears session

3. **Protected Routes:**
   - All /studio/* routes require login
   - Public site remains public
   - Redirect to login on auth failure

### Authorization Model

```
User Roles (V01):
├── Admin (Moura)
│   ├── Create/Edit/Delete all content
│   ├── Upload media
│   ├── Manage tags
│   ├── Configure settings
│   └── View analytics
│
└── Viewer (David - Optional V02)
    ├── View published content
    ├── Read-only access
    └── Comment on posts (if enabled)

Future Roles (V02+):
├── Editor
│   ├── Create/Edit own content
│   └── View published content
└── Contributor
    ├── Create content
    └── Can't publish (needs approval)
```

### Security Measures

```
1. Input Validation
   - All user input validated server-side
   - Zod schema validation
   - Type checking with TypeScript

2. XSS Prevention
   - HTML content sanitized before display
   - React automatically escapes JSX
   - DOMPurify for user HTML content

3. CSRF Protection
   - SameSite cookie attributes
   - CSRF tokens in forms

4. Rate Limiting
   - API endpoint rate limiting
   - Login attempt throttling
   - Upload size limits (50MB max)

5. Data Protection
   - HTTPS enforced
   - Secrets in environment variables
   - No sensitive data in logs
   - Session timeout (24 hours)

6. File Upload Security
   - File type whitelist
   - MIME type validation
   - Virus scanning (optional)
   - Stored outside web root initially
```

---

## Database Schema

### File-Based Content Structure

#### Musing Document

```typescript
{
  // Metadata (in frontmatter)
  title: string;
  slug: string;
  date: ISO8601Date;
  category: 'thinking' | 'feeling' | 'doing';
  tags: string[];
  excerpt: string;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  author: string;
  davidNotes?: string;

  // Media references
  featuredImage?: {
    url: string;
    alt: string;
    caption?: string;
  };
  audio?: string;  // URL
  video?: string;  // URL

  // Content (body)
  content: string;  // MDX

  // System
  createdAt: ISO8601Date;
  updatedAt: ISO8601Date;
  publishedAt?: ISO8601Date;
}
```

#### Artwork Document

```typescript
{
  title: string;
  slug: string;
  date: ISO8601Date;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';

  // Artwork specific
  description: string;
  medium?: string;
  dimensions?: string;
  year?: number;

  // Images
  primaryImage: {
    url: string;
    alt: string;
    focalPoint?: { x: number; y: number };
  };
  processImages?: Array<{
    url: string;
    order: number;
    caption?: string;
  }>;

  tags: string[];

  // System
  createdAt: ISO8601Date;
  updatedAt: ISO8601Date;
  publishedAt?: ISO8601Date;
}
```

#### Publication Document

```typescript
{
  title: string;
  slug: string;
  date: ISO8601Date;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';

  // Publication specific
  authors: string[];
  journal?: string;
  year: number;
  abstract?: string;
  doi?: string;
  pdf?: {
    url: string;
    title: string;
  };
  externalLink?: string;

  tags: string[];

  // System
  createdAt: ISO8601Date;
  updatedAt: ISO8601Date;
  publishedAt?: ISO8601Date;
}
```

---

## Frontend Architecture

### State Management (Context API)

```typescript
// /src/context/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

// /src/context/ContentContext.tsx
interface ContentContextType {
  musings: Musing[];
  currentMusing: Musing | null;
  isLoading: boolean;
  error: Error | null;
  fetch: (type: ContentType, filters?: Filter) => Promise<void>;
  get: (type: ContentType, id: string) => Promise<void>;
  create: (type: ContentType, data: any) => Promise<void>;
  update: (type: ContentType, id: string, data: any) => Promise<void>;
  delete: (type: ContentType, id: string) => Promise<void>;
  publish: (type: ContentType, id: string) => Promise<void>;
}

// /src/context/MediaContext.tsx
interface MediaContextType {
  assets: MediaAsset[];
  isLoading: boolean;
  upload: (file: File, metadata?: any) => Promise<MediaAsset>;
  delete: (id: string) => Promise<void>;
  fetch: (filters?: Filter) => Promise<void>;
  getUsage: (id: string) => Promise<UsageInfo>;
}
```

### Component Hierarchy

```
/pages/studio/
├── index.tsx (Dashboard)
│   └── <DashboardView>
│       ├── <StatsWidget>
│       ├── <RecentActivityWidget>
│       ├── <DraftsWidget>
│       └── <QuickCreateWidget>
│
├── musings.tsx (List View)
│   └── <MusingList>
│       ├── <ListHeader>
│       │   ├── <ViewToggle>
│       │   └── <SearchInput>
│       ├── <FilterBar>
│       ├── <ContentCard> (multiple)
│       └── <Pagination>
│
└── musings/[id].tsx (Editor)
    └── <MusingEditor>
        ├── <TitleInput>
        ├── <CategorySelector>
        ├── <RichTextEditor>
        │   ├── <EditorToolbar>
        │   └── <EditorContent>
        ├── <MetadataPanel>
        │   ├── <TagManager>
        │   ├── <ExcerptField>
        │   └── <FeaturedImageUpload>
        ├── <ActionButtons>
        └── <PreviewPanel>
```

### React Hooks (Custom)

```typescript
// /src/lib/hooks/useAuth.ts
export function useAuth() {
  return useContext(AuthContext);
}

// /src/lib/hooks/useContent.ts
export function useContent(type: ContentType) {
  const [content, setContent] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = async (filters?: Filter) => {
    // API call
  };

  const create = async (data: any) => {
    // API call
  };

  return { content, isLoading, fetch, create, ... };
}

// /src/lib/hooks/useMedia.ts
export function useMedia() {
  // Similar pattern
}

// /src/lib/hooks/useForm.ts
export function useForm(initialData: any) {
  // Form state management
  // Auto-save
  // Validation
}
```

---

## Performance Optimization

### Frontend Performance

```
1. Code Splitting
   - Pages dynamically imported
   - Large components lazy-loaded
   - Editor components on-demand

2. Image Optimization
   - Next.js Image component with optimization
   - Lazy loading for media library
   - Thumbnails for fast grid display
   - WebP format with fallbacks

3. Caching Strategy
   - Browser cache for assets
   - SWR for API calls (optional)
   - Service Worker for offline drafts (V02)

4. Bundle Size
   - Tree-shaking enabled
   - Minimal dependencies
   - Monitor with next/bundle-analyzer

5. Rendering Optimization
   - Memoization for expensive components
   - Virtual scrolling for long lists
   - Debounced search/filter
   - Pagination (not infinite scroll)
```

### Backend Performance

```
1. Database Optimization
   - File system efficient (small dataset)
   - Indexing not needed (small dataset)
   - Caching manifest file

2. API Optimization
   - Pagination for list endpoints
   - Selective field returns
   - Compression (gzip)
   - ETag support

3. Image Processing
   - Async image optimization
   - Queue system for bulk processing
   - CDN delivery via Vercel

4. Server-side Caching
   - Cache manifest in memory
   - Cache content index
   - Invalidate on update
```

### Monitoring & Performance Metrics

```
Target Performance Metrics (per User Journeys):
- Dashboard load: < 2 seconds
- List view (100 items): < 1 second
- Editor open: < 1.5 seconds
- Image upload (5MB): < 5 seconds
- Publish action: < 3 seconds
- Auto-save: < 500ms

Monitoring Tools:
- Web Vitals (LCP, FID, CLS)
- Error tracking (Sentry, optional)
- Analytics (Vercel Analytics)
- Performance profiling (Chrome DevTools)
```

---

## Deployment & CI/CD

### Deployment Architecture

```
Local Development
↓ git push origin main
GitHub (mq-studio-dev)
↓ (Manual push to production remote)
GitHub (mq-studio-site)
↓ (GitHub webhook)
Vercel (Auto-build & deploy)
↓
Live Site (mq-studio-site.vercel.app)
```

### Build & Deployment Process

```bash
# Local development
npm run dev                 # Start local server

# Testing before deploy
npm run build              # Build production bundle
npm run lint               # Check code quality
npm run test               # Run tests

# Deployment
git push origin main       # Push to development
git push production main    # Push to production (triggers Vercel)

# Vercel automated steps:
1. npm install
2. npm run build
3. npm run lint (if configured)
4. Deploy to edge network
5. Invalidate cache
6. Update DNS (if needed)
```

### Environment Configuration

```env
# .env.local (secrets, not in repo)
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=http://localhost:3000
CMS_ADMIN_EMAIL=moura@example.com
CMS_ADMIN_PASSWORD=<hashed-password>
GITHUB_TOKEN=<for-git-operations>

# .env.production (Vercel)
NEXTAUTH_URL=https://mq-studio-site.vercel.app
# Same secrets via Vercel dashboard
```

### Rollback Strategy

```
If deployment issues:
1. Identify problem (via Vercel logs)
2. Git revert: git revert <commit>
3. Push: git push origin main
4. Vercel auto-deploys (auto-rollback)

Alternative:
1. Access Vercel dashboard
2. Go to Deployments
3. Click "Promote to Production" on previous version
4. Immediate rollback

Content-only issues:
1. Edit content in CMS
2. Republish content
3. Git auto-commits
4. Vercel redeploys (minimal)
```

---

## Error Handling & Recovery

### Error Categories

```
1. Validation Errors (400)
   - Missing required field
   - Invalid slug format
   - File too large
   → Show inline error message
   → Highlight problem field

2. Authentication Errors (401)
   - Session expired
   - Invalid credentials
   → Show login prompt
   → Preserve current state
   → Auto-restore after login

3. Permission Errors (403)
   - Insufficient permissions
   → Show error message
   → Suggest contact admin

4. Not Found Errors (404)
   - Content deleted
   - Resource not found
   → Show "Not found" message
   → Link back to list

5. Conflict Errors (409)
   - Duplicate slug
   - Concurrent edit
   → Show options to resolve
   → Allow manual override

6. Server Errors (500)
   - Database error
   - File system error
   - Processing error
   → Show generic error
   → Log details server-side
   → Show retry button

7. Network Errors
   - Timeout
   - Connection lost
   → Show offline message
   → Retry with backoff
   → Local storage backup
```

### Error Recovery Patterns

```typescript
// Auto-retry with exponential backoff
async function retryWithBackoff(
  fn: () => Promise<any>,
  maxRetries = 3,
  baseDelay = 1000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Auto-save with conflict detection
async function autoSave(data: any) {
  try {
    await retryWithBackoff(() => saveToServer(data));
    showSuccessMessage('Saved');
  } catch (error) {
    if (error.code === 'CONFLICT') {
      // Another version exists, show merge dialog
    }
    // Fall back to localStorage
    localStorage.setItem('draft', JSON.stringify(data));
  }
}

// Graceful degradation
if (uploadAPI) {
  // Use API for uploads
} else {
  // Fall back to local file system
}
```

### Data Loss Prevention

```
1. Auto-save every 30 seconds
   - Draft status, not published
   - Stored in file system
   - Recoverable if browser crashes

2. Local storage backup
   - Duplicate of current form state
   - Used if server unavailable
   - Cleared on successful save

3. Version history
   - Previous versions in Git
   - Rollback capability
   - Limited to recent versions

4. Confirmation dialogs
   - "Are you sure?" before delete
   - "Save before leaving?" on unsaved changes
   - Undo for recent actions

5. Archive instead of delete
   - Content moved to /archive/
   - Can be restored
   - Soft delete pattern
```

---

## Summary

This Technical Architecture document provides:

1. **System overview** showing all major components
2. **Technology stack** with justified choices
3. **Detailed API design** for all endpoints
4. **Data flow** for key operations
5. **File storage** structure and format
6. **Security measures** for protection
7. **Frontend architecture** with state management
8. **Performance optimization** strategies
9. **Deployment process** via Vercel
10. **Error handling** and recovery patterns

The architecture prioritizes **simplicity, maintainability, and alignment with existing site architecture** while enabling fast content creation and publishing.

Next: Implementation Roadmap details the phased approach for building the CMS.
