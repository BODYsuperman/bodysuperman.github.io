---
title: OpenClaw User Guide - Complete Tutorial
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

- [1. Understanding OpenClaw](#1-understanding-openclaw)
  - [1.1 What is OpenClaw?](#11-what-is-openclaw)
  - [1.2 Core Capabilities](#12-core-capabilities)
  - [1.3 Architecture Overview](#13-architecture-overview)
- [2. Quick Start](#2-quick-start)
  - [2.1 System Requirements](#21-system-requirements)
  - [2.2 One-Click Installation](#22-one-click-installation)
  - [2.3 Verify Installation](#23-verify-installation)
  - [2.4 5-Minute Quick Experience](#24-5-minute-quick-experience)
- [3. Installation & Deployment](#3-installation--deployment)
  - [3.1 Installation Methods Comparison](#31-installation-methods-comparison)
  - [3.2 Manual Installation (npm)](#32-manual-installation-npm)
  - [3.3 Configure PATH (if needed)](#33-configure-path-if-needed)
  - [3.4 Docker Deployment](#34-docker-deployment)
  - [3.5 Version Updates](#35-version-updates)
<!--more-->
- [4. Channel Integration](#4-channel-integration)
  - [4.1 Channel Difficulty Comparison](#41-channel-difficulty-comparison)
  - [4.2 Telegram Integration (Recommended for Beginners)](#42-telegram-integration-recommended-for-beginners)
  - [4.3 Feishu Integration](#43-feishu-integration)
  - [4.4 Multi-Channel Configuration](#44-multi-channel-configuration)
- [5. Configuration Guide](#5-configuration-guide)
  - [5.1 Configuration File Locations](#51-configuration-file-locations)
  - [5.2 Model Configuration](#52-model-configuration)
  - [5.3 Recommended Models](#53-recommended-models)
  - [5.4 Gateway Configuration](#54-gateway-configuration)
  - [5.5 Authentication Modes](#55-authentication-modes)
- [6. Multi-Agent Configuration](#6-multi-agent-configuration)
  - [6.1 What is Multi-Agent?](#61-what-is-multi-agent)
  - [6.2 Built-in Agent Types](#62-built-in-agent-types)
  - [6.3 Creating Custom Agents](#63-creating-custom-agents)
  - [6.4 Assign Agents to Different Tasks](#64-assign-agents-to-different-tasks)
  - [6.5 Agent Routing Configuration](#65-agent-routing-configuration)
  - [6.6 Multi-Agent Best Practices](#66-multi-agent-best-practices)
  - [6.7 View and Manage Agents](#67-view-and-manage-agents)
  - [6.8 Multi-Agent Architecture Example](#68-multi-agent-architecture-example)
- [7. Skills System](#7-skills-system)
  - [7.1 What are Skills?](#71-what-are-skills)
  - [7.2 Installing Skills](#72-installing-skills)
  - [7.3 Popular Skills](#73-popular-skills)
  - [7.4 Creating Custom Skills](#74-creating-custom-skills)
- [8. Memory System](#8-memory-system)
  - [8.1 Memory Types](#81-memory-types)
  - [8.2 Memory File Locations](#82-memory-file-locations)
  - [8.3 Search Memory](#83-search-memory)
  - [8.4 Memory Maintenance](#84-memory-maintenance)
- [9. Scheduled Tasks](#9-scheduled-tasks)
  - [9.1 Cron Basics](#91-cron-basics)
  - [9.2 Cron Expressions](#92-cron-expressions)
  - [9.3 Heartbeat Tasks](#93-heartbeat-tasks)
  - [9.4 Practical Cron Examples](#94-practical-cron-examples)
- [10. Common Commands](#10-common-commands)
  - [10.1 Gateway Management](#101-gateway-management)
  - [10.2 Configuration Management](#102-configuration-management)
  - [10.3 Model Management](#103-model-management)
  - [10.4 Channel Management](#104-channel-management)
  - [10.5 Agent Management](#105-agent-management)
  - [10.6 Memory Operations](#106-memory-operations)
  - [10.7 Session Management](#107-session-management)
- [11. Troubleshooting](#11-troubleshooting)
  - [11.1 Common Issues](#111-common-issues)
  - [11.2 Viewing Logs](#112-viewing-logs)
  - [11.3 Diagnostic Commands](#113-diagnostic-commands)
  - [11.4 Reset & Recovery](#114-reset--recovery)
- [Appendix](#appendix)
  - [A. Resource Links](#a-resource-links)
  - [B. Version Information](#b-version-information)
  - [C. Contributors](#c-contributors)
---

<a name="1-understanding-openclaw"></a>
## Understanding OpenClaw

<a name="11-what-is-openclaw"></a>
### What is OpenClaw?

OpenClaw is an **open-source, self-hosted AI Agent system** that transforms AI from a "chat tool" into a "digital employee capable of autonomously executing tasks."

| Dimension | ChatGPT | OpenClaw |
| ----------- | ---------------- | ----------------- |
| Positioning | Q&A Advisor | Digital Employee |
| Deployment | Cloud SaaS | Local Self-hosted |
| Interaction | Web Chat | 20+ Chat Channels |
| Capability | Answer Questions | Execute Tasks |
| Data | Cloud Storage | Local Control |

<a name="12-core-capabilities"></a>
### Core Capabilities

- ✅ **Multi-channel Connection**: Telegram, WhatsApp, Feishu, DingTalk, Discord, etc.
- ✅ **Persistent Memory**: Remembers your preferences, projects, contacts
- ✅ **Skill Extension**: Infinitely expand capabilities through the Skills system
- ✅ **Proactive Work**: Scheduled tasks, heartbeat checks, automatic reminders
- ✅ **Local Data**: All data stored on your device
- ✅ **Multi-Agent Collaboration**: Dedicated agents for different tasks

<a name="13-architecture-overview"></a>
### Architecture Overview

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
## Quick Start

<a name="21-system-requirements"></a>
### System Requirements

| Requirement | Description |
|------|------|
| Node.js | v22.0.0 or higher |
| Operating System | macOS / Linux / Windows (WSL2) |
| Memory | Minimum 2GB, Recommended 4GB+ |
| Storage | Minimum 1GB available space |

<a name="22-one-click-installation"></a>
### One-Click Installation

**macOS / Linux:**
```bash
curl -fsSL https://openclaw.bot/install.sh | bash
```

**Windows (PowerShell):**
```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

<a name="23-verify-installation"></a>
### Verify Installation

```bash
# Check version
openclaw --version

# Run diagnostics
openclaw doctor

# Check status
openclaw status
```

<a name="24-5-minute-quick-experience"></a>
### 5-Minute Quick Experience

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
## Installation & Deployment

<a name="31-installation-methods-comparison"></a>
### Installation Methods Comparison

| Method | Difficulty | Use Case |
|------|------|----------|
| One-Click Script | ⭐ | Recommended for beginners |
| npm Manual Install | ⭐⭐ | Familiar with Node.js |
| Docker | ⭐⭐ | Containerized deployment |
| Source Build | ⭐⭐⭐⭐ | Developers |

<a name="32-manual-installation-npm"></a>
### Manual Installation (npm)

```bash
# Check Node.js version
node -v  # Requires >= 22.0.0

# Global installation
npm install -g openclaw@latest

# If encountering sharp module errors
SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm install -g openclaw@latest
```

<a name="33-configure-path-if-needed"></a>
### Configure PATH (if needed)

If you get `openclaw: command not found`:

```bash
# Find npm global path
npm prefix -g

# Add to ~/.bashrc or ~/.zshrc
export PATH="$(npm prefix -g)/bin:$PATH"

# Apply changes
source ~/.bashrc
```

<a name="34-docker-deployment"></a>
###  Docker Deployment

```bash
docker run -d \
  --name openclaw \
  -v ~/openclaw-data:/root/.openclaw \
  -p 18789:18789 \
  openclaw/openclaw:latest
```

<a name="35-version-updates"></a>
###  Version Updates

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
## Channel Integration

<a name="41-channel-difficulty-comparison"></a>
###  Channel Difficulty Comparison

| Tier | Platform | Time | Description |
|------|------|------|------|
| First Tier | Telegram, QQ | 5-10 min | Easiest, zero threshold |
| Second Tier | Discord, Feishu | 15-20 min | Well-documented |
| Third Tier | WhatsApp, Slack, DingTalk | 25-40 min | More configuration |
| Fourth Tier | iMessage, WeChat | 1+ hour | Additional requirements |

<a name="42-telegram-integration-recommended-for-beginners"></a>
###  Telegram Integration (Recommended for Beginners)

**Step 1: Create Bot**
1. Search for `@BotFather` in Telegram
2. Send `/newbot` command
3. Set bot name (must end with `bot`)
4. Save the returned Bot Token

**Step 2: Configure OpenClaw**

Edit `~/.openclaw/openclaw.json`:
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

**Step 3: Start and Pair**
```bash
# Restart Gateway
openclaw gateway restart

# Send a message to the bot in Telegram
# You'll receive a pairing verification code
```

<a name="43-feishu-integration"></a>
###  Feishu Integration

```bash
# Run configuration wizard
openclaw configure --section feishu
```

You need to create an enterprise self-built app in the Feishu Open Platform and obtain App ID and App Secret.

<a name="44-multi-channel-configuration"></a>
###  Multi-Channel Configuration

You can configure multiple channels simultaneously:

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
##  Configuration Guide

<a name="51-configuration-file-locations"></a>
###  Configuration File Locations

| File | Path | Description |
|------|------|------|
| Main Config | `~/.openclaw/openclaw.json` | Gateway, channels, models |
| Agent Config | `~/.openclaw/agents/*/agent/` | Individual agent configs |
| Workspace | `~/.openclaw/workspace-*/` | Agent workspaces |

<a name="52-model-configuration"></a>
###  Model Configuration

Edit `~/.openclaw/openclaw.json`:

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
###  Recommended Models

| Provider | Model | Use Case |
|--------|------|----------|
| Alibaba Cloud | qwen3.5-plus | General tasks, cost-effective |
| Anthropic | Claude Opus 4.6 | Programming, code generation |
| Zhipu | glm-5 | Optimized for Chinese tasks |
| Moonshot AI | kimi-k2.5 | Long text processing |

<a name="54-gateway-configuration"></a>
### 5.4 Gateway Configuration

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
### Authentication Modes

**Token Authentication (Recommended for API Integration):**
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

**Password Authentication (Recommended for Web UI):**
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
## Multi-Agent Configuration

<a name="61-what-is-multi-agent"></a>
### What is Multi-Agent?

OpenClaw supports running multiple independent Agent instances, where each Agent can:
- Use different model configurations
- Have independent workspaces and memory
- Focus on specific types of tasks
- Configure Skills and tools independently

<a name="62-built-in-agent-types"></a>
###  Built-in Agent Types

| Agent | Purpose | Recommended Model |
|-------|------|----------|
| **main** | Main conversation Agent, handles daily tasks | qwen3.5-plus |
| **chat** | Pure chat Agent, casual conversation | qwen3.5-plus |
| **coding** | Programming Agent, code generation/review | Claude Opus 4.6 |
| **analysis** | Data analysis Agent | qwen3.5-plus |

<a name="63-creating-custom-agents"></a>
### Creating Custom Agents

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
###  Assign Agents to Different Tasks

| Task Type | Recommended Agent | Invocation |
|----------|-----------|----------|
| Daily conversation, Q&A | main | Default |
| Writing code, Debugging | coding | `/agent coding` |
| Data analysis, Reports | analysis | `/agent analysis` |
| Creative writing | chat | `/agent chat` |
| Domain-specific tasks | Custom Agent | `/agent <name>` |

<a name="65-agent-routing-configuration"></a>
###  Agent Routing Configuration

**Method 1: Command Prefix**
```
/agent coding Help me write a Python script
/agent analysis Analyze this data
```

**Method 2: Automatic Routing (Keyword-based)**
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

**Method 3: Channel Binding**
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
###  Multi-Agent Best Practices

**✅ Recommended:**
- Create dedicated Agents for high-frequency tasks
- Use separate Agents for programming (avoid context pollution)
- Create independent Agent instances for different projects
- Regularly clean up inactive Agents

**❌ Avoid:**
- Creating too many Agents (recommended ≤5)
- All Agents using the same model (wastes resources)
- Ignoring memory isolation between Agents

<a name="67-view-and-manage-agents"></a>
###  View and Manage Agents

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
###  Multi-Agent Architecture Example

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
Here're the Telegram Bot I've configured with diffent agent roles:

![pic](a1.png)


<a name="7-skills-system"></a>
## Skills System

<a name="71-what-are-skills"></a>
### What are Skills?

Skills are OpenClaw's plugin system, enabling AI to:
- Access external APIs (weather, news, stocks)
- Operate local resources (files, cameras)
- Execute specific tasks (GitHub, calendar, email)

<a name="72-installing-skills"></a>
### Installing Skills

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
### Popular Skills

| Skill | Function | Install Command |
|-------|------|----------|
| weather | Weather forecast | `skill install weather` |
| github | GitHub operations | `skill install github` |
| news-aggregator | News aggregation | `skill install news-aggregator` |
| pinchtab-browser | Browser automation | `skill install pinchtab-browser` |

<a name="74-creating-custom-skills"></a>
### Creating Custom Skills

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
##  Memory System

<a name="81-memory-types"></a>
###  Memory Types

| Type | File | Description |
|------|------|------|
| Long-term Memory | `MEMORY.md` | Curated important information |
| Daily Memory | `memory/YYYY-MM-DD.md` | Raw logs |
| Identity | `IDENTITY.md` | AI personality settings |
| User | `USER.md` | User information |
| Soul | `SOUL.md` | Behavioral guidelines |

<a name="82-memory-file-locations"></a>
###  Memory File Locations

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
###  Search Memory

```bash
# Semantic search
openclaw memory search "project mentioned last time"

# Search by date
openclaw memory search --date 2026-03-15 "meeting"
```

<a name="84-memory-maintenance"></a>
###  Memory Maintenance

Recommended to review MEMORY.md regularly (weekly):
- Remove outdated information
- Add new decisions and context
- Organize highlights from daily memory files

---

<a name="9-scheduled-tasks"></a>
## Scheduled Tasks

<a name="91-cron-basics"></a>
### Cron Basics

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
###  Cron Expressions

| Expression | Description |
|--------|------|
| `0 9 * * *` | Daily at 9:00 |
| `0 9 * * 1` | Every Monday at 9:00 |
| `*/30 * * * *` | Every 30 minutes |
| `0 0 1 * *` | 1st of each month at 0:00 |

<a name="93-heartbeat-tasks"></a>
###  Heartbeat Tasks

Edit `HEARTBEAT.md`:

```markdown
# HEARTBEAT.md

- [ ] Check unread emails
- [ ] View calendar (within 24 hours)
- [ ] Check weather (if going out)
- [ ] Review memory files (weekly)
```

<a name="94-practical-cron-examples"></a>
### Practical Cron Examples

**Daily News Briefing:**
```bash
openclaw cron add \
  --name "daily-news" \
  --schedule "0 8 * * *" \
  --message "Execute news-aggregator skill, send daily news"
```

**Weekly Backup:**
```bash
openclaw cron add \
  --name "weekly-backup" \
  --schedule "0 2 * * 0" \
  --message "Backup workspace and memory directories"
```

---

<a name="10-common-commands"></a>
## Common Commands

<a name="101-gateway-management"></a>
### Gateway Management

```bash
openclaw gateway start      # Start
openclaw gateway stop       # Stop
openclaw gateway restart    # Restart
openclaw gateway status     # Status
openclaw gateway install    # Install as system service
openclaw gateway uninstall  # Uninstall service
```

<a name="102-configuration-management"></a>
### Configuration Management

```bash
openclaw onboard            # Initial setup wizard
openclaw configure          # Configure channels
openclaw doctor             # Health check
openclaw status             # Check status
openclaw dashboard          # Open web dashboard
openclaw tui                # Terminal interface
```

<a name="103-model-management"></a>
### Model Management

```bash
openclaw models status      # Model status
openclaw models list        # List models
openclaw models add         # Add model
```

<a name="104-channel-management"></a>
### Channel Management

```bash
openclaw channels list      # List channels
openclaw channels add       # Add channel
openclaw channels remove    # Remove channel
```

<a name="105-agent-management"></a>
### Agent Management

```bash
openclaw agents list            # List Agents
openclaw agents create <name>   # Create Agent
openclaw agents config <name>   # Configure Agent
openclaw agents start <name>    # Start Agent
openclaw agents stop <name>     # Stop Agent
openclaw agents delete <name>   # Delete Agent
```

<a name="106-memory-operations"></a>
### Memory Operations

```bash
openclaw memory search <query>   # Search memory
openclaw memory list             # List memory files
openclaw memory edit             # Edit memory
```

<a name="107-session-management"></a>
### Session Management

```bash
openclaw sessions list           # List sessions
openclaw sessions history <key>  # View history
openclaw sessions send           # Send message to session
```

---

<a name="11-troubleshooting"></a>
## Troubleshooting

<a name="111-common-issues"></a>
### Common Issues

**Issue 1: `openclaw: command not found`**

```bash
# Find npm global path
npm prefix -g

# Add to PATH
export PATH="$(npm prefix -g)/bin:$PATH"

# Add to ~/.bashrc permanently
echo 'export PATH="$(npm prefix -g)/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Issue 2: Gateway fails to start**

```bash
# Check port usage
lsof -i :18789

# View logs
journalctl --user -u openclaw-gateway.service -n 50

# Restart service
systemctl --user restart openclaw-gateway.service
```

**Issue 3: Not receiving Telegram messages**

```bash
# Check if Bot Token is correct
cat ~/.openclaw/openclaw.json | grep botToken

# Check if offset is updated
cat ~/.openclaw/telegram/update-offset-*.json

# View Gateway logs
journalctl -t gateway-start.sh -n 30 | grep telegram
```

**Issue 4: Model API call failures**

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
###  Viewing Logs

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
###  Diagnostic Commands

```bash
# Full diagnostics
openclaw doctor

# Check system
openclaw status

# Check configuration
openclaw config list
```

<a name="114-reset--recovery"></a>
### 11.4 Reset & Recovery

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
## Appendix

<a name="a-resource-links"></a>
### A. Resource Links

| Resource | Link |
|------|------|
| OpenClaw-Cookbook | https://github.com/BODYsuperman/OpenClaw-Cookbook |

<a name="b-version-information"></a>
### B. Version Information

- Document Version: v1.1
- Applicable OpenClaw Version: v2026.3.11+
- Last Updated: 2026-03-17

<a name="c-contributors"></a>
### C. Contributors

This document integrates content from:
- OpenClaw Orange Book (Hua Shu)
- Datawhale OpenClaw Tutorial
- APIFox OpenClaw User Guide
- OpenClaw Official Documentation

---

*For questions or suggestions, please provide feedback to the OpenClaw community.*
