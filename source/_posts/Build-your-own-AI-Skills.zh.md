---
title: 搭建属于你自己的AI技能
lang: zh-CN
date: 2026-08-30 09:32:54
updated: 2026-09-26 00:00:00
comments: true
categories:
  - AI
tags:
  - Claude Code
  - Skills
  - AI Agent
  - LLM
  - Developer Tools
  - Automation
---

- [引言](#introduction)
- [什么是技能（Skill）](#what-is-a-skill)
- [为什么技能很重要](#why-skills-matter)
- [技能的解剖结构](#anatomy-of-a-skill)
  - [SKILL.md 文件](#the-skill-md-file)
  - [配角阵容](#the-supporting-cast)
- [动手搭建：从简单到完整](#build-your-own-from-simple-to-complete)
  - [Git 提交信息：只要一个 SKILL.md](#git-commit-messages-just-skill-md)
  - [API 端点生成器：加一份配置](#api-endpoint-generator-add-a-config)
  - [React 组件生成器：脚本与模板](#react-component-generator-scripts-and-templates)
  - [安全审计：参考文档](#security-audit-reference-documents)
  - [你需要哪种结构？](#which-structure-do-you-need)
- [寻找现成的技能](#find-ready-made-skills)
  - [官方技能库](#official-libraries)
  - [Skills CLI](#the-skills-cli)
  - [社区技能库](#community-libraries)
  - [安装前的安全检查](#safety-before-you-install)
- [将技能融入你的工作流](#integrating-skills-into-your-workflow)
- [迭代与版本管理](#iterating-and-versioning)
- [最佳实践](#best-practices)
- [常见问题](#faq)
- [总结](#summary)

<!--more-->

<a name="introduction"></a>

## 引言

这周你已经把同一个提示词敲了三遍。每一次，AI 给你的回答都略有不同——周一它用 Tab 缩进，今天它用空格，中间某次它还悄悄"优化"了一个你根本没让它碰的函数。

这就是**"吩咐"**与**"教会"**之间的区别。

当你和 AI 对话时，你给的是一条口头指令，模型每次都要重新解读一遍。而当你写下一个**技能（Skill）**时，你交给它的是一本成文的操作手册——一份标准作业程序（SOP），它可以每次都一字不差地照着执行，在每个项目里都保持一致。

> 如果提示词是一句口头命令，那么技能就是打印出来的 `SOP`。

这篇文章会告诉你：技能是什么、为什么重要，以及最重要的——如何搭建属于你自己的技能。读完之后，你将掌握一套可复用的方法，把那些"我又在敲同一个提示词"的时刻，变成你个人的 AI 工具箱。

<a name="what-is-a-skill"></a>

## 什么是技能（Skill）

**技能**是一组可复用的指令，它把某项特定能力打包起来。

想想做菜。每次凭记忆烧一道菜，你都可能漏掉某种配料或某个步骤。但如果把菜谱写下来一次，你就能每次都完美复刻——还能把它分享给别人。技能就是这样一份菜谱，只不过是写给 AI 的。

它与一次性提示词的对比正是全部意义所在：

| 维度     | 单个提示词           | 技能                          |
| -------- | -------------------- | ----------------------------- |
| 本质     | 一次性指令           | 可复用的标准流程              |
| 一致性   | 每次输出都不一样     | 每次都遵循同一标准            |
| 成本     | 每次都要重新写       | 触发一次即可                  |
| 维护     | 用完即弃             | 可版本化、可持续改进          |
| 类比     | 一句口头命令         | 一份成文的 SOP（标准作业程序）|

技能不是一种新模型，也不是运行在 AI"外部"的插件。它只是**指令加资源**，按照一定的结构组织起来，让 AI 能在需要时精准加载所需内容。正是这种简单性让它行之有效。

<a name="why-skills-matter"></a>

## 为什么技能很重要

四个实实在在的好处，按它们真正为你节省的程度排序：

1. **一致性** —— AI 每次都遵循同一标准。再也不用忍受"今天 Tab、明天空格"。
2. **效率** —— 复杂的多步骤工作流收缩成一次触发，而不是一段反复重写的提示词。
3. **可复用性** —— 一个技能可以跨项目、跨团队使用，最佳实践不再只存在于你的脑子里。
4. **可迭代性** —— 技能是一个你可以持续改进的文件，所以它会越用_越好_，而不是原地冻结。

这里有一个你早就熟悉的编程原则：**DRY —— Don't Repeat Yourself（不要重复自己）。** 它不仅适用于代码，也适用于提示词。如果类似的提示词你已经写了三遍，那就该把它变成技能了。

技能之所以重要的更深层原因是：大模型的训练数据里不可能内置每个领域的最佳实践。技能是你按需注入_你的_专业知识的方式——你团队的约定、你的安全标准、你的模板。这就是"聪明的通才"与_你的_领域专家之间的区别。

<a name="anatomy-of-a-skill"></a>

## 技能的解剖结构

先说一个人们最常搞错的点：**技能是一个文件夹，而不是一个文件。** 单个 Markdown 文件可能就够用了，但一个完整的技能是一个小型"能力包"，可能捆绑多种类型的文件。

继续用菜谱来类比：

- **`SKILL.md`** 是菜谱本身——菜名、步骤、注意事项。
- **`scripts/`** 是厨房工具抽屉——处理琐碎工作的辅助脚本。
- **`resources/`** 是配料包——模板、示例数据和配置。
- **`references/`** 是后墙的参考书架——AI 可以查阅的标准和文档。
- **`requirements.txt`** 声明脚本需要哪些第三方依赖包。

标准的目录结构长这样：

```
skill-xxx/                 # Skill root (naming: lowercase + hyphens)
├── SKILL.md               # Core: the instruction file (required)
├── scripts/               # Helper scripts (optional)
│   ├── helper.py
│   └── utils.js
├── resources/             # Bundled resources (optional)
│   ├── template/          # Code/report templates
│   ├── examples/          # Input/output examples
│   └── config/            # Config files (JSON/YAML)
├── references/            # Reference docs (optional)
│   ├── best-practices.md
│   ├── api-docs.md
│   └── standards.md
└── requirements.txt       # Dependency declarations (optional)
```

只有 `SKILL.md` 是必需的。其他一切都是可选的，只有在确实需要时才添加。

<a name="the-skill-md-file"></a>

### SKILL.md 文件

`SKILL.md` 是技能的心脏。它由两部分组成：一个可选的 **frontmatter**（元数据）块，以及承载实际指令的正文。

```markdown
---
name: react-component-generator # unique identifier
version: 1.0 # skill version
description: Generate React component files that follow project conventions
trigger: ["create component", "new React component"] # trigger keywords
tools: ["typescript", "react"] # dependent tools
author: your-name
---

# React Component Generator

## Execution Steps

1. Confirm the component name and requirements.
2. Create files under `src/components/{componentName}/`.
3. Generate code from the templates in `resources/template/`.
4. Run `scripts/validate.js` to verify the structure.

## Output Rules

- Report the list of created files when done.
- Provide a usage example.

## Error Handling

- If the directory exists, ask before overwriting.
- If dependencies are missing, print the install command.

## Example

(one complete input → output example)
```

frontmatter 是可选的——很多技能干脆不写它。但当一个技能需要被智能体系统_自动发现_时，`trigger` 和 `description` 字段就变得重要了。智能体在启动时只读取元数据，只有当任务匹配时才加载完整指令。这种**渐进式披露（progressive disclosure）**设计节省了上下文窗口的空间，这在长会话中至关重要。

<a name="the-supporting-cast"></a>

### 配角阵容

四个可选目录各自解决不同的问题：

**`scripts/` —— 辅助脚本。** 当技能需要真正的逻辑（数据清洗、批量文件操作、格式校验）时，把它移进脚本可以让 `SKILL.md` 保持干净。AI 只需调用脚本，而不用重新推导逻辑。

```python
# scripts/helper.py — encapsulate complex logic, call it from SKILL.md
def fill_missing_value(df, column, strategy="mean"):
    if strategy == "mean":
        df[column].fillna(df[column].mean(), inplace=True)
    elif strategy == "empty":
        df[column].fillna("", inplace=True)
    return df
```

**`resources/` —— 生产物料。** 模板、示例和配置文件。它们被_直接使用_来产出结果：

- `template/` —— AI 生成输出所依据的代码/文档模板。
- `examples/` —— 输入/输出示例对，展示"好的输出长什么样"。
- `config/` —— 存放规则和默认值的 JSON/YAML 文件，避免把它们硬编码进 `SKILL.md`。

**`references/` —— 参考书架。** 与 `resources/` 不同，这些内容_不会_被复制进输出；它们是 **AI 为了做出正确决策而阅读的知识**。编码规范、安全检查清单（如 OWASP Top 10）、API 文档和技术决策记录都属于这里。

> **一句话区分 `resources/` 与 `references/`：** `resources/` 是你用来构建的_物料_（模板、配置）；`references/` 是你用来查阅的_手册_（标准、规则）。

**`requirements.txt` —— 依赖声明。** 如果 `scripts/` 用到了第三方库，把它们列在这里，环境就能一步搭建完成。

```
pandas>=2.0.0
openpyxl>=3.1.0
```

<a name="build-your-own-from-simple-to-complete"></a>

## 动手搭建：从简单到完整

现在到了你期待已久的部分。搭建技能最重要的一条规则：

> **用能解决问题的最简单结构。**

不是每个技能都需要每个目录。下面四个示例从单文件一路演进到完整能力包，每个示例教会你结构中的一个组成部分。读完之后，你就会清楚_你的_技能到底需要多少结构。

<a name="git-commit-messages-just-skill-md"></a>

### Git 提交信息：只要一个 SKILL.md

**目标：** 每次都不假思索地生成一条 Conventional Commits 格式的提交信息。

这是最简单的技能——只有一个 `SKILL.md`，别无其他。

```
.claude/skills/git-commit/
└── SKILL.md
```

创建 `.claude/skills/git-commit/SKILL.md`：

```markdown
---
name: git-commit-standard
version: 1.0
description: Generate Conventional Commits messages from staged changes
trigger: ["commit", "git commit", "generate commit"]
---

# Git Commit Standardization

## Steps

1. Run `git diff --staged` to see the staged changes.
2. Classify the change:
   - feat: new feature
   - fix: bug fix
   - refactor: restructuring (no behavior change)
   - style: formatting
   - docs: documentation
   - test: tests
   - chore: build/tooling
3. Generate the message in the format `<type>(<scope>): <description>`.
4. Show it to the user for confirmation before committing.

## Example

Changed the navigation style in `src/components/Header.tsx`

Generated message:
style(Header): improve responsive layout of the navbar
```

就这样。没有脚本，没有模板——而它能用，因为这项工作纯粹是遵循指令。一旦你的任务需要真正的逻辑或固定的输出格式，就要添加目录了，如下面的示例所示。

<a name="api-endpoint-generator-add-a-config"></a>

### API 端点生成器：加一份配置

**目标：** 生成标准的 CRUD 端点，全部返回相同的 JSON 结构。

这个技能新增了一个组成部分：`resources/config/`。它把响应格式存放在文件里，而不是硬编码在指令中。

```
.claude/skills/api-endpoint/
├── SKILL.md
└── resources/
   └── config/
      └── response-format.json
```

创建 `SKILL.md`：

```markdown
---
name: api-endpoint-generator
version: 1.0
description: Generate standard CRUD API endpoints for a data model
trigger: ["create API", "generate endpoint", "new endpoint"]
---

# RESTful API Endpoint Generator

## Inputs

- modelName (required): the data model name (e.g. "bookmark", "tag")
- fields (required): the model's fields
- operations (optional, default: all): create/read/update/delete/list

## Steps

1. Create `route.ts` under `src/app/api/{modelName}s/`.
2. Implement:
   - GET /api/{modelName}s → list (with pagination and search)
   - POST /api/{modelName}s → create
   - GET /api/{modelName}s/[id] → get one
   - PUT /api/{modelName}s/[id] → update
   - DELETE /api/{modelName}s/[id] → delete
3. Conventions:
   - Use Prisma for database access.
   - Follow `resources/config/response-format.json` for return shapes.
   - Include input validation and try/catch error handling.
4. List every endpoint's URL and usage when done.
```

以及配置文件 `.claude/skills/api-endpoint/resources/config/response-format.json`：

```json
{
  "success_response": { "success": true, "data": "<payload>" },
  "error_response": { "success": false, "error": "<message>" },
  "list_response": {
    "success": true,
    "data": "<array>",
    "pagination": { "page": 1, "pageSize": 20, "total": 100 }
  }
}
```

这里的好处是关注点分离：只需编辑一个 JSON 文件就能改变响应结构，完全不用碰指令。`SKILL.md` 保持简短，格式在所有使用处保持一致。

<a name="react-component-generator-scripts-and-templates"></a>

### React 组件生成器：脚本与模板

**目标：** 每个新 React 组件都遵循相同的文件结构、编码风格和测试配置。

这是一个_完整的_技能包——它用 `scripts/` 做校验，用 `resources/template/` 保证代码一致性。

```
.claude/skills/react-component/
├── SKILL.md
├── scripts/
│   └── validate.js
└── resources/
   ├── template/
   │   ├── component.tsx.tpl
   │   └── test.tsx.tpl
   └── examples/
      └── BookmarkCard-example/
```

先搭好目录结构：

```bash
mkdir -p .claude/skills/react-component/scripts
mkdir -p .claude/skills/react-component/resources/template
mkdir -p .claude/skills/react-component/resources/examples
```

`SKILL.md` 定义了完整契约：

```markdown
---
name: react-component-generator
version: 1.0
description: Generate React component files that follow project conventions
trigger: ["create component", "new React component"]
tools: ["typescript", "react", "tailwindcss"]
---

# React Component Generator

## Inputs

- componentName (required): PascalCase component name
- description (required): what the component does
- hasProps (optional, default true): generate a Props type
- hasState (optional, default false): include state management

## Steps

1. Create the folder `src/components/{componentName}/`.
2. Using the templates in `resources/template/`, create:
   - `index.tsx` (from component.tsx.tpl)
   - `types.ts` (if hasProps)
   - `{componentName}.test.tsx` (from test.tsx.tpl)
3. Code conventions:
   - Functional components + TypeScript.
   - Props as an interface named `{componentName}Props`.
   - Tailwind CSS for styling.
   - Named exports and JSDoc comments.
4. Test conventions:
   - Use @testing-library/react.
   - At minimum: a render test and a props test.
5. Run `scripts/validate.js` to verify the structure.
```

校验脚本 `scripts/validate.js` 给技能内置了一个自检机制：

```javascript
const fs = require("fs");
const path = require("path");

function validateComponent(componentName) {
  const dir = path.join("src/components", componentName);
  const requiredFiles = ["index.tsx", "types.ts"];
  const missing = requiredFiles.filter(
    (f) => !fs.existsSync(path.join(dir, f)),
  );

  if (missing.length > 0) {
    console.error(
      `Component ${componentName} is missing: ${missing.join(", ")}`,
    );
    return false;
  }
  console.log(`Component ${componentName} structure OK`);
  return true;
}

const name = process.argv[2];
if (!name) {
  console.error("Usage: node validate.js <ComponentName>");
  process.exit(1);
}
validateComponent(name);
```

模板 `resources/template/component.tsx.tpl` 给 AI 提供了一个具体的参考形态（不是让它逐字照抄，而是一种要遵循的_风格_）：

```tsx
/**
 * {componentName} component
 * {description}
 */

import { {componentName}Props } from './types';

export function {componentName}({ ...props }: {componentName}Props) {
  return (
    <div className="...">
      {/* component content */}
    </div>
  );
}
```

> **为什么模板胜过纯文字描述。** "干净、带类型、函数式组件"这样的文字描述是含糊的；而模板向 AI 精确展示了你的意思。它产出的质量永远高于一段文字描述。

配置好之后，你只需要一句话就能使用它：

```
> Create a BookmarkCard component. It shows a bookmark's title, URL, description,
> and tag list. It needs Props, no state.
```

<a name="security-audit-reference-documents"></a>

### 安全审计：参考文档

**目标：** 按照_你的_标准审计代码，而不是靠 AI 的泛泛猜测。

前面三个示例覆盖了 `scripts/`、`resources/` 和一个裸 `SKILL.md`。这一个则重点介绍 **`references/`**——当 AI 必须依据特定的外部规则行事时，这个目录就至关重要。

```
.claude/skills/security-audit/
├── SKILL.md
├── references/
│   ├── owasp-top10-checklist.md
│   └── team-security-standards.md
└── resources/
   └── examples/
      └── audit-report-sample.md
```

`SKILL.md` 告诉 AI _该做什么、规则在哪里_：

```markdown
---
name: security-audit
version: 1.0
description: Audit code against OWASP Top 10 and team security standards
trigger: ["security audit", "security check", "code security"]
---

# Code Security Audit

## Steps

1. Read the target files or directory.
2. Check against `references/owasp-top10-checklist.md`.
3. Check against `references/team-security-standards.md`.
4. Format the report like `resources/examples/audit-report-sample.md`.
5. For each issue: severity (high/medium/low), fix suggestion, and fix code.

## Output Rules

- List all issues in a Markdown table.
- Each issue: file, line, description, severity, fix suggestion.
- End with a security score (0-100) and a summary.
```

参考文档是你团队_具体_要求存放的地方——那些通用模型永远不可能知道的内容：

```markdown
# Team Security Standards

## Mandatory rules (violation = high severity)

1. No hardcoded secrets, keys, or tokens — use environment variables.
2. All database access through the ORM (Prisma). No raw SQL.
3. All user input validated server-side. Never trust the frontend alone.
4. Every API route must enforce authorization. No open endpoints.

## Recommended rules (violation = medium severity)

1. File uploads must restrict type and size.
2. Sensitive operations (delete, change password) need a second confirmation.
3. Pagination must cap pageSize to prevent abuse.
4. Error responses must not leak internal implementation details.
```

> **为什么 `references/` 值得投入。** 没有它，AI 只会用它的_通用_知识做审计，漏掉你团队的_具体_规则。有了它，审计标准就变得**确定、可控、可迭代**——规则变了就更新 `references/team-security-standards.md`，之后每一次审计都会立刻遵循新规则。

<a name="which-structure-do-you-need"></a>

### 你需要哪种结构？

把四个示例并排放在一起，结论就显而易见了：

| 示例          | 核心组成部分                                       | 它教会你什么            |
| ------------- | -------------------------------------------------- | ----------------------- |
| Git 提交      | 仅 `SKILL.md`                                      | 最简单的技能形态        |
| API 端点      | `SKILL.md` + `resources/config/`                   | 配置外部化              |
| React 组件    | `SKILL.md` + `scripts/` + `resources/template/`    | 脚本校验 + 模板         |
| 安全审计      | `SKILL.md` + `references/` + `resources/examples/` | 参考文档驱动的审查      |

这里有一份为你自己的技能准备的快速决策指南：

| 场景             | 推荐结构                                      |
| ---------------- | --------------------------------------------- |
| 编码规范         | 仅 `SKILL.md`                                 |
| 代码生成         | `SKILL.md` + `resources/template/`            |
| 数据处理         | `SKILL.md` + `scripts/` + `resources/config/` |
| 质量审查         | `SKILL.md` + `references/`                    |
| 完整工程化流程   | 以上全部                                      |

<a name="find-ready-made-skills"></a>

## 寻找现成的技能

你不必从零开始。一个成熟的技能生态已经存在，高效的路径是**寻找 → 评估 → 安装 → 定制**，而不是从头造轮子。

<a name="official-libraries"></a>

### 官方技能库

**Anthropic** 官方技能库（[github.com/anthropics/skills](https://github.com/anthropics/skills)）是质量最高的起点。它自己的定义说得很好：

> _"技能是包含指令、脚本和资源的文件夹，Claude 会动态加载它们，以提升在专业任务上的表现。"_

| 分类         | 示例                                                    |
| ------------ | ------------------------------------------------------- |
| 文档处理     | `docx`、`pdf`、`pptx`、`xlsx`                           |
| 创意/设计    | `algorithmic-art`、`canvas-design`、`slack-gif-creator` |
| 开发         | `frontend-design`、`mcp-builder`、`webapp-testing`      |
| 企业沟通     | `brand-guidelines`、`internal-comms`                    |
| 元技能       | `skill-creator`（一个用来创建技能的技能）               |

**Vercel** 技能库（[github.com/vercel-labs/skills](https://github.com/vercel-labs/skills)）专注于 React/Next.js/AI SDK 生态，如果那是你的技术栈，它将非常有价值。

<a name="the-skills-cli"></a>

### Skills CLI

Vercel 还提供了一个 CLI，相当于**技能界的 npm**——在终端里搜索、安装和管理技能：

```bash
npx skills find "react testing"              # search
npx skills add <owner/repo>                  # install all Skills in a repo
npx skills add <owner/repo>@<name> -g        # install one, globally
npx skills list                              # list installed Skills
npx skills init                              # scaffold the Skills directory
```

入门时最值得先装的两个：

```bash
npx skills add anthropics/skills@skill-creator -g    # a Skill that builds Skills
npx skills add vercel-labs/skills@find-skills -g     # a Skill that finds Skills
```

`skill-creator` 是一个"元技能"：告诉它你想要什么，它会引导你创建一个结构规范的 `SKILL.md` 和目录结构。`find-skills` 则帮你在不知道有什么可用的时候发现现成的技能。这两个都强烈推荐新手安装。

<a name="community-libraries"></a>

### 社区技能库

除了官方库，社区已经聚合了数千个技能：

| 仓库                               | 规模   | 亮点                                          |
| ---------------------------------- | ------ | --------------------------------------------- |
| `alirezarezvani/claude-skills`     | 235+   | 9 大领域，25 个"POWERFUL"级进阶技能           |
| `ComposioHQ/awesome-claude-skills` | 127+   | 10 大分类，59 个 SaaS 集成技能                |
| `travisvn/awesome-claude-skills`   | 精选   | 社区投票选出的短名单                          |

聚合平台则免去了"逐个翻仓库"的痛苦：**skills.sh**（约 4.8 万个技能）和 **SkillsMP**（约 90 万个技能）让你可以按分类和关键词搜索，并一键安装。

<a name="safety-before-you-install"></a>

### 安装前的安全检查

技能是一组 _AI 将会执行的指令_——而恶意技能可能包含危险操作。在使用任何第三方技能之前，先做一次快速安全检查：

| 维度     | 检查什么                                    | 示例                                        |
| -------- | ------------------------------------------- | ------------------------------------------- |
| 安全性   | 有危险命令吗？有数据外传吗？                | 留意 `rm -rf`、指向外部主机的 `curl`        |
| 维护状况 | 最近有更新吗？作者活跃吗？                  | 超过 6 个月无人维护就要警惕                 |
| 文档     | `SKILL.md` 是否清晰、有示例？               | 文档糟糕往往意味着质量低下                  |
| 兼容性   | 与你的工具版本匹配吗？                      | 查看 frontmatter 的 `tools` 字段            |
| 来源可信度 | 官方 / 知名组织 / 个人？Star 数如何？     | 优先选择官方和高 Star 仓库                  |

黄金法则：

> **永远不要盲目安装技能。使用前先读它的 `SKILL.md` 和所有 `scripts/`——检查是否有网络调用和文件删除操作。官方库优先，高 Star 社区仓库其次，不知名的个人仓库最后。**

<a name="integrating-skills-into-your-workflow"></a>

## 将技能融入你的工作流

放在文件夹里的技能什么也做不了，直到 AI 知道要去用它。在 Claude Code 中有两种常见的接入方式：

**方式一——在 `CLAUDE.md` 中引用它（推荐）。** 列出你的技能，让 AI 在合适的任务中加载合适的技能：

```markdown
## Project Skills

These Skills define standardized workflows (each is a folder with its core
instructions in SKILL.md):

- `.claude/skills/react-component/` — React component generation rules
- `.claude/skills/api-endpoint/` — API endpoint generation rules
- `.claude/skills/git-commit/` — Git commit message rules
- `.claude/skills/security-audit/` — Code security audit

When a task matches, read the matching SKILL.md and follow it strictly,
including any scripts/, resources/, or references/.
```

**方式二——把它暴露为斜杠命令。** 在 `.claude/commands/` 中放一个触发文件，就能通过 `/skill-name` 直接调用某个技能：

```
.claude/
├── commands/
│   ├── new-component.md    → /new-component
│   └── security-check.md   → /security-check
└── skills/
    ├── react-component/
    ├── api-endpoint/
    ├── security-audit/
    └── git-commit/
```

对其他工具而言思路是一样的——技能的规则成为项目级上下文。比如在 Cursor 中，你可以把技能的核心规则转写成一个 `.cursor/rules/*.mdc` 文件。

<a name="iterating-and-versioning"></a>

## 迭代与版本管理

技能不是"写一次、忘一辈子"的东西。要像对待代码一样对待它：

- **每次使用后都迭代。** 记下 AI 做得好的地方（保留）和做错的地方（加一条更明确的指令）。漏掉了某个边界情况？把它补进错误处理部分。
- **用 Git 做版本管理。** 你的技能目录就是代码，所以要像代码一样提交：

```bash
git add .claude/skills/react-component/
git commit -m "feat(skills): add React component generator v1.0"

git add .claude/skills/react-component/SKILL.md
git commit -m "chore(skills): bump React Skill to v1.1, refine template"
```

一旦技能被提交到共享仓库，每个拉取代码的人都会获得同样的工作流。这才是真正的回报：最佳实践不再是口口相传的部落知识，而是可版本化、可审查的文件。

<a name="best-practices"></a>

## 最佳实践

一份简短的清单，按你应当应用的顺序排列：

1. **从最小化开始。** 对于简单规则，一个 `SKILL.md` 胜过一个完整能力包。只有当具体需求出现时才添加目录。
2. **重复第三次时就技能化。** 如果类似的提示词你已经写了三遍，这就是该搭建技能的信号。
3. **优先使用官方库。** 不要重复造 `pdf`、`docx` 或 `frontend-design` 的轮子——直接安装然后定制。
4. **安装前先阅读。** 审查每一个第三方的 `SKILL.md` 和 `scripts/`，排查危险命令。
5. **模板胜过描述。** 相比文字叙述，模板文件能更可靠地传达你想要的输出形态。
6. **把规则放进 `references/`。** 当 AI 必须遵循_你的_标准时，把这些标准写进参考文档，而不是留在你的脑子里。
7. **用 Git 做版本管理。** 像代码一样提交技能，让它们可共享、可审查、可回滚。

<a name="faq"></a>

## 常见问题

**问：每个技能都真的需要完整的文件夹结构吗？**

不需要。很多技能只有一个 `SKILL.md`，别无他物。用能解决问题的最简单结构——上面的决策指南展示了何时该添加哪些组成部分。

**问：SKILL.md 中的 frontmatter 是必需的吗？**

不是，它是可选的。它主要在智能体系统需要按 `trigger` 和 `description` 自动发现和匹配技能时才重要，这样可以避免把完整指令加载进每一个会话。

**问：`resources/` 和 `references/` 的实际区别是什么？**

`resources/` 存放直接用于产出结果的_物料_（模板、示例、配置）。`references/` 存放 AI 为了做出正确决策而阅读的_知识_（标准、检查清单、API 文档）。前者会被复制进输出；后者只供查阅。

**问：怎么让 Claude Code 真正用上我的技能？**

在 `CLAUDE.md` 中引用它，让 AI 在匹配的任务中加载它；或者在 `.claude/commands/` 中添加一个触发文件，把它作为斜杠命令调用。

**问：技能和 Cursor Rules 是一回事吗？**

不完全是，但它们是"表亲"。两者都是"把经验沉淀为可复用的上下文"。Cursor Rules（`*.mdc`）是项目级的行为指令，而技能是一个更结构化、自包含的能力包，带有脚本和资源。你可以把技能的核心规则转写成一个 Rules 文件。

**问：我怎么知道一个第三方技能是否安全？**

安装前先阅读它的 `SKILL.md` 和所有 `scripts/`，检查是否有危险命令（`rm -rf`）或数据外传行为（指向外部主机的 `curl`）。优先选择官方库和高 Star 仓库，并先在一个一次性项目里测试。

**问：技能可以调用外部工具吗？**

可以。技能可以调用 MCP（Model Context Protocol）服务器来获得额外能力——比如一个部署技能可以调用 GitHub MCP 服务器来创建 PR。但请把 MCP 当作进阶话题；先掌握基础技能。

**问：技能和 MCP 有什么区别？**

它们是互补的。技能定义_做什么、怎么做_（流程和规则）；MCP 提供_新能力_（把 AI 连接到外部服务）。你可以两者结合使用——一个调用 MCP 所提供工具的技能。

<a name="summary"></a>

## 总结

如果说与 AI 对话是下达口头命令，那么技能就是把打印好的操作手册交到它手上。整篇文章可以浓缩为三个习惯：

1. **把重复的操作技能化。** 每个你敲过三遍的提示词都值得变成一个技能。一致性、效率和可复用性都会随之免费获得。
2. **用可行的最简结构。** 从一个 `SKILL.md` 开始；只有当具体需求出现时才添加 `resources/config/`、`scripts/`、`resources/template/` 或 `references/`——绝不提前。
3. **先借用，再自建。** 从 Anthropic 和 Vercel 的官方库安装，审查所有第三方内容，定制而不是重新发明。

其余的都是细节：

| 主题   | 一句话要点                                                           |
| ------ | -------------------------------------------------------------------- |
| 是什么 | 技能是可复用的指令集——一份菜谱/SOP，而不是一次性提示词               |
| 结构   | `SKILL.md` 是必需的；`scripts/`、`resources/`、`references/` 是可选的 |
| 一致性 | 每次运行都遵循同一标准，不同于每次重写的提示词                       |
| 配置   | 把固定格式放进 `resources/config/`，不要硬编码在指令里               |
| 校验   | 把真实逻辑封装进 `scripts/`，让 AI 调用而不是重新推导                |
| 标准   | 把_你的_规则放进 `references/`，让审计变得确定而非泛泛               |
| 来源   | 官方库优先，社区仓库其次，不知名的个人仓库最后                       |
| 维护   | 每次使用后迭代，并用 Git 对技能做版本管理                            |

从小处开始：为你重复最多的那个提示词写一个 `SKILL.md`，把它接入 `CLAUDE.md`，然后用上一次。这第一个技能教会你的东西，会比这篇文章剩下的所有内容加起来还多。
