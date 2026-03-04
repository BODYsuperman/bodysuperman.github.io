---
title: Git guideline
date: 2025-11-10 16:15:59
updated: 2025-11-10 18:04:19
comments: true
categories:
  - Development
  - Git
tags:
  - Git
  - Version Control
  - GitHub
  - CLI
  - Software Engineering
---

- [Understanding Git Basics](#understanding-git-basics)
  - [1. Working Directory](#1-working-directory)
  - [2. Staging Area (Index)](#2-staging-area-index)
  - [3. Repository](#3-repository)
- [Essential Git Commands](#essential-git-commands)
  - [Initial Setup](#initial-setup)
  - [Cloning a Repository](#cloning-a-repository)
  - [Tracking and Committing Changes](#tracking-and-committing-changes)
  - [View history](#view-history)
  - [Recommended commit prefixes](#recommended-commit-prefixes)
  <!--more-->
- [Working with Remote Repositories](#working-with-remote-repositories)
- [Branching and Merging](#branching-and-merging)
  - [Recommended branch naming](#recommended-branch-naming)
- [Undoing Changes and Recovery](#undoing-changes-and-recovery)
- [Tags and Version Releases](#tags-and-version-releases)
- [Common Development Scenarios](#common-development-scenarios)
  - [New Project Push](#new-project-push)
  - [Team Feature Development](#team-feature-development)
  - [Hotfix Production Bug](#hotfix-production-bug)
- [Common Pitfalls and How to Avoid Them](#common-pitfalls-and-how-to-avoid-them)
- [Using SSH with GitHub (Recommended)](#using-ssh-with-github-recommended)
- [Git Best Practices](#git-best-practices)
- [Conclusion](#conclusion)

---

## Understanding Git Basics <a name="understanding-git-basics"></a>

### Working Directory <a name="1-working-directory"></a>

This is where you actually edit files on your local machine.

### Staging Area (Index) <a name="2-staging-area-index"></a>

A buffer between your working directory and the repository.  
You decide **what exactly goes into the next commit**.

### Repository <a name="3-repository"></a>

The database that stores all commit history.

**Typical workflow:**

```
Working Directory → Staging Area → Local Repository → Remote Repository
```

Once this flow makes sense, Git becomes much easier.

## Essential Git Commands <a name="essential-git-commands"></a>

### Initial Setup <a name="initial-setup"></a>

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global --list
```

Initialize a repository:

```bash
git init
```

### Cloning a Repository <a name="cloning-a-repository"></a>

```bash
# HTTPS
git clone https://github.com/username/repo.git
```

# SSH (recommended)

```
git clone git@github.com:username/repo.git
```

### Tracking and Committing Changes <a name="tracking-and-committing-changes"></a>

```bash
git status
git add .
git commit -m "feat: add login feature"
```

### View history <a name="view-history"></a>

```bash
git log --oneline
```

### Recommended commit prefixes <a name="recommended-commit-prefixes"></a>

- `feat`: new feature
- `fix`: bug fix
- `docs`: documentation
- `refactor`: refactoring

## Working with Remote Repositories <a name="working-with-remote-repositories"></a>

```bash
git remote add origin <repo-url>
git remote -v
git push origin main
git pull origin main
```

Avoid force push unless you know exactly what you’re doing:

```bash
git push --force-with-lease
```

## Branching and Merging <a name="branching-and-merging"></a>

Branches allow safe experimentation.

```bash
git branch
git checkout -b feature/login
git checkout main
git merge feature/login
git branch -d feature/login
```

### Recommended branch naming <a name="recommended-branch-naming"></a>

- main – stable production
- feature/\* – new features
- hotfix/\* – urgent fixes

## Undoing Changes and Recovery <a name="undoing-changes-and-recovery"></a>

Git is powerful because almost nothing is truly lost.

```bash
git reset --soft <commit>
git reset --mixed <commit>
git reset --hard <commit>
git reflog
git reflog is your emergency exit.
```
## Tags and Version Releases <a name="tags-and-version-releases"></a>

```bash
git tag -a v1.0 -m "First release"
git push origin --tags
```

Tags are ideal for marking stable releases.

## Common Development Scenarios <a name="common-development-scenarios"></a>

### New Project Push <a name="new-project-push"></a>

```bash
git init
git add .
git commit -m "init: initial commit"
git remote add origin <repo>
git push -u origin main
```

### Team Feature Development <a name="team-feature-development"></a>

```bash
git checkout -b feature/payment
git commit -m "feat: payment integration"
git push origin feature/payment
```

### Hotfix Production Bug <a name="hotfix-production-bug"></a>

```bash
git checkout main
git pull
git checkout -b hotfix/critical-bug
git commit -m "fix: critical production issue"
```

## Common Pitfalls and How to Avoid Them <a name="common-pitfalls-and-how-to-avoid-them"></a>

- Forgot git add
- Merge conflicts ignored
- Panic after git reset --hard
- Using password instead of token/SSH

Tip: If something goes wrong, stop and check git reflog.

## Using SSH with GitHub (Recommended) <a name="using-ssh-with-github-recommended"></a>

```bash
ssh-keygen -t ed25519 -C "you@example.com"
cat ~/.ssh/id_ed25519.pub
ssh -T git@github.com
```

Successful output:

```rust
Hi username! You've successfully authenticated.
```

## Git Best Practices <a name="git-best-practices"></a>

Commit small, meaningful changes

Write clear commit messages

Use branches aggressively

Clean unused branches regularly

Prefer SSH over HTTPS

Use fine-grained tokens for automation

## Conclusion <a name="conclusion"></a>

You don’t need to memorize every Git command.

Git is not about commands—it’s about understanding history and collaboration.

Once you understand the workflow, Git becomes a powerful safety net rather than a source of anxiety.
