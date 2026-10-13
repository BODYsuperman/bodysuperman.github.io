---
title: 六个节省 Claude Code 开支的技巧
date: 2026-08-06 16:15:59
updated: 2026-08-16 18:04:19
comments: true
lang: zh-CN
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

Anthropic 发布了一篇博客，分享了六个节省 Claude Code 开支的技巧：完成任务后用 `/clear` 清除对话；在开始时锁定模型和推理强度，避免中途切换导致提示缓存失效；用 `@` 引用文件而非手动输入路径；为产生大量输出的命令添加静默参数；离开前运行 `/compact`；将大输出量的任务分配给子代理。

![pic](pic01.png)

<!-- more -->

官方指出，输出 token 的价格是输入 token 的五倍，而提示缓存命中后的读取仅消耗正常输入价格的 `0.1 倍`，可节省 `90%`。开发者平均每天大约消耗价值 `$13` 的 token。

## TL;DR

- **在任务之间运行** `/clear`。这可以防止之前不相关的上下文被重新发送给模型，从而减少 token 用量。

- **在开始前设置好模型和努力等级**。在对话过程中更改其中任何一项都会破坏提示缓存，从而增加 token 开销。

- **用 @ 提及文件，而不是手动输入文件名**。文件会直接附加到你的消息中，省去了一次 Read 调用，也省去了 Claude 需要搜索文件的过程。

- **为输出冗长的命令添加静默标志，或在子代理中运行它们**。命令输出和文件一样会被添加到对话中，并在整个会话期间一直保留。

- **在新会话中运行一次 `/context`**。它会显示已加载的内容（CLAUDE.md、MCP 工具定义），方便你移除不必要的部分。

- **离开键盘前运行 `/compact`**。提示缓存一小时后过期，在缓存仍然有效时压缩对话摘要的成本要低得多。

参考：https://claude.com/blog/maximizing-the-value-of-your-claude-code-sessions
