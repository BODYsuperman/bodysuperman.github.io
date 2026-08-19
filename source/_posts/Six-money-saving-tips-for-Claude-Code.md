---
title: Six money-saving tips for Claude Code
date: 2026-08-06 16:15:59
updated: 2026-08-16 18:04:19
comments: true
categories:
  - AI Engineering
  - Developer Tools

tags:
  - Claude Code
  - AI Coding Agent
  - Agent Workflow
  - Context Engineering
  - LLM
  - Prompt Engineering
  - Software Development
---

Anthropic released a blog sharing six money-saving tips for Claude Code: clear the conversation with `/clear` after completing a task; lock the model and reasoning intensity at the start to avoid invalidating the prompt cache by switching; use `@` to reference files instead of typing paths manually; add silent parameters to commands that generate a lot of output; run `/compact` before taking a break; assign large output tasks to sub-agents.

![pic](pic01.png)

<!-- more -->

The Official stated that output tokens are five times more expensive than input tokens, while reading after a prompt cache hit costs only `0.1 times` the normal input price, saving `90%`. Developers consume approximately `$13 worth` of tokens per day on average.

## TL;DR

- **Run** `/clear` between tasks. This prevents prior irrelevant context from being sent back to the model, which can reduce token usage.

- **Set your model and effort level before you start**. Changing either one mid-conversation can bust your prompt cache, which can increase token cost.

- **@-mention files instead of naming them**. The file gets attached to your message directly, which saves a Read call, or a search if Claude has to go find it.

- **Add quiet flags to noisy commands, or run them in a subagent**. Command output is added to the conversation just like a file, and stays there for the rest of the session.

- **Run `/context` once in a fresh session**. It shows what's loaded (CLAUDE.md, MCP tool definitions), so you can cut out anything unnecessary.

- **`/compact` before you take a break from your keyboard**. The prompt cache expires after an hour, and summarizing a conversation is much cheaper while it's still cached.

Reference: https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions
