import { Metadata } from 'next'

export interface PageMetadata {
  title: string
  description: string
  keywords?: string
  image?: string
  path: string
}

const siteConfig = {
  name: 'TeamX Healthcare Consulting',
  description: 'Transformative healthcare consulting services for operational optimization and strategic growth',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://teamx-healthcare.com',
  image: '/images/teamx-og-image.jpg'
}

export function generateMetadata(page: PageMetadata): Metadata {
  const title = page.title.includes('TeamX') ? page.title : `${page.title} | ${siteConfig.name}`
  const url = `${siteConfig.url}${page.path}`
  const image = page.image || siteConfig.image

  return {
    title,
    description: page.description,
    keywords: page.keywords,
    authors: [{ name: 'TeamX Healthcare Consulting' }],
    robots: 'index, follow',
    alternates: {
      canonical: url
    },
    openGraph: {
      title,
      description: page.description,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: page.description,
      images: [image],
      creator: '@teamxhealthcare',
      site: '@teamxhealthcare',
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
    },
  }
}

export const pageMetadata: Record<string, PageMetadata> = {
  home: {
    title: 'TeamX - Healthcare Consulting Excellence',
    description: 'TeamX delivers transformative healthcare consulting services, specializing in operational optimization, strategic growth, and sustainable value creation for healthcare organizations.',
    keywords: 'healthcare consulting, operational optimization, strategic growth, healthcare transformation, TeamX',
    path: '/',
  },
  about: {
    title: 'About TeamX - Healthcare Consulting Experts',
    description: 'Learn about TeamX Healthcare Consulting, our mission, values, and 15+ years of experience transforming 150+ healthcare organizations across North America.',
    keywords: 'about teamx, healthcare consulting experts, healthcare transformation, consulting experience',
    path: '/about',
  },
  services: {
    title: 'Healthcare Consulting Services - TeamX',
    description: 'Comprehensive healthcare consulting services including operational optimization, strategic growth planning, digital transformation, and organizational development.',
    keywords: 'healthcare consulting services, operational optimization, strategic planning, digital transformation, organizational development',
    path: '/services',
  },
  process: {
    title: 'Our Proven Consulting Process - TeamX',
    description: 'Discover TeamX\'s proven 6-phase consulting methodology that delivers measurable results and sustainable transformation for healthcare organizations.',
    keywords: 'consulting process, healthcare consulting methodology, transformation framework, proven approach',
    path: '/process',
  },
  frameworks: {
    title: 'Healthcare Consulting Frameworks - TeamX',
    description: 'Explore TeamX\'s proprietary consulting frameworks including the Integrated Master Framework, Operational Alpha Canvas, and Network Effects Canvas.',
    keywords: 'consulting frameworks, healthcare frameworks, proprietary methodologies, strategic tools',
    path: '/frameworks',
  },
  'case-studies': {
    title: 'Healthcare Consulting Case Studies - TeamX',
    description: 'Real-world success stories showcasing how TeamX has transformed healthcare organizations, delivering measurable ROI and sustainable growth.',
    keywords: 'healthcare case studies, consulting success stories, transformation results, ROI examples',
    path: '/case-studies',
  },
  team: {
    title: 'Our Expert Team - TeamX Healthcare Consulting',
    description: 'Meet TeamX\'s experienced healthcare consulting team with 60+ years of combined expertise in healthcare transformation and strategic growth.',
    keywords: 'healthcare consulting team, expert consultants, healthcare professionals, team expertise',
    path: '/team',
  },
  investors: {
    title: 'Investor Relations - TeamX',
    description: 'Investment opportunities and partnership information for TeamX Healthcare Consulting. Join us in transforming the healthcare industry.',
    keywords: 'investment opportunities, investor relations, healthcare consulting investment, partnership opportunities',
    path: '/investors',
  },
  resources: {
    title: 'Healthcare Consulting Resources - TeamX',
    description: 'Access valuable healthcare consulting resources, whitepapers, industry insights, and tools to help transform your organization.',
    keywords: 'healthcare resources, consulting whitepapers, industry insights, healthcare tools',
    path: '/resources',
  },
  contact: {
    title: 'Contact TeamX - Healthcare Consulting',
    description: 'Get in touch with TeamX Healthcare Consulting to discuss your transformation needs. Schedule a consultation with our expert team.',
    keywords: 'contact teamx, healthcare consulting contact, consultation request, get in touch',
    path: '/contact',
  },
}