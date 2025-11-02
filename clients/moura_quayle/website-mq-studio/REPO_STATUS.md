# Repository Status: DEVELOPMENT

**Type**: Development & Experimentation
**GitHub**: rhart696/website-mq-studio (experimental)
**Vercel**: NOT connected (no auto-deploy)
**Purpose**: Experimental development before production

## ⚠️ Important

- This is NOT the production repository
- Changes here do NOT deploy automatically
- Production is at: mq-studio/mq-studio-site
- Safe to experiment and break things here

## Porting to Production

When a feature is ready:

```bash
# 1. Copy to production repo
cd /home/ichardart/code/clients/moura_quayle/migration-to-github/repos/mq-studio-site
cp -r /path/to/feature .

# 2. Commit and push
git add .
git commit -m "feat: Add feature from dev"
git push origin main  # This deploys to Vercel
```

## Production Repo Location

**Path**: `/home/ichardart/code/clients/moura_quayle/migration-to-github/repos/mq-studio-site`
**GitHub**: `mq-studio/mq-studio-site`

**Last Updated**: 2025-11-02
