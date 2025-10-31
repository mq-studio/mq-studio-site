/**
 * Publisher URL resolver for academic publications
 * Maps DOI prefixes and journal names to their publisher sites
 */

// DOI prefix to publisher URL mapping
const DOI_PREFIX_TO_PUBLISHER: Record<string, string> = {
  // Major publishers
  '10.1016': 'https://www.sciencedirect.com', // Elsevier
  '10.1007': 'https://link.springer.com', // Springer
  '10.1177': 'https://journals.sagepub.com', // SAGE Publications
  '10.1080': 'https://www.tandfonline.com', // Taylor & Francis
  '10.1111': 'https://onlinelibrary.wiley.com', // Wiley
  '10.1002': 'https://onlinelibrary.wiley.com', // Wiley (alternative prefix)
  '10.1093': 'https://academic.oup.com', // Oxford University Press
  '10.1017': 'https://www.cambridge.org', // Cambridge University Press
  '10.1038': 'https://www.nature.com', // Nature Publishing Group
  '10.1126': 'https://www.science.org', // Science/AAAS
  '10.1371': 'https://journals.plos.org', // PLOS
  '10.1186': 'https://www.biomedcentral.com', // BioMed Central
  '10.3389': 'https://www.frontiersin.org', // Frontiers
  '10.1145': 'https://dl.acm.org', // ACM
  '10.1109': 'https://ieeexplore.ieee.org', // IEEE
  '10.1056': 'https://www.nejm.org', // New England Journal of Medicine
  '10.1001': 'https://jamanetwork.com', // JAMA Network
};

// Journal name to specific URL mapping (for cases where we know the exact journal)
const JOURNAL_TO_URL: Record<string, string> = {
  // Landscape and planning journals
  'landscape and urban planning': 'https://www.sciencedirect.com/journal/landscape-and-urban-planning',
  'landscape journal': 'https://uwpress.wisc.edu/journals/journals/lj.html',
  'journal of landscape architecture': 'https://www.tandfonline.com/toc/rjla20/current',
  'landscape architecture education': 'https://www.asla.org/education/',

  // Governance and policy journals
  'environment and planning c: politics and space': 'https://journals.sagepub.com/home/epc',
  'policy sciences': 'https://www.springer.com/journal/11077',
  'urban studies': 'https://journals.sagepub.com/home/usj',
  'planning theory & practice': 'https://www.tandfonline.com/journals/rptp20',
  'planning theory and practice': 'https://www.tandfonline.com/journals/rptp20',

  // General academic journals
  'nature': 'https://www.nature.com',
  'science': 'https://www.science.org',
  'proceedings of the national academy of sciences': 'https://www.pnas.org',
  'pnas': 'https://www.pnas.org',
};

export interface PublisherInfo {
  url: string;
  name: string;
  type: 'doi' | 'journal' | 'external' | 'publisher';
}

/**
 * Validates a DOI string
 * DOI should start with 10. followed by publisher code and slash
 */
