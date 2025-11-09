/**
 * Sanitization Utilities
 * Security-focused sanitization helpers for content and data
 */

/**
 * Sanitizes content to remove potentially dangerous scripts and HTML
 * Removes script tags, event handlers, and dangerous attributes
 */
export function sanitizeContent(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Remove script tags and their content
  let sanitized = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  return sanitized;
}

/**
 * Sanitizes metadata strings (title, description, etc.)
 * Removes HTML tags and trims whitespace
 */
export function sanitizeMetadataString(value: string): string {
  if (!value || typeof value !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = value.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');

  // Trim whitespace
  return sanitized.trim();
}

/**
 * Sanitizes object by removing potentially dangerous values
 */
export function sanitizeMetadata(
  metadata: Record<string, any>
): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(metadata)) {
    // Skip null/undefined values
    if (value === null || value === undefined) {
      continue;
    }

    // Handle strings
    if (typeof value === 'string') {
      sanitized[key] = sanitizeMetadataString(value);
    }
    // Handle arrays
    else if (Array.isArray(value)) {
      sanitized[key] = value
        .map((item) =>
          typeof item === 'string' ? sanitizeMetadataString(item) : item
        )
        .filter((item) => item !== '');
    }
    // Handle dates
    else if (value instanceof Date) {
      sanitized[key] = value;
    }
    // Handle booleans and numbers
    else if (typeof value === 'boolean' || typeof value === 'number') {
      sanitized[key] = value;
    }
    // Skip objects and other types
  }

  return sanitized;
}

/**
 * Sanitizes error messages for production logging
 * Removes sensitive file paths and system information
 */
export function sanitizeErrorForLogging(error: unknown): string {
  if (error instanceof Error) {
    let message = error.message;

    // Remove file paths
    message = message.replace(/[A-Za-z0-9/_.-]+\.(ts|js|json|mdx)/g, '[FILE]');

    // Remove absolute paths
    message = message.replace(/\/[A-Za-z0-9/_.-]+/g, '[PATH]');
    message = message.replace(/[A-Za-z]:[\\\/][A-Za-z0-9/_.-]+/g, '[PATH]');

    // Remove ENOENT path details
    message = message.replace(/ENOENT: no such file or directory, open '[^']*'/g, 'ENOENT: no such file or directory');

    return message;
  }

  return 'Unknown error occurred';
}
