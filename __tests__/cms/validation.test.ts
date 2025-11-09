/**
 * Validation Utilities Test Suite
 * Tests security-focused validation helpers
 */

import {
  validateSlug,
  validateEmail,
  validatePasswordStrength,
  validateContentType,
  validateContentStatus,
} from '../../lib/utils/validation';

describe('Validation Utilities', () => {
  describe('validateSlug', () => {
    it('should accept valid slugs', () => {
      expect(validateSlug('my-post')).toBe(true);
      expect(validateSlug('my_post')).toBe(true);
      expect(validateSlug('my-post-123')).toBe(true);
      expect(validateSlug('MyPost123')).toBe(true);
    });

    it('should reject path traversal attempts', () => {
      expect(validateSlug('../etc/passwd')).toBe(false);
      expect(validateSlug('../../secret')).toBe(false);
      expect(validateSlug('..\\windows\\system32')).toBe(false);
      expect(validateSlug('./local')).toBe(false);
    });

    it('should reject slugs with slashes', () => {
      expect(validateSlug('my/post')).toBe(false);
      expect(validateSlug('my\\post')).toBe(false);
    });

    it('should reject slugs with special characters', () => {
      expect(validateSlug('my post')).toBe(false);
      expect(validateSlug('my@post')).toBe(false);
      expect(validateSlug('my#post')).toBe(false);
      expect(validateSlug('<script>alert("xss")</script>')).toBe(false);
    });

    it('should reject empty or null slugs', () => {
      expect(validateSlug('')).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(validateSlug(null)).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(validateSlug(undefined)).toBe(false);
    });

    it('should reject slugs over 100 characters', () => {
      const longSlug = 'a'.repeat(101);
      expect(validateSlug(longSlug)).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user@example.co.uk')).toBe(true);
      expect(validateEmail('admin@mq-studio.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('notanemail')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user @example.com')).toBe(false);
    });

    it('should reject empty or null emails', () => {
      expect(validateEmail('')).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(validateEmail(null)).toBe(false);
    });

    it('should reject emails over 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(validateEmail(longEmail)).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept strong passwords', () => {
      expect(validatePasswordStrength('TestPassword123!')).toBe(true);
      expect(validatePasswordStrength('MyStr0ng!Pass')).toBe(true);
      expect(validatePasswordStrength('C0mpl3x@Passw0rd')).toBe(true);
    });

    it('should reject passwords without uppercase', () => {
      expect(validatePasswordStrength('testpassword123!')).toBe(false);
    });

    it('should reject passwords without lowercase', () => {
      expect(validatePasswordStrength('TESTPASSWORD123!')).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      expect(validatePasswordStrength('TestPassword!')).toBe(false);
    });

    it('should reject passwords without special characters', () => {
      expect(validatePasswordStrength('TestPassword123')).toBe(false);
    });

    it('should reject passwords shorter than 12 characters', () => {
      expect(validatePasswordStrength('Test123!')).toBe(false);
    });

    it('should reject empty or null passwords', () => {
      expect(validatePasswordStrength('')).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(validatePasswordStrength(null)).toBe(false);
    });
  });

  describe('validateContentType', () => {
    it('should accept valid content types', () => {
      expect(validateContentType('musing')).toBe(true);
      expect(validateContentType('artwork')).toBe(true);
      expect(validateContentType('publication')).toBe(true);
      expect(validateContentType('project')).toBe(true);
    });

    it('should reject invalid content types', () => {
      expect(validateContentType('invalid')).toBe(false);
      expect(validateContentType('musings')).toBe(false);
      expect(validateContentType('')).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(validateContentType(null)).toBe(false);
    });
  });

  describe('validateContentStatus', () => {
    it('should accept valid content statuses', () => {
      expect(validateContentStatus('draft')).toBe(true);
      expect(validateContentStatus('published')).toBe(true);
      expect(validateContentStatus('archived')).toBe(true);
    });

    it('should reject invalid content statuses', () => {
      expect(validateContentStatus('invalid')).toBe(false);
      expect(validateContentStatus('pending')).toBe(false);
      expect(validateContentStatus('')).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(validateContentStatus(null)).toBe(false);
    });
  });
});
