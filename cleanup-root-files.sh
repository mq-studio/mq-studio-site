#!/bin/bash
# Cleanup script for root-owned files in website-mq-studio
# Run this with: sudo bash cleanup-root-files.sh

echo "Cleaning up root-owned files in website-mq-studio..."

# Remove root-owned directories
rm -rf .next/server
rm -rf .next/static
rm -rf .next/types
rm -rf .specify

# Clean the rest of .next directory
rm -rf .next

echo "Cleanup complete!"
echo "You can now run 'npm run dev' to rebuild the development server."