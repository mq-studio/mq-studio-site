import Head from 'next/head';

interface SEOMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
}

/**
 * SEO Meta Component
 * 
 * Adds Open Graph, Twitter Card, and structured data meta tags
 * 
 * Usage:
 * <SEOMeta
 *   title="Page Title"
 *   description="Page description"
 *   image="/path/to/image.jpg"
 * />
 */
export default function SEOMeta({
  title = 'MQ Studio - Moura Quayle',
  description = 'Where governance meets watercolor, policy meets poetry, and decades of scholarship coexist with ongoing artistic exploration.',
  image = '/background_assets/optimized/variants/hero-image-1-web.webp',
  url = 'https://mq-studio-site.vercel.app',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Moura Quayle',
  tags = []
}: SEOMetaProps) {
  const fullTitle = title.includes('MQ Studio') ? title : `${title} | MQ Studio`;
  const fullImageUrl = image.startsWith('http') ? image : `${url}${image}`;
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="author" content={author} />
      {tags.length > 0 && <meta name="keywords" content={tags.join(', ')} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="MQ Studio" />
      
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && tags.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Additional SEO */}
      <link rel="canonical" href={url} />
      
      {/* Structured Data - Person Schema */}
      {type === 'website' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Moura Quayle',
              jobTitle: 'Professor, Academic Leader, Artist',
              description: description,
              url: url,
              image: fullImageUrl,
              sameAs: [
                // Add social media profiles here if available
              ]
            })
          }}
        />
      )}
      
      {/* Structured Data - Article Schema */}
      {type === 'article' && publishedTime && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: title,
              description: description,
              image: fullImageUrl,
              datePublished: publishedTime,
              dateModified: modifiedTime || publishedTime,
              author: {
                '@type': 'Person',
                name: author
              },
              publisher: {
                '@type': 'Organization',
                name: 'MQ Studio',
                logo: {
                  '@type': 'ImageObject',
                  url: `${url}/logo.png` // Add logo if available
                }
              }
            })
          }}
        />
      )}
    </Head>
  );
}
