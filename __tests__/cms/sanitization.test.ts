/**
 * Sanitization Utilities Test Suite
 * Tests security-focused sanitization helpers
 */

import {
  sanitizeContent,
  sanitizeMetadataString,
  sanitizeMetadata,
  sanitizeErrorForLogging,
} from '../../lib/utils/sanitization';

describe('Sanitization Utilities', () => {
  describe('sanitizeContent', () => {
    it('should remove script tags', () => {
      const malicious = 'Hello <script>alert("XSS")</script> World';
      const sanitized = sanitizeContent(malicious);
      expect(sanitized).toBe('Hello  World');
      expect(sanitized).not.toContain('<script>');
    });

    it('should remove iframe tags', () => {
      const malicious = 'Hello <iframe src="evil.com"></iframe> World';
      const sanitized = sanitizeContent(malicious);
      expect(sanitized).toBe('Hello  World');
      expect(sanitized).not.toContain('<iframe>');
    });

    it('should remove event handlers', () => {
      const malicious = '<div onclick="alert(\'XSS\')">Click me</div>';
      const sanitized = sanitizeContent(malicious);
      expect(sanitized).not.toContain('onclick');
      expect(sanitized).toContain('<div>Click me</div>');
    });

    it('should remove various event handlers', () => {
      const tests = [
        { input: '<img onload="evil()" />', handler: 'onload' },
        { input: '<body onmouseover="evil()">', handler: 'onmouseover' },
        { input: '<a href="#" onerror="evil()">Link</a>', handler: 'onerror' },
      ];

      tests.forEach(({ input, handler }) => {
        const sanitized = sanitizeContent(input);
        expect(sanitized).not.toContain(handler);
      });
    });

    it('should allow safe HTML', () => {
      const safe = '<p>Hello <strong>World</strong></p>';
      const sanitized = sanitizeContent(safe);
      expect(sanitized).toBe(safe);
    });

    it('should handle empty or null content', () => {
      expect(sanitizeContent('')).toBe('');
      // @ts-expect-error Testing invalid input
      expect(sanitizeContent(null)).toBe('');
      // @ts-expect-error Testing invalid input
      expect(sanitizeContent(undefined)).toBe('');
    });
  });

  describe('sanitizeMetadataString', () => {
    it('should remove HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const sanitized = sanitizeMetadataString(input);
      expect(sanitized).toBe('Hello World');
      expect(sanitized).not.toContain('<');
    });

    it('should decode HTML entities', () => {
      const input = 'Hello &amp; Goodbye &lt;test&gt;';
      const sanitized = sanitizeMetadataString(input);
      expect(sanitized).toBe('Hello & Goodbye <test>');
    });

    it('should trim whitespace', () => {
      const input = '   Hello World   ';
      const sanitized = sanitizeMetadataString(input);
      expect(sanitized).toBe('Hello World');
    });

    it('should handle empty or null strings', () => {
      expect(sanitizeMetadataString('')).toBe('');
      // @ts-expect-error Testing invalid input
      expect(sanitizeMetadataString(null)).toBe('');
    });
  });

  describe('sanitizeMetadata', () => {
    it('should sanitize string values', () => {
      const input = {
        title: '<p>My Title</p>',
        description: '   Description   ',
      };
      const sanitized = sanitizeMetadata(input);
      expect(sanitized.title).toBe('My Title');
      expect(sanitized.description).toBe('Description');
    });

    it('should sanitize array values', () => {
      const input = {
        tags: ['<tag1>', '  tag2  ', 'tag3'],
      };
      const sanitized = sanitizeMetadata(input);
      expect(sanitized.tags).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should preserve dates', () => {
      const now = new Date();
      const input = { createdAt: now };
      const sanitized = sanitizeMetadata(input);
      expect(sanitized.createdAt).toBe(now);
    });

    it('should preserve booleans and numbers', () => {
      const input = {
        featured: true,
        views: 42,
      };
      const sanitized = sanitizeMetadata(input);
      expect(sanitized.featured).toBe(true);
      expect(sanitized.views).toBe(42);
    });

    it('should skip null and undefined values', () => {
      const input = {
        title: 'Hello',
        nullValue: null,
        undefinedValue: undefined,
      };
      const sanitized = sanitizeMetadata(input);
      expect(sanitized.title).toBe('Hello');
      expect(sanitized.nullValue).toBeUndefined();
      expect(sanitized.undefinedValue).toBeUndefined();
    });

    it('should skip objects', () => {
      const input = {
        title: 'Hello',
        nestedObject: { key: 'value' },
      };
      const sanitized = sanitizeMetadata(input);
      expect(sanitized.title).toBe('Hello');
      expect(sanitized.nestedObject).toBeUndefined();
    });
  });

  describe('sanitizeErrorForLogging', () => {
    it('should remove file paths', () => {
      const error = new Error('Error in /home/user/app/file.ts');
      const sanitized = sanitizeErrorForLogging(error);
      expect(sanitized).not.toContain('/home/user/app/file.ts');
      expect(sanitized).toContain('[FILE]');
    });

    it('should remove absolute paths', () => {
      const error = new Error('Cannot access /etc/passwd');
      const sanitized = sanitizeErrorForLogging(error);
      expect(sanitized).not.toContain('/etc/passwd');
      expect(sanitized).toContain('[PATH]');
    });

    it('should sanitize ENOENT errors', () => {
      const error = new Error("ENOENT: no such file or directory, open '/secret/file.txt'");
      const sanitized = sanitizeErrorForLogging(error);
      expect(sanitized).not.toContain('/secret/file.txt');
      expect(sanitized).toBe('ENOENT: no such file or directory');
    });

    it('should handle non-Error objects', () => {
      const sanitized = sanitizeErrorForLogging('string error');
      expect(sanitized).toBe('Unknown error occurred');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeErrorForLogging(null)).toBe('Unknown error occurred');
      expect(sanitizeErrorForLogging(undefined)).toBe('Unknown error occurred');
    });
  });
});
