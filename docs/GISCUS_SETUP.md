# Giscus Setup Guide for Musings Comments

Giscus is a comments system powered by GitHub Discussions. It's free, open-source, and doesn't track users.

## Prerequisites

1. A public GitHub repository for this website
2. GitHub Discussions enabled on that repository
3. The Giscus app installed on the repository

## Setup Steps

### 1. Enable GitHub Discussions

1. Go to your repository on GitHub
2. Click on **Settings**
3. Scroll down to **Features**
4. Check **Discussions**

### 2. Install Giscus App

1. Visit [https://github.com/apps/giscus](https://github.com/apps/giscus)
2. Click **Install**
3. Choose the repository for MQ Studio
4. Grant permissions

### 3. Create a Discussions Category

1. Go to the **Discussions** tab in your repository
2. Create a new category called "Musings" (or similar)
3. Choose "Announcement" type (only maintainers can create new discussions, but anyone can comment)
4. Note the category ID (you'll need this)

### 4. Get Your Configuration Values

1. Visit [https://giscus.app](https://giscus.app)
2. Enter your repository details:
   - Repository: `YOUR_USERNAME/mq-studio` (or actual repo name)
   - Page ↔️ Discussions Mapping: Choose "pathname"
   - Discussion Category: Select "Musings"
3. The page will generate configuration values for you

### 5. Update the CommentSection Component

Edit `/components/musings/CommentSection.tsx` and replace these placeholder values:

```typescript
script.setAttribute('data-repo', 'YOUR_GITHUB_USERNAME/YOUR_REPO_NAME'); // e.g., 'moura-quayle/mq-studio'
script.setAttribute('data-repo-id', 'YOUR_REPO_ID'); // from giscus.app
script.setAttribute('data-category-id', 'YOUR_CATEGORY_ID'); // from giscus.app
```

### 6. Verify It Works

1. Deploy the site
2. Navigate to a musing page
3. You should see the Giscus comment interface at the bottom
4. Try posting a test comment

## Customization Options

### Theme

The current implementation uses a light theme. To match the site's design better, you can:

1. Create a custom CSS theme
2. Use one of Giscus's built-in themes
3. Switch themes dynamically based on user preference

### Moderation

As the repository owner, you can:

- Delete inappropriate comments via GitHub Discussions
- Edit comments if needed
- Lock discussions to prevent further comments
- Hide discussions entirely

### Privacy

Giscus requires users to sign in with GitHub to comment. This:

- Prevents anonymous spam
- Provides accountability
- Doesn't track users beyond GitHub's standard authentication
- Is GDPR-compliant (GitHub handles the data)

## Alternative: Utterances

If you prefer an even simpler setup, consider [Utterances](https://utteranc.es/):

- Uses GitHub Issues instead of Discussions
- Lighter weight
- Fewer configuration options
- Same authentication model

## Testing

Before going live, test with:

1. A private repository first
2. Multiple user accounts (to verify non-maintainer experience)
3. Different browsers
4. Mobile devices

## Troubleshooting

### Comments not loading

- Check that Discussions are enabled on your repo
- Verify the repository is public
- Ensure the Giscus app is installed
- Check browser console for errors

### Wrong category

- Double-check the category ID in the component
- Make sure you selected an "Announcement" type category

### Styling issues

- Giscus uses an iframe, so custom styling is limited
- You can customize the theme and surrounding container
- Check the Giscus documentation for theme customization options

## Resources

- [Giscus Documentation](https://github.com/giscus/giscus)
- [GitHub Discussions Documentation](https://docs.github.com/en/discussions)
- [Giscus Configuration Tool](https://giscus.app)
