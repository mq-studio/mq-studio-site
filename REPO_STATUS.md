# Repository Status: PRODUCTION

**Type**: Production Website
**GitHub**: mq-studio/mq-studio-site
**Vercel**: Connected (auto-deploys on push to main)
**Purpose**: Live website code at mq-studio-site.vercel.app

## ⚠️ Important

- This repository deploys directly to production
- All changes trigger Vercel builds
- Test thoroughly before pushing
- Breaking changes will affect live site

## Development Workflow

- **Development repo**: `/home/ichardart/code/clients/moura_quayle/website-mq-studio`
- **Process**: Develop → Test → Port to this repo → Push (deploys)

## Quick Commands

```bash
# Check deployment status
git log -1 --oneline

# See what's different from dev
diff -rq content/ /path/to/dev/content/

# Push to production (triggers Vercel)
git push origin main
```

**Last Updated**: 2025-11-02
