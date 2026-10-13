---
title: 基于 Git 分支策略的 Hexo 博客多设备同步与管理指南
lang: zh-CN
date: 2025-05-03 09:52:39
updated: 2025-05-03 19:04:19
comments: true
categories: 
  - Blog
  - Hexo
tags: 
  - Hexo
  - Git
  - Multi-Device Synchronization
---
- [引言：多设备协作的必要性](#introduction-the-necessity)
- [Hexo 多设备同步的核心原理](#core-principles-of-hexo)
  - [Hexo 目录结构与版本控制策略](#hexo-directory)
  - [Git 分支分工模型](#git-branch)
- [旧电脑操作指南：搭建远程同步基础](#old-computer-operation)
  - [创建和配置远程分支](#creating-and-configuring-remote-branches)
  - [本地环境与远程仓库同步](#local-environment)
  - [.gitignore 关键配置](#gitignore-key-configuration)
- [新电脑环境搭建：从远程仓库恢复博客](#new-computer-environment)
  - [SSH Key 配置与环境依赖安装](#ssh-key-configuration)
  - [远程仓库克隆与依赖恢复](#remote-repository)
  - [首次运行验证与配置检查](#first-run-verification)
- [日常更新工作流：双分支协同操作](#daily-update-workflow)
  - [源码更新与提交流程](#source-code)
  - [静态文件部署与分支同步](#static-file)
  - [自动化脚本优化工作流](#automation-script)
- [常见问题与解决方案](#common-problems)
  - [分支切换冲突处理](#branch-switching)
  - [环境依赖不一致问题](#environment-dependency)
  - [主题和插件同步异常](#theme-and-pluginy)
- [进阶技巧：私有仓库与多分支策略](#advanced-tips-private)
  - [私有仓库保护源码安全](#private-repositories)
  - [多分支协同开发模型](#multi-branch-collaborative-development-model)
- [结语：多设备同步的最佳实践](#conclusion-best-practices)
<!--more-->
## 引言：多设备协作的必要性<a name="introduction-the-necessity"></a>
前几天，我在思考是否能用多台设备（如家用电脑、办公电脑、笔记本电脑）来更新博客，这在我看来已经成为常态。作为一款高效的静态博客生成器，Hexo 的默认部署机制仅将静态文件推送到 GitHub Pages，但源码文件（Markdown 文章、主题配置、插件）并未同步，导致多设备协作存在以下痛点：
  - 源码存储分散，无法统一管理
  - 重复搭建环境配置，效率低下
  - 突发情况（如电脑故障）导致源码丢失

因此我写了这篇文章，通过 Git 分支策略构建一套完整的 Hexo 多设备同步方案，实现源码跨设备的无缝同步和管理。
## Hexo 多设备同步的核心原理<a name="core-principles-of-hexo"></a>
### Hexo 目录结构与版本控制策略<a name="hexo-directory"></a>
在 Hexo 博客目录结构中，以下`文件/目录`需要特别关注：
| 目录/文件 | 功能 | 版本控制策略 |
|----------|------|--------------|
| `node_modules/` | 依赖包目录 | 忽略（通过 `package.json` 重新生成） |
| `themes/` | 主题文件 | 必须同步（包含自定义配置） |
| `public/` | 静态生成文件 | 忽略（由 `hexo g` 生成） |
| `source/` | 博客源码（Markdown） | 必须同步 |
| `_config.yml` | 全局配置文件 | 必须同步 |
| `package.json` | 依赖描述文件 | 必须同步 |

### Git 分支分工模型<a name="git-branch"></a>
强烈推荐使用双分支策略：
- **源码分支（如 `hexo01` 或 `source`）**：存储 Hexo 源码（Markdown、主题、配置）
- **部署分支（如 `master` 或 `gh-pages`）**：存储静态生成文件（由 `hexo deploy` 自动推送）

#### 核心逻辑：
1. 源码分支作为"开发分支"，所有手动修改都在此完成。
2. 部署分支作为"生产分支"，仅接收静态生成文件。使用 `git push origin hexo01` 推送到"开发分支"时，"生产分支"将自动同步。
3. 两个分支通过 `.gitignore` 配置进行隔离。
## 旧电脑操作指南：
### 创建和配置远程分支<a name="creating-and-configuring-remote-branches"></a>
1. **远程仓库准备**  
   在 GitHub 上创建仓库 `username.github.io`，并执行以下操作：
```bash
   # Create hexo source branch
   git branch hexo
   # Set hexo as the default branch, this is a key step!
   git branch --set-upstream-to=origin/hexo hexo
```
2. **本地环境初始化**
  在博客根目录执行：
  初始化 Git 仓库
```bash
git init
# Add remote repository
git remote add origin git@github.com:username/username.github.io.git
```
### 本地环境与远程仓库同步<a name="local-environmen"></a>
1. 清理并复制文件
保留 **.git** 文件夹，删除其他文件
将原始 Hexo 目录（除 .deploy_git/ 外）复制到当前目录
将源码提交到远程分支
```bash
# Add all files
git add .
# Commit changes
git commit -m "Init hexo source branch"
# Push to the remote hexo branch
git push origin hexo
```
### .gitignore 关键配置 <a name="gitignore-key-configuratio"></a>
在项目根目录创建 **.gitignore** 文件，内容如下：
```
.DS_Store
Thumbs.db
db.json
*.log
node_modules/
public/
.deploy*/
```
## 新电脑环境搭建 <a name="new-computer-environment"></a>
### SSH Key 配置与环境依赖安装 <a name="ssh-key-configuratio"></a>
1. 生成并添加 SSH key
```bash
ssh-keygen -t rsa -C "your_email@example.com"
```
2. 将生成的公钥（如 **id_rsa.pub**）添加到 ```GitHub 的 Settings > SSH and GPG Keys```，Mac 下路径为 `~/.ssh`，Windows 下路径为 `C:\Users\username\.ssh`
2. 配置 Git 全局信息
```bash
git config --global user.name "YourName"
git config --global user.email "your_email@example.com"
```
### 远程仓库克隆与依赖恢复 <a name="remote-repository"></a>
1. 克隆源码分支
```bash
git clone -b hexo git@github.com:username/username.github.io.git blog
cd blog
```
2.安装依赖
```bash
# Install Hexo CLI
npm install -g hexo-cli
# Install project dependencies
npm install
# Install deployment plugins
npm install hexo-deployer-git
```
**注意**：请确保使用相同版本的 (Node.js)[https://nodejs.org/en/download] 来安装以上工具，否则可能会出现兼容性问题。
### 首次运行验证与配置检查 <a name="first-run-verification"></a>
本地预览验证
```bash
hexo clean
hexo g && hexo s
```
访问 http://localhost:4000 确认博客正常运行
部署配置检查
确保 `_config.yml` 中的部署配置指向 `master` 分支：
```yaml
deploy:
  type: git
  repo: git@github.com:username/username.github.io.git
  branch: master
```
## 日常更新工作流：双分支协同操作 <a name="daily-update-workflow"></a>
### 源码更新与提交流程 <a name="source-cod"></a>
1. 拉取最新源码
```bash
git pull origin hexo
```
2. 修改并提交
```bash
# Add a new article
hexo new "New Article"
# Commit changes
git add .
git commit -m "Update blog content"
# Push to the remote source branch
git push origin hexo
```
### 自动化脚本优化工作流 <a name="automation-script"></a>
创建一个 `deploy.sh` 脚本来简化流程：
```bash
#!/bin/bash
# ================ Hexo Automated Deployment Script (hexo01 branch) ================
# Usage: Execute in the blog root directory with ./deploy.sh "Commit message"
# If no commit message is provided, a default timestamp message will be used
# ================================================================

# Define color output
COLOR_RED="\033[31m"
COLOR_GREEN="\033[32m"
COLOR_YELLOW="\033[33m"
COLOR_RESET="\033[0m"

# Check if commit message is provided, otherwise use default
COMMIT_MSG=${1:-"Auto deploy at $(date +'%Y-%m-%d %H:%M:%S')"}

echo -e "${COLOR_YELLOW}==== Starting Hexo Blog Deployment ====${COLOR_RESET}"

# Step 0: Pull latest source code (hexo01 branch)
echo -e "${COLOR_GREEN}[0/4] Pulling latest source code...${COLOR_RESET}"
git pull origin hexo01
if [ $? -ne 0 ]; then
    echo -e "${COLOR_RED}Failed to pull source code! Please resolve conflicts manually and retry.${COLOR_RESET}"
    exit 1
fi

# Step 1: Clean and generate static files
echo -e "${COLOR_GREEN}[1/4] Cleaning and generating static files...${COLOR_RESET}"
hexo clean && hexo generate
if [ $? -ne 0 ]; then
    echo -e "${COLOR_RED}Failed to generate static files!${COLOR_RESET}"
    exit 1
fi
# Step 2: Deploy to GitHub Pages
echo -e "${COLOR_GREEN}[2/4] Deploying to GitHub Pages...${COLOR_RESET}"
hexo deploy
if [ $? -ne 0 ]; then
    echo -e "${COLOR_RED}Failed to deploy to GitHub Pages!${COLOR_RESET}"
    exit 1
fi
# Step 3: Commit source code changes to hexo01 branch
echo -e "${COLOR_GREEN}[3/4] Committing source code changes...${COLOR_RESET}"
git add .
git commit -m "$COMMIT_MSG"
if [ $? -ne 0 ]; then
    echo -e "${COLOR_YELLOW}No changes to commit.${COLOR_RESET}"
else
    # Step 4: Push source code to GitHub
    echo -e "${COLOR_GREEN}[4/4] Pushing source code to GitHub (hexo01 branch)...${COLOR_RESET}"
    git push origin hexo01
    if [ $? -ne 0 ]; then
        echo -e "${COLOR_RED}Failed to push source code to GitHub!${COLOR_RESET}"
        exit 1
    fi
fi

echo -e "${COLOR_YELLOW}==== Hexo Blog Deployment Completed ====${COLOR_RESET}"
echo -e "${COLOR_GREEN}View blog: https://your-username.github.io${COLOR_GREEN}"
echo -e "${COLOR_GREEN}View source: https://github.com/your-username/your-repo/tree/hexo01${COLOR_RESET}"
```
授予执行权限并运行：
```bash
chmod +x deploy.sh
./deploy.sh "Update description"
```
## 常见问题与解决方案 <a name="automation-script"></a>
### 分支切换冲突处理 <a name="branch-switchin"></a>
切换分支导致 node_modules 冲突时，执行：
```bash
# Stash current changes
git stash
# Switch branches
git checkout hexo
# Restore changes
git stash pop
# Clean untracked files
git clean -fdx
# Reinstall dependencies
npm install
```
如果你在 **Mac** 上无法运行 `hexo s` 等 hexo 命令，这是因为 Mac 的默认终端是 zsh（可以通过 echo $SHELL 命令查询），用户环境变量文件是 ~/.zshrc。执行以下命令后，环境变量配置即生效：
```bash
echo 'PATH="$PATH:./node_modules/.bin"' >> ~/.zshrc
```
### 环境依赖不一致问题 <a name="environment-dependenc"></a>
确保各设备的 `Node.js` 版本一致，可通过 `package.json` 锁定：
```json
"engines": {
  "node": "14.x"
}
```
在新设备上执行：
```bash
npm install --no-save
```

### 主题和插件同步异常<a name="theme-and-pluginy"></a>
1. 检查主题中是否嵌套了 Git
删除主题目录中的 .git 文件夹：
```bash
find themes/ -type d -name ".git" -exec rm -rf {} \;
```
2. 手动同步主题更新
如果主题有更新，可通过 Git submodule 管理：
```bash
git submodule add <theme-repo> themes/<theme-name>
```
## 进阶技巧：私有仓库与多分支策略 <a name="advanced-tips-private"></a>
### 私有仓库保护源码安全 <a name="private-repositories"></a>
1. 创建私有仓库
在 GitHub 上新建私有仓库 `hexo-source` 用于存储源码
2. 迁移源码分支
```bash
# Remove old remote
git remote remove origin
# Add new private repository
git remote add origin git@github.com:username/hexo-source.git
# Push the source branch
git push -u origin hexo
```
3. 配置双重部署目标
在 _config.yml 中添加：
```yaml
deploy:
  - type: git
    repo: git@github.com:username/hexo-source.git
    branch: hexo
  - type: git
    repo: git@github.com:username/username.github.io.git
    branch: main
```

### 多分支协同开发模型<a name="multi-branch-collaborative-development-model"></a>
1. 功能分支工作流
```bash
# Create a feature branch
git checkout -b feature/new-theme
# After development, merge into the hexo branch
git checkout hexo
git merge feature/new-theme
git push origin hexo
```
## 多设备同步的最佳实践<a name="conclusion-best-practices"></a>
  1. 核心原则：
    - 源码与静态文件分开存储
    - 通过 package.json 管理依赖
    - 提交前务必先拉取，避免冲突
  2. 操作清单：
    - 新设备：`git clone -b hexo + npm install`
    - 日常更新：`git pull` → 编辑 → `git push` → `hexo deploy`（必须先 git pull）
    - 环境迁移：只需 Git 克隆 + 安装依赖，无需重新初始化
  3. 进阶建议：
    - 使用 GitHub Actions 实现自动化部署
    - 定期将源码分支备份到其他云存储
    - 采用分支保护策略以实现团队协作
