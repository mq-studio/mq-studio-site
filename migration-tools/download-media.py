#!/usr/bin/env python3
"""
Download Media Assets from WordPress Blog
Downloads and organizes images referenced in the imported blog posts
"""

import os
import json
import requests
import hashlib
from urllib.parse import urlparse, unquote
from pathlib import Path
import time

class MediaDownloader:
    def __init__(self, media_urls_file: str, output_dir: str):
        self.media_urls_file = media_urls_file
        self.output_dir = output_dir
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; BlogMigration/1.0)'
        })

    def load_media_urls(self):
        """Load media URLs from JSON file"""
        with open(self.media_urls_file, 'r') as f:
            return json.load(f)

    def get_filename_from_url(self, url: str) -> str:
        """Extract filename from URL"""
        parsed = urlparse(url)
        path = unquote(parsed.path)
        filename = os.path.basename(path)

        # If no extension, try to guess from URL
        if '.' not in filename:
            # Use URL hash as filename
            url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
            filename = f"image_{url_hash}.jpg"

        return filename

    def determine_year_from_url(self, url: str) -> str:
        """Try to determine year from WordPress upload URL"""
        # WordPress pattern: /wp-content/uploads/YYYY/MM/filename
        if '/uploads/' in url:
            parts = url.split('/uploads/')[-1].split('/')
            if len(parts) > 0 and parts[0].isdigit() and len(parts[0]) == 4:
                return parts[0]

        # Check for year in filename
        import re
        year_match = re.search(r'(20\d{2})', url)
        if year_match:
            return year_match.group(1)

        return 'misc'  # Default folder for unknown years

    def download_media(self, url: str, output_path: str) -> bool:
        """Download a single media file"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()

            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

            # Save file
            with open(output_path, 'wb') as f:
                f.write(response.content)

            return True

        except Exception as e:
            print(f"  ✗ Failed to download {url}: {e}")
            return False

    def create_media_map(self, downloads: list) -> dict:
        """Create a mapping of original URLs to local paths"""
        media_map = {}
        for item in downloads:
            if item['success']:
                # Create relative path for use in MDX files
                relative_path = f"/images/musings/archive/{item['year']}/{item['filename']}"
                media_map[item['url']] = {
                    'local': relative_path,
                    'absolute': item['output_path'],
                    'filename': item['filename'],
                    'year': item['year']
                }
        return media_map

    def run(self):
        """Run the media download process"""
        print("=" * 60)
        print("Media Asset Download Starting")
        print("=" * 60)

        # Load URLs
        media_urls = self.load_media_urls()
        print(f"Found {len(media_urls)} media URLs to download")

        # Track downloads
        downloads = []
        success_count = 0

        # Download each file
        for i, url in enumerate(media_urls, 1):
            print(f"[{i}/{len(media_urls)}] Downloading: {url[:60]}...")

            filename = self.get_filename_from_url(url)
            year = self.determine_year_from_url(url)

            # Create output path
            year_dir = os.path.join(self.output_dir, year)
            output_path = os.path.join(year_dir, filename)

            # Skip if already exists
            if os.path.exists(output_path):
                print(f"  ⏭ Already exists: {year}/{filename}")
                downloads.append({
                    'url': url,
                    'filename': filename,
                    'year': year,
                    'output_path': output_path,
                    'success': True,
                    'skipped': True
                })
                success_count += 1
                continue

            # Download
            success = self.download_media(url, output_path)

            downloads.append({
                'url': url,
                'filename': filename,
                'year': year,
                'output_path': output_path,
                'success': success,
                'skipped': False
            })

            if success:
                print(f"  ✓ Saved: {year}/{filename}")
                success_count += 1

            # Be respectful to the server
            time.sleep(0.5)

        print(f"\n{'=' * 60}")
        print(f"Download Complete: {success_count}/{len(media_urls)} successful")
        print("=" * 60)

        # Create media mapping file
        media_map = self.create_media_map(downloads)
        map_file = os.path.join(os.path.dirname(self.output_dir), 'media-map.json')

        with open(map_file, 'w') as f:
            json.dump(media_map, f, indent=2)

        print(f"\nMedia mapping saved to: {map_file}")
        print("\nNext steps:")
        print("1. Update MDX files to use local image paths")
        print("2. Copy images to public/images/musings/archive/")
        print("3. Update image optimization settings in Next.js")

        return downloads


if __name__ == "__main__":
    # Configuration
    MEDIA_URLS_FILE = "/home/ichardart/code/clients/moura_quayle/website-mq-studio/content/musings/archive/media-urls.json"
    OUTPUT_DIR = "/home/ichardart/code/clients/moura_quayle/website-mq-studio/public/images/musings/archive"

    # Run downloader
    downloader = MediaDownloader(MEDIA_URLS_FILE, OUTPUT_DIR)
    downloads = downloader.run()