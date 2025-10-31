#!/usr/bin/env python3
"""
WordPress Blog Content Extractor
Extracts content from mouraquayle.wordpress.com
Works with RSS feed and web scraping as fallback to XML export
"""

import os
import re
import json
import requests
from datetime import datetime
from typing import Dict, List, Optional
import time
from urllib.parse import urlparse, urljoin
import html2text
import xml.etree.ElementTree as ET
import html

class WordPressExtractor:
    def __init__(self, blog_url: str = "https://mouraquayle.wordpress.com"):
        self.blog_url = blog_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; BlogMigration/1.0)'
        })
        self.posts = []
        self.media_urls = set()

    def extract_from_rss(self) -> List[Dict]:
        """Extract posts from RSS feed (limited to recent posts)"""
        print("Attempting RSS extraction...")
        posts = []

        try:
            # WordPress.com RSS feed URL
            rss_url = f"{self.blog_url}/feed/"
            response = self.session.get(rss_url)
            response.raise_for_status()

            root = ET.fromstring(response.content)

            # Parse RSS items
            for item in root.findall('.//item'):
                post = {
                    'title': item.find('title').text if item.find('title') is not None else '',
                    'link': item.find('link').text if item.find('link') is not None else '',
                    'pubDate': item.find('pubDate').text if item.find('pubDate') is not None else '',
                    'creator': item.find('.//{http://purl.org/dc/elements/1.1/}creator').text if item.find('.//{http://purl.org/dc/elements/1.1/}creator') is not None else 'mouraquayle',
                    'category': item.find('category').text if item.find('category') is not None else 'Uncategorized',
                    'description': item.find('description').text if item.find('description') is not None else '',
                    'content': item.find('.//{http://purl.org/rss/1.0/modules/content/}encoded').text if item.find('.//{http://purl.org/rss/1.0/modules/content/}encoded') is not None else '',
                }

                # Extract media from content
                if post['content']:
                    self._extract_media_urls(post['content'])

                posts.append(post)
                print(f"  - Extracted: {post['title']}")

            print(f"Extracted {len(posts)} posts from RSS")

        except Exception as e:
            print(f"RSS extraction failed: {e}")

        return posts

    def extract_from_sitemap(self) -> List[str]:
        """Get all post URLs from sitemap"""
        print("Fetching URLs from sitemap...")
        urls = []

        try:
            sitemap_url = f"{self.blog_url}/sitemap.xml"
            response = self.session.get(sitemap_url)
            response.raise_for_status()

            # Parse sitemap
            root = ET.fromstring(response.content)

            # Extract all URLs
            for url in root.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
                url_text = url.text
                # Filter for actual posts (exclude pages, archives, etc.)
                if '/20' in url_text and url_text != self.blog_url:  # Posts have years in URL
                    urls.append(url_text)

            print(f"Found {len(urls)} post URLs in sitemap")

        except Exception as e:
            print(f"Sitemap extraction failed: {e}")

        return urls

    def scrape_post(self, url: str) -> Optional[Dict]:
        """Scrape individual post from URL"""
        try:
            response = self.session.get(url)
            response.raise_for_status()
            html_content = response.text

            # Extract post data using regex patterns
            post = {'url': url}

            # Title
            title_match = re.search(r'<h1[^>]*class="entry-title"[^>]*>([^<]+)</h1>', html_content)
            if not title_match:
                title_match = re.search(r'<title>([^<]+)</title>', html_content)
            post['title'] = html.unescape(title_match.group(1).split('|')[0].strip()) if title_match else 'Untitled'

            # Date
            date_match = re.search(r'datetime="([^"]+)"', html_content)
            if not date_match:
                date_match = re.search(r'<time[^>]*>([^<]+)</time>', html_content)
            post['date'] = date_match.group(1) if date_match else ''

            # Content
            content_match = re.search(r'<div[^>]*class="entry-content"[^>]*>(.*?)</div>\s*<footer', html_content, re.DOTALL)
            if content_match:
                post['content'] = content_match.group(1)
                self._extract_media_urls(post['content'])
            else:
                post['content'] = ''

            # Author
            author_match = re.search(r'rel="author">([^<]+)</a>', html_content)
            post['author'] = author_match.group(1) if author_match else 'Moura Quayle'

            # Category
            cat_match = re.search(r'rel="category[^"]*">([^<]+)</a>', html_content)
            post['category'] = cat_match.group(1) if cat_match else 'Uncategorized'

            print(f"  ✓ Scraped: {post['title']}")
            return post

        except Exception as e:
            print(f"  ✗ Failed to scrape {url}: {e}")
            return None

    def _extract_media_urls(self, html_content: str):
        """Extract image and media URLs from HTML content"""
        # Find all image sources
        img_pattern = r'<img[^>]+src="([^"]+)"'
        for match in re.finditer(img_pattern, html_content):
            self.media_urls.add(match.group(1))

        # Find PDF and document links
        doc_pattern = r'href="([^"]+\.(?:pdf|doc|docx))"'
        for match in re.finditer(doc_pattern, html_content, re.IGNORECASE):
            self.media_urls.add(match.group(1))

    def convert_to_mdx(self, post: Dict) -> str:
        """Convert post to MDX format"""
        h = html2text.HTML2Text()
        h.ignore_links = False
        h.ignore_images = False
        h.body_width = 0  # Don't wrap lines

        # Convert HTML content to Markdown
        content_md = h.handle(post.get('content', ''))

        # Parse date
        date_str = post.get('date', post.get('pubDate', ''))
        if date_str:
            try:
                # Parse WordPress date format
                if 'T' in date_str:
                    date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                else:
                    date_obj = datetime.strptime(date_str, '%a, %d %b %Y %H:%M:%S %z')
                formatted_date = date_obj.strftime('%Y-%m-%d')
            except:
                formatted_date = date_str
        else:
            formatted_date = 'unknown'

        # Generate slug from title or URL
        if 'url' in post:
            slug = post['url'].rstrip('/').split('/')[-1]
        else:
            slug = re.sub(r'[^a-z0-9-]', '', post.get('title', 'untitled').lower().replace(' ', '-'))

        # Build MDX frontmatter
        mdx = f"""---
title: "{post.get('title', 'Untitled').replace('"', '\\"')}"
date: "{formatted_date}"
slug: "{slug}"
author: "{post.get('author', post.get('creator', 'Moura Quayle'))}"
category: "{post.get('category', 'Uncategorized')}"
legacy: true
originalUrl: "{post.get('url', post.get('link', ''))}"
excerpt: "{post.get('description', '').replace('"', '\\"')[:160]}"
---

{content_md}
"""
        return mdx

    def run_extraction(self, use_scraping: bool = True):
        """Run the full extraction process"""
        print("=" * 60)
        print("WordPress Content Extraction Starting")
        print("=" * 60)

        # Try RSS first (gets recent posts quickly)
        rss_posts = self.extract_from_rss()
        self.posts.extend(rss_posts)

        if use_scraping:
            # Get all URLs from sitemap
            all_urls = self.extract_from_sitemap()

            # Filter out URLs we already have from RSS
            rss_urls = {p.get('link', p.get('url', '')) for p in rss_posts}
            urls_to_scrape = [url for url in all_urls if url not in rss_urls]

            print(f"\nScraping {len(urls_to_scrape)} additional posts...")

            # Scrape remaining posts
            for i, url in enumerate(urls_to_scrape, 1):
                print(f"[{i}/{len(urls_to_scrape)}]", end=" ")
                post = self.scrape_post(url)
                if post:
                    self.posts.append(post)
                time.sleep(0.5)  # Be respectful to the server

        print(f"\n{'=' * 60}")
        print(f"Extraction Complete: {len(self.posts)} posts")
        print(f"Found {len(self.media_urls)} media files")
        print("=" * 60)

    def save_posts(self, output_dir: str):
        """Save posts as MDX files organized by year"""
        saved_count = 0

        for post in self.posts:
            try:
                # Determine year from date or URL
                year = 'unknown'

                date_str = post.get('date', post.get('pubDate', ''))
                if date_str:
                    if '20' in date_str:
                        year_match = re.search(r'20\d{2}', date_str)
                        if year_match:
                            year = year_match.group()

                if year == 'unknown' and 'url' in post:
                    year_match = re.search(r'/(\d{4})/', post['url'])
                    if year_match:
                        year = year_match.group(1)

                # Create year directory
                year_dir = os.path.join(output_dir, year)
                os.makedirs(year_dir, exist_ok=True)

                # Generate filename
                slug = post.get('url', '').rstrip('/').split('/')[-1]
                if not slug:
                    slug = re.sub(r'[^a-z0-9-]', '', post.get('title', 'untitled').lower().replace(' ', '-'))

                filename = f"{slug}.mdx"
                filepath = os.path.join(year_dir, filename)

                # Convert to MDX and save
                mdx_content = self.convert_to_mdx(post)

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(mdx_content)

                saved_count += 1
                print(f"  ✓ Saved: {year}/{filename}")

            except Exception as e:
                print(f"  ✗ Failed to save post: {e}")

        print(f"\nSaved {saved_count}/{len(self.posts)} posts")

        # Save media URLs list
        media_file = os.path.join(output_dir, 'media-urls.json')
        with open(media_file, 'w') as f:
            json.dump(list(self.media_urls), f, indent=2)
        print(f"Media URLs saved to: {media_file}")


if __name__ == "__main__":
    # Configuration
    BLOG_URL = "https://mouraquayle.wordpress.com"
    OUTPUT_DIR = "/home/ichardart/code/clients/moura_quayle/website-mq-studio/content/musings/archive"

    # Run extraction
    extractor = WordPressExtractor(BLOG_URL)
    extractor.run_extraction(use_scraping=True)
    extractor.save_posts(OUTPUT_DIR)

    print("\nExtraction complete!")
    print(f"Check {OUTPUT_DIR} for extracted content")