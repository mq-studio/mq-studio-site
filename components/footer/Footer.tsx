'use client';

import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

const navigationLinks: FooterLink[] = [
  { label: 'Gallery', href: '/gallery/artworks' },
  { label: 'Publications', href: '/gallery/publications' },
  { label: 'Musings', href: '/musings' },
  { label: 'Press', href: '/press' },
  { label: 'Projects', href: '/projects' },
  { label: 'Search', href: '/search' },
];

const getSocialLinks = (): SocialLink[] => [
  {
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/in/moura-quayle-61907010/',
    icon: 'linkedin',
  },
  {
    platform: 'Facebook',
    url: 'https://www.facebook.com/mouraquayle',
    icon: 'facebook',
  },
  {
    platform: 'Instagram',
    url: 'https://www.instagram.com/mouraquayle/',
    icon: 'instagram',
  },
];

const getContactEmail = (): string => 'moura@mouraquayle.ca';

export default function Footer() {
  const socialLinks = getSocialLinks();
  const contactEmail = getContactEmail();

  return (
    <footer className="mt-24 border-t border-[var(--border)] py-12 bg-gradient-to-br from-[var(--rice-paper)] to-[var(--studio-cream)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {/* Left Column: Brand */}
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-4">
              <Link
                href="/"
                className="text-lg font-montserrat font-semibold hover:opacity-80 transition-opacity"
              >
                <span className="text-[var(--moura-teal)]">Moura</span>
                <span className="text-[var(--vibrant-magenta)]"> Quayle</span>
              </Link>
            </div>
            <p className="font-lora text-sm text-[var(--charcoal-wash)] text-center md:text-left">
              Thinking · Feeling · Doing
            </p>
          </div>

          {/* Center Column: Navigation & Social */}
          <div className="flex flex-col items-center">
            <nav className="mb-6 text-sm">
              <div className="flex flex-wrap justify-center gap-4 font-montserrat text-[var(--charcoal-wash)]">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-[var(--moura-teal)] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Social Icons */}
            <div className="flex gap-4 justify-center">
              {socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center transition-transform hover:scale-110"
                  aria-label={`Visit Moura Quayle on ${social.platform}`}
                  title={social.platform}
                >
                  {social.icon === 'linkedin' && (
                    <svg className="w-6 h-6" fill="#0A66C2" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                    </svg>
                  )}
                  {social.icon === 'facebook' && (
                    <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  )}
                  {social.icon === 'instagram' && (
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <defs>
                        <linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                          <stop offset="0%" style={{ stopColor: '#feda75', stopOpacity: 1 }} />
                          <stop offset="5%" style={{ stopColor: '#fa7e1e', stopOpacity: 1 }} />
                          <stop offset="45%" style={{ stopColor: '#d92e7f', stopOpacity: 1 }} />
                          <stop offset="60%" style={{ stopColor: '#9b36b7', stopOpacity: 1 }} />
                          <stop offset="90%" style={{ stopColor: '#515bd4', stopOpacity: 1 }} />
                        </linearGradient>
                      </defs>
                      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#instagram-gradient)" />
                      <circle cx="12" cy="12" r="4" fill="white" />
                      <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Right Column: Contact */}
          <div className="flex flex-col items-center md:items-end">
            <a
              href={`mailto:${contactEmail}`}
              className="inline-block px-4 py-2 bg-[var(--moura-teal)] text-white font-montserrat text-sm font-medium rounded-lg hover:bg-[var(--scholar-blue)] transition-colors duration-300"
            >
              Get in Touch
            </a>
            <p className="font-lora text-xs text-[var(--muted-foreground)] mt-3">
              {contactEmail}
            </p>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="border-t border-[var(--border)] pt-8 text-center">
          <p className="font-lora text-sm text-[var(--muted-foreground)]">
            © 2025 Moura Quayle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
