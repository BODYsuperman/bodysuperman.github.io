---
title: OpenClaw 使用指南 - 完整教程
lang: zh-CN
date: 2026-03-08 09:37:33
updated: 2026-03-17 10:23:00
comments: true
categories:
  - AI Agent
  - Tutorials
tags:
  - OpenClaw
  - AI Agent
  - Multi-Agent
  - Self-Hosted
  - Open Source
  - AI Automation
  - Digital Employee
  - Tutorial
---

- [1. 了解 OpenClaw](#1-understanding-openclaw)
  - [1.1 什么是 OpenClaw？](#11-what-is-openclaw)
  - [1.2 核心能力](#12-core-capabilities)
  - [1.3 架构概览](#13-architecture-overview)
- [2. 快速开始](#2-quick-start)
  - [2.1 系统要求](#21-system-requirements)
  - [2.2 一键安装](#22-one-click-installation)
  - [2.3 验证安装](#23-verify-installation)
  - [2.4 五分钟快速体验](#24-5-minute-quick-experience)
- [3. 安装与部署](#3-installation--deployment)
  - [3.1 安装方式对比](#31-installation-methods-comparison)
  - [3.2 手动安装（npm）](#32-manual-installation-npm)
  - [3.3 配置 PATH（如需要）](#33-configure-path-if-needed)
  - [3.4 Docker 部署](#34-docker-deployment)
  - [3.5 版本更新](#35-version-updates)
<!--more-->
- [4. 渠道集成](#4-channel-integration)
  - [4.1 渠道难度对比](#41-channel-difficulty-comparison)
  - [4.2 Telegram 集成（推荐新手）](#42-telegram-integration-recommended-for-beginners)
  - [4.3 飞书集成](#43-feishu-integration)
  - [4.4 多渠道配置](#44-multi-channel-configuration)
- [5. 配置指南](#5-configuration-guide)
  - [5.1 配置文件位置](#51-configuration-file-locations)
  - [5.2 模型配置](#52-model-configuration)
  - [5.3 推荐模型](#53-recommended-models)
  - [5.4 网关配置](#54-gateway-configuration)
  - [5.5 认证模式](#55-authentication-modes)
- [6. 多 Agent 配置](#6-multi-agent-configuration)
  - [6.1 什么是多 Agent？](#61-what-is-multi-agent)
  - [6.2 内置 Agent 类型](#62-built-in-agent-types)
  - [6.3 创建自定义 Agent](#63-creating-custom-agents)
  - [6.4 为不同任务分配 Agent](#64-assign-agents-to-different-tasks)
  - [6.5 Agent 路由配置](#65-agent-routing-configuration)
  - [6.6 多 Agent 最佳实践](#66-multi-agent-best-practices)
  - [6.7 查看和管理 Agent](#67-view-and-manage-agents)
  - [6.8 多 Agent 架构示例](#68-multi-agent-architecture-example)
- [7. 技能系统](#7-skills-system)
  - [7.1 什么是技能？](#71-what-are-skills)
  - [7.2 安装技能](#72-installing-skills)
  - [7.3 热门技能](#73-popular-skills)
  - [7.4 创建自定义技能](#74-creating-custom-skills)
- [8. 记忆系统](#8-memory-system)
  - [8.1 记忆类型](#81-memory-types)
  - [8.2 记忆文件位置](#82-memory-file-locations)
  - [8.3 搜索记忆](#83-search-memory)
  - [8.4 记忆维护](#84-memory-maintenance)
- [9. 定时任务](#9-scheduled-tasks)
  - [9.1 Cron 基础](#91-cron-basics)
  - [9.2 Cron 表达式](#92-cron-expressions)
  - [9.3 心跳任务](#93-heartbeat-tasks)
  - [9.4 实用 Cron 示例](#94-practical-cron-examples)
- [10. 常用命令](#10-common-commands)
  - [10.1 网关管理](#101-gateway-management)
  - [10.2 配置管理](#102-configuration-management)
  - [10.3 模型管理](#103-model-management)
  - [10.4 渠道管理](#104-channel-management)
  - [10.5 Agent 管理](#105-agent-management)
  - [10.6 记忆操作](#106-memory-operations)
  - [10.7 会话管理](#107-session-management)
- [11. 故障排除](#11-troubleshooting)
  - [11.1 常见问题](#111-common-issues)
  - [11.2 查看日志](#112-viewing-logs)
  - [11.3 诊断命令](#113-diagnostic-commands)
  - [11.4 重置与恢复](#114-reset--recovery)
- [附录](#appendix)
  - [A. 资源链接](#a-resource-links)
  - [B. 版本信息](#b-version-information)
  - [C. 贡献者](#c-contributors)
---

<a name="1-understanding-openclaw"></a>
## 了解 OpenClaw

<a name="11-what-is-openclaw"></a>
### 什么是 OpenClaw？

OpenClaw 是一个**开源、自托管的 AI Agent 系统**，将 AI 从"聊天工具"转变为"能够自主执行任务的数字员工"。

| 维度 | ChatGPT | OpenClaw |
| ----------- | ---------------- | ----------------- |
| 定位 | 问答顾问 | 数字员工 |
| 部署 | 云端 SaaS | 本地自托管 |
| 交互 | 网页聊天 | 20+ 聊天渠道 |
| 能力 | 回答问题 | 执行任务 |
| 数据 | 云端存储 | 本地掌控 |

<a name="12-core-capabilities"></a>
### 核心能力

- ✅ **多渠道连接**：Telegram、WhatsApp、飞书、钉钉、Discord 等
- ✅ **持久记忆**：记住你的偏好、项目、联系人
- ✅ **技能扩展**：通过技能系统无限扩展能力
- ✅ **主动工作**：定时任务、心跳检查、自动提醒
- ✅ **本地数据**：所有数据存储在你的设备上
- ✅ **多 Agent 协作**：为不同任务配置专用 Agent

<a name="13-architecture-overview"></a>
### 架构概览

```
┌─────────────────────────────────────────────────────────┐
│                    User Chat Channels                   │
│   Telegram / WhatsApp / Feishu / DingTalk / Discord ... │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Gateway Core Service                  │
│  - Message Routing  - Session Management  - Event Processing  - Task Scheduling │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Agent System                         │
│  main / chat / coding / Custom Agents                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Tools & Skills                        │
│  Skills / Plugins / Tools / Memory / Cron               │
└─────────────────────────────────────────────────────────┘
```

---

<a name="2-quick-start"></a>
## 快速开始

<a name="21-system-requirements"></a>
### 系统要求

| 要求 | 说明 |
|------|------|
| Node.js | v22.0.0 或更高版本 |
| 操作系统 | macOS / Linux / Windows (WSL2) |
| 内存 | 最低 2GB，推荐 4GB+ |
| 存储 | 最低 1GB 可用空间 |

<a name="22-one-click-installation"></a>
### 一键安装

**macOS / Linux：**
```bash
curl -fsSL https://openclaw.bot/install.sh | bash
```

**Windows (PowerShell)：**
```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

<a name="23-verify-installation"></a>
### 验证安装

```bash
# Check version
openclaw --version

# Run diagnostics
openclaw doctor

# Check status
openclaw status
```

<a name="24-5-minute-quick-experience"></a>
### 五分钟快速体验

```bash
# 1. Install
npm i -g openclaw

# 2. Run setup wizard
openclaw onboard

# 3. Start Gateway
openclaw gateway start

# 4. Open dashboard
openclaw dashboard

# 5. Start chatting in your browser!
```

---

<a name="3-installation--deployment"></a>
## 安装与部署

<a name="31-installation-methods-comparison"></a>
### 安装方式对比

| 方式 | 难度 | 适用场景 |
|------|------|----------|
| 一键脚本 | ⭐ | 推荐新手使用 |
| npm 手动安装 | ⭐⭐ | 熟悉 Node.js |
| Docker | ⭐⭐ | 容器化部署 |
| 源码编译 | ⭐⭐⭐⭐ | 开发者 |

<a name="32-manual-installation-npm"></a>
### 手动安装（npm）

```bash
# Check Node.js version
node -v  # Requires >= 22.0.0

# Global installation
npm install -g openclaw@latest

# If encountering sharp module errors
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest
```

<a name="33-configure-path-if-needed"></a>
### 配置 PATH（如需要）

如果遇到 `openclaw: command not found`：

```bash
# Find npm global path
npm prefix -g

# Add to ~/.bashrc or ~/.zshrc
export PATH="$(npm prefix -g)/bin:$PATH"

# Apply changes
source ~/.bashrc
```

<a name="34-docker-deployment"></a>
### Docker 部署

```bash
docker run -d \
  --name openclaw \
  -v ~/openclaw-data:/root/.openclaw \
  -p 18789:18789 \
  openclaw/openclaw:latest
```

<a name="35-version-updates"></a>
### 版本更新

```bash
# Update to stable version (recommended)
openclaw update --channel stable

# Update to beta version
openclaw update --channel beta

# Update to dev version
openclaw update --channel dev
```

---

<a name="4-channel-integration"></a>
## 渠道集成

<a name="41-channel-difficulty-comparison"></a>
### 渠道难度对比

| 梯队 | 平台 | 时间 | 说明 |
|------|------|------|------|
| 第一梯队 | Telegram、QQ | 5-10 分钟 | 最简单，零门槛 |
| 第二梯队 | Discord、飞书 | 15-20 分钟 | 文档完善 |
| 第三梯队 | WhatsApp、Slack、钉钉 | 25-40 分钟 | 配置较多 |
| 第四梯队 | iMessage、微信 | 1+ 小时 | 有额外要求 |

<a name="42-telegram-integration-recommended-for-beginners"></a>
### Telegram 集成（推荐新手）

**第一步：创建 Bot**
1. 在 Telegram 中搜索 `@BotFather`
2. 发送 `/newbot` 命令
3. 设置 bot 名称（必须以 `bot` 结尾）
4. 保存返回的 Bot Token

**第二步：配置 OpenClaw**

编辑 `~/.openclaw/openclaw.json`：
```json
{
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "YOUR_BOT_TOKEN",
      "dmPolicy": "pairing",
      "allowFrom": ["tg:YOUR_USER_ID"]
    }
  }
}
```

**第三步：启动并配对**
```bash
# Restart Gateway
openclaw gateway restart

# Send a message to the bot in Telegram
# You'll receive a pairing verification code
```

<a name="43-feishu-integration"></a>
### 飞书集成

```bash
# Run configuration wizard
openclaw configure --section feishu
```

你需要在飞书开放平台创建企业自建应用，获取 App ID 和 App Secret。

<a name="44-multi-channel-configuration"></a>
### 多渠道配置

你可以同时配置多个渠道：

```json
{
  "channels": {
    "telegram": { "enabled": true, "botToken": "..." },
    "feishu": { "enabled": true, "appId": "...", "appSecret": "..." },
    "discord": { "enabled": true, "botToken": "..." }
  }
}
```

---

<a name="5-configuration-guide"></a>
## 配置指南

<a name="51-configuration-file-locations"></a>
### 配置文件位置

| 文件 | 路径 | 说明 |
|------|------|------|
| 主配置 | `~/.openclaw/openclaw.json` | 网关、渠道、模型 |
| Agent 配置 | `~/.openclaw/agents/*/agent/` | 各 Agent 独立配置 |
| 工作空间 | `~/.openclaw/workspace-*/` | Agent 工作空间 |

<a name="52-model-configuration"></a>
### 模型配置

编辑 `~/.openclaw/openclaw.json`：

```json
{
  "models": {
    "mode": "merge",
    "providers": {
      "bailian": {
        "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        "apiKey": "sk-YOUR_API_KEY",
        "api": "openai-completions",
        "models": [
          {
            "id": "qwen3.5-plus",
            "name": "qwen3.5-plus",
            "contextWindow": 1000000,
            "maxTokens": 65536
          }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "bailian/qwen3.5-plus"
      }
    }
  }
}
```

<a name="53-recommended-models"></a>
### 推荐模型

| 提供商 | 模型 | 用途 |
|--------|------|----------|
| 阿里云 | qwen3.5-plus | 通用任务，性价比高 |
| Anthropic | Claude Opus 4.6 | 编程、代码生成 |
| 智谱 | glm-5 | 针对中文任务优化 |
| 月之暗面 | kimi-k2.5 | 长文本处理 |

<a name="54-gateway-configuration"></a>
### 5.4 网关配置

```json
{
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "lan",
    "auth": {
      "mode": "token",
      "token": "your-secure-token"
    },
    "controlUi": {
      "allowedOrigins": ["http://192.168.1.100:18789"],
      "allowInsecureAuth": true
    }
  }
}
```

<a name="55-authentication-modes"></a>
### 认证模式

**Token 认证（推荐用于 API 集成）：**
```json
{
  "gateway": {
    "auth": {
      "mode": "token",
      "token": "your-token"
    }
  }
}
```

**密码认证（推荐用于 Web UI）：**
```json
{
  "gateway": {
    "auth": {
      "mode": "password"
    }
  }
}
```

---

<a name="6-multi-agent-configuration"></a>
## 多 Agent 配置

<a name="61-what-is-multi-agent"></a>
### 什么是多 Agent？

OpenClaw 支持运行多个独立的 Agent 实例，每个 Agent 可以：
- 使用不同的模型配置
- 拥有独立的工作空间和记忆
- 专注于特定类型的任务
- 独立配置技能和工具

<a name="62-built-in-agent-types"></a>
### 内置 Agent 类型

| Agent | 用途 | 推荐模型 |
|-------|------|----------|
| **main** | 主对话 Agent，处理日常任务 | qwen3.5-plus |
| **chat** | 纯聊天 Agent，闲聊对话 | qwen3.5-plus |
| **coding** | 编程 Agent，代码生成/审查 | Claude Opus 4.6 |
| **analysis** | 数据分析 Agent | qwen3.5-plus |

<a name="63-creating-custom-agents"></a>
### 创建自定义 Agent

```bash
# Create new Agent
openclaw agents create my-agent

# Set dedicated model
openclaw agents config my-agent --model glm-5

# Configure workspace
openclaw agents workspace my-agent --path ~/projects/my-agent

# Start Agent
openclaw agents start my-agent
```

<a name="64-assign-agents-to-different-tasks"></a>
### 为不同任务分配 Agent

| 任务类型 | 推荐 Agent | 调用方式 |
|----------|-----------|----------|
| 日常对话、问答 | main | 默认 |
| 编写代码、调试 | coding | `/agent coding` |
| 数据分析、报告 | analysis | `/agent analysis` |
| 创意写作 | chat | `/agent chat` |
| 领域特定任务 | 自定义 Agent | `/agent <name>` |

<a name="65-agent-routing-configuration"></a>
### Agent 路由配置

**方式一：命令前缀**
```
/agent coding Help me write a Python script
/agent analysis Analyze this data
```

**方式二：自动路由（基于关键词）**
```json
{
  "routing": {
    "rules": [
      {
        "keywords": ["code", "programming", "python", "javascript"],
        "agent": "coding"
      },
      {
        "keywords": ["analyze", "data", "chart"],
        "agent": "analysis"
      }
    ]
  }
}
```

**方式三：渠道绑定**
```json
{
  "channels": {
    "telegram": {
      "defaultAgent": "main"
    },
    "discord": {
      "defaultAgent": "chat"
    }
  }
}
```

<a name="66-multi-agent-best-practices"></a>
### 多 Agent 最佳实践

**✅ 推荐：**
- 为高频任务创建专用 Agent
- 编程时使用独立 Agent（避免上下文污染）
- 为不同项目创建独立的 Agent 实例
- 定期清理不活跃的 Agent

**❌ 避免：**
- 创建过多 Agent（建议 ≤5 个）
- 所有 Agent 使用同一模型（浪费资源）
- 忽略 Agent 之间的记忆隔离

<a name="67-view-and-manage-agents"></a>
### 查看和管理 Agent

```bash
# List all Agents
openclaw agents list

# Check Agent status
openclaw agents status my-agent

# View Agent configuration
openclaw agents config my-agent --show

# Stop Agent
openclaw agents stop my-agent

# Delete Agent
openclaw agents delete my-agent
```

<a name="68-multi-agent-architecture-example"></a>
### 多 Agent 架构示例

```
┌─────────────────────────────────────────────────────────┐
│                    User Message                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Routing Layer (distributes by rules)       │
│   Keyword Matching / Command Prefix / Channel Binding   │
└──────────┬──────────────┬──────────────┬────────────────┘
           │              │              │
           ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │   main   │   │  coding  │   │ analysis │
    │  Agent   │   │  Agent   │   │  Agent   │
    └────┬─────┘   └────┬─────┘   └────┬─────┘
         │              │              │
         ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ General  │   │  Code    │   │   Data   │
    │  Memory  │   │  Skills  │   │  Tools   │
    │ Qwen3.5  │   │  Claude  │   │  Pandas  │
    └──────────┘   └──────────┘   └──────────┘
```
以下是我配置了不同 Agent 角色的 Telegram Bot：

![pic](a1.png)


<a name="7-skills-system"></a>
## 技能系统

<a name="71-what-are-skills"></a>
### 什么是技能？

技能是 OpenClaw 的插件系统，使 AI 能够：
- 访问外部 API（天气、新闻、股票）
- 操作本地资源（文件、摄像头）
- 执行特定任务（GitHub、日历、邮件）

<a name="72-installing-skills"></a>
### 安装技能

```bash
# Install from ClawHub
openclaw skill install <skill-slug>

# Search Skills
openclaw skill search <keyword>

# List installed
openclaw skill list

# Update Skills
openclaw skill update
```

<a name="73-popular-skills"></a>
### 热门技能

| 技能 | 功能 | 安装命令 |
|-------|------|----------|
| weather | 天气预报 | `openclaw skills install weather` |
| github | GitHub 操作 | `openclaw skills install github` |
| [news-aggregator](https://github.com/BODYsuperman/world-news-aggregator-skill) | 新闻聚合 | `npx skills add https://github.com/BODYsuperman/world-news-aggregator-skill`|
| pinchtab-browser | 浏览器自动化 | `openclaw skills install pinchtab-browser` |

<a name="74-creating-custom-skills"></a>
### 创建自定义技能

```bash
# Create Skill directory
mkdir -p ~/.openclaw/workspace-main/skills/my-skill

# Create SKILL.md
cat > ~/.openclaw/workspace-main/skills/my-skill/SKILL.md << 'EOF'
# my-skill

## Description
My custom skill

## Usage
/MyCommand [arguments]
EOF
```

---

<a name="8-memory-system"></a>
## 记忆系统

<a name="81-memory-types"></a>
### 记忆类型

| 类型 | 文件 | 说明 |
|------|------|------|
| 长期记忆 | `MEMORY.md` | 精选的重要信息 |
| 每日记忆 | `memory/YYYY-MM-DD.md` | 原始日志 |
| 身份设定 | `IDENTITY.md` | AI 人格设置 |
| 用户信息 | `USER.md` | 用户信息 |
| 行为准则 | `SOUL.md` | 行为指南 |

<a name="82-memory-file-locations"></a>
### 记忆文件位置

```
~/.openclaw/workspace-main/
├── MEMORY.md              # Long-term memory
├── IDENTITY.md            # Identity settings
├── USER.md                # User information
├── SOUL.md                # Behavioral guidelines
├── AGENTS.md              # Workspace description
├── TOOLS.md               # Tool notes
├── HEARTBEAT.md           # Heartbeat tasks
└── memory/
    ├── 2026-03-16.md      # Daily memory
    └── 2026-03-15.md
```

<a name="83-search-memory"></a>
### 搜索记忆

```bash
# Semantic search
openclaw memory search "project mentioned last time"

# Search by date
openclaw memory search --date 2026-03-15 "meeting"
```

<a name="84-memory-maintenance"></a>
### 记忆维护

建议定期（每周）审查 MEMORY.md：
- 删除过时信息
- 添加新的决策和上下文
- 整理每日记忆文件中的要点

---

<a name="9-scheduled-tasks"></a>
## 定时任务

<a name="91-cron-basics"></a>
### Cron 基础

```bash
# Add scheduled task
openclaw cron add --schedule "0 9 * * *" --message "Good morning! Today's tasks:"

# List tasks
openclaw cron list

# Run task
openclaw cron run <job-id>

# Remove task
openclaw cron remove <job-id>
```

<a name="92-cron-expressions"></a>
### Cron 表达式

| 表达式 | 说明 |
|--------|------|
| `0 9 * * *` | 每天 9:00 |
| `0 9 * * 1` | 每周一 9:00 |
| `*/30 * * * *` | 每 30 分钟 |
| `0 0 1 * *` | 每月 1 日 0:00 |

<a name="93-heartbeat-tasks"></a>
### 心跳任务

编辑 `HEARTBEAT.md`：

```markdown
# HEARTBEAT.md

- [ ] Check unread emails
- [ ] View calendar (within 24 hours)
- [ ] Check weather (if going out)
- [ ] Review memory files (weekly)
```

<a name="94-practical-cron-examples"></a>
### 实用 Cron 示例

**每日新闻简报：**
```bash
openclaw cron add \
  --name "daily-news" \
  --schedule "0 8 * * *" \
  --message "Execute news-aggregator skill, send daily news"
```

**每周备份：**
```bash
openclaw cron add \
  --name "weekly-backup" \
  --schedule "0 2 * * 0" \
  --message "Backup workspace and memory directories"
```

---

<a name="10-common-commands"></a>
## 常用命令

<a name="101-gateway-management"></a>
### 网关管理

```bash
openclaw gateway start      # Start
openclaw gateway stop       # Stop
openclaw gateway restart    # Restart
openclaw gateway status     # Status
openclaw gateway install    # Install as system service
openclaw gateway uninstall  # Uninstall service
```

<a name="102-configuration-management"></a>
### 配置管理

```bash
openclaw onboard            # Initial setup wizard
openclaw configure          # Configure channels
openclaw doctor             # Health check
openclaw status             # Check status
openclaw dashboard          # Open web dashboard
openclaw tui                # Terminal interface
```

<a name="103-model-management"></a>
### 模型管理

```bash
openclaw models status      # Model status
openclaw models list        # List models
openclaw models add         # Add model
```

<a name="104-channel-management"></a>
### 渠道管理

```bash
openclaw channels list      # List channels
openclaw channels add       # Add channel
openclaw channels remove    # Remove channel
```

<a name="105-agent-management"></a>
### Agent 管理

```bash
openclaw agents list            # List Agents
openclaw agents create <name>   # Create Agent
openclaw agents config <name>   # Configure Agent
openclaw agents start <name>    # Start Agent
openclaw agents stop <name>     # Stop Agent
openclaw agents delete <name>   # Delete Agent
```

<a name="106-memory-operations"></a>
### 记忆操作

```bash
openclaw memory search <query>   # Search memory
openclaw memory list             # List memory files
openclaw memory edit             # Edit memory
```

<a name="107-session-management"></a>
### 会话管理

```bash
openclaw sessions list           # List sessions
openclaw sessions history <key>  # View history
openclaw sessions send           # Send message to session
```

---

<a name="11-troubleshooting"></a>
## 故障排除

<a name="111-common-issues"></a>
### 常见问题

**问题 1：`openclaw: command not found`**

```bash
# Find npm global path
npm prefix -g

# Add to PATH
export PATH="$(npm prefix -g)/bin:$PATH"

# Add to ~/.bashrc permanently
echo 'export PATH="$(npm prefix -g)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**问题 2：网关启动失败**

```bash
# Check port usage
lsof -i :18789

# View logs
journalctl --user -u openclaw-gateway.service -n 50

# Restart service
systemctl --user restart openclaw-gateway.service
```

**问题 3：收不到 Telegram 消息**

```bash
# Check if Bot Token is correct
cat ~/.openclaw/openclaw.json | grep botToken

# Check if offset is updated
cat ~/.openclaw/telegram/update-offset-*.json

# View Gateway logs
journalctl -t gateway-start.sh -n 30 | grep telegram
```

**问题 4：模型 API 调用失败**

```bash
# Check API Key
openclaw models status

# Test connection
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.example.com/v1/models

# Check network
ping api.example.com
```

<a name="112-viewing-logs"></a>
### 查看日志

```bash
# Gateway logs
journalctl --user -u openclaw-gateway.service -f

# Last 50 entries
journalctl --user -u openclaw-gateway.service -n 50

# Specific time range
journalctl --user -u openclaw-gateway.service \
  --since "2026-03-16 10:00:00" --until "2026-03-16 12:00:00"
```

<a name="113-diagnostic-commands"></a>
### 诊断命令

```bash
# Full diagnostics
openclaw doctor

# Check system
openclaw status

# Check configuration
openclaw config list
```

<a name="114-reset--recovery"></a>
### 11.4 重置与恢复

```bash
# Reset configuration (use with caution)
openclaw onboard --reset

# Reinstall Gateway
openclaw gateway uninstall
openclaw gateway install

# Clear cache
rm -rf ~/.openclaw/browser
rm -rf ~/.openclaw/cron
```

---

<a name="appendix"></a>
## 附录

<a name="a-resource-links"></a>
### A. 资源链接

| 资源 | 链接 |
|------|------|
| OpenClaw-Cookbook | https://github.com/BODYsuperman/OpenClaw-Cookbook |

<a name="b-version-information"></a>
### B. 版本信息

- 文档版本：v1.1
- 适用 OpenClaw 版本：v2026.3.11+
- 最后更新：2026-03-17

<a name="c-contributors"></a>
### C. 贡献者

本文档整合了以下内容来源：
- OpenClaw 橙皮书（华书）
- Datawhale OpenClaw 教程
- APIFox OpenClaw 使用指南
- OpenClaw 官方文档

---

*如有疑问或建议，请向 OpenClaw 社区提供反馈。*
