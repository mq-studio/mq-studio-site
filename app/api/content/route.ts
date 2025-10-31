// API route for content retrieval
import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '@/lib/content/content-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');
    const search = searchParams.get('search');
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    // Single content by ID
    if (id) {
      const content = await contentService.getContentById(id);
      if (!content) {
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(content);
    }

    // Single content by slug
    if (slug) {
      const content = await contentService.getContentBySlug(slug);
      if (!content) {
        return NextResponse.json(
          { error: 'Content not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(content);
    }

    // Search
    if (search) {
      const results = await contentService.searchContent(search);
      return NextResponse.json(results);
    }

    // Get content by filters
    let content;

    if (type) {
      content = await contentService.getContentByType(type as any);
    } else if (category) {
      content = await contentService.getContentByCategory(category as any);
    } else if (featured === 'true') {
      content = await contentService.getFeaturedContent();
    } else {
      content = await contentService.getAllContent();
    }

    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit, 10);
      content = content.slice(0, limitNum);
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error in content API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// API route to get recent content and other POST actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, contentId, id, slug, limit = 6 } = body;

    switch (action) {
      case 'recent':
        const recentContent = await contentService.getRecentContent(limit);
        return NextResponse.json(recentContent);

      case 'related':
      case 'getRelated':
        const targetId = contentId || id;
        if (!targetId) {
          return NextResponse.json(
            { error: 'contentId or id required for related content' },
            { status: 400 }
          );
        }
        const relatedContent = await contentService.getRelatedContent(targetId, limit);
        return NextResponse.json(relatedContent);

      case 'getBySlug':
        if (!slug) {
          return NextResponse.json(
            { error: 'slug required for getBySlug action' },
            { status: 400 }
          );
        }
        const content = await contentService.getContentBySlug(slug);
        if (!content) {
          return NextResponse.json(
            { error: 'Content not found' },
            { status: 404 }
          );
        }
        return NextResponse.json(content);

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in content API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}