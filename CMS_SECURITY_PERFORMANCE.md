# MQ Studio CMS: Security & Performance Specifications

**Version:** V01
**Date:** 2025-11-09
**Status:** Complete
**Audience:** Development Team, Security Review

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [Input Validation & Sanitization](#input-validation--sanitization)
5. [Common Vulnerabilities Prevention](#common-vulnerabilities-prevention)
6. [Performance Requirements](#performance-requirements)
7. [Performance Optimization Strategies](#performance-optimization-strategies)
8. [Monitoring & Alerting](#monitoring--alerting)
9. [Security Checklist](#security-checklist)
10. [Performance Checklist](#performance-checklist)

---

## Security Overview

### Security Principles

1. **Defense in Depth** - Multiple layers of protection
2. **Least Privilege** - Minimal necessary permissions
3. **Secure by Default** - Safe defaults, opt-in for features
4. **Fail Securely** - Errors don't expose vulnerabilities
5. **Input Validation** - Validate everything
6. **Output Encoding** - Encode before display

### Security Goals

```
✓ Only Moura can access and modify content
✓ User credentials never exposed
✓ No unauthorized data access
✓ No injection attacks (SQL, XSS, Command)
✓ CSRF protection on all state-changing operations
✓ Data protected in transit and at rest
✓ Audit trail of all changes (Git)
✓ Secure file uploads (no malware)
✓ Secure error messages (no info leakage)
```

### Threat Model

```
THREAT 1: Unauthorized Access
──────────────────────────────
Actor: Random attacker on internet
Goal: Access Moura's CMS and modify content
Likelihood: High (public URL)
Impact: Critical (content defacement)

THREAT 2: Credential Theft
──────────────────────────
Actor: Network attacker
Goal: Steal Moura's password
Likelihood: Medium (if using public WiFi)
Impact: Critical (full access)

THREAT 3: Malicious File Upload
────────────────────────────────
Actor: Attacker with access to upload
Goal: Upload malware disguised as image
Likelihood: Low (only Moura can upload)
Impact: Medium (web shell, if not detected)

THREAT 4: XSS Attack
────────────────────
Actor: Attacker injecting HTML/JS in content
Goal: Steal session tokens or perform actions
Likelihood: Medium (if content not sanitized)
Impact: Critical (session hijacking)

THREAT 5: CSRF Attack
─────────────────────
Actor: Attacker with Moura's session
Goal: Perform unwanted actions on her behalf
Likelihood: Low (CMS-only, no public forms)
Impact: High (content modification)

THREAT 6: Data Breach
─────────────────────
Actor: Insider at Vercel/GitHub
Goal: Access Moura's content
Likelihood: Very Low (trusted services)
Impact: High (content exposure)
```

---

## Authentication & Authorization

### Authentication Strategy

#### Login Mechanism (V01)

```
Method: Email + Password
Storage: Password hash (bcrypt) in .env.local
Transport: HTTPS only
Credential Verification: Direct string comparison (production-grade hashing)

Flow:
1. User enters email and password
2. Frontend sends to /api/auth/login (POST)
3. Backend validates credentials
   - Check email matches configured admin
   - Hash submitted password and compare with stored hash
   - No timing attacks: use constant-time comparison
4. If valid: Generate JWT token
5. Store token in httpOnly, Secure, SameSite cookie
6. Return success response
7. Frontend redirects to dashboard

Token Details:
- Type: JWT (JSON Web Token)
- Algorithm: HS256
- Expiration: 24 hours
- Refresh: Token auto-refreshes on page reload
- Storage: httpOnly cookie (XSS protection)
- Secure flag: Always (HTTPS only)
- SameSite: Strict (CSRF protection)
```

#### Session Management

```
Session Lifetime: 24 hours
Activity-based timeout: After 30 minutes of inactivity
Auto-refresh: On each page load (extends timer)
Single session: Only one active session per user
Logout: Clears session cookie immediately

Recovery from Timeout:
1. User makes request with expired token
2. Backend returns 401 Unauthorized
3. Frontend catches error
4. Show login modal (preserve current state)
5. User logs back in
6. Restore preserved state (if available)
7. Continue operation
```

#### Protected Routes

```
All /pages/studio/* routes require authentication

Implementation:
1. Use Next.js middleware to check auth
2. Redirect to /studio/login if unauthenticated
3. Verify token validity
4. Check token expiration
5. Allow request only if valid

API Routes:
- Check Authorization header or cookie
- Validate JWT token
- Return 401 if missing/invalid
- Return 403 if insufficient permissions
```

### Authorization Model

```
Role-Based Access Control (RBAC)

Roles (V01):
┌─────────────────────────────────────────┐
│ Admin (Moura)                           │
├─────────────────────────────────────────┤
│ ✓ Create, read, update, delete content  │
│ ✓ Upload, delete media                  │
│ ✓ Create, edit, delete tags             │
│ ✓ Configure site settings               │
│ ✓ View all analytics                    │
│ ✓ Access all CMS features               │
└─────────────────────────────────────────┘

Future Roles (V02+):
┌─────────────────────────────────────────┐
│ Viewer (David)                          │
├─────────────────────────────────────────┤
│ ✓ Read published content                │
│ ✓ Cannot edit or delete                 │
│ ✓ Can add comments (if enabled)         │
└─────────────────────────────────────────┘
```

---

## Data Protection

### Password Security

```
✓ Hash with bcrypt (cost factor: 12)
✓ Never store plaintext
✓ Never transmit in logs
✓ Only accept HTTPS POST
✓ Min length: 8 characters
✓ Complexity: At least 1 uppercase, 1 number

Storage Location:
- .env.local file (NOT in repo)
- Never checked into Git
- Not visible in logs
- Not visible in error messages
```

### Data in Transit

```
✓ HTTPS/TLS 1.2+ enforced
✓ All API calls over HTTPS
✓ Certificate validation
✓ HSTS header (Strict-Transport-Security)
✓ No HTTP fallback

Header: Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Data at Rest

```
Content Files:
- Stored in /content/ directory on filesystem
- Protected by file system permissions
- No encryption (low risk for non-sensitive content)
- Backed up via Git (private repository)

Media Files:
- Stored in /public/uploads/ directory
- Protected by file system permissions
- Served through CDN (Vercel Edge Network)
- Backup via Git (if in public/)

Secrets:
- Password hash in .env.local (not in repo)
- GitHub token in .env.local (not in repo)
- Never logged or exposed
- Rotated regularly
```

### Git Repository Security

```
Repository Structure:
├── mq-studio-dev (Private)
│   - Development repository
│   - Shared with team
│   - Protected branch: main (requires PR review)
│
└── mq-studio-site (Private)
    - Production repository
    - Automatic deployment
    - Branch protection enabled
    - Audit log enabled

Protections:
✓ Only admins can push directly
✓ PR reviews required
✓ Status checks must pass
✓ Signed commits (recommended)
✓ No force pushes allowed
✓ No commit history rewrites
```

### Sensitive Data in Logs

```
✗ Never log passwords
✗ Never log tokens
✗ Never log API keys
✗ Never log personal information
✗ Never log file contents
✗ Never log error stack traces in production

✓ Log action type (create, update, delete)
✓ Log user (email)
✓ Log resource type (musing, artwork)
✓ Log resource ID (not name/content)
✓ Log timestamp
✓ Log HTTP status

Example Good Log:
"User admin@example.com created content type=musing id=abc123 status=draft"

Example Bad Log:
"POST /api/content/musings with data={password, token, ...}"
```

---

## Input Validation & Sanitization

### Validation Strategy

```
Layer 1: Client-side validation (immediate feedback)
├── Type checking
├── Length checking
├── Format checking (URL, email, slug)
└── Required field checking

Layer 2: Server-side validation (security)
├── ALL inputs re-validated
├── Type enforcement
├── Length limits
├── Format validation
├── Business logic validation
└── Rate limiting

Layer 3: Output encoding (XSS prevention)
├── HTML entities escaped
├── Attributes properly quoted
├── JavaScript context escaped
└── URL context escaped
```

### Input Validation Rules

#### Content Fields

```
Title:
- Type: String
- Required: Yes
- Max length: 200 characters
- Allowed chars: A-Z, a-z, 0-9, spaces, punctuation
- Trim whitespace: Yes
- No HTML: Yes (sanitize)

Slug:
- Type: String
- Required: Yes
- Max length: 100 characters
- Format: lowercase-with-dashes
- Regex: ^[a-z0-9]([a-z0-9-]*[a-z0-9])?$
- Unique: Yes (check against existing)
- Auto-generated from title or manual

Category:
- Type: Enum
- Required: Yes
- Allowed values: thinking, feeling, doing
- No user input: Radio selection only

Content (Body):
- Type: String (HTML/MDX)
- Required: Yes
- Min length: 10 characters
- Max length: 1,000,000 characters
- Sanitized: DOMPurify allowed tags only
- Images: Only from media library

Tags:
- Type: Array<String>
- Required: No
- Max items: 20
- Per tag:
  - Max length: 50 characters
  - Format: lowercase-with-dashes
  - No special chars except hyphen
  - Autocomplete from existing or create new

Excerpt:
- Type: String
- Required: No
- Max length: 500 characters
- Plain text only (no HTML)
- Auto-generated if not provided

Featured Image:
- Type: String (URL)
- Required: No
- Source: Only from media library
- Validation: File exists and is image
```

#### Media Upload Fields

```
File:
- Type: Binary file
- Max size: 50 MB
- Allowed types (whitelist):
  - Images: JPG, PNG, GIF, WebP
  - Audio: MP3, M4A, WAV
  - Video: MP4, WebM
  - PDF: PDF only
- MIME type validation: Check actual type (not extension)
- Virus scanning: Enable if available

Alt Text:
- Type: String
- Max length: 200 characters
- Plain text only
- Describe image content

Caption:
- Type: String
- Max length: 500 characters
- May include markdown-style links
```

#### Settings Fields

```
Site Title:
- Type: String
- Max length: 100
- Required: Yes

Contact Email:
- Type: String
- Format: Valid email
- Required: Yes
- Validation: RFC 5322

Social Links:
- Type: URL
- Format: Valid URL
- HTTPS required for social media
- Domain whitelist (twitter, linkedin, instagram, etc.)
```

### Output Encoding/Escaping

```
HTML Context:
✓ Use React (auto-escapes by default)
✓ .textContent for text content
✗ innerHTML with untrusted content
✗ v-html (Vue) equivalent

Allowed HTML in Content:
Use DOMPurify to allow only safe tags:
✓ <p>, <h1>-<h6>, <strong>, <em>, <a>, <img>
✓ <ul>, <ol>, <li>, <blockquote>, <code>, <pre>
✗ <script>, <iframe>, <form>, <button>
✗ onclick, onerror, onload, etc. (event handlers)

URL Context:
✓ Use href="" with validated URLs
✓ Check protocol (http://, https://, mailto:, /)
✗ javascript: protocol
✗ data: protocol (unless specifically needed)

JavaScript Context:
✓ Serialize to JSON
✓ Use JSON.parse only on valid JSON
✗ eval()
✗ new Function()
✗ Serializing objects with functions
```

### Form Validation Implementation

```typescript
// /src/lib/services/validation-service.ts

export const VALIDATION_RULES = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s\-.,!?'""''–—:;()\/&]+$/,
  },
  slug: {
    required: true,
    maxLength: 100,
    pattern: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
  },
  category: {
    required: true,
    enum: ['thinking', 'feeling', 'doing'],
  },
  tags: {
    maxItems: 20,
    itemMaxLength: 50,
  },
  content: {
    required: true,
    minLength: 10,
    maxLength: 1000000,
  },
};

export async function validateMusing(data: any) {
  const errors: Record<string, string> = {};

  // Server-side validation (comprehensive)
  if (!data.title || data.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (data.title.length > VALIDATION_RULES.title.maxLength) {
    errors.title = `Title must be under ${VALIDATION_RULES.title.maxLength} characters`;
  }

  if (!VALIDATION_RULES.category.enum.includes(data.category)) {
    errors.category = 'Invalid category';
  }

  // Check slug uniqueness (only server-side)
  if (data.slug) {
    const exists = await contentService.slugExists(data.slug, data.id);
    if (exists) {
      errors.slug = 'This slug is already in use';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function sanitizeContent(html: string): string {
  // Use DOMPurify to remove dangerous content
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'strong', 'em', 'a', 'img',
                   'ul', 'ol', 'li', 'blockquote', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel'],
    FORCE_BODY: false,
  });
}
```

---

## Common Vulnerabilities Prevention

### OWASP Top 10 Protection

#### A01: Broken Access Control

```
Risk: Moura's content accessible to unauthorized users

Prevention:
✓ Authentication required for all /studio/* routes
✓ Check user identity on every API request
✓ No public visibility of CMS content/settings
✓ No direct file access (use API routes)
✓ Proper HTTP status codes (401, 403)

Implementation:
- Next.js middleware checks auth on all CMS routes
- Each API route validates user identity
- File access only through authenticated endpoints
- Test: Try accessing /studio/ without login → redirect to login
```

#### A02: Cryptographic Failures

```
Risk: Credentials or data exposed in transit

Prevention:
✓ HTTPS/TLS 1.2+ enforced (Vercel default)
✓ HSTS header enabled
✓ httpOnly cookies (no JavaScript access)
✓ Secure flag on cookies (HTTPS only)
✓ No data in URL query strings (use POST body)

Implementation:
// Next.js config
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
];
```

#### A03: Injection

```
Risk: XSS, Command Injection, Path Traversal

Prevention (XSS):
✓ React auto-escapes by default
✓ DOMPurify for user HTML content
✓ No dangerouslySetInnerHTML with user content
✓ ContentSecurityPolicy header

Prevention (Command Injection):
✓ No shell exec with user input
✓ Use library functions (simple-git)
✓ Validate all file paths
✓ Use absolute paths (no relative paths from user)

Prevention (Path Traversal):
✓ Validate file paths (no ../)
✓ Restrict to specific directories
✓ Use path.resolve() and check within allowed dir
✓ Whitelist allowed paths

Implementation:
// Safe file path handling
function ensurePathInDirectory(filePath: string, baseDir: string) {
  const resolved = path.resolve(filePath);
  const base = path.resolve(baseDir);

  if (!resolved.startsWith(base)) {
    throw new Error('Path traversal attempt detected');
  }

  return resolved;
}
```

#### A04: Insecure Design

```
Risk: Poor architectural decisions

Prevention:
✓ Threat modeling (done in this doc)
✓ Security by default (safe settings)
✓ Defense in depth (multiple layers)
✓ Least privilege (minimal permissions)
✓ Regular security reviews

Implementation:
- Design decision: File-based content (no SQL)
- Design decision: NextAuth for auth (battle-tested)
- Design decision: Git for audit trail
- Design decision: No admin UI (email/password only)
```

#### A05: Broken Authentication

```
Risk: Weak authentication, session hijacking

Prevention:
✓ Strong password storage (bcrypt cost 12)
✓ Secure session tokens (JWT)
✓ httpOnly cookies (XSS protection)
✓ Secure flag (HTTPS only)
✓ SameSite=Strict (CSRF protection)
✓ Session timeout (24 hours)
✓ Single session enforcement

Implementation:
// NextAuth configuration
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: '__secure.next-auth.session-token',
      options: {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      },
    },
  },
};
```

#### A06: Sensitive Data Exposure

```
Risk: Passwords, tokens in logs or error messages

Prevention:
✓ Never log passwords
✓ Never log tokens
✓ Never log file contents
✓ Sanitize error messages
✓ No stack traces in production

Implementation:
// Good error handling
try {
  // operation
} catch (error) {
  // Log safe info
  logger.error('Operation failed', {
    action: 'publish_content',
    contentId: id,
    timestamp: new Date(),
  });
  // Return safe error to client
  res.status(500).json({
    error: 'An error occurred. Please try again later.',
  });
}
```

#### A07: CSRF (Cross-Site Request Forgery)

```
Risk: Attacker tricks user into performing unwanted action

Prevention:
✓ SameSite cookies (Strict)
✓ CSRF tokens (if needed)
✓ No state-changing GET requests
✓ POST/PUT/DELETE for modifications

Implementation:
// Already handled by:
- NextAuth.js (auto CSRF tokens)
- SameSite=Strict cookies
- All mutations use POST/PUT/DELETE
```

#### A08: Software & Data Integrity Failures

```
Risk: Compromised dependencies, tampered deployments

Prevention:
✓ Dependency scanning (npm audit)
✓ Use trusted libraries
✓ Lock dependency versions
✓ Regular updates
✓ Signed commits (optional)
✓ Secure deployment pipeline

Implementation:
- npm ci (clean install, respects lock file)
- npm audit before deploy
- Vercel's security scanning
- GitHub branch protection
```

#### A09: Logging & Monitoring Failures

```
Risk: Attacks go undetected, cannot investigate

Prevention:
✓ Log important security events
✓ Monitor for suspicious activity
✓ Alerting on errors
✓ Regular log review

Implementation:
// Log security events
logger.info('User login', { user: email, timestamp });
logger.warn('Failed login attempt', { email, ip });
logger.error('Unauthorized access attempt', {
  route, userId, timestamp
});
```

#### A10: SSRF (Server-Side Request Forgery)

```
Risk: CMS makes requests to internal systems

Prevention:
✓ No user-supplied URLs in requests
✓ Whitelist allowed domains
✓ Validate all URLs
✓ No requests to internal IPs

Implementation:
// Good: Whitelist social media URLs
const ALLOWED_DOMAINS = [
  'twitter.com',
  'linkedin.com',
  'instagram.com',
];

function validateUrl(url: string) {
  const parsed = new URL(url);
  if (!ALLOWED_DOMAINS.includes(parsed.hostname)) {
    throw new Error('Domain not allowed');
  }
}
```

---

## Performance Requirements

### Target Metrics (Based on Current Performance)

```
Current Public Site Performance:
- Desktop FCP: 0.4s
- Desktop LCP: 0.5s
- Mobile FCP: 1.8s
- Mobile LCP: 2.7s

CMS Interface Performance Targets:
┌──────────────────────────────────┬────────┬────────┐
│ Metric                           │ Target │ Good   │
├──────────────────────────────────┼────────┼────────┤
│ Initial Dashboard Load (FCP)     │ < 2s   │ < 1.5s │
│ Editor Open                      │ < 1.5s │ < 1s   │
│ List View Load (100 items)       │ < 1s   │ < 0.5s │
│ Search Results (debounced)       │ < 300ms│ < 100ms│
│ Auto-save Roundtrip              │ < 500ms│ < 300ms│
│ Publish Action                   │ < 3s   │ < 2s   │
│ Image Upload (5MB)               │ < 5s   │ < 3s   │
│ Image Optimization               │ async  │ async  │
│ Largest Contentful Paint (LCP)   │ < 2.5s │ < 2s   │
│ First Input Delay (FID)          │ < 100ms│ < 50ms │
│ Cumulative Layout Shift (CLS)    │ < 0.1  │ < 0.05 │
│ Time to Interactive (TTI)        │ < 3.5s │ < 3s   │
└──────────────────────────────────┴────────┴────────┘
```

### Performance Budgets

```
Bundle Size Budget:
- JavaScript: < 200 KB (gzipped)
  ├── React + Next.js: ~60 KB
  ├── Editor library: ~50 KB
  ├── UI components: ~30 KB
  └── App code: ~60 KB
- CSS: < 50 KB (gzipped)
- Total: < 250 KB (gzipped)

Image Performance:
- Page images: < 100 KB each (after optimization)
- Thumbnails: < 30 KB
- No unoptimized images
- WebP format with PNG fallback

Network Performance:
- No more than 15 HTTP requests
- Lazy load below-fold images
- Cache static assets (max-age: 1 year)
- Compression: gzip minimum

Core Web Vitals:
- LCP: < 2.5s (good)
- FID: < 100ms (good)
- CLS: < 0.1 (good)
```

### Performance Metrics Collection

```
Tools to Use:
✓ Lighthouse (Chrome DevTools)
✓ Google PageSpeed Insights
✓ WebPageTest
✓ Vercel Analytics (built-in)
✓ Web Vitals library (real-user monitoring)

Monitoring:
- Measure at multiple points during development
- Baseline before optimization
- Track over time
- Alert if regression > 10%

Targets:
- Desktop: LCP 1.5s, CLS < 0.05
- Mobile: LCP 2.5s, CLS < 0.05
- Must be achieved on 4G network
- Slow 4G should be near target
```

---

## Performance Optimization Strategies

### Frontend Optimization

#### Code Splitting & Lazy Loading

```typescript
// Dynamic imports for large components
const MusingEditor = dynamic(
  () => import('@/components/editors/MusingEditor'),
  { loading: () => <LoadingSpinner /> }
);

// Route-based code splitting (Next.js App Router automatic)
// Each page loaded only when accessed

// Reduce initial bundle:
- Remove unused dependencies
- Tree-shake unused code
- Minimize polyfills
```

#### Image Optimization

```typescript
// Use Next.js Image component
<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={400}
  height={300}
  priority={isAboveTheFold}
  loading={isBelowTheFold ? 'lazy' : 'eager'}
/>

// Automatic optimizations:
- Responsive images (multiple sizes)
- WebP format with fallback
- Lazy loading below fold
- LQIP (Low Quality Image Placeholder)

// Manual optimization:
- Sharp: Resize, compress, convert
- Target max 1MB for images
- Generate thumbnails (100KB)
```

#### State Management Optimization

```typescript
// Use Context API selectively
- Don't put everything in Context
- Split into separate contexts (Auth, Content, Media)
- Use useReducer for complex state
- Memoize context values to prevent unnecessary re-renders

// Optimization:
const ContentContext = React.createContext();
export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent outside provider');
  return context;
}

// In provider:
const memoizedValue = useMemo(() => ({
  musings,
  fetch,
  create,
}), [musings, fetch, create]);
```

#### Component Optimization

```typescript
// Memoization for expensive components
const MusingCard = React.memo(({ musing, onEdit, onDelete }) => {
  return (
    <div className="card">
      <h3>{musing.title}</h3>
      {/* ... */}
    </div>
  );
});

// useCallback for handlers to prevent re-renders
const handleEdit = useCallback((id) => {
  router.push(`/studio/musings/${id}`);
}, [router]);

// Virtualization for long lists
import { FixedSizeList as List } from 'react-window';

<List
  height={600}
  itemCount={items.length}
  itemSize={100}
  width="100%"
>
  {({ index, style }) => <Item style={style} item={items[index]} />}
</List>
```

#### Network Optimization

```typescript
// Debouncing search/filter
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useMemo(
  () => debounce((term) => {
    fetch(`/api/content/musings?search=${term}`);
  }, 300),
  []
);

const handleSearch = (e) => {
  setSearchTerm(e.target.value);
  debouncedSearch(e.target.value);
};

// Pagination instead of infinite scroll
// Smaller initial payload
// Load more on demand

// Compression (automatic on Vercel)
// SWR for data fetching with caching
import useSWR from 'swr';

const { data: musings, isLoading } = useSWR(
  `/api/content/musings?${queryString}`,
  fetcher,
  { revalidateOnFocus: false }
);
```

### Backend Optimization

#### API Response Optimization

```typescript
// Pagination (required)
GET /api/content/musings?page=1&limit=20

Response:
{
  data: [ /* 20 items */ ],
  pagination: {
    page: 1,
    limit: 20,
    total: 48,
    pages: 3,
  }
}

// Selective field returns
GET /api/content/musings?fields=id,title,slug,date,status

// Compression
- gzip enabled (Vercel default)
- Smaller JSON payload
- Reduce bandwidth
```

#### Database Optimization

```
File System Optimization (No real database):
- Cache manifest in memory
- Invalidate cache on writes
- Index content by category/tag in memory
- Regular cache refresh (every 5 mins)
- Async file operations (don't block)
```

#### Image Processing Optimization

```typescript
// Async processing (don't block request)
router.post('/api/media/upload', async (req, res) => {
  // 1. Validate and save original
  await saveFile(file);

  // 2. Return immediately to user
  res.json({ url, thumbnail });

  // 3. Optimize in background
  optimizeImageAsync(id)
    .catch(err => logger.error(err));
});

// Generate multiple sizes
const sizes = [200, 400, 800];
const formats = ['webp', 'png'];
// But return best one first
```

#### Caching Strategy

```
Browser Cache:
- Static assets: max-age=31536000 (1 year)
- HTML: no-cache (revalidate every time)
- API responses: no-cache (fresh data)

Edge Cache (Vercel):
- Static pages: 3600 seconds
- Dynamic API: 60 seconds (if cacheable)
- Purge on publish

Code Example:
res.setHeader('Cache-Control', 'public, max-age=3600');
```

---

## Monitoring & Alerting

### Metrics to Monitor

```
Performance Metrics:
- Page load time (FCP, LCP)
- API response times
- Image optimization effectiveness
- Bundle size trends
- Database query times (if applicable)

Availability:
- Uptime percentage
- API endpoint availability
- Deployment success rate
- Error rate

Security:
- Failed login attempts
- Unauthorized access attempts
- XSS/injection attempt detection
- Unusual traffic patterns

User Behavior:
- Time to create content
- Publish frequency
- Error rates
- Feature usage
```

### Monitoring Tools

```
Web Vitals (Real-User Monitoring):
npm install web-vitals

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(metric => analytics.track('CLS', metric));
getFID(metric => analytics.track('FID', metric));
getFCP(metric => analytics.track('FCP', metric));
getLCP(metric => analytics.track('LCP', metric));
getTTFB(metric => analytics.track('TTFB', metric));

Vercel Analytics:
- Built-in, no additional setup
- Real user monitoring
- Performance insights
- Deployment analytics

Error Tracking (Optional):
- Sentry for error monitoring
- Automatic error alerts
- Session replay
- Performance monitoring

Lighthouse:
- Chrome DevTools
- Automated CI/CD testing
- Monthly manual audits
```

### Alerting Thresholds

```
Alert If:
- LCP > 3s (critical)
- FID > 200ms (critical)
- CLS > 0.2 (warning)
- Error rate > 1% (warning)
- API response > 5s (warning)
- Failed logins > 5 attempts/5 min (security)
- Unauthorized access attempts > 10/5 min (security)
```

---

## Security Checklist

### Development Security

- [ ] TypeScript strict mode enabled
- [ ] No any types (use unknown + type guard)
- [ ] ESLint security rules enabled
- [ ] No console.log in production
- [ ] Error boundaries implemented
- [ ] Input validation on all forms
- [ ] DOMPurify for HTML content
- [ ] No hardcoded secrets in code
- [ ] Environment variables for secrets
- [ ] .env.local in .gitignore
- [ ] API route auth checks
- [ ] CORS properly configured (none needed for same-origin)
- [ ] Rate limiting on API (optional for V01)

### Deployment Security

- [ ] HTTPS enforced (Vercel default)
- [ ] HSTS header enabled
- [ ] CSP header configured
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY (if not embedded)
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Secure cookies (httpOnly, Secure, SameSite=Strict)
- [ ] Session timeout implemented
- [ ] Logout clears all session data
- [ ] No sensitive data in logs
- [ ] Error messages don't reveal system info
- [ ] Dependency updates checked
- [ ] Security audit completed
- [ ] No public access to admin endpoints
- [ ] GitHub repository private
- [ ] Branch protection enabled
- [ ] Force push disabled
- [ ] PR review required

### Operational Security

- [ ] .env.local backed up securely
- [ ] GitHub token has minimal permissions
- [ ] Regular password rotation (manually)
- [ ] Access logs reviewed regularly
- [ ] Incident response plan documented
- [ ] Rollback procedure tested
- [ ] Backup procedure tested
- [ ] Monitoring enabled and alerting functional
- [ ] On-call rotation established
- [ ] Security training completed

---

## Performance Checklist

### Development Performance

- [ ] Bundle size monitored (< 250 KB gzipped)
- [ ] Code splitting implemented
- [ ] Lazy loading implemented for routes
- [ ] Images optimized and lazy-loaded
- [ ] No unnecessary re-renders (React DevTools)
- [ ] Debounced search/filter
- [ ] Pagination implemented (no infinite scroll)
- [ ] Memoization used for expensive components
- [ ] useCallback for handlers
- [ ] Context API properly split
- [ ] No blocking operations in main thread
- [ ] Web Workers for heavy computation (if needed)
- [ ] Service Worker for offline support (V02+)

### Build Performance

- [ ] Next.js build time < 2 minutes
- [ ] No warnings in build output
- [ ] Tree-shaking enabled
- [ ] Minification enabled
- [ ] Source maps in development only
- [ ] Production builds tested
- [ ] Build artifacts size checked

### Runtime Performance

- [ ] FCP < 2s (desktop), < 2.5s (mobile)
- [ ] LCP < 2s (desktop), < 2.5s (mobile)
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] TTI < 3.5s
- [ ] Lighthouse score > 90
- [ ] No layout shifts on interactions
- [ ] Animations smooth (60 fps)
- [ ] No main thread blocking
- [ ] Memory leaks checked

### Network Performance

- [ ] Compression enabled (gzip)
- [ ] HTTP/2 enabled
- [ ] Browser cache configured
- [ ] CDN enabled (Vercel)
- [ ] API responses paginated
- [ ] API response times < 500ms
- [ ] No unnecessary network requests
- [ ] Request deduplication
- [ ] Connection pooling working

### Testing Performance

- [ ] Lighthouse CI configured
- [ ] Performance regression tests
- [ ] Load testing completed
- [ ] Stress testing completed
- [ ] Performance budget enforced
- [ ] Metrics dashboard created
- [ ] Alert thresholds set

---

## Summary

This Security & Performance document provides:

1. **Comprehensive security strategy** protecting against OWASP Top 10
2. **Authentication & authorization** implementation details
3. **Input validation** and output encoding rules
4. **Data protection** measures for all scenarios
5. **Performance requirements** with specific metrics
6. **Optimization strategies** for frontend and backend
7. **Monitoring & alerting** setup instructions
8. **Detailed checklists** for security and performance

The focus is on **practical, implementable security** that protects Moura's content while maintaining **excellent performance** that doesn't regress from the current optimized site.

Next: Final V01 Specification consolidates all requirements into a single document.
