'use client'

interface StructuredDataProps {
  data: Record<string, any>
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 2),
      }}
    />
  )
}

// Organization structured data
export const organizationData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "TeamX Healthcare Consulting",
  "description": "Transformative healthcare consulting services for operational optimization and strategic growth",
  "url": "https://teamx-healthcare.com",
  "logo": "https://teamx-healthcare.com/images/teamx-logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "areaServed": "North America",
    "availableLanguage": "English"
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "CA",
    "addressRegion": "Ontario"
  },
  "sameAs": [
    "https://linkedin.com/company/teamx-healthcare",
    "https://twitter.com/teamxhealthcare"
  ]
}

// Healthcare consulting service structured data
export const serviceData = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Healthcare Consulting Services",
  "description": "Comprehensive healthcare consulting services including operational optimization, strategic growth planning, digital transformation, and organizational development",
  "provider": {
    "@type": "Organization",
    "name": "TeamX Healthcare Consulting"
  },
  "serviceType": "Healthcare Consulting",
  "areaServed": {
    "@type": "Place",
    "name": "North America"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Healthcare Consulting Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Operational Optimization",
          "description": "Streamline processes, reduce costs, and improve efficiency across all healthcare operations"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Strategic Growth Planning",
          "description": "Develop comprehensive growth strategies that align with market opportunities"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Healthcare Analytics",
          "description": "Leverage advanced analytics and business intelligence to drive informed decision-making"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Team Development",
          "description": "Build high-performing teams through targeted training and leadership development"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Compliance & Risk Management",
          "description": "Ensure regulatory compliance and implement comprehensive risk management frameworks"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Patient Experience Enhancement",
          "description": "Improve patient satisfaction and outcomes through service design and workflow optimization"
        }
      }
    ]
  }
}

// Website structured data
export const websiteData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "TeamX Healthcare Consulting",
  "url": "https://teamx-healthcare.com",
  "description": "TeamX delivers transformative healthcare consulting services, specializing in operational optimization, strategic growth, and sustainable value creation for healthcare organizations.",
  "publisher": {
    "@type": "Organization",
    "name": "TeamX Healthcare Consulting"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://teamx-healthcare.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}