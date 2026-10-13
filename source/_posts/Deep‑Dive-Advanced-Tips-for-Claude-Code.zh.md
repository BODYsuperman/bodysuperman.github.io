---
title: 深入理解与进阶技巧：Claude Code
date: 2026-08-23 12:48:28
updated: 2026-09-02 00:00:00
comments: true
lang: zh-CN
categories:
  - AI

tags:
  - Claude Code
  - LLM
  - AI Agent
  - Developer Tools
  - Coding Agent
  - MCP‑Protocol
---

- [引言](#introduction)
- [全局视角：七层扩展体系](#the-big-picture-seven-layers-of-extension)
- [选择合适的模型](#choosing-the-right-model)
  - [模型对比](#model-comparison)
  - [四种切换模型的方式](#four-ways-to-switch-models)
  - [配置文件层级](#settings-file-hierarchy)
- [核心配置](#core-configuration)
  - [settings.json：权限与默认设置](#settings-json-permissions-and-defaults)
  - [CLAUDE.md：项目手册](#claude-md-the-project-handbook)
  - [三层记忆系统](#three-layers-of-memory)
  - [.claudeignore](#claudeignore)
- [日常命令与交互](#daily-commands-and-interactions)
  - [斜杠命令速查表](#slash-command-cheat-sheet)
  - [必须掌握的四个命令](#the-four-commands-you-must-master)
  - [快捷键](#keyboard-shortcuts)
  - [高级交互：!、@ 与图片](#power-interactions)
- [正确的工作流：探索、规划、实现、提交](#the-right-workflow-explore-plan-implement-commit)
  - [Plan 模式与三种运行模式](#plan-mode-and-the-three-operating-modes)
  - [何时规划，何时直接动手](#when-to-plan-and-when-to-just-do-it)
  - [实战演练：用 Express 构建一个 Hello API](#walkthrough-building-a-hello-api-with-express)
- [最佳实践](#best-practices)
  - [提示词编写原则](#prompt-writing-principles)
  - [上下文管理](#context-management)
  - [Git 是你的存档点](#git-is-your-save-point)
  - [控制成本](#controlling-costs)
  - [在大型代码库中工作](#working-in-large-codebases)
  - [三个容易被忽视的进阶技巧](#three-overlooked-advanced-tips)
- [新项目启动套件](#starter-kit-for-new-projects)
- [常见问题](#faq)
- [总结](#summary)

<!--more-->

<a name="introduction"></a>

## 引言

你安装了 Claude Code，配置好了 API Key，体验了第一次"哇"的时刻。然后现实问题来了。大多数人会撞上同样的三堵墙：

1. **"它为什么改了我的代码？"** — 你只是要一个小功能，它却重写了三个你根本没提到的文件。
2. **"它怎么越来越笨了？"** — 会话越长，它越慢、越健忘。
3. **"它为什么对谁都一样？"** — 每次会话都从零开始，不了解你的技术栈、你的规范、你的项目。

一个令人不太舒服的事实是：这些不是模型的问题，而是配置的问题。Anthropic 在其企业指南中直言不讳：

> **模型能力是下限，配置质量是上限。**

花一小时做好配置，比追逐最新模型版本的回报大得多。本文就是那份缺失的手册，涵盖三项技能，分别应对上述三堵墙：

- **控制它** — 权限、模式，以及撤销按钮
- **管理它的上下文** — `/compact` / `/clear` 的使用纪律
- **个性化它** — 三层记忆系统

<a name="the-big-picture-seven-layers-of-extension"></a>

## 全局视角：七层扩展体系

在深入细节之前，先看一下 Claude Code 项目的典型目录结构：

```
your-project/
├── CLAUDE.md ← 团队共享指令，提交到 git
├── CLAUDE.local.md ← 个人覆盖，git 忽略
└── .claude/
 ├── settings.json ← 权限 + 配置，提交到 git
 ├── settings.local.json ← 个人权限，git 忽略
 ├── commands/ ← 自定义斜杠命令
 │ ├── review.md → /project:review
 │ ├── fix-issue.md → /project:fix-issue
 │ └── deploy.md → /project:deploy
 ├── rules/ ← 模块化指令文件（全局生效）
 │ ├── code-style.md
 │ ├── testing.md
 │ └── api-conventions.md
 ├── skills/ ← 自动调用的工作流
 │ ├── security-review/
 │ │ └── SKILL.md
 │ └── deploy/
 │ └── SKILL.md
 └── agents/ ← 子代理角色定义
 ├── code-reviewer.md
 └── security-auditor.md
```

![pic](cl-1.png)

本质上，Claude Code 的能力被组织为 **7 个扩展层**（官方术语叫 _Harness_）：

```
Layer 7  Subagents      独立上下文并行工作
Layer 6  MCP            连接外部工具和数据源
Layer 5  LSP            IDE 级别的代码导航
Layer 4  Plugins        将 Skills + Hooks + MCP 打包分发
Layer 3  Skills         按需加载的知识包
Layer 2  Hooks          在特定时刻运行的事件触发器
Layer 1  CLAUDE.md      项目手册，每次会话都会加载
```

| 层级 | 定义 | 何时需要 |
| --------- | --------------------------------------------------------- | ------------------------ |
| CLAUDE.md | 项目手册，每次会话自动加载 | 第一天 |
| Hooks | 在特定时刻自动运行的事件触发器 | 当你需要护栏时 |
| Skills | AI 按需加载的知识包 | 重复性工作流 |
| Plugins | Skills + Hooks + MCP 打包分发 | 与团队共享时 |
| LSP | IDE 级别的代码导航 | 大型代码库 |
| MCP | 连接外部工具和数据 | GitHub、数据库、Jira…… |
| Subagents | 拥有独立上下文的并行工作者 | 研究密集型任务 |

第 1–3 层是**基础配置**；第 4–7 层是**高级扩展**。本文聚焦于基础配置，以及让它们真正发挥作用的工作习惯。

<a name="choosing-the-right-model"></a>

## 选择合适的模型

API 配置好之后，第一个问题是：该用哪个模型？

<a name="model-comparison"></a>

### 模型对比

| 模型 | 速度 | 代码质量 | 推理能力 | 成本 | 推荐场景 |
| ----------------- | -------- | -------- | -------- | ---- | ------------------------------------------------------ |
| Claude Haiku 4.5 | 非常快 | 良好 | 中等 | $ | 简单补全、格式化、小修复 |
| Claude Sonnet 4.6 | 快 | 优秀 | 强 | $$ | 日常开发、功能实现（**默认选择**） |
| Claude Opus 4.7 | 中等 | 顶级 | 非常强 | $$$ | 复杂架构、疑难 Bug、算法问题 |

价格参考（2026-05-18 验证）：

| 模型 | 输入 | 输出 | 典型角色 |
| ----------------- | -------------- | -------------- | ------------------------ |
| Claude Haiku 4.5 | $1 / 百万 token | $5 / 百万 token | 低成本批处理 |
| Claude Sonnet 4.6 | $3 / 百万 token | $15 / 百万 token | 日常开发主力 |
| Claude Opus 4.7 | $5 / 百万 token | $25 / 百万 token | 留给难题使用 |

> **提示：** 日常开发用 Sonnet 就够了。只有遇到真正困难的问题时才切换到 Opus。Haiku 在批量处理大量简单任务时表现出色。

场景化推荐：

| 场景 | 模型 | 原因 |
| -------------------------- | ------------------------ | -------------------------- |
| 日常功能开发 | Sonnet | 速度/质量最佳平衡 |
| 简单编辑 / 格式化 | Haiku | 够用，最便宜 |
| 复杂架构设计 | Opus | 推理能力最强，物有所值 |
| 调试（简单） | Sonnet | 通常够用 |
| 调试（困难） | Opus | 需要深度推理 |
| 预算紧张 | 更便宜的第三方 API | 按当时价格选择 |
| 离线 / 隐私敏感 | 本地模型（Ollama） | 完全本地运行，免费 |

同一任务的实际对比 — _构建一个带 GET 和 POST 端点的小型 Express.js TODO API_：

| 模型 | 耗时 | 质量 | 额外内容 |
| ------ | ---- | ------------------------------------------------ | ------------------------------------------------------ |
| Haiku | ~3s | 正确、简洁 | 无 |
| Sonnet | ~8s | 正确，包含输入验证和错误处理 | 添加了 CORS 和 body 解析中间件 |
| Opus | ~15s | 正确，架构清晰 | 分层设计，详细注释，完整的错误处理 |

> **提示：** 没有"最好的模型"，只有适合当前任务的模型。在简单工作上用昂贵的模型浪费钱；在困难工作上用便宜的模型浪费时间。

<a name="four-ways-to-switch-models"></a>

### 四种切换模型的方式

按优先级从高到低排列：

**1. 启动参数（一次性）：**

```bash
claude --model opus      # 最强推理
claude --model sonnet    # 日常编码（默认）
claude --model haiku     # 快速轻量
```

**2. 斜杠命令（会话中）：**

```
/model            # 交互式模型选择器
/model sonnet     # 直接切换
```

选择会保存到用户设置中，重启后依然生效。

**3. 环境变量（持久化）：**

```bash
export ANTHROPIC_MODEL="sonnet"
```

**4. 配置文件（持久化，推荐）：**

```json
// ~/.claude/settings.json — 适用于所有项目
{
  "model": "sonnet"
}
```

```json
// project/.claude/settings.json — 仅当前项目
{
  "model": "opus"
}
```

> **注意：** 优先级顺序：`--model` 参数 > `ANTHROPIC_MODEL` 环境变量 > `settings.json` 中的 `model` 字段。`/model` 命令会将选择写入用户设置文件。

<a name="settings-file-hierarchy"></a>

### 配置文件层级

Claude Code 有三个层级的配置文件，每一层都会覆盖上一层：

```
全局    ~/.claude/settings.json                 （所有项目）
              ↓ 被以下覆盖
项目    project/.claude/settings.json           （团队共享，已提交）
              ↓ 被以下覆盖
本地    project/.claude/settings.local.json     （个人使用，gitignore 忽略）
```

| 文件 | 范围 | 是否提交到 Git | 优先级 |
| ------------------------------------- | --------------------- | -------------- | -------- |
| `~/.claude/settings.json` | 全局（所有项目） | 否 | 低 |
| `project/.claude/settings.json` | 项目（团队共享） | 是 | 中 |
| `project/.claude/settings.local.json` | 项目（个人） | 否（gitignore） | 高 |

`CLAUDE.md` 也遵循同样的模式，我们接下来会看到。

<a name="core-configuration"></a>

## 核心配置

<a name="settings-json-permissions-and-defaults"></a>

### settings.json：权限与默认设置

`settings.json` 控制 Claude Code 在无需询问的情况下被允许执行的操作。最重要的部分是 `permissions`：

```json
{
  "permissions": {
    "allow": [
      "Read", // read files
      "Write", // write files
      "Bash(npm *)", // run npm commands
      "Bash(git *)", // run git commands
      "Bash(node *)" // run node commands
    ],
    "deny": [
      "Bash(rm -rf *)" // block dangerous deletes
    ]
  },
  "model": "sonnet",
  "autoCompactThreshold": 80
}
```

> **警告：** 请谨慎设置权限。过于宽泛的白名单会让 AI 做出你意料之外的操作。如果你是初学者，保持默认设置并确认每一步操作 — 确认提示正是你审查每个步骤的机会。

<a name="claude-md-the-project-handbook"></a>

### CLAUDE.md：项目手册

CLAUDE.md 是**最重要的配置文件，没有之一**。把它想象成你为新实习生写的入职手册：项目背景、技术栈、编码规范和当前状态。

没有它，Claude Code 必须在每次会话中重新了解你的项目。有了它，AI 从第一条消息开始就掌握全部上下文。

**一个可以直接复制并修改的模板：**

````markdown
# 项目名称

## 概述

一句话描述这个项目的功能。

## 技术栈

- 前端：Next.js 14 + TypeScript + Tailwind CSS
- 后端：Next.js API Routes
- 数据库：Prisma + SQLite
- 部署：Vercel

## 项目结构

```
src/
├── app/          # Next.js App Router 页面
├── components/   # React 组件
├── lib/          # 工具函数和配置
├── prisma/       # 数据库 schema 和迁移
└── types/        # TypeScript 类型定义
```

## 编码规范

- 函数式组件 + React Hooks
- 组件使用 PascalCase 命名（如 BookmarkCard.tsx）
- API 路由返回统一格式：{ success, data?, error? }
- 所有数据库访问通过 Prisma client 进行

## 当前状态

- [x] 项目已初始化，数据库 schema 完成
- [ ] 书签 CRUD API 开发中
- [ ] 前端页面尚未开始

## 禁止事项

- 不要提交 prisma/dev.db 或 .env
- 不要修改迁移文件
- 开始任何新功能前先创建分支
````

**CLAUDE.md 的三个层级。** 大多数人只知道项目根目录的那一个，但实际上有三个层级，它们会叠加生效：

| 层级 | 路径 | 范围 | 写入内容 |
| ------- | ----------------------- | ----------------- | ------------------------------------------------------------------------- |
| 全局 | `~/.claude/CLAUDE.md` | 所有项目 | 个人习惯（"始终用英语回复"、"不要自动提交"） |
| 项目 | `project/CLAUDE.md` | 当前项目 | 技术栈、架构、规范、状态（提交到 Git，与团队共享） |
| 文件夹 | `src/payment/CLAUDE.md` | 该子目录 | 模块特定规则（如支付模块的注意事项） |

优先级：文件夹 > 项目 > 全局。它们是累加关系，不会冲突。

**两种官方创建方式：**

- **`/init` 用于项目层级** — 在项目根目录运行 `claude`，输入 `/init`，Claude 会扫描项目并生成 CLAUDE.md 草稿供你完善。项目有一定内容后使用效果最好。
- **`/memory` 用于全局层级** — 在会话中输入 `/memory`，选择全局 CLAUDE.md 进行编辑。修改后需要重启 Claude Code 才能生效。

**最佳实践：**

1. **保持更新** — 随着功能完成和踩坑经验的积累及时更新。
2. **要具体** — 写明确的版本号、真实的目录结构。
3. **记录禁止事项** — "不要碰迁移文件"这样的规则和任何正向指令一样有价值。
4. **保持简洁** — AI 需要关键事实，不是长篇大论。
5. **只放顶层不变规则** — Karpathy 公开分享的规则文件仅用几百行通用规则就获得了 10 万+ star。如果一条规则不是顶层的、不变的、严格的，那它应该放在别处（见下一节）。

<a name="three-layers-of-memory"></a>

### 三层记忆系统

Claude Code 的记忆分为三层，每层回答不同的问题：

| 层级 | 是什么 | 如何加载 | 由谁维护 |
| ----------------- | -------------------------- | ------------------------------- | ----------------------- |
| 1. CLAUDE.md | 你明确写下的规则 | 会话开始时完整加载 | 你自己 |
| 2. Auto Memory | Claude 自己写的笔记 | 先加载索引，按需加载子文件 | Claude，你负责审查 |
| 3. 参考文档 | 你编写的专业文档 | 仅在任务需要时加载 | 你自己 |

**第 1 层 — CLAUDE.md** 是你的显式规则手册，上文已经介绍过。

**第 2 层 — Auto Memory** 是 Claude 自己的笔记本。你从未写下过的习惯、反馈和项目事实，会由后台代理记录下来。通过 `/memory` 启用，选择 "Enable Auto Memory"。它记录四种类型的条目：

| 类型 | 含义 | 示例 |
| ----------- | -------------------- | ------------------------------------------------- |
| `user` | 关于你 | 你的角色、偏好（"不喜欢深色 UI"） |
| `feedback` | 你给出的纠正 | "别那样做" / "对，就是这样" |
| `project` | 项目事实 | 进度、决策、技术选择 |
| `reference` | 外部引用 | "设计文档在 docs/design.md" |

实际使用体验：

- 它是**项目范围**的 — 每个项目积累自己的记忆。
- 它很**轻量** — 只加载索引（`memory.md`），子文件只在相关时读取。
- 会话中按 `Ctrl+O` 可以查看实际使用了哪些记忆。
- 如果它记错了什么，只需说 _"忘掉我不喜欢深色主题这件事"_ 它就会删除该条目。

> **提示：** 一句话区分两者：CLAUDE.md 是**显式规则手册，完整注入**；Auto Memory 是**隐式笔记本，按需注入**。两者结合让 Claude Code 随着时间推移越来越了解你。

**第 3 层 — 自编参考文档（渐进式披露）。** 有些知识太过专业或篇幅太长，不适合放在 CLAUDE.md 中，但在需要时必须可用。编写专门的文档并在 CLAUDE.md 中添加指引：

```markdown
## 参考文档

- 修改颜色、字体或间距 → 先阅读 docs/brand-visual.md
- 编写 UI 文案或按钮标签 → 先阅读 docs/copywriting-style.md
- 定义 API 响应格式 → 先阅读 docs/api-conventions.md
```

Claude 只在任务需要时才读取完整文档 — 在需要时精准提供，其他时候零开销。

> **洞见：** Agent 中所有的"记忆"本质上是同一个技巧：在正确的时机将压缩后的上下文注入模型。这些机制就是提示词工程（prompt engineering），只是被组织成了层次化的结构方便你使用。

<a name="claudeignore"></a>

### .claudeignore

类似 `.gitignore`，但面向 AI — 告诉 Claude Code 哪些内容永远不需要读取：

```
# .claudeignore
node_modules/      # dependencies (huge, the AI doesn't need them)
.next/             # build output
dist/              # compiled output
*.log              # log files
.env               # secrets
```

<a name="daily-commands-and-interactions"></a>

## 日常命令与交互

熟练掌握日常用法，就像上高速前先学会踩踏板和看后视镜。

**启动会话：**

```bash
claude                              # start in the current directory
claude --project-dir /path/to/app   # start in a specific project
claude --model sonnet               # start with a specific model
claude -p "list all JS files here"  # one-shot mode, exits when done
```

在执行操作之前，Claude Code 会请求确认：

| 操作 | 示例 | 你可以 |
| ---------- | --------------------- | ---------------------------------- |
| 创建文件 | `index.html` | **Enter / y** 确认 |
| 编辑文件 | `app.js` 第 10 行 | **n** 拒绝 |
| 运行命令 | `npm install express` | 输入额外信息来调整计划 |
| 删除文件 | `temp.txt` | |

<a name="slash-command-cheat-sheet"></a>

### 斜杠命令速查表

在输入框中输入 `/` 可以查看完整列表；`/help` 会解释每个命令。

**日常使用的基础命令：**

| 命令 | 用途 | 何时使用 |
| ---------- | -------------------------------- | ------------------------------------- |
| `/help` | 显示帮助 | 忘记命令时 |
| `/model` | 查看/切换模型 | 切换到更强/更快的模型 |
| `/compact` | 压缩对话上下文 | 长会话中，AI 开始"遗忘"时 |
| `/clear` | 完全清除对话 | 开始全新任务时 |
| `/context` | 显示上下文占用情况 | 诊断 token 使用 |
| `/memory` | 编辑 CLAUDE.md 和自动记忆 | 管理记忆层 |
| `/status` | 会话状态 | 检查模型和 token 使用 |
| `/cost` | 会话费用 | 监控花费 |
| `/review` | 代码审查 | 完成功能后 |
| `/init` | 自动生成 CLAUDE.md | 新项目的第一件事 |
| `/plan` | 进入 Plan 模式（只读） | 复杂任务的起手式 |
| `/rewind` | 回退 Claude 的更改 | "撤销按钮" |
| `/resume` | 恢复历史会话 | 继续昨天的工作 |

**扩展管理：**

| 命令 | 用途 |
| --------------- | ------------------------------------- |
| `/skill <name>` | 手动调用 Skill |
| `/agent` | 创建、列出或调用子代理 |
| `/plugin` | 插件管理器（发现 / 已安装） |
| `/login` | 使用 Claude 订阅登录 |

<a name="the-four-commands-you-must-master"></a>

### 必须掌握的四个命令

**`/compact` — 上下文压缩。** 这是"AI 越用越笨"的解药。每条消息、每次文件读取、每条命令输出都在挤压上下文窗口。窗口可能有 200K token，但只有 60–80% 保持高效，而且随着填充增加质量会下降。`/compact` 会总结到目前为止的对话并释放空间：

```
> /compact

Context compressed. Summary:
- Building a bookmark manager
- Done: database design, API endpoints
- Now: frontend pages
```

**`/context` — 上下文监视器。** 在压缩之前运行它，看看_是什么_在吃掉窗口：

```
> /context

Used: 142,000 / 200,000 tokens (71%)
├── Conversation history: 89,000
├── CLAUDE.md:             2,100
├── Skills:               12,500
└── MCP tools:             4,800
```

> **提示：** 我的习惯：一旦 `/context` 显示使用量超过 60%，就执行 `/compact`。不要等到接近满载时的自动压缩 — 到那时 AI 已经开始遗忘了。

**`/compact` 与 `/clear` 的区别：**

| 命令 | 效果 | 何时使用 |
| ---------- | ------------------------------------------------------ | ------------------------------------- |
| `/compact` | 将历史压缩为摘要，保留关键决策 | 同一任务，对话太长 |
| `/clear` | 完全清除，重新开始 | 一个任务完成，开始另一个 |

> **经验法则：** 宁可用多次 `/clear` 配合新鲜的背景，也不要维持一个无尽的长对话。每次 `/clear` 都给 AI 一个重新聚焦的机会。

**`/rewind` — 撤销按钮（双击 `Esc` 也可以）。** 当 Claude 修改了代码而你不满意结果时，`/rewind` 会打开回退菜单：

```
[Rewind] Choose rollback mode:
  1. Conversation only     → keep files, drop recent turns
  2. Conversation + files  → recommended, return to a checkpoint
  3. Files only            → keep the conversation, restore files
```

> **警告：** `/rewind` 只能撤销 **Claude 自己编辑的文件**。它执行的终端命令（安装依赖、修改数据库）不会被回退。真正的撤销按钮是 Git — 参见 [Git 是你的存档点](#git-is-your-save-point)。

<a name="keyboard-shortcuts"></a>

### 快捷键

| 快捷键 | 操作 |
| --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `Enter` | 发送消息 / 确认操作 |
| `Shift + Enter` | **也会发送！**（不是换行 — 初学者经常因此发送写了一半的提示词） |
| `Option + Enter`（Mac）/ `Ctrl + Enter`（Win） | 换行不发送 |
| `Ctrl + C` | 中断当前操作 |
| `Esc` | 取消进行中的生成 |
| `Esc` × 2 | 打开 `/rewind` 回退菜单 |
| `Shift + Tab` | 循环切换 Normal → Auto-Accept → Plan 模式 |
| `↑` / `↓` | 浏览消息历史 |
| `Ctrl + B` | 将正在运行的命令发送到后台 |
| `Ctrl + O` | 查看本次会话中使用的 Auto Memory 内容 |

<a name="power-interactions"></a>

### 高级交互：!、@ 与图片

**1. `!` — Bash 模式。** 在不离开对话的情况下运行 shell 命令：

```
> !npm run dev
> !node app.js
```

如果命令永远不会退出（比如开发服务器），按 `Ctrl+B` 将其推入后台继续对话。

**2. `@file` — 精确上下文。** Claude 不会将整个项目加载到上下文中；它按需搜索。用 `@` 指定文件可以省去探索的成本：

```
> 参照 @src/auth/login.ts 的风格，在 @src/auth/ 下添加 register.ts

> 提示词太长不想打？先写进文档：
> 实现 @docs/feature-spec.md 中的需求
```

> **提示：** 反直觉但真实：更短的指令可能花费_更多_ token，因为 Claude 必须探索项目来猜测你的意思。具体的指令 + 显式的 `@` 引用既便宜又准确。

**3. 粘贴图片。** 将图片拖入输入框或按 `Ctrl+V`。非常适合：

- 将设计稿转化为 UI 代码
- 粘贴错误截图进行诊断
- 根据架构图实现系统

**4. 实用的启动参数：**

```bash
claude -c                             # --continue：恢复上次会话
claude --permission-mode plan         # 直接进入 Plan 模式
claude --dangerously-skip-permissions # "绿灯"模式：永远不再询问
```

> **警告：** `--dangerously-skip-permissions` 只在沙箱环境、完全被 Git 覆盖的项目、或一次性实验中才是合理的。绝不要在生产代码中使用。初学者应保持默认模式。

<a name="the-right-workflow-explore-plan-implement-commit"></a>

## 正确的工作流：探索、规划、实现、提交

官方推荐的工作流分为四个阶段：

```
┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌──────────┐
│  Explore │ →  │   Plan   │ →  │  Implement   │ →  │  Commit  │
│ 阅读代码 │    │ 提出方案 │    │ 执行已批准   │    │ 提交工作 │
│          │    │          │    │ 的方案       │    │          │
└──────────┘    └──────────┘    └──────────────┘    └──────────┘
      ↑                                                    │
      └────────────────── 下一个任务 ──────────────────────┘
```

| 阶段 | 你做什么 | AI 做什么 | 模式 |
| --------- | --------------------------- | ----------------------------------------- | -------------------- |
| 探索 | 指向要修改的区域 | 读取文件、搜索、追踪引用 | Plan 模式 |
| 规划 | 审查方案 | 编写详细计划、检查边界情况 | Plan 模式 |
| 实现 | 批准并切换模式 | 按顺序编辑文件、运行构建 | Normal / Auto-Accept |
| 提交 | 请求提交消息 | 生成消息、提交 | Normal |

> **提示：** 为什么要分阶段？想象一下：你说"加个软删除"，15 分钟后 AI 改了 14 个文件、修改了全局查询过滤器、破坏了 3 个现有端点 — 留给你手动回退。**这就是跳过规划的代价。** Plan 模式中的五分钟，通常能省下三十分钟的返工。

<a name="plan-mode-and-the-three-operating-modes"></a>

### Plan 模式与三种运行模式

Claude Code 有**三种互斥的运行模式**：

| 模式 | 行为 | 适合 | 状态栏 |
| ---------------- | ------------------------------------------- | -------------------------------------------- | ----------------- |
| Normal（默认） | 每次编辑和命令都需要确认 | 小任务、仔细审查 | （无标记） |
| Auto-Accept | 不询问直接执行 | 已批准的批量工作 | `accept edits on` |
| Plan 模式 | 完全只读：分析、提问、提议 | 复杂任务、不熟悉的代码、架构设计 | `plan mode on` |

在 Plan 模式下，AI 只能使用只读工具：

| 工具 | 用途 |
| -------------------- | ----------------------------------------- |
| Read | 查看文件内容 |
| Glob | 按模式查找文件 |
| Grep | 搜索文件内容 |
| LS | 列出目录 |
| WebSearch / WebFetch | 在线调研 |
| Task | 将研究任务委派给只读子代理 |
| AskUserQuestion | 向你提出澄清性问题 |

在 Plan 模式下，写文件、编辑文件和运行 shell 命令是**严格禁止的** — 在你批准方案之前，项目中不会有任何更改。

**四种进入 Plan 模式的方式**（从临时到持久）：

```
1. Shift+Tab 两次          → 循环切换到 Plan 模式（最常用）
2. /plan                    → 斜杠命令（v2.1.0+）
3. claude --permission-mode plan        → 启动参数
4. settings.json "defaultMode": "plan"  → 项目默认
```

第一次 `Shift+Tab` 切换到 Auto-Accept，第二次到 Plan 模式，第三次回到 Normal。

> **注意：** 在某些 Windows 终端上，`Shift+Tab` 会跳过 Plan 模式，只在 Normal/Auto-Accept 之间切换。请改用 `Alt+M` — 这是一个已知问题。

在项目的 `.claude/settings.json` 中设置 `defaultMode: "plan"`，该项目每次会话都会以 Plan 模式启动 — 对于复杂代码库来说是一个很好的默认设置。

<a name="when-to-plan-and-when-to-just-do-it"></a>

### 何时规划，何时直接动手

一条简单的规则：

> **如果你能用一句话描述预期的 diff，跳过规划。如果不能，先规划。**

| 任务 | 推荐模式 | 原因 |
| -------------------------------------------- | ---------------- | --------------------------------------- |
| 从零开始的新项目 | Plan 模式 | 先做架构决策 |
| 复杂功能（认证、计费、软删除） | Plan 模式 | 涉及多个文件，回退成本高 |
| 大规模重构、跨文件迁移 | Plan 模式 | 需要评估影响范围 |
| 探索不熟悉的代码库 | Plan 模式 | 本质上就是只读的 |
| 修复一个明确的 Bug | Normal | 范围和目标都很清晰 |
| 重命名函数或变量 | Normal | diff 用一句话就能描述 |
| 按已批准方案批量执行 | Auto-Accept | 不要打断执行过程 |

> **核心原则：** 简单任务直接做；复杂任务先规划。拿不准时，选择 Plan 模式 — 它永远是更安全的选择。

**一个成本优化的变体：** `claude --model opusplan` 在规划阶段使用 **Opus**（推理能力强，价格高），在实现阶段使用 **Sonnet**（快速，便宜）— 用贵模型深入思考，用便宜模型敲字。

<a name="walkthrough-building-a-hello-api-with-express"></a>

### 实战演练：用 Express 构建一个 Hello API

让我们在一个小项目上走一遍完整的工作流。

**第 1 步 — 初始化：**

```bash
mkdir hello-api && cd hello-api
claude
```

然后，在对话中：

```
初始化一个 Node.js Express 项目：
1. npm init 创建 package.json
2. 安装 express
3. 创建 app.js 作为入口文件
4. 添加 GET /hello 返回 { message: "Hello AI Coding!" }
5. 使用端口 3000
```

Claude 会列出每个操作并在执行前询问：

```
[Claude] Will run: npm init -y           → y
[Claude] Will run: npm install express   → y
[Claude] Will create file: app.js        → y
```

生成的 `app.js`：

```javascript
const express = require("express");

const app = express();
const PORT = 3000;

app.get("/hello", (req, res) => {
  res.json({ message: "Hello AI Coding!" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/hello`);
});
```

**第 2 步 — 运行和验证：**

```
启动服务器并用 curl 测试 /hello
```

然后在浏览器中打开 `http://localhost:3000/hello`。如果看到以下 JSON，说明成功了：

```json
{
  "message": "Hello AI Coding!"
}
```

**第 3 步 — 提交：**

```
初始化 Git 仓库并以 "Init Express Hello World API" 为消息提交
```

Claude 执行 `git init`、`git add .` 和 `git commit`。四个阶段完成：没有探索（新项目）、内联规划、实现、提交。

<a name="best-practices"></a>

## 最佳实践

<a name="prompt-writing-principles"></a>

### 提示词编写原则

**1. 要具体，不要模糊：**

```
BAD:  Add a login feature
GOOD: Create a login API under /api/auth/:
      - POST /api/auth/login
      - Accepts { email, password }
      - Verify the password with bcrypt
      - Return a JWT on success
      - Use the existing Prisma client to query the User table
```

**2. 以现有代码作为参考：**

```
GOOD: Following the style of /api/bookmarks/route.ts, create similar CRUD
      endpoints under /api/tags/. The data model is the Tag table in
      prisma/schema.prisma.
```

**3. 执行前先要求规划：**

```
GOOD: I want to add search to the bookmark manager. First list which files
      need to change and show me the plan. Start only after I confirm.
```

**4. 一次做一件事：**

```
BAD:  Add search, tag management, auth, and export — all at once
GOOD: Implement bookmark search first:
      - Add a search box to the list page
      - Search by title and description
      - Filter results live on the frontend
```

<a name="context-management"></a>

### 上下文管理

一个针对你实际会遇到的症状的快速决策表：

| 症状 | 原因 | 操作 |
| ---------------------------------------- | ----------------------------------- | ------------------------------------ |
| 响应变慢，质量下降 | 上下文接近满载 | `/context` → 如果超过 60%，执行 `/compact` |
| AI "忘记"了早期决策 | 早期信息被挤出窗口 | 立即 `/compact` |
| AI 重新问已经回答过的问题 | 上下文混乱 | `/clear`，重新开始 |
| 切换到完全不同的任务 | 避免跨任务污染 | `/clear`，重新开始 |
| 希望规则永久生效 | 需要持久记忆 | `/memory` 或写入 CLAUDE.md |

<a name="git-is-your-save-point"></a>

### Git 是你的存档点

把 Git 想象成你的**游戏存档系统**。打 Boss 之前你会存档；输了就重新读档。使用 Claude Code 的项目完全一样：**在每个好的检查点存档；出问题时读档。**

AI 编码的一个特性让这一点不可妥协：Claude Code 是**非确定性的**。同样的请求提两次，你可能得到两种不同的实现。这不是 Bug — 这是工具的本质。养成肌肉记忆：**每个成功步骤后都提交。** 有 Git 作为安全网，你可以让 Claude 尝试大胆的方案。

```
黄金法则：在让 AI 做大改动之前先提交

1. git commit              → 保存当前状态
2. AI 实现功能
3. 测试
   ├── 成功  → git commit → 下一个功能
   └── 失败 → git checkout . → 换一种方式重试
```

```bash
# 开始前保存
git add . && git commit -m "checkpoint: before adding search"

# ... Claude 实现功能 ...
# 如果出错了：
git checkout .

# 如果成功了：
git add . && git commit -m "feat: search"
```

> **陷阱：** 最常见也最令新手痛苦的做法是在不先提交的情况下让 AI 重写代码 — 然后损失无法挽回。记住：**改动之前先存档。**

<a name="controlling-costs"></a>

### 控制成本

| 策略 | 方法 | 典型节省 |
| ------------------ | -------------------------------------------------- | ---------------- |
| 分级使用模型 | Haiku 处理简单任务，Sonnet 处理常规任务，Opus 处理难题 | 30–50% |
| 精确的提示词 | 减少修正轮次 | 20–30% |
| 及时 `/compact` | 避免重复发送长上下文 | 10–20% |
| `/cost` 监控 | 实时了解花费 | — |
| 预算上限 | 在 Anthropic Console 设置月度限额 | 防止超支 |

```
> /cost

Session cost:
  Input tokens:  15,234
  Output tokens:  8,721
  Estimated:     $0.18
```

Anthropic 还发布了六个节省 token 的具体习惯 — 在任务之间清除会话、尽早锁定模型以保护提示缓存、用 `@` 指定文件、抑制嘈杂的命令输出、在新会话中检查 `/context`、以及在休息前压缩。我用官方数据总结了它们：{% post_link Six-money-saving-tips-for-Claude-Code [Claude Code 六大省钱技巧] %}。

<a name="working-in-large-codebases"></a>

### 在大型代码库中工作

以上都是通用建议。对于**数十万行代码、多人协作的代码库**，Anthropic 的大型代码库手册增加了六条实践。核心矛盾在于：即使是巨大的上下文窗口也比不上一个真实的代码库。前三条是纪律，后三条是武器。

**纪律 1 — 第一天就 `/init`。** 在新项目中运行 `/init`，然后在生成的 CLAUDE.md 中手动添加三项内容：

| 必须添加 | 原因 | 示例 |
| ---------------- | -------------------------------- | ------------------------------------------------ |
| 目录地图 | 让 AI 知道代码在哪里 | "认证逻辑在 src/auth/，UI 在 src/components/" |
| 禁区 | 让 AI 不会破坏任何东西 | "绝不修改 prisma/migrations/ 或 vendor/" |
| 团队规范 | 保持一致的风格 | "所有 API 返回 { success, data, error }" |

**纪律 2 — 小而聚焦的任务。** 在大型代码库中最危险的操作是向 AI 抛出一个巨大的请求：

```
BAD:  Refactor the whole payment module: new risk control, reconciliation,
      notifications, and reports
GOOD: Step one — extract the risk-rules engine under src/payment/risk/.
      Interface spec in docs/risk-rules.md. Don't touch callers yet.
```

经验法则：一个任务应该涉及 **≤ 5 个文件 / ≤ 200 行改动**。超出这个范围就拆分。

**纪律 3 — 频繁重置上下文。** 很多初学者认为对话越长 AI 越聪明。在大型代码库中恰恰相反：陈旧片段和之前任务中失败的尝试会污染后续任务。

| 时机 | 操作 |
| -------------------------------- | ------------------------- |
| 任务完成（PR 已合并） | `/clear` |
| 同一任务，对话太长 | `/compact` |
| 想要完全重新开始 | 退出并重新启动 `claude` |

**武器 1 — 先用 Plan 模式。** 在不熟悉的代码库中，或任何涉及多处修改的变更，先用 `/plan` 或 `Shift+Tab` 两次进入。只读探索，批准方案，然后执行。回退成本接近于零。

**武器 2 — 将研究工作交给子代理和 Skills。** 像"找到这个已弃用 API 的所有调用点"或"画出这个模块的依赖图"这样的调查会消耗大量 token。不要在主会话中运行 — 委派给子代理（只有结论会返回）或将工作流打包为可复用的 Skill。

**武器 3 — 连接 MCP 和 LSP。** 真正的工程师不只是读代码：他们查 Jira、查数据库、使用"跳转到定义"。MCP 将这些能力引入：

| 集成 | 解决的问题 | 示例 |
| -------------------- | -------------------------------- | ------------------------------------- |
| GitHub MCP | PR、Issue、CI 日志 | "这个 Bug 在 PR #1234 中讨论过吗？" |
| 数据库 MCP | 直接查询 | "有多少用户的 deleted_at 被设置了？" |
| Jira / Linear MCP | 任务卡片 | "按 PROJ-123 实现" |
| LSP | 精确跳转、类型、引用 | IDE 级"查找所有引用" |
| Sentry / Datadog MCP | 告警、堆栈追踪 | "显示过去一小时的 5xx 错误" |

速查卡片：

| 实践 | 命令 / 入口 | 何时 | 收益 |
| ----------------- | ------------------------- | ----------------------- | -------------------------- |
| 项目初始化 | `/init` + 手动编辑 | 项目第一天 | 地图 + 禁区 |
| 任务拆分 | （习惯） | 每次请求前 | 不会大面积破坏 |
| 上下文重置 | `/clear` / `/compact` | 任务结束 / 长上下文 | 无污染，更少 token |
| 先规划 | `/plan` 或 `Shift+Tab ×2` | 复杂任务 | 先探索再行动 |
| 研究外包 | 子代理 / Skill | 频繁的调研 | 保护主上下文 |
| 工具集成 | `claude mcp add ...` | 项目设置 | 看到代码之外的信息 |

<a name="three-overlooked-advanced-tips"></a>

### 三个容易被忽视的进阶技巧

这三条在官方指导中反复出现，却最常被初学者跳过。

**1. 从子目录启动，而非仓库根目录。** 在 monorepo 中反直觉，但至关重要：

```bash
# BAD: 从 monorepo 根目录启动
user@monorepo $ claude
# AI 看到 300 个服务和数千个包 → 上下文污染

# GOOD: 在你要修改的服务目录内启动
user@monorepo $ cd services/payment
user@monorepo/services/payment $ claude
# Claude 会向上遍历并加载沿途所有的 CLAUDE.md，
# 但它的工作范围被精确限制在相关代码内
```

配合每个子目录下放一个小型 CLAUDE.md，列出**该目录自己的测试和 lint 命令** — 这样 AI 就不会在修改一个服务后运行整个仓库的测试套件。

**2. 每 3–6 个月审查一次配置。** 为去年的模型编写的指令可能在今年的模型上起反作用。Anthropic 给出的两个真实例子：

| 过时的配置 | 曾经有用 | 现在有害 |
| ---------------------------------------------- | ------------------------------------- | -------------------------------------------------------------- |
| CLAUDE.md 中"每次重构只改一个文件" | 让旧模型保持专注 | 新模型能跨文件协调；这条规则变成了束缚 |
| 每次写入时运行 `p4 edit` 的 Hook | 在原生 Perforce 支持之前需要 | 多余 — Perforce 现在已被原生支持 |

设一个日历提醒：每次主要模型发布后，重新阅读 `CLAUDE.md`、`.claude/settings.json`、hooks 和 skills，问自己：_这条规则还需要吗？现在有更好 way 了吗？这是在补偿哪个模型的弱点？_ 如果 Claude Code 感觉卡在瓶颈期，问题通常不在模型 — 而是配置没有跟上。

**3. 团队需要一个负责人（DRI / Agent Manager）。** 面向团队而非个人：最快推广 Claude Code 的组织会先让一个小团队负责基础设施。

| 团队规模 | 角色 | 职责 |
| ----------------- | -------------------------------------- | ------------------------------------------------ |
| 小型（< 20 人） | DRI — 一位有兴趣的志愿者 | 项目 CLAUDE.md、共享 Skills、插件选择 |
| 中型 | Agent Manager（半个 PM，半个工程师） | 跨团队推广、权限策略、安全 |
| 大型 / 合规要求 | 跨职能工作组 | 工程 + 安全 + 治理 + 合规 |

为什么重要：开发者使用 Claude Code 的**第一次**体验决定了整个推广是否成功。如果第一天就是"AI 搞坏了我的代码"，要赢回信任很难。

<a name="starter-kit-for-new-projects"></a>

## 新项目启动套件

每个新项目开始时，Claude Code 就像一个新员工：不了解你的技术栈、你的禁区、你的规范。默认的 Claude Code 是一个什么都能做但什么都不了解的通才。解决方案：把一次性的解释变成可复用的配置文件。**四个文件，五分钟设置好，未来每个项目都是预训练过的。**

**文件 1 — 全局 CLAUDE.md**（你的个人默认设置）：

```markdown
## 沟通方式

- 用英语回复；代码、命令和路径也保持英语
- 结论先行，简洁，不要铺垫背景
- 给出真实判断 — 直接指出我的方案有什么问题

## Git

- 除非我要求，否则不要自动提交或推送
- 提交前显示变更摘要
- 提交消息用简洁的英语

## 红线

即使在 Auto-Accept 模式下，以下操作也必须先询问：

- 删除文件、目录或 git 历史
- 修改 .env、密钥、token、证书、CI/CD 配置
- git push / rebase / reset --hard / force push
- 发布（npm publish、生产部署）
```

在其上叠加项目级 CLAUDE.md，写入技术栈、目录地图、提交格式和禁区。维护规则：**每次 Claude 让你踩坑，就在 CLAUDE.md 中加一行。** 三个月后这个文件就变成了"Claude 在这个项目上犯过的每个错误 — 都被预防了"。你将打出的最有生产力的一句话：_"更新 CLAUDE.md 确保这种事不再发生。"_

**文件 2 — settings.json**（让安全操作通过，锁定危险操作）：

```json
{
  "permissions": {
    "allow": [
      "Read",
      "Glob",
      "Grep",
      "Edit",
      "MultiEdit",
      "Write(src/**)",
      "Write(tests/**)",
      "Bash(npm *)",
      "Bash(pnpm *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git add *)",
      "Bash(git commit *)"
    ],
    "deny": [
      "Read(**/.env*)",
      "Read(**/*.pem)",
      "Read(**/*.key)",
      "Write(**/.env*)",
      "Write(**/secrets/**)",
      "Bash(rm -rf *)",
      "Bash(sudo *)",
      "Bash(git push *)",
      "Bash(git rebase *)",
      "Bash(curl * | sh)"
    ],
    "defaultMode": "acceptEdits"
  }
}
```

效果：日常操作零提示，危险操作自动拦截。根据你的工具链（yarn、bun……）调整 `allow`；保持 `deny` 列表作为安全底线。

**文件 3 — .gitignore 补充**（防止 AI 工具配置和密钥被提交）：

```gitignore
# AI 工具本地配置
.claude/settings.local.json
.cursor/

# 密钥和凭证
*.pem
*.key
credentials.json
```

注意分离：`.claude/settings.local.json` 被忽略，但 `.claude/settings.json` 和 `.claude/skills/` 会被提交 — 团队配置共享，个人偏好保持私有。

**文件 4 — 几个 Skills**（你的预检清单命令）。每个 Skill 是 `.claude/skills/<name>/SKILL.md` 中的 Markdown 文件。最有价值的三个：

- **`/review`** — 按严重程度审查代码：CRITICAL（逻辑错误、空指针、竞态条件、安全漏洞）→ WARNING（N+1 查询、缺少错误处理）→ INFO（命名、死代码）。以"X 个严重，Y 个警告，Z 个信息"结尾。
- **`/commit`** — 运行 `git status` 和 `git diff --stat`，按逻辑分组变更，以 `type(scope): description` 格式编写消息。
- **`/deploy-check`** — 发布前关卡：类型检查 → 测试 → lint → 构建 → 搜索遗留的 `console.log` → 验证 `.env` 引用 → 确认工作树干净。全部通过才发布。

**三种安装套件的方式：**

| 情况 | 方法 |
| -------------------- | ----------------------------------------------------------------------------- |
| 全新项目 | 复制模板，填入技术栈，在第一次提交中包含配置 |
| 已有项目 | 在根目录添加 CLAUDE.md 和 .gitignore，合并 settings.json，放入 skills |
| 所有项目统一 | settings.json + skills 放在 `~/.claude/`（全局）；CLAUDE.md 按项目维护 |

推荐：权限和 Skills 全局化，CLAUDE.md 按项目维护。

**套件是有生命力的。** 模板的价值不在于"原样使用"，而在于"从这里开始，让它随你的项目成长"：CLAUDE.md 每次踩坑加一行，settings.json 随工具链扩展，Skills 吸收团队的规范。三个月后，模板已经被你的习惯塑造成了不同的样子 — 而这种变化就是价值所在。

<a name="faq"></a>

## 常见问题

**Q：安装时报错 `ENOENT: no such file or directory`**

npm 缓存损坏。运行 `npm cache clean --force`，然后重新安装。

**Q：安装好了，但找不到 `claude` 命令**

npm 全局路径不在你的 `PATH` 中。运行 `npm config get prefix`，将输出的路径添加到你的 `PATH` 环境变量中。

**Q：Windows 提示"在此系统上禁止运行脚本"**

PowerShell 执行策略问题。以管理员身份打开 PowerShell，运行 `Set-ExecutionPolicy RemoteSigned`。

**Q：启动时提示 `Invalid API Key`**

密钥错误或已过期。验证环境变量：`echo $ANTHROPIC_API_KEY`（macOS/Linux）或 `echo $env:ANTHROPIC_API_KEY`（PowerShell）。

**Q：通过代理/中继服务连接超时**

检查 `ANTHROPIC_BASE_URL`，在浏览器中确认中继服务正常运行，并用 `curl` 测试连通性。

**Q：`Rate limit exceeded`**

短时间内请求过多。等一分钟后重试；如果持续出现，升级套餐。

**Q：AI 修改了不该修改的文件**

首先用 `git checkout .` 回退。然后重新表述需求时明确指定范围（"只修改文件 X"），并将禁止的文件添加到 CLAUDE.md 中以防再次发生。

**Q：AI 陷入循环 — 修好 A 就破坏 B，修好 B 就破坏 A**

AI 缺乏全局视角。回退到稳定的提交，`/clear`，然后一次性重述包含所有约束的_完整_需求。

**Q：长对话后 AI "忘记"了早期内容**

上下文窗口接近满载。运行 `/compact`，或开启一个全新会话。

**Q：AI 推荐了一个不存在的 npm 包**

幻觉。安装 AI 建议的任何包之前，先去 npmjs.com 确认它存在。

**Q：觉得费用太高**

运行 `/cost` 查看实际花费，切换到更便宜的模型，保持对话简短，并在 Anthropic Console 中设置月度预算上限。

<a name="summary"></a>

## 总结

开箱即用的 Claude Code 是一个什么都能做但什么都不了解的通才。配置将它变成_你的_专家。整篇文章浓缩为三个习惯：

1. **改动之前先存档。** Git 才是真正的撤销按钮 — 每次 AI 大改动之前先提交，`/rewind` 就是锦上添花而非救命稻草。
2. **行动之前先规划。** 如果你不能用一句话描述预期的 diff，就从 Plan 模式开始。五分钟的规划省下三十分钟的返工。
3. **教一次，永久生效。** 每次踩坑变成 CLAUDE.md 中的一行；每个重复的工作流变成一个 Skill。模型能力是下限 — 配置质量是上限。

其他都是细节：

| 主题 | 一句话要点 |
| --------------- | ------------------------------------------------------------------------------------ |
| 模型 | Sonnet 日常用，Opus 解难题，Haiku 做批处理 |
| 记忆 | CLAUDE.md = 显式规则，Auto Memory = 隐式笔记，参考文档 = 按需加载 |
| 上下文 | `/context` 检查，超过 60% 就 `/compact`，任务间用 `/clear` |
| 模式 | 默认 Normal，已批准批量用 Auto-Accept，复杂任务用 Plan 模式 |
| 大型代码库 | `/init` + 小任务 + 频繁重置 + 子代理 + MCP |
| 成本 | 分级模型、精确提示词、及时压缩、`/cost` 监控 |

现在就去更新你的 CLAUDE.md — 这是你今天能花的最高杠杆率的五分钟。
