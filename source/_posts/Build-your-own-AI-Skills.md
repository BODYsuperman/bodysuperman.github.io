---
title: Build Your Own AI Skills
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

- [Introduction](#introduction)
- [What Is a Skill](#what-is-a-skill)
- [Why Skills Matter](#why-skills-matter)
- [Anatomy of a Skill](#anatomy-of-a-skill)
  - [The SKILL.md File](#the-skill-md-file)
  - [The Supporting Cast](#the-supporting-cast)
- [Build Your Own: From Simple to Complete](#build-your-own-from-simple-to-complete)
  - [Git Commit Messages: Just SKILL.md](#git-commit-messages-just-skill-md)
  - [API Endpoint Generator: Add a Config](#api-endpoint-generator-add-a-config)
  - [React Component Generator: Scripts and Templates](#react-component-generator-scripts-and-templates)
  - [Security Audit: Reference Documents](#security-audit-reference-documents)
  - [Which Structure Do You Need?](#which-structure-do-you-need)
- [Find Ready-Made Skills](#find-ready-made-skills)
  - [Official Libraries](#official-libraries)
  - [The Skills CLI](#the-skills-cli)
  - [Community Libraries](#community-libraries)
  - [Safety Before You Install](#safety-before-you-install)
- [Integrating Skills Into Your Workflow](#integrating-skills-into-your-workflow)
- [Iterating and Versioning](#iterating-and-versioning)
- [Best Practices](#best-practices)
- [FAQ](#faq)
- [Summary](#summary)

<!--more-->

<a name="introduction"></a>

## Introduction

You've typed the same prompt three times this week. Each time, the AI gave you a slightly different answer — Monday it used tabs for indentation, today it used spaces, and somewhere in between it quietly "improved" a function you never asked it to touch.

That is the difference between **asking** and **teaching**.

When you talk to an AI, you are giving a verbal instruction that the model interprets fresh every time. When you write a **Skill**, you are handing it a written manual — a standard operating procedure it can follow the exact same way, every single time, across every project.

> If a prompt is a verbal order, a Skill is the printed `SOP`.

This article shows you what Skills are, why they matter, and — most importantly — how to build your own. By the end, you will have a repeatable recipe for turning your own "I keep typing this prompt" moments into a personal AI toolbox.

<a name="what-is-a-skill"></a>

## What Is a Skill

A **Skill** is a reusable set of instructions that packages a specific capability.

Think of cooking. Every time you make a dish from memory, you risk forgetting an ingredient or a step. But if you write the recipe down once, you can follow it perfectly every time — and share it with someone else. A Skill is that recipe, written for the AI.

The contrast with a one-off prompt is the whole point:

| Dimension   | Single Prompt              | Skill                               |
| ----------- | -------------------------- | ----------------------------------- |
| Nature      | One-time instruction       | Reusable standard process           |
| Consistency | Different output each time | Same standard every time            |
| Effort      | Rewritten every time       | Triggered once                      |
| Maintenance | Throwaway                  | Versioned and continuously improved |
| Analogy     | A verbal order             | A written SOP (standard procedure)  |

A Skill is not a new kind of model or a plugin that runs "outside" the AI. It is just **instructions plus resources**, structured so the AI can load exactly what it needs when it needs it. That simplicity is why it works.

<a name="why-skills-matter"></a>

## Why Skills Matter

Four concrete benefits, in order of how much they actually save you:

1. **Consistency** — the AI follows the same standard every time. No more "tab today, spaces tomorrow".
2. **Efficiency** — a complex multi-step workflow collapses into a single trigger instead of a rewritten prompt.
3. **Reusability** — one Skill works across projects and teams, so best practices stop living in your head.
4. **Iterability** — a Skill is a file you can improve, so it gets _better_ with use instead of staying frozen.

There is a programming principle here you already know: **DRY — Don't Repeat Yourself.** It applies to prompts, not just code. If you've written a similar prompt three times, it's time to turn it into a Skill.

The deeper reason Skills matter: a large model cannot have every domain's best practices baked into its training data. A Skill is your way to inject _your_ expertise — your team's conventions, your security standards, your templates — on demand. It's the difference between a brilliant generalist and _your_ specialist.

<a name="anatomy-of-a-skill"></a>

## Anatomy of a Skill

Here's the first thing people get wrong: **a Skill is a folder, not a file.** A single Markdown file can be enough, but a complete Skill is a small "capability pack" that may bundle several kinds of files.

Using the recipe analogy again:

- **`SKILL.md`** is the recipe itself — the name, the steps, the warnings.
- **`scripts/`** is the drawer of kitchen tools — helper scripts for the fiddly work.
- **`resources/`** is the ingredient kit — templates, sample data, and config.
- **`references/`** is the reference shelf at the back — standards and docs the AI can consult.
- **`requirements.txt`** declares which third-party packages the scripts need.

The standard directory structure looks like this:

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

Only `SKILL.md` is required. Everything else is optional, added only when it earns its place.

<a name="the-skill-md-file"></a>

### The SKILL.md File

`SKILL.md` is the heart of the Skill. It has two parts: an optional **frontmatter** block for metadata, and the body with the actual instructions.

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

The frontmatter is optional — plenty of Skills skip it. But when a Skill needs to be _auto-discovered_ by an agent system, the `trigger` and `description` fields become important. The agent reads only the metadata at startup and loads the full instructions only when a task matches. This **progressive disclosure** design saves context-window space, which matters on long sessions.

<a name="the-supporting-cast"></a>

### The Supporting Cast

The four optional directories each solve a different problem:

**`scripts/` — helper scripts.** When a Skill needs real logic (data cleaning, batch file operations, format validation), moving it into a script keeps `SKILL.md` clean. The AI just calls the script instead of re-deriving the logic.

```python
# scripts/helper.py — encapsulate complex logic, call it from SKILL.md
def fill_missing_value(df, column, strategy="mean"):
    if strategy == "mean":
        df[column].fillna(df[column].mean(), inplace=True)
    elif strategy == "empty":
        df[column].fillna("", inplace=True)
    return df
```

**`resources/` — production materials.** Templates, examples, and config files. These are _used directly_ to produce output:

- `template/` — code/document templates the AI bases its output on.
- `examples/` — input/output pairs that show "what good looks like".
- `config/` — JSON/YAML files holding rules and defaults, so you don't hardcode them in `SKILL.md`.

**`references/` — the reference shelf.** Unlike `resources/`, these are _not_ copied into output; they are **knowledge the AI reads to make correct decisions**. Coding standards, security checklists (like OWASP Top 10), API docs, and tech-decision records all belong here.

> **`resources/` vs `references/` in one line:** `resources/` is the _material_ you build with (templates, config); `references/` is the _manual_ you consult (standards, rules).

**`requirements.txt` — dependency declarations.** If `scripts/` uses third-party libraries, list them here so the environment can be set up in one step.

```
pandas>=2.0.0
openpyxl>=3.1.0
```

<a name="build-your-own-from-simple-to-complete"></a>

## Build Your Own: From Simple to Complete

Now the part you came for. The single most important rule of building Skills:

> **Use the simplest structure that does the job.**

Not every Skill needs every directory. The four examples below go from a single file to a full package, and each one teaches one component of the structure. By the end, you'll know exactly how much structure _your_ Skill actually needs.

<a name="git-commit-messages-just-skill-md"></a>

### Git Commit Messages: Just SKILL.md

**Goal:** generate a Conventional Commits message every time, without thinking.

This is the simplest possible Skill — one `SKILL.md`, nothing else.

```
.claude/skills/git-commit/
└── SKILL.md
```

Create `.claude/skills/git-commit/SKILL.md`:

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

That's it. No scripts, no templates — and it works, because the job is pure instruction-following. The moment your task needs real logic or a fixed output shape, you add directories, as the next examples show.

<a name="api-endpoint-generator-add-a-config"></a>

### API Endpoint Generator: Add a Config

**Goal:** generate standard CRUD endpoints that all return the same JSON shape.

This Skill adds one new component: `resources/config/`. It keeps the response format in a file instead of hardcoding it in the instructions.

```
.claude/skills/api-endpoint/
├── SKILL.md
└── resources/
   └── config/
      └── response-format.json
```

Create `SKILL.md`:

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

And the config file `.claude/skills/api-endpoint/resources/config/response-format.json`:

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

The win here is separation of concerns: change the response shape by editing one JSON file, without touching the instructions. `SKILL.md` stays short, and the format stays consistent everywhere it's used.

<a name="react-component-generator-scripts-and-templates"></a>

### React Component Generator: Scripts and Templates

**Goal:** every new React component follows the same file structure, coding style, and test setup.

This is a _complete_ Skill package — it uses `scripts/` for validation and `resources/template/` for code consistency.

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

First the structure:

```bash
mkdir -p .claude/skills/react-component/scripts
mkdir -p .claude/skills/react-component/resources/template
mkdir -p .claude/skills/react-component/resources/examples
```

`SKILL.md` defines the full contract:

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

The validation script `scripts/validate.js` gives the Skill a built-in self-check:

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

The template `resources/template/component.tsx.tpl` gives the AI a concrete reference shape (not something to copy verbatim — a _style_ to follow):

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

> **Why templates beat plain text.** A text description of "clean, typed, functional component" is ambiguous; a template shows the AI exactly what you mean. It produces higher-quality output than a paragraph ever will.

After wiring it up, you use it with a single sentence:

```
> Create a BookmarkCard component. It shows a bookmark's title, URL, description,
> and tag list. It needs Props, no state.
```

<a name="security-audit-reference-documents"></a>

### Security Audit: Reference Documents

**Goal:** audit code against _your_ standards, not the AI's generic guesswork.

The previous three examples covered `scripts/`, `resources/`, and a bare `SKILL.md`. This one highlights **`references/`** — the directory that matters when the AI must act according to specific, external rules.

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

`SKILL.md` tells the AI _what to do and where the rules live_:

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

The reference document is where your team's _specific_ requirements live — the things a general-purpose model would never know:

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

> **Why `references/` is worth it.** Without it, the AI audits with its _generic_ knowledge and misses your team's _specific_ rules. With it, the audit standard becomes **deterministic, controllable, and iterable** — update `references/team-security-standards.md` when your rules change, and every future audit instantly follows them.

<a name="which-structure-do-you-need"></a>

### Which Structure Do You Need?

Putting the four examples side by side makes the lesson obvious:

| Example         | Core components                                    | What it teaches               |
| --------------- | -------------------------------------------------- | ----------------------------- |
| Git commit      | `SKILL.md` only                                    | Simplest possible Skill       |
| API endpoint    | `SKILL.md` + `resources/config/`                   | Externalizing configuration   |
| React component | `SKILL.md` + `scripts/` + `resources/template/`    | Script validation + templates |
| Security audit  | `SKILL.md` + `references/` + `resources/examples/` | Reference-driven review       |

Here's a quick decision guide for your own Skills:

| Scenario              | Recommended structure                         |
| --------------------- | --------------------------------------------- |
| Coding convention     | `SKILL.md` only                               |
| Code generation       | `SKILL.md` + `resources/template/`            |
| Data processing       | `SKILL.md` + `scripts/` + `resources/config/` |
| Quality review        | `SKILL.md` + `references/`                    |
| Full engineering flow | All of the above                              |

<a name="find-ready-made-skills"></a>

## Find Ready-Made Skills

You don't have to start from zero. A mature Skill ecosystem already exists, and the efficient path is **find → evaluate → install → customize** rather than build from scratch.

<a name="official-libraries"></a>

### Official Libraries

The **Anthropic** Skill library ([github.com/anthropics/skills](https://github.com/anthropics/skills)) is the highest-quality starting point. Its own definition puts it well:

> _"Skills are folders of instructions, scripts, and resources that Claude loads dynamically to improve performance on specialized tasks."_

| Category         | Examples                                                |
| ---------------- | ------------------------------------------------------- |
| Document work    | `docx`, `pdf`, `pptx`, `xlsx`                           |
| Creative/design  | `algorithmic-art`, `canvas-design`, `slack-gif-creator` |
| Development      | `frontend-design`, `mcp-builder`, `webapp-testing`      |
| Enterprise comms | `brand-guidelines`, `internal-comms`                    |
| Meta             | `skill-creator` (a Skill that creates Skills)           |

The **Vercel** library ([github.com/vercel-labs/skills](https://github.com/vercel-labs/skills)) focuses on the React/Next.js/AI SDK ecosystem and is invaluable if that's your stack.

<a name="the-skills-cli"></a>

### The Skills CLI

Vercel also ships a CLI that acts as **npm for Skills** — search, install, and manage them from the terminal:

```bash
npx skills find "react testing"              # search
npx skills add <owner/repo>                  # install all Skills in a repo
npx skills add <owner/repo>@<name> -g        # install one, globally
npx skills list                              # list installed Skills
npx skills init                              # scaffold the Skills directory
```

Two of the most useful installs to start with:

```bash
npx skills add anthropics/skills@skill-creator -g    # a Skill that builds Skills
npx skills add vercel-labs/skills@find-skills -g     # a Skill that finds Skills
```

`skill-creator` is a "meta-skill": tell it what you want, and it walks you through creating a well-formed `SKILL.md` and directory structure. `find-skills` helps you discover existing Skills when you don't know what's out there. Both are strongly recommended for beginners.

<a name="community-libraries"></a>

### Community Libraries

Beyond the official libraries, the community has aggregated thousands of Skills:

| Repository                         | Scale   | Highlights                                    |
| ---------------------------------- | ------- | --------------------------------------------- |
| `alirezarezvani/claude-skills`     | 235+    | 9 domains, 25 "POWERFUL" tier advanced Skills |
| `ComposioHQ/awesome-claude-skills` | 127+    | 10 categories, 59 SaaS-integration Skills     |
| `travisvn/awesome-claude-skills`   | curated | Community-voted shortlist                     |

Aggregator platforms take the "browse by repo" pain away: **skills.sh** (~48k Skills) and **SkillsMP** (~900k Skills) let you search by category and keyword and install in one click.

<a name="safety-before-you-install"></a>

### Safety Before You Install

A Skill is a set of _instructions the AI will execute_ — and a malicious Skill can contain dangerous operations. Before using any third-party Skill, run a quick safety check:

| Dimension     | What to check                                 | Example                                     |
| ------------- | --------------------------------------------- | ------------------------------------------- |
| Safety        | Dangerous commands? Data exfiltration?        | Look for `rm -rf`, `curl` to external hosts |
| Maintenance   | Recently updated? Author active?              | Be wary if untouched for 6+ months          |
| Documentation | Is `SKILL.md` clear, with examples?           | Poor docs often signal low quality          |
| Compatibility | Matches your tool versions?                   | Check the frontmatter `tools` field         |
| Source trust  | Official / reputable org / individual? Stars? | Prefer official and high-star repos         |

The golden rule:

> **Never blindly install a Skill. Read its `SKILL.md` and any `scripts/` before using it — check for network calls and file deletions. Official libraries first, high-star community repos second, unknown individual repos last.**

<a name="integrating-skills-into-your-workflow"></a>

## Integrating Skills Into Your Workflow

A Skill sitting in a folder does nothing until the AI knows to use it. Two common ways to wire it in for Claude Code:

**Method 1 — reference it from `CLAUDE.md` (recommended).** List your Skills so the AI loads the right one for the right task:

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

**Method 2 — expose it as a slash command.** Put a trigger file in `.claude/commands/` to invoke a Skill directly via `/skill-name`:

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

For other tools the idea is the same — the Skill's rules become project-level context. In Cursor, for example, you'd translate the Skill's core rules into a `.cursor/rules/*.mdc` file.

<a name="iterating-and-versioning"></a>

## Iterating and Versioning

A Skill is not a "write once, forget forever" artifact. Treat it like code:

- **Iterate after every use.** Note what the AI did well (keep it) and what it got wrong (add a sharper instruction). Miss an edge case? Add it to the error-handling section.
- **Version it with Git.** Your Skill directory is code, so commit it like code:

```bash
git add .claude/skills/react-component/
git commit -m "feat(skills): add React component generator v1.0"

git add .claude/skills/react-component/SKILL.md
git commit -m "chore(skills): bump React Skill to v1.1, refine template"
```

Once a Skill is committed to a shared repo, everyone who pulls the code gets the same workflow. That's the real payoff: best practices stop being tribal knowledge and become versioned, reviewable files.

<a name="best-practices"></a>

## Best Practices

A short list, in the order you should apply it:

1. **Start minimal.** One `SKILL.md` beats a full package for simple rules. Add directories only when a concrete need appears.
2. **Skill-ify at the third repeat.** If you've written a similar prompt three times, that's your signal to build a Skill.
3. **Prefer official libraries.** Don't reinvent `pdf`, `docx`, or `frontend-design` — install and customize.
4. **Read before you install.** Audit every third-party `SKILL.md` and `scripts/` for dangerous commands.
5. **Templates beat descriptions.** A template file communicates your output shape more reliably than prose.
6. **Push rules into `references/`.** When the AI must follow _your_ standards, put those standards in a reference doc, not in your head.
7. **Version with Git.** Commit Skills like code so they're shared, reviewable, and reversible.

<a name="faq"></a>

## FAQ

**Q: Do I really need the full folder structure for every Skill?**

No. Many Skills are a single `SKILL.md` and nothing else. Use the simplest structure that solves the problem — the decision guide above shows which components to add and when.

**Q: Is the frontmatter in SKILL.md required?**

No, it's optional. It matters mainly when an agent system needs to auto-discover and match Skills by `trigger` and `description`, which keeps the full instructions from loading into every session.

**Q: What's the actual difference between `resources/` and `references/`?**

`resources/` holds _material_ used directly to produce output (templates, examples, config). `references/` holds _knowledge_ the AI reads to make correct decisions (standards, checklists, API docs). One is copied into output; the other is consulted.

**Q: How do I get Claude Code to actually use my Skill?**

Reference it from `CLAUDE.md` so the AI loads it for matching tasks, or add a trigger file to `.claude/commands/` to invoke it as a slash command.

**Q: Are Skills the same thing as Cursor Rules?**

Not exactly, but they're cousins. Both capture "experience as reusable context." Cursor Rules (`*.mdc`) are project-level behavior instructions, while a Skill is a more structured, self-contained package with scripts and resources. You can translate a Skill's core rules into a Rules file.

**Q: How do I know a third-party Skill is safe?**

Before installing, read its `SKILL.md` and any `scripts/`, checking for dangerous commands (`rm -rf`) or data exfiltration (`curl` to external hosts). Prefer official libraries and high-star repos, and test in a throwaway project first.

**Q: Can a Skill call external tools?**

Yes. A Skill can invoke MCP (Model Context Protocol) servers for extra capabilities — a deploy Skill could call a GitHub MCP server to open a PR. But treat MCP as an advanced topic; master basic Skills first.

**Q: How is a Skill different from MCP?**

They're complementary. A Skill defines _what to do and how_ (process and rules); MCP provides _new capabilities_ (connecting the AI to external services). You can use both together — a Skill that calls MCP-provided tools.

<a name="summary"></a>

## Summary

If talking to an AI is giving verbal orders, a Skill is handing it the printed manual. The whole article compresses into three habits:

1. **Skill-ify your repeats.** Every prompt you've typed three times deserves to be a Skill. Consistency, efficiency, and reusability follow for free.
2. **Use the simplest structure that works.** Start with one `SKILL.md`; add `resources/config/`, `scripts/`, `resources/template/`, or `references/` only as a concrete need appears — not before.
3. **Borrow before you build.** Install from the official Anthropic and Vercel libraries, audit anything third-party, and customize rather than reinvent.

Everything else is detail:

| Topic         | One-line takeaway                                                            |
| ------------- | ---------------------------------------------------------------------------- |
| What          | A Skill is a reusable instruction set — a recipe/SOP, not a one-off prompt   |
| Structure     | `SKILL.md` is required; `scripts/`, `resources/`, `references/` are optional |
| Consistency   | Same standard every run, unlike a fresh prompt                               |
| Configuration | Put fixed shapes in `resources/config/`, not hardcoded in instructions       |
| Validation    | Wrap real logic in `scripts/` so the AI calls it instead of re-deriving it   |
| Standards     | Put _your_ rules in `references/` so audits are deterministic, not generic   |
| Sourcing      | Official libraries first, community repos second, unknown individuals last   |
| Maintenance   | Iterate after each use and version Skills with Git                           |

Start small: write a single `SKILL.md` for the prompt you repeat most, wire it into `CLAUDE.md`, and use it once. That first Skill will teach you more than the rest of this article combined.
