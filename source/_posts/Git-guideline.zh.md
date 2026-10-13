---
title: Git 指南
lang: zh-CN
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

- [理解 Git 基础](#understanding-git-basics)
  - [1. 工作目录](#1-working-directory)
  - [2. 暂存区（Index）](#2-staging-area-index)
  - [3. 仓库](#3-repository)
- [常用 Git 命令](#essential-git-commands)
  - [初始配置](#initial-setup)
  - [克隆仓库](#cloning-a-repository)
  - [跟踪并提交更改](#tracking-and-committing-changes)
  - [查看历史](#view-history)
  - [推荐的提交前缀](#recommended-commit-prefixes)
  <!--more-->
- [操作远程仓库](#working-with-remote-repositories)
- [分支与合并](#branching-and-merging)
  - [推荐的分支命名](#recommended-branch-naming)
- [撤销更改与恢复](#undoing-changes-and-recovery)
- [标签与版本发布](#tags-and-version-releases)
- [常见开发场景](#common-development-scenarios)
  - [新项目推送](#new-project-push)
  - [团队功能开发](#team-feature-development)
  - [热修复生产 Bug](#hotfix-production-bug)
- [常见陷阱及避免方法](#common-pitfalls-and-how-to-avoid-them)
- [在 GitHub 中使用 SSH（推荐）](#using-ssh-with-github-recommended)
- [Git 最佳实践](#git-best-practices)
- [总结](#conclusion)

---

## 理解 Git 基础 <a name="understanding-git-basics"></a>

### 工作目录 <a name="1-working-directory"></a>

这是你在本地机器上实际编辑文件的地方。

### 暂存区（Index） <a name="2-staging-area-index"></a>

工作目录与仓库之间的缓冲区。
由你决定**哪些内容会进入下一次提交**。

### 仓库 <a name="3-repository"></a>

存储所有提交历史的数据库。

**典型工作流：**

```
Working Directory → Staging Area → Local Repository → Remote Repository
```

理解了这一流程之后，Git 就会变得简单许多。

## 常用 Git 命令 <a name="essential-git-commands"></a>

### 初始配置 <a name="initial-setup"></a>

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global --list
```

初始化仓库：

```bash
git init
```

### 克隆仓库 <a name="cloning-a-repository"></a>

```bash
# HTTPS
git clone https://github.com/username/repo.git
```

# SSH（推荐）

```
git clone git@github.com:username/repo.git
```

### 跟踪并提交更改 <a name="tracking-and-committing-changes"></a>

```bash
git status
git add .
git commit -m "feat: add login feature"
```

### 查看历史 <a name="view-history"></a>

```bash
git log --oneline
```

### 推荐的提交前缀 <a name="recommended-commit-prefixes"></a>

- `feat`：新功能
- `fix`：修复 Bug
- `docs`：文档
- `refactor`：重构

## 操作远程仓库 <a name="working-with-remote-repositories"></a>

```bash
git remote add origin <repo-url>
git remote -v
git push origin main
git pull origin main
```

除非你非常清楚自己在做什么，否则避免强制推送：

```bash
git push --force-with-lease
```

## 分支与合并 <a name="branching-and-merging"></a>

分支让你可以安全地进行各种尝试。

```bash
git branch
git checkout -b feature/login
git checkout main
git merge feature/login
git branch -d feature/login
```

### 推荐的分支命名 <a name="recommended-branch-naming"></a>

- main – 稳定的生产分支
- feature/\* – 新功能
- hotfix/\* – 紧急修复

## 撤销更改与恢复 <a name="undoing-changes-and-recovery"></a>

Git 之所以强大，是因为几乎没有什么是真正丢失的。

```bash
git reset --soft <commit>
git reset --mixed <commit>
git reset --hard <commit>
git reflog
git reflog is your emergency exit.
```
## 标签与版本发布 <a name="tags-and-version-releases"></a>

```bash
git tag -a v1.0 -m "First release"
git push origin --tags
```

标签非常适合用来标记稳定的发布版本。

## 常见开发场景 <a name="common-development-scenarios"></a>

### 新项目推送 <a name="new-project-push"></a>

```bash
git init
git add .
git commit -m "init: initial commit"
git remote add origin <repo>
git push -u origin main
```

### 团队功能开发 <a name="team-feature-development"></a>

```bash
git checkout -b feature/payment
git commit -m "feat: payment integration"
git push origin feature/payment
```

### 热修复生产 Bug <a name="hotfix-production-bug"></a>

```bash
git checkout main
git pull
git checkout -b hotfix/critical-bug
git commit -m "fix: critical production issue"
```

## 常见陷阱及避免方法 <a name="common-pitfalls-and-how-to-avoid-them"></a>

- 忘记执行 git add
- 忽略合并冲突
- 执行 git reset --hard 后惊慌失措
- 使用密码而不是令牌（Token）/SSH

提示：如果出了问题，先停下来查看 git reflog。

## 在 GitHub 中使用 SSH（推荐） <a name="using-ssh-with-github-recommended"></a>

```bash
ssh-keygen -t ed25519 -C "you@example.com"
cat ~/.ssh/id_ed25519.pub
ssh -T git@github.com
```

成功时的输出：

```rust
Hi username! You've successfully authenticated.
```

## Git 最佳实践 <a name="git-best-practices"></a>

小步提交，每次提交应有明确意义

编写清晰的提交信息

积极使用分支

定期清理无用分支

优先使用 SSH 而非 HTTPS

自动化操作时使用细粒度令牌（Fine-grained Token）

## 总结 <a name="conclusion"></a>

你不需要记住所有的 Git 命令。

Git 的核心不在于命令——而在于理解历史与协作。

一旦你理解了工作流，Git 就会成为一个强大的安全网，而不是焦虑的来源。