export function isValidDOI(doi: string | undefined): boolean {
  if (!doi) return false;
  // Remove quotes if present
  const cleanDoi = doi.replace(/['"]/g, '');
  // DOI pattern: starts with 10., has 4+ digits, contains /
  const doiPattern = /^10\.\d{4,}\/\S+$/;
  return doiPattern.test(cleanDoi);
}

/**
 * Clean DOI string (remove quotes and whitespace)
 */
export function cleanDOI(doi: string): string {
  return doi.replace(/['"]/g, '').trim();
}

/**
 * Extract DOI prefix (first two parts: 10.XXXX)
 */
export function getDOIPrefix(doi: string): string | null {
  const cleanedDoi = cleanDOI(doi);
  const match = cleanedDoi.match(/^(10\.\d{4,})/);
  return match ? match[1] : null;
}

/**
 * Generate DOI.org URL from DOI
 */
export function getDOIUrl(doi: string): string {
  const cleanedDoi = cleanDOI(doi);
  return `https://doi.org/${cleanedDoi}`;
}

/**
 * Get publisher URL from DOI prefix
 */
export function getPublisherFromDOI(doi: string): string | null {
  const prefix = getDOIPrefix(doi);
  if (!prefix) return null;

  // Check if we have a mapping for this prefix
  for (const [prefixKey, publisherUrl] of Object.entries(DOI_PREFIX_TO_PUBLISHER)) {
    if (prefix.startsWith(prefixKey)) {
      return publisherUrl;
    }
  }

  return null;
}

/**
 * Get journal URL from journal name
 */
export function getJournalUrl(journalName: string | undefined): string | null {
  if (!journalName) return null;

  // Normalize journal name for lookup
  const normalized = journalName.toLowerCase().trim();

  // Direct match
  if (JOURNAL_TO_URL[normalized]) {
    return JOURNAL_TO_URL[normalized];
  }

  // Partial match (for variations)
  for (const [key, url] of Object.entries(JOURNAL_TO_URL)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return url;
    }
  }

  return null;
}

/**
 * Construct publisher article URL if possible
 */
export function constructPublisherArticleUrl(doi: string, publisherBase: string): string {
  const cleanedDoi = cleanDOI(doi);

  // Special handling for different publishers
  if (publisherBase.includes('sciencedirect.com')) {
    // Elsevier/ScienceDirect uses pii or doi in URLs
    return `${publisherBase}/science/article/pii/${cleanedDoi.replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  if (publisherBase.includes('springer.com')) {
    // Springer uses article/DOI format
    return `${publisherBase}/article/${cleanedDoi}`;
  }

  if (publisherBase.includes('journals.sagepub.com')) {
    // SAGE uses doi/ format
    return `${publisherBase}/doi/full/${cleanedDoi}`;
  }

  if (publisherBase.includes('tandfonline.com')) {
    // Taylor & Francis uses doi/full/ format
    return `${publisherBase}/doi/full/${cleanedDoi}`;
  }

  if (publisherBase.includes('wiley.com')) {
    // Wiley uses doi/full/ format
    return `${publisherBase}/doi/full/${cleanedDoi}`;
  }

  // Default: use DOI.org as fallback
  return getDOIUrl(cleanedDoi);
}

/**
 * Main resolver function that determines the best link for a publication
 * Priority: externalUrl > publisherUrl > journal-specific URL > DOI-derived publisher URL > DOI.org
 */
export function resolvePublisherLink(publication: {
  externalUrl?: string;
  publisherUrl?: string;
  doi?: string;
  journal?: string;
}): PublisherInfo | null {
  // 1. Check for explicit external URL (highest priority)
  if (publication.externalUrl) {
    return {
      url: publication.externalUrl,
      name: 'Publisher',
      type: 'external'
    };
  }

  // 2. Check for explicit publisher URL
  if (publication.publisherUrl) {
    return {
      url: publication.publisherUrl,
      name: 'Publisher',
      type: 'publisher'
    };
  }

  // 3. Try to get journal-specific URL
  const journalUrl = getJournalUrl(publication.journal);
  if (journalUrl) {
    // If we have a DOI and journal URL, try to construct article URL
    if (publication.doi && isValidDOI(publication.doi)) {
      const publisherBase = getPublisherFromDOI(publication.doi);
      if (publisherBase) {
        return {
          url: constructPublisherArticleUrl(publication.doi, publisherBase),
          name: 'View on Publisher Site',
          type: 'journal'
        };
      }
    }
    // Otherwise return journal homepage
    return {
      url: journalUrl,
      name: 'View Journal',
      type: 'journal'
    };
  }

  // 4. Try to derive publisher from DOI
  if (publication.doi && isValidDOI(publication.doi)) {
    const publisherUrl = getPublisherFromDOI(publication.doi);
    if (publisherUrl) {
      return {
        url: constructPublisherArticleUrl(publication.doi, publisherUrl),
        name: 'View on Publisher Site',
        type: 'doi'
      };
    }

    // 5. Fall back to DOI.org if we have a valid DOI but no publisher mapping
    return {
      url: getDOIUrl(publication.doi),
      name: 'View on DOI',
      type: 'doi'
    };
  }

  // No link available
  return null;
}

/**
 * Get button text based on the type of link
 */
export function getPublisherButtonText(info: PublisherInfo | null): string {
  if (!info) return 'Publisher Site';

  switch (info.type) {
    case 'external':
    case 'publisher':
      return 'View on Publisher Site';
    case 'journal':
      return 'View in Journal';
    case 'doi':
      return info.name; // Will be either "View on Publisher Site" or "View on DOI"
    default:
      return 'View Publication';
  }
}