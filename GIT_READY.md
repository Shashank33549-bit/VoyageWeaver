# Git Ready Checklist

Before pushing:

```bash
git init
git add .
git status
```

Confirm no `.env`, API keys, SQLite databases, `node_modules`, or Python virtual environments are staged.

Then:

```bash
git commit -m "Initial Voyage Weaver full-stack release"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

See `DEPLOYMENT.md` for environment variables and deployment steps.
