/**
 * Validation Utilities
 * Security-focused validation helpers for slug, paths, and content
 */

/**
 * Validates slug to prevent path traversal attacks
 * Only allows alphanumeric characters, hyphens, and underscores
 */
export function validateSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  // Only allow alphanumeric, hyphens, and underscores
  const slugRegex = /^[a-zA-Z0-9_-]+$/;

  if (!slugRegex.test(slug)) {
    return false;
  }

  // Prevent path traversal attempts
  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
    return false;
  }

  // Max length of 100 characters
  if (slug.length > 100) {
    return false;
  }

  return true;
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validates password strength
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePasswordStrength(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }

  const minLength = 12;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
}

/**
 * Validates content type
 */
export function validateContentType(type: string): type is 'musing' | 'artwork' | 'publication' | 'project' {
  return ['musing', 'artwork', 'publication', 'project'].includes(type);
}

/**
 * Validates content status
 */
export function validateContentStatus(status: string): status is 'draft' | 'published' | 'archived' {
  return ['draft', 'published', 'archived'].includes(status);
}
