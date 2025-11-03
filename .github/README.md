# GitHub Actions for Learning

## What is GitHub Actions?

GitHub Actions is a CI/CD (Continuous Integration/Continuous Deployment) system built into GitHub. Think of it as a robot that automatically runs tasks when you push code.

## Why learn this as a student?

1. **Industry Standard**: Every company uses CI/CD
2. **Portfolio Value**: Shows you understand professional workflows
3. **Prevents Bugs**: Catches errors before they reach main branch
4. **Free Learning**: GitHub gives you free compute time to experiment

## The Three Workflows Explained:

### 1. CI Pipeline (ci.yml)

**Purpose**: Test your code automatically
**When it runs**: Every time you push code or create a pull request
**What it does**:

- Installs your dependencies
- Runs your tests
- Builds your frontend
- Tests Docker builds
- If ANY step fails, it marks the commit as "broken"

### 2. CD Pipeline (cd.yml)

**Purpose**: Deploy your code (COMMENTED OUT FOR LEARNING)
**Status**: Not needed yet since you're not deploying anywhere
**What it would do**: Push your app to a server when tests pass

### 3. PR Checks (pr-checks.yml)

**Purpose**: Validate pull requests before merging
**When it runs**: When you open a pull request
**What it does**: Same as CI but adds a comment to your PR

## For Learning Phase:

**Keep**: CI Pipeline - This will teach you professional testing habits
**Comment Out**: CD Pipeline - You don't need deployment yet
**Keep**: PR Checks - Good for team projects or practice

## How to use this:

1. Push your code to GitHub
2. Go to your repo -> Actions tab
3. Watch the workflows run
4. See green checkmarks (pass) or red X (fail)
5. Click on failed jobs to see what went wrong
6. Fix the issues and push again

## Learning Benefits:

- Forces you to write tests
- Teaches you Docker
- Shows you industry practices
- Builds good coding habits
- Looks professional on your GitHub profile

## Simple Commands:

```bash
# Test locally first
cd backend && npm test

# Then push
git add .
git commit -m "your changes"
git push

# GitHub Actions will automatically test your code
```

This setup will make you a better developer by forcing good practices.
