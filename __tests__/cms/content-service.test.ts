/**
 * ContentService Test Suite
 * Tests CRUD operations and security measures
 */

import { ContentService } from '../../lib/services/ContentService';
import { promises as fs } from 'fs';
import path from 'path';

// Mock the file system
jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    access: jest.fn(),
    unlink: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(() => {
    service = new ContentService();
    jest.clearAllMocks();
  });

  describe('Security - Path Traversal Protection', () => {
    it('should reject path traversal in getContentBySlug', async () => {
      await expect(
        service.getContentBySlug('musing', '../../../etc/passwd')
      ).rejects.toThrow('Invalid slug format');
    });

    it('should reject path traversal in createContent', async () => {
      await expect(
        service.createContent('musing', '../evil', {}, 'content')
      ).rejects.toThrow('Invalid slug format');
    });

    it('should reject path traversal in updateContent', async () => {
      await expect(
        service.updateContent('musing', '../../secret', {})
      ).rejects.toThrow('Invalid slug format');
    });

    it('should reject path traversal in deleteContent', async () => {
      await expect(
        service.deleteContent('musing', '../../../var/www')
      ).rejects.toThrow('Invalid slug format');
    });
  });

  describe('Security - Invalid Content Type', () => {
    it('should reject invalid content type in getContentBySlug', async () => {
      // @ts-expect-error Testing invalid input
      await expect(
        service.getContentBySlug('invalid-type', 'test-slug')
      ).rejects.toThrow('Invalid content type');
    });

    it('should reject invalid content type in createContent', async () => {
      // @ts-expect-error Testing invalid input
      await expect(
        service.createContent('invalid-type', 'test', {}, 'content')
      ).rejects.toThrow('Invalid content type');
    });
  });

  describe('Security - Slug Validation', () => {
    it('should reject slugs with special characters', async () => {
      const invalidSlugs = [
        'my post',
        'my@post',
        '<script>alert("xss")</script>',
        'my/post',
        'my\\post',
      ];

      for (const slug of invalidSlugs) {
        await expect(
          service.getContentBySlug('musing', slug)
        ).rejects.toThrow('Invalid slug format');
      }
    });

    it('should accept valid slugs', async () => {
      mockFs.readFile.mockResolvedValue(`---
title: Test Post
---
Content here`);

      const validSlugs = ['my-post', 'my_post', 'post-123', 'MyPost'];

      for (const slug of validSlugs) {
        await expect(
          service.getContentBySlug('musing', slug)
        ).resolves.toBeDefined();
      }
    });
  });

  describe('getAllContent', () => {
    it('should return empty array when directory does not exist', async () => {
      const error: NodeJS.ErrnoException = new Error('ENOENT');
      error.code = 'ENOENT';
      mockFs.readdir.mockRejectedValue(error);

      const result = await service.getAllContent('musing');
      expect(result).toEqual([]);
    });

    it('should return content files', async () => {
      mockFs.readdir.mockResolvedValue(['post1.mdx', 'post2.mdx', 'README.md'] as any);
      mockFs.readFile.mockResolvedValue(`---
title: Test Post
description: Test Description
status: published
---
Content here`);

      const result = await service.getAllContent('musing');
      expect(result.length).toBe(2); // Only .mdx files
      expect(mockFs.readFile).toHaveBeenCalledTimes(2);
    });
  });

  describe('getContentBySlug', () => {
    it('should return null when content does not exist', async () => {
      const error: NodeJS.ErrnoException = new Error('ENOENT');
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);

      const result = await service.getContentBySlug('musing', 'non-existent');
      expect(result).toBeNull();
    });

    it('should return content when it exists', async () => {
      mockFs.readFile.mockResolvedValue(`---
title: My Post
description: A test post
status: published
---
This is the content`);

      const result = await service.getContentBySlug('musing', 'my-post');
      expect(result).toBeDefined();
      expect(result?.metadata.title).toBe('My Post');
      expect(result?.metadata.description).toBe('A test post');
      expect(result?.content).toBe('This is the content');
    });

    it('should sanitize content', async () => {
      mockFs.readFile.mockResolvedValue(`---
title: My Post
---
Hello <script>alert("XSS")</script> World`);

      const result = await service.getContentBySlug('musing', 'my-post');
      expect(result?.content).not.toContain('<script>');
      expect(result?.content).toBe('Hello  World');
    });
  });

  describe('createContent', () => {
    it('should create content successfully', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const accessError: NodeJS.ErrnoException = new Error('ENOENT');
      accessError.code = 'ENOENT';
      mockFs.access.mockRejectedValue(accessError);
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await service.createContent(
        'musing',
        'new-post',
        { title: 'New Post', description: 'A new post' },
        'Content here'
      );

      expect(result).toBeDefined();
      expect(result.metadata.slug).toBe('new-post');
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it('should reject duplicate slugs', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.access.mockResolvedValue(undefined); // File exists

      await expect(
        service.createContent('musing', 'existing-post', {}, 'Content')
      ).rejects.toThrow('already exists');
    });

    it('should sanitize content before writing', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      const accessError: NodeJS.ErrnoException = new Error('ENOENT');
      accessError.code = 'ENOENT';
      mockFs.access.mockRejectedValue(accessError);
      mockFs.writeFile.mockResolvedValue(undefined);

      await service.createContent(
        'musing',
        'test',
        { title: '<script>XSS</script>' },
        'Hello <script>alert("XSS")</script>'
      );

      const writeCall = mockFs.writeFile.mock.calls[0];
      const writtenContent = writeCall[1] as string;

      expect(writtenContent).not.toContain('<script>');
    });

    it('should validate and reject invalid status', async () => {
      await expect(
        service.createContent(
          'musing',
          'test',
          // @ts-expect-error Testing invalid input
          { status: 'invalid-status' },
          'Content'
        )
      ).rejects.toThrow('Invalid content status');
    });
  });

  describe('updateContent', () => {
    it('should update existing content', async () => {
      mockFs.readFile.mockResolvedValue(`---
title: Old Title
---
Old content`);
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await service.updateContent(
        'musing',
        'my-post',
        { title: 'New Title' },
        'New content'
      );

      expect(result.metadata.title).toBe('New Title');
      expect(result.content).toBe('New content');
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it('should reject non-existent content', async () => {
      const error: NodeJS.ErrnoException = new Error('ENOENT');
      error.code = 'ENOENT';
      mockFs.readFile.mockRejectedValue(error);

      await expect(
        service.updateContent('musing', 'non-existent', {})
      ).rejects.toThrow('not found');
    });
  });

  describe('deleteContent', () => {
    it('should delete content successfully', async () => {
      mockFs.unlink.mockResolvedValue(undefined);

      await expect(
        service.deleteContent('musing', 'my-post')
      ).resolves.toBeUndefined();

      expect(mockFs.unlink).toHaveBeenCalled();
    });

    it('should reject non-existent content', async () => {
      const error: NodeJS.ErrnoException = new Error('ENOENT');
      error.code = 'ENOENT';
      mockFs.unlink.mockRejectedValue(error);

      await expect(
        service.deleteContent('musing', 'non-existent')
      ).rejects.toThrow('not found');
    });
  });

  describe('publishContent', () => {
    it('should update status to published', async () => {
      mockFs.readFile.mockResolvedValue(`---
title: My Post
status: draft
---
Content`);
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await service.publishContent('musing', 'my-post');
      expect(result.metadata.status).toBe('published');
      expect(result.metadata.publishedAt).toBeDefined();
    });
  });

  describe('archiveContent', () => {
    it('should update status to archived', async () => {
      mockFs.readFile.mockResolvedValue(`---
title: My Post
status: published
---
Content`);
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await service.archiveContent('musing', 'my-post');
      expect(result.metadata.status).toBe('archived');
    });
  });
});
