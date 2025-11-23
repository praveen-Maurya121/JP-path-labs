# How to Upload Project to GitHub

This guide will help you upload your Lab Booking System project to GitHub.

## Prerequisites

- GitHub account ([Sign up here](https://github.com/signup) if you don't have one)
- Git installed on your system (check with `git --version`)

## Step 1: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `lab-booking-system` (or your preferred name)
   - **Description**: "Pathology Lab Booking System - Full Stack MERN Application"
   - **Visibility**: Choose **Public** or **Private**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

## Step 2: Initialize Git in Your Project

Open terminal in your project directory and run:

```bash
cd /Users/pmauryaji/apps/jpdc

# Initialize git repository
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Lab Booking System"
```

## Step 3: Connect to GitHub and Push

After creating the repository on GitHub, you'll see instructions. Use these commands:

```bash
# Add GitHub repository as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename default branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Example:**
If your GitHub username is `johndoe` and repository name is `lab-booking-system`:
```bash
git remote add origin https://github.com/johndoe/lab-booking-system.git
git branch -M main
git push -u origin main
```

## Step 4: Verify Upload

1. Go to your GitHub repository page
2. You should see all your project files
3. Verify that `.env` files and `node_modules/` are NOT visible (they should be ignored)

## Quick Commands Reference

### Initial Setup (One-time)
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

### Daily Workflow (After making changes)
```bash
# Check what files changed
git status

# Add specific files
git add filename.js

# Or add all changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push
```

### Common Git Commands
```bash
# View commit history
git log

# View current status
git status

# View differences
git diff

# Pull latest changes from GitHub
git pull

# Create a new branch
git checkout -b feature-name

# Switch branches
git checkout main

# Merge branch
git merge feature-name
```

## Important Notes

### ⚠️ Security: Never Commit Sensitive Files

The `.gitignore` file is configured to exclude:
- `.env` files (contain secrets like JWT_SECRET, MongoDB URI)
- `node_modules/` (dependencies)
- Build outputs (`dist/`, `build/`)

**Before pushing, verify these are ignored:**
```bash
git status
# You should NOT see .env or node_modules in the output
```

### If You Accidentally Committed Sensitive Files

If you accidentally committed `.env` or other sensitive files:

```bash
# Remove from git (but keep local file)
git rm --cached .env
git rm --cached backend/.env
git rm --cached frontend/.env

# Commit the removal
git commit -m "Remove sensitive files from git"

# Push the changes
git push

# If already pushed, you'll need to:
# 1. Change all secrets in .env files
# 2. Regenerate JWT_SECRET
# 3. Update MongoDB passwords if exposed
```

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:

```bash
# Install GitHub CLI (if not installed)
# macOS: brew install gh
# Linux: sudo apt install gh

# Login to GitHub
gh auth login

# Create and push repository
gh repo create lab-booking-system --public --source=. --remote=origin --push
```

## Troubleshooting

### Authentication Issues

If you get authentication errors:

**Option 1: Use Personal Access Token**
1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Use token as password when pushing

**Option 2: Use SSH (Recommended)**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH and GPG keys → New SSH key

# Change remote to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/REPO_NAME.git
```

### Large Files Error

If you get errors about large files:
```bash
# Check for large files
find . -type f -size +50M

# Add to .gitignore if needed
# Or use Git LFS for large files
```

### Merge Conflicts

If you have conflicts when pulling:
```bash
# Pull latest changes
git pull

# Resolve conflicts in your editor
# Then:
git add .
git commit -m "Resolve merge conflicts"
git push
```

## Next Steps After Upload

1. **Add README.md** - Already included with project details
2. **Add License** - If you want to add a license file
3. **Set up GitHub Actions** - For CI/CD (optional)
4. **Add Issues Template** - For bug reports (optional)
5. **Add Pull Request Template** - For contributions (optional)

## Repository Settings (Recommended)

After uploading, go to repository Settings and:

1. **General** → Add topics: `mern`, `react`, `nodejs`, `mongodb`, `pathology-lab`
2. **Pages** → Enable GitHub Pages (if you want to host frontend)
3. **Branches** → Add branch protection rules for `main` branch
4. **Secrets** → Add repository secrets for CI/CD (if needed)

## Summary

Your project is now on GitHub! 🎉

- ✅ Code is backed up
- ✅ Can collaborate with others
- ✅ Version control in place
- ✅ Easy to deploy from GitHub

Remember to:
- Commit regularly with meaningful messages
- Never commit `.env` files
- Pull before pushing if working with others
- Use branches for new features

