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
  { label: 'Search', href: '/search' },
];

const getSocialLinks = (): SocialLink[] => [
  {
    platform: 'LinkedIn',
    url: '#',
    icon: 'in',
  },
  {
    platform: 'Facebook',
    url: '#',
    icon: 'f',
  },
  {
    platform: 'Instagram',
    url: '#',
    icon: 'ig',
  },
];

const getContactEmail = (): string => '#';

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
            <div className="flex gap-3 justify-center">
              {socialLinks.map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded bg-[var(--ink-black)] text-white flex items-center justify-center hover:bg-[var(--moura-teal)] transition-colors text-xs font-montserrat font-semibold"
                  aria-label={social.platform}
                  title={social.platform}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right Column: Contact */}
          <div className="flex flex-col items-center md:items-end">
            <a
              href={contactEmail.startsWith('http') ? contactEmail : '#'}
              className="inline-block px-4 py-2 bg-[var(--moura-teal)] text-white font-montserrat text-sm font-medium rounded-lg hover:bg-[var(--scholar-blue)] transition-colors duration-300"
            >
              Get in Touch
            </a>
            {contactEmail && contactEmail !== '#' && (
              <p className="font-lora text-xs text-[var(--muted-foreground)] mt-3">
                {contactEmail}
              </p>
            )}
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
