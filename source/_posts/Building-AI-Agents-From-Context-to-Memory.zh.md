---
title: '构建 AI Agent：从上下文到记忆'
lang: zh-CN
date: 2026-06-10 15:09:38
updated: 2026-07-23 15:09:38
comments: true
categories:
  - AI
  - AI Agent
tags:
  - AI Agent
  - LLM
  - Context Engineering
  - RAG
  - Memory
---

- [引言](#introduction)
- [什么是 AI Agent](#what-is-an-ai-agent)
  - [核心公式：LLM + 上下文 + 工具](#the-core-formula-llm-context-tools)
  - [ReAct 循环：Agent 的实际运作方式](#the-react-loop-how-agents-actually-work)
- [上下文工程：Agent 能力的天花板](#context-engineering-the-ceiling-of-agent-capability)
  - [API 层面的上下文：静态前缀 + 动态轨迹](#context-at-the-api-level-static-prefix-dynamic-trajectory)
  - [KV Cache：为什么前缀稳定性至关重要](#kv-cache-why-prefix-stability-matters)
  - [提示词工程：编写 Agent 的操作手册](#prompt-engineering-writing-the-agents-operating-manual)
  - [Agent 技能：按需加载知识](#agent-skills-load-knowledge-on-demand)
  - [Agent 状态栏：从隐式状态到显式知识](#agent-status-bar-from-implicit-state-to-explicit-knowledge)
  - [上下文压缩：少即是多](#context-compression-when-less-is-more)
- [从上下文到记忆：让 Agent 拥有记忆力](#from-context-to-memory-making-agents-remember)
  - [用户记忆：构建用户模型](#user-memory-building-a-model-of-the-user)
  - [四种存储格式：从简单笔记到高级 JSON 卡片](#four-storage-formats-from-simple-notes-to-advanced-json-cards)
  - [RAG：为 Agent 赋予知识库](#rag-giving-agents-a-knowledge-base)
  - [超越扁平文本：结构化索引与 Agentic RAG](#beyond-flat-text-structured-indexing-and-agentic-rag)
  - [上下文检索：从根源解决分块问题](#contextual-retrieval-fixing-chunking-at-the-root)
  - [两层记忆架构](#the-two-tier-memory-architecture)
- [Harness 工程：超越 Demo 的可靠性](#harness-engineering-reliability-beyond-the-demo)
  - [约束、验证、纠正：三层安全保障](#constrain-verify-correct-the-three-safety-layers)
  - [工作流 vs. 自主模式：选择正确的模式](#workflow-vs-autonomous-choosing-the-right-pattern)
- [最佳实践](#best-practices)
- [常见问题](#faq)
- [总结](#summary)

<!--more-->

<a name="introduction"></a>

## 引言

如果你用过 Cursor 写代码，看过它搜索代码库、编辑多个文件、反复运行测试直到通过，那你已经在使用 AI Agent 了。同样，如果你用 Deep Research 通过反复搜索和阅读来研究某个主题，或者让 Manus 控制浏览器完成在线任务，也是在使用 Agent。

这些产品形态各异，但有一个共同特征：它们不再是"你问它答"的被动对话。它们会自主规划执行步骤、调用每个任务所需的工具，并根据返回结果调整策略。

本文将从基础公式出发，依次讲解单次会话内的上下文工程，以及跨会话的持久记忆，梳理现代 AI Agent 的核心思想。目标是为你提供一套可用于构建自己 Agent 的心智模型。

<a name="what-is-an-ai-agent"></a>

## 什么是 AI Agent

<a name="the-core-formula-llm-context-tools"></a>

### 核心公式：LLM + 上下文 + 工具

现代 Agent 系统的本质可以用一个简洁的公式概括：

**Agent = LLM + 上下文 + 工具**

每一项的含义都比表面看起来更广：

- **LLM 是推理引擎。** 它是决策核心，负责理解意图、推理、规划和判断。其能力来自预训练阶段获得的世界知识，以及后训练阶段编码的决策策略。
- **上下文是信息的 working set（工作集）。** 不仅是输入模型的文本，而是在每个决策点可用的一切信息——环境状态、用户记忆、领域知识、Agent 自身状态以及任务进度。
- **工具是 action interface（行动接口）。** Agent 可以采取行动的全部方式——从预定义的工具调用到按需加载的技能，从生成代码到将任务委派给子 Agent。

更直观地表达：**Agent = 推理引擎 + 工作上下文 + 行动接口**。模型负责推理和决策，上下文提供决策所依赖的信息，工具提供决策影响外部世界的接口。

不同类型的 Agent 在这三个维度上的对比：

| Agent 产品 | 工作上下文 | 行动接口 | 策略 |
|---|---|---|---|
| 编程 Agent（Cursor） | 需求、代码库、终端 | 代码搜索、文件读写、命令执行 | 理解 → 搜索 → 编辑 → 测试 → 调试 |
| 搜索 Agent（Deep Research） | 网络资源、数据库 | 搜索查询、网页阅读、摘要生成 | 基于已有信息的迭代深入 |
| 电脑控制（Manus） | 屏幕、浏览器、文件系统 | 点击、输入、滚动、截图 | 视觉感知 + 操作执行 |
| 手机助手（豆包） | 手机屏幕、已安装应用 | 点击、滑动、打开应用 | 意图理解 + 应用控制 |
| 任务 Agent（Pine AI） | 账户信息、历史账单 | 打电话、发邮件、填表单 | 多步骤任务执行 |

这些系统共享三个特征：**开放式的行动空间**（生成任意自然语言和代码，而非在固定按钮中选择）、**内部推理**（行动前先规划）、**持续交互**（根据反馈调整策略）。

<a name="the-react-loop-how-agents-actually-work"></a>

### ReAct 循环：Agent 的实际运作方式

核心执行模式称为 **ReAct**（Reasoning + Acting，推理 + 行动）。虽然名字只提到了推理和行动，但实际循环包含三个阶段：模型先**推理**下一步该做什么，然后调用工具**行动**，接着**观察**工具返回的结果并推理后续步骤。

```
Reason → Act → Observe → Reason → Act → Observe → ... (until task is done)
```

考虑一个多币种收入汇总的场景。用户提问："根据公司季度收入：Q1 250 万美元、Q2 210 万欧元、Q3 180 万英镑、Q4 3.8 亿日元，计算全年总收入。"

Agent 的**轨迹（trajectory）**——即工作过程中不断累积的消息历史——如下所示：

```
trajectory = [
  {role: "user", content: "Based on quarterly revenue...calculate total"},

  # Iteration 1: LLM reasons and calls conversion tools in parallel
  {role: "assistant",
   reasoning: "Need to convert all currencies to USD...",
   tool_calls: [
     {name: "convert_currency", args: {amount: 2100000, from: "EUR", to: "USD"}},
     {name: "convert_currency", args: {amount: 1800000, from: "GBP", to: "USD"}},
     {name: "convert_currency", args: {amount: 380000000, from: "JPY", to: "USD"}}
   ]},

  # Framework executes tools, adds results to trajectory
  {role: "tool", content: "EUR->USD: 2282608.7"},
  {role: "tool", content: "GBP->USD: 2278481.01"},
  {role: "tool", content: "JPY->USD: 2541806.02"},

  # Iteration 2: LLM aggregates with code interpreter
  {role: "assistant",
   reasoning: "Conversion results obtained, now aggregate...",
   tool_calls: [{name: "code_interpreter", args: {code: "total = 2500000 + ..."}}]},

  {role: "tool", content: "Total: $9,602,895.73, Average: $2,400,723.93"},

  # Iteration 3: LLM produces final answer
  {role: "assistant",
   reasoning: "All calculations complete, summarizing...",
   content: "FINAL ANSWER: Total revenue $9,602,895.73..."}
]
```

一个复杂的多步骤任务在 3 次迭代、4 次工具调用中完成。其优雅之处在于**上下文的累积性**：每次 LLM 调用都会接收完整的轨迹，因此模型知道当前处于哪个阶段、之前尝试过什么、结果如何。

关键洞察：**Agent 上下文 = 静态前缀 + 轨迹**。静态前缀（系统提示 + 工具定义）保持不变；轨迹（用户消息 + 助手消息 + 工具结果）随每次交互不断增长。

<a name="context-engineering-the-ceiling-of-agent-capability"></a>

## 上下文工程：Agent 能力的天花板

大语言模型在基准测试中成绩优异，但在实际应用中往往表现不佳。原因很简单：模型能力是通用的，而具体任务依赖于本地知识——产品架构、业务规则、运维约束。这些信息不存在于模型参数中。

考虑一个收到"帮我修复这个 bug"指令的 Coding Agent。它收到的上下文质量决定了能否完成任务：

- **代码上下文**：代码库结构、模块职责、编码规范。缺少这些，Agent 可能生成语法正确但违反项目架构的代码。
- **流程要求**：Git 分支策略、提交规范、CI/CD 要求。缺少这些，Agent 可能直接将未经测试的代码提交到 main 分支。
- **环境配置**：开发环境设置、测试数据库连接字符串、API 密钥管理。缺少这些，在本地能跑的修复在测试环境中会失败。

模型的固有能力只是基础；**上下文决定了天花板**。一个能力中等但上下文组织良好的模型，往往能超越一个上下文不足的更强模型。

<a name="context-at-the-api-level-static-prefix-dynamic-trajectory"></a>

### API 层面的上下文：静态前缀 + 动态轨迹

在 API 层面，每次 LLM 调用的上下文由五部分组成：

- **系统提示（System Prompt）**：开发者编写的指令，定义 Agent 的身份、权限和行为准则。在整个对话期间保持不变。
- **工具定义（Tool Definitions）**：声明可用工具的名称、描述和参数格式。没有它们，Agent 无法识别或调用任何工具。
- **用户消息（User Messages）**：来自用户的输入，可能包含通过 RAG 检索的外部知识。
- **助手消息（Assistant Messages）**：前次模型的输出，包括 `reasoning`、`content` 和 `tool_calls`。
- **工具结果（Tool Results）**：框架执行工具后返回的输出。

前两者构成**静态前缀**；后三者构成随每次交互增长的**动态轨迹**。

一项消融实验揭示了移除各组件后的影响：

| 被移除的组件 | 对 Agent 的影响 |
|---|---|
| 工具定义 | Agent 无法识别或调用任何工具——完全丧失行动能力 |
| 工具结果 | Agent 收不到执行反馈，反复调用同一工具，陷入无限循环 |
| 助手消息中的推理 | 连续决策之间开始相互矛盾 |
| 消息历史 | Agent 丧失任务连续性，从头开始，重复已完成的步骤 |

核心洞察：**上下文决定了 Agent 在决策时拥有哪些信息，而 Agent 只能基于这些信息做出决策**。

<a name="kv-cache-why-prefix-stability-matters"></a>

### KV Cache：为什么前缀稳定性至关重要

模型每生成一个 token，都需要参考前面 token 的中间计算结果。如果每轮都从头重新计算，开销会非常大。**KV Cache** 存储了键值状态，使后续计算可以复用它们。前提条件是：**前缀必须完全不变**。

一个生产事故说明了其重要性。某团队的客服 Agent 每天处理 10 万次对话。一位工程师在系统提示中加了一行 `Current time: {{now}}`，让 Agent 能知道当前时间。第二天，监控告警响起：首 token 延迟从 0.5 秒飙升到 3-5 秒，月度推理费用几乎翻倍。

那一行时间戳使每次请求的 KV Cache 都失效了。系统提示每次都不同，迫使模型从头重新计算前缀的键值对。

由此得出三条实用原则：

1. **系统提示和工具定义一旦确定，就不要修改。** 任何改动都会使整个缓存失效。
2. **始终将动态信息追加到末尾。** 时间戳和用户状态应该作为对话末尾的新消息，而非修改系统提示。
3. **使用标准 API 格式，不要手动拼接消息。** 结构化消息由 Chat Template 转换为模型训练时见过的固定 token 序列。

```
┌─────────────────────────────────────────────────────────┐
│                    API Request                          │
│                                                         │
│  ┌─────────────────────────────────┐  ← Static prefix   │
│  │ system prompt + tool definitions│    (KV Cache hits) │
│  └─────────────────────────────────┘                    │
│  ┌─────────────────────────────────┐  ← Dynamic part    │
│  │     user / assistant / tool     │    (grows each     │
│  │         messages (trajectory)   │     turn)          │
│  └─────────────────────────────────┘                    │
│  ┌─────────────────────────────────┐  ← Append-only     │
│  │   new dynamic info (status bar) │    (cache-safe)    │
│  └─────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

<a name="prompt-engineering-writing-the-agents-operating-manual"></a>

### 提示词工程：编写 Agent 的操作手册

一个实用的试金石：LLM 就像一个能力很强但完全不了解你具体工作流程的新团队成员。如果这样一个人读完你的系统提示后仍然不知道该做什么，Agent 也一样。

几个重要的维度：

**语气和风格**塑造用户体验。像"NEVER do X"这样的大写词能提高指令的显著性，但过度使用会削弱效果——留给真正关键的约束。

**结构化提示**之所以有效，是因为模型是在结构化数据上训练的。XML 标签携带语义信息（`<working_directory>` 一目了然），Markdown 同时为人类和机器组织内容。

**流程驱动的提示**优于规则堆砌。想象给新团队成员一本手册，里面散落着数百条规则，却没有流程图。流程驱动的提示提供清晰的标准操作流程（SOP）：

```
File Processing SOP:

Step 1: Validation
   Check if file exists and is accessible
   - If not found → log error and stop
   ↓
Step 2: Classification
   Determine file type based on extension and content
   ↓
Step 3: Preprocessing
   Config files → create backup
   Large files (>1MB) → stream processing
   ↓
Step 4: Execution
   Execute core processing logic based on file type
```

**业务规则的细化**是最关键也最容易被忽视的部分。像"根据任务情况选择合适的计费类型"这样模糊的规则会导致 Agent 行为不稳定。规则必须定义到可执行的程度："NEVER use percentage-based billing for refunds. Use fixed_fee instead."

一项关于提示词工程的消融实验发现，移除系统提示中的结构（保留所有规则内容，但将有序流程转换为无结构的集合）会使任务成功率下降超过 30%。

<a name="agent-skills-load-knowledge-on-demand"></a>

### Agent 技能：按需加载知识

随着 Agent 处理的场景越来越多，系统提示会不断膨胀：退款规则、编码规范、格式要求。将所有内容放在一个提示中会产生两个问题：**token 浪费**（大部分内容与当前任务无关）和**注意力稀释**（无关信息淹没了关键内容）。

Agent 技能（Skills）通过**渐进式披露（Progressive Disclosure）**来解决这个问题：不是一次性加载所有知识，而是让 Agent 按需加载。每个技能是一个模块化的知识包，分为三层：

- **第一层（元数据）**：一个 `SKILL.md` 文件，包含 `name` 和 `description` 字段，在启动时注入上下文。通常只有几百个 token。
- **第二层（核心工作流）**：当 Agent 判断需要某个技能时，通过专用工具加载完整的 `SKILL.md`。内容以工具结果的形式出现。
- **第三层（细节）**：文件引用允许按需深入查阅子文档。

生产环境的实现（Claude Code 使用的方式）将元数据列表作为 **user 角色的 meta 消息注入到上下文末尾**，用 `<system-reminder>` 标签包裹。这样不修改系统提示，KV Cache 前缀保持稳定。完整内容随后通过专用工具按需加载。

```
Trajectory with Skills:
┌──────────────────────────────────────┐
│ system prompt + tool definitions     │ ← Cached prefix
├──────────────────────────────────────┤
│ user: "convert this PDF to PPTX"     │
│ assistant: tool_calls: [Skill("pdf")]│ ← Agent decides
│ tool: <full SKILL.md content>        │ ← Loaded on demand
│ assistant: tool_calls:[Skill("pptx")]│
│ tool: <full SKILL.md content>        │
│ ...                                  │
│ user: <system-reminder>              │ ← End-of-context
│   Available skills: [pdf, pptx, ...] │   meta message
│ </system-reminder>                   │
└──────────────────────────────────────┘
```

<a name="agent-status-bar-from-implicit-state-to-explicit-knowledge"></a>

### Agent 状态栏：从隐式状态到显式知识

提示词工程部分解决了"给模型什么静态指令"的问题。但在执行过程中，Agent 还需要动态跟踪自身状态。**Agent 状态栏**正是为此而生。

最贴切的类比是操作系统的状态栏。在手机上，屏幕顶部显示时间、电量和信号强度——让用户即时了解设备状态。Agent 状态栏对模型的作用类似：它是注入到上下文末尾的**状态摘要**。

为什么需要这个？理论基础是注意力的一个基本特性：**上下文内学习（in-context learning）更像检索而非推理**。模型擅长在上下文中找到已存在的信息，但在单次前向传播中主动总结和推导聚合状态时不太可靠。

考虑一个打电话的 Agent，要求对每个商家最多拨打三次电话。三次之后，它经常数错并拨打第四次。问题在于："我打了多少次电话？"并没有自动提炼为一个明确的事实，而是分散在原始的通话记录中。

当我们在每次工具结果中直接包含通话计数：

```xml
<agent_status>
Current State:
- Tool call summary: 'phone_call' invoked 3 times (Xfinity: 3/3)
- Constraint check: Maximum calls reached (3/3)
- TODO: [1] Cancel plan (in_progress)
</agent_status>
```

模型可以立即识别到已达到上限并停止。实验表明，对于弱模型，预计算的状态栏可将准确率恢复 40-54 个百分点；对于强模型，可减少 80-90% 甚至更多的推理 token。

三条可操作的经验：

1. **用代码维护状态栏，而非 LLM。** 一个 20 行的正则函数就能达到真实值的准确率；而前沿模型总结全部历史却产生大量错误条目。
2. **在删除原始上下文之前，确认状态栏覆盖了所有问题。** 状态栏是有损投影。如果问题涉及它未被设计捕获的信息，准确率会崩塌。
3. **将状态栏准确率作为一线生产指标监控。** 模型几乎无条件信任状态栏——如果它说"已拨打 3 次"，模型会不加验证地接受这个值。

<a name="context-compression-when-less-is-more"></a>

### 上下文压缩：少即是多

随着多轮交互的深入，上下文不断膨胀。压缩有两个不同的动机：

1. **应对长度和成本约束。** 上下文窗口有限，几轮工具调用就可能将其填满。
2. **提升推理质量。** 经过提炼的知识比原始信息对模型更有用。

第二个动机更深层也更容易被忽视。假设一个 Agent 通过 10 次网络搜索积累信息，原始结果分散在数万个 token 中。当 Agent 需要做最终决策时，其注意力变得分散。

在第 10 次搜索后，一次 LLM 调用就可以生成结构化摘要："当前已知：A 是……，B 是……，C 的信息仍然缺失。"模型随后可以使用这些提炼后的知识，而无需从原始数据中重新提取。

一种称为**上下文腐烂（Context Rot）**的现象使这一点至关重要。上下文腐烂不同于上下文溢出：溢出是"放不下了"，而腐烂是"放得下但找不到"。Agent 看起来在正常工作，但决策质量在悄然下降。

一项研究任务（追踪 OpenAI 联合创始人的在职状态）比较了六种压缩策略：

| 策略 | 压缩比 | Token 数 | 迭代次数 | 备注 |
|---|---|---|---|---|
| 不压缩 | 不适用 | 溢出 | 5 | 在 128K 限制处失败 |
| 逐条摘要 | 10.9% | 276,608 | 12 | 信息碎片化 |
| 合并摘要 | 4.3% | 93,449 | 10 | 末尾可能丢失信息 |
| 上下文感知 | 3.0% | 40,157 | 7 | 最佳效率 |
| 上下文感知 + 引用 | 4.1% | 222,992 | — | 可验证 |
| 自适应窗口 | 可变 | 174,601 | — | 仅在接近限制时压缩 |

上下文感知压缩——将当前查询意图纳入压缩决策——相比朴素方法减少了超过 75% 的 token 使用量。

Claude Code 等生产级系统使用**分层压缩机制**，包含五个层级，按成本递增顺序应用：

1. **工具结果预算控制**：大输出存储到磁盘，模型只看到预览。
2. **直接删除噪声**：低价值内容直接移除，不做摘要。
3. **API 级微压缩**：服务端从前缀中移除特定工具结果。
4. **归档摘要**：结构化的逐轮摘要（类似 `git log`）。
5. **全量压缩**：LLM 驱动的完整压缩，作为带有断路器的最后手段。

压缩最容易丢失的不是细节本身，而是**早期的架构决策、约束背后的理由以及失败的路径**。显式的保留优先级可以防止这种损失。

<a name="from-context-to-memory-making-agents-remember"></a>

## 从上下文到记忆：让 Agent 拥有记忆力

前面的章节讨论了单次会话内的上下文管理。但如何让 Agent 在对话结束后仍然记住用户、保留知识？

这个持久记忆系统在两个尺度上运作：

- **用户记忆（User Memory）** 是针对个人的个性化记忆——Agent 逐渐学习每个用户的偏好、习惯和需求。
- **知识库（Knowledge Base）** 是所有用户共享的集体知识——行业法规、公司流程、专业文档。

<a name="user-memory-building-a-model-of-the-user"></a>

### 用户记忆：构建用户模型

记忆不是用户说过的所有话的逐字记录。我们不会记住与朋友每次对话的原始内容；通过反复互动，我们形成了关于对方的心智模型。

在一次关于预订飞往东京航班的对话后，Agent 框架调用一个专用 LLM 来提取值得记住的信息：

```
Extracted memories:
- User prefers window seats (preference)
- User is vegetarian, needs special meals (dietary restriction)
- User's United MileagePlus number: 12345678 (loyalty program)
- User has travel plans to Tokyo (recent activity)
```

关键特征：**选择性**（短暂的信息被遗忘）、**抽象性**（具体事例变成一般偏好）、**结构性**（每条记忆都标有类型）。

一个三级评估框架衡量记忆能力：

| 级别 | 能力 | 示例 |
|---|---|---|
| 第一级：基础回忆 | 存储和检索直接提供的信息 | "我的会员号是 12345" |
| 第二级：跨会话检索 | 对跨越不同会话的信息进行推理 | 有两辆车的用户要求"安排保养"——Agent 找到两辆 |
| 第三级：主动服务 | 跨会话综合信息提供预测性帮助 | 预订国际航班 → 提示护照即将过期 |

记忆被划分为层次化级别，对应人类认知：

- **轨迹（Trajectory）**：单次会话的完整历史，只追加，不重写。
- **用户长期记忆**：跨会话的持久存储，反复重写、合并和修剪。

从认知科学的角度，长期记忆有三种类型，每种都有 Agent 对应物：

| 认知类型 | 人类示例 | Agent 对应物 |
|---|---|---|
| 情景记忆 | "上周三和同事吃了顿很棒的晚餐" | "用户预订了下周五飞往东京的 ANA 航班" |
| 语义记忆 | "意大利的首都是罗马" | "用户是素食主义者，偏好靠窗座位" |
| 程序性记忆 | 骑自行车的能力 | "先搜直飞 → 确认座位 → 使用常旅客号码" |

<a name="four-storage-formats-from-simple-notes-to-advanced-json-cards"></a>

### 四种存储格式：从简单笔记到高级 JSON 卡片

同一条用户信息可以用不同粒度来表示：

**简单笔记（Simple Notes）** —— 每条记忆是一个最小的、不可再分的事实（"User email: john@example.com"）。开销最小，但事实之间的关联完全丢失。"在 TechCorp 担任高级工程师，做推荐系统"变成三个不相连的碎片。

**增强笔记（Enhanced Notes）** —— 每条记忆是一个包含完整上下文的段落。保留了叙事结构，但存在存储冗余、更新复杂度高、段落过长影响检索准确性等问题。

**JSON 卡片（JSON Cards）** —— 三级嵌套结构（类别 → 子类别 → 键值对），模拟人类的分类方式。支持部分更新，但强制信息归入单一类别。

**高级 JSON 卡片（Advanced JSON Cards）** —— 每张卡片记录事实 + 叙事背景（backstory）、主体身份（person）和关系。解决歧义问题："张医生"可能是用户的牙医，也可能是用户父亲的心脏科医生。

| 格式 | 优势 | 劣势 |
|---|---|---|
| 简单笔记 | O(1) 操作，开销最小 | 关联丢失 |
| 增强笔记 | 语义完整 | 冗余，难以更新 |
| JSON 卡片 | 结构化，支持部分更新 | 强制单一分类 |
| 高级 JSON 卡片 | 消歧，丰富的上下文 | 维护成本高 |

实践中混合使用效果最好：对**关键的、少量的**的数据使用高级 JSON 卡片；对**大量的、非关键**的事实使用简单笔记。

<a name="rag-giving-agents-a-knowledge-base"></a>

### RAG：为 Agent 赋予知识库

构建共享知识库的核心技术是**检索增强生成（Retrieval-Augmented Generation，RAG）**。核心思想：将 LLM 的推理能力与外部知识库的广度和时效性相结合。

一个典型的 RAG 系统有两部分：**检索器**（找到相关片段）和**生成器**（将片段作为上下文生成答案）。

```python
# 1. User query
query = "What is quantum entanglement?"

# 2. Retrieval: Find relevant fragments
results = retriever.search(query, top_k=3)

# 3. Generation: LLM uses retrieved results as context
answer = llm.generate(
    system="Answer based on the following reference materials.",
    context=results,
    question=query
)
```

检索器的质量直接决定了 RAG 的效果。两种主要的检索方法互为补充：

**稠密嵌入（Dense Embeddings）** 将文本映射到向量空间，语义相似的内容向量距离相近。它们能理解"kitty"和"cat"是相关的，但可能错过精确的关键词匹配。

**稀疏嵌入（Sparse Embeddings）**（如 BM25）源自传统的关键词匹配。稀疏向量的大部分维度为零——只有文档中出现的词对应的维度非零。BM25 在 TF-IDF 的基础上引入了词频饱和和文档长度归一化。

```
Query: "model distillation"
Word "model"  → appears in 60/100 docs → low IDF → low discriminative power
Word "distillation" → appears in 3/100 docs → high IDF → high discriminative power

BM25 ranking weights "distillation" much more heavily than "model"
```

**混合检索**将两者结合：并行运行两个引擎，使用倒数排名融合（Reciprocal Rank Fusion，RRF）合并结果，再用神经重排序器（reranker）做最终排序。

```
┌──────────┐     ┌──────────┐
│  Dense   │     │  Sparse  │
│ Retrieval│     │ Retrieval│
└────┬─────┘     └────┬─────┘
     │                │
     └───────┬────────┘
             ↓
     ┌───────────────┐
     │  Result Fusion│  (RRF: score = Σ 1/(k + rank))
     └───────┬───────┘
             ↓
     ┌───────────────┐
     │Neural Reranker│  (Cross-Encoder, deep matching)
     └───────┬───────┘
             ↓
        Final ranking
```

<a name="beyond-flat-text-structured-indexing-and-agentic-rag"></a>

### 超越扁平文本：结构化索引与 Agentic RAG

简单的分块有一个根本性的局限：它将知识扁平化，忽略了结构和跨文档关系。两个案例说明了这一点：

**黑猫计数问题**：如果知识库有 100 个案例文档（90 只黑猫，10 只白猫），用户问"比例是多少？"，top-k 检索只返回一个样本。模型看到 15 只黑猫和 3 只白猫，得出了错误的结论。一个预生成的摘要（"总计：90 只黑猫，10 只白猫"）就能立即解决。

**Xfinity 折扣问题**：三个孤立的案例——退伍军人 John 获得了折扣，医生 Sarah 获得了折扣，教师 Mike 不符合资格。当一位护士咨询时，检索器优先返回 Sarah 的案例（"nurse"和"doctor"的语义相似度），遗漏了 Mike 的案例，导致错误推断护士也有资格。

两个案例指向同一个结论：**朴素的 RAG 不够用**。模型的注意力是基于相似度的软检索系统，而不是主动总结的思考引擎。必须在索引阶段投入计算。

**RAPTOR** 构建树形层次结构：对相似的叶节点聚类，生成父级摘要，递归向上。检索可以在任何抽象层级进行。

**GraphRAG** 将知识建模为实体-关系图。其不可替代的能力是**多跳推理**："我的医生所在医院的地址是什么？"需要遍历 用户 → 医生 → 医院 → 地址。

| 方法 | 结构 | 最适用场景 |
|---|---|---|
| RAPTOR | 树形层次结构 | 从概念下钻到细节 |
| GraphRAG | 实体-关系图 | "A 和 B 的关系是什么？"类查询 |

**Agentic RAG** 将检索从固定管道变为动态的、迭代式的探索。知识库成为 Agent 随时可调用的工具，遵循 ReAct 循环：

```
Think: "Need sentencing standards for negligent injury + intoxication + prior theft"
  ↓
Act: Search for each sub-question in parallel
  ↓
Observe: Found basic provisions but missing link between prior theft and current offense
  ↓
Think: "Need to search for recidivism rules across charges"
  ↓
Act: Search for "recidivism" + "negligent injury"
  ↓
Observe: Found judicial interpretations
  ↓
Generate final answer with complete legal basis
```

<a name="contextual-retrieval-fixing-chunking-at-the-root"></a>

### 上下文检索：从根源解决分块问题

即使有了 Agentic RAG，传统的分块仍然是瓶颈。一个孤立的片段如"公司第二季度收入增长了 3%"是模糊的——哪家公司？什么时候？哪条产品线？

**上下文检索（Contextual Retrieval）** 从源头修复这个问题：在索引之前，用 LLM 为每个分块生成一个简短的上下文前缀，然后将其与原始文本拼接。

```
Original chunk: "Revenue grew by 3%"

With context prefix:
"[Excerpted from 'Key Performance Indicators' section of ACME Corp 2025 Q2 Financial Report]
 Revenue grew by 3%"
```

这同时增强了两种检索模式：BM25 获得了丰富的可匹配关键词（"ACME"、"2025 Q2"），稠密嵌入获得了准确的语义背景。根据 Anthropic 的研究，与 BM25 结合时检索失败率降低 49%，加上 reranker 后降低 67%。

<a name="the-two-tier-memory-architecture"></a>

### 两层记忆架构

用户记忆的最高层次——**主动服务**——需要同时具备全局概览和精确细节。仅靠常驻上下文会因容量限制丢失细节；仅靠检索会遗漏隐含的跨会话关联。

解决方案是**两层记忆架构**：

```
┌─────────────────────────────────────────────┐
│              Tier 1: Overview               │
│  Advanced JSON Cards, resident in context   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │Passport │ │ Trips   │ │ Family  │        │
│  │expires  │ │ Tokyo   │ │ members │        │
│  │2025-02  │ │ 2025-01 │ │ ...     │        │
│  └─────────┘ └─────────┘ └─────────┘        │
├─────────────────────────────────────────────┤
│              Tier 2: Details                │
│  Contextual Retrieval, on-demand access     │
│  ┌─────────────────────────────────────┐    │
│  │ Original conversation chunks with   │    │
│  │ context prefixes, fetched via RAG   │    │
│  │ when details are needed             │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

当用户预订国际航班时：

1. **事实回顾**：Agent 回顾 JSON Cards，识别出"东京行程"和"护照信息"
2. **关联推理**：航班日期（一月）接近护照到期日（二月）
3. **细节验证**：使用上下文检索查找关于护照和航班的原始对话
4. **主动服务**："您的护照即将到期，建议尽快办理加急换发。"

<a name="harness-engineering-reliability-beyond-the-demo"></a>

## Harness 工程：超越 Demo 的可靠性

核心公式描述了 Agent 的内部组成。但在可运行的 Demo 和可靠的产品之间存在巨大差距。**Harness 工程**是实施层面的视角：将 LLM 视为一个核心组件（Model），将所有辅助代码称为 Harness。

扩展后的生产级组成：

> **Agent = LLM + [Context + Tools + Constrain + Verify + Correct] = Model + Harness**

一个具体例子展示了其价值。假设你让 Agent 为一笔 3 天前的订单退款：

| 没有 Harness | 有 Harness |
|---|---|
| 未收到退款策略（无上下文） | 系统提示指定 7 天退款政策 |
| 不知道该调用哪个 API（无工具） | 调用 `query_order` 和 `process_refund` 工具 |
| 捏造退款结果（无验证） | 框架检查退款金额不超过订单总额 |
| 用户发现退款从未执行（无纠正） | 与数据库确认；超时自动重试 |

<a name="constrain-verify-correct-the-three-safety-layers"></a>

### 约束、验证、纠正：三层安全保障

| 功能 | 核心原则 | 实践示例 |
|---|---|---|
| **上下文** | 信息充分性 | 系统提示、知识库 |
| **工具** | 清晰的接口 | 工具名称直观，参数有示例 |
| **约束** | 故障安全默认值 | 每个工具默认需要用户授权 |
| **验证** | 输入隔离 | 安全检查只看结构化数据，不看自由文本 |
| **纠正** | 在确认失败之前隐藏中间状态 | 静默重试，连续失败时触发断路器 |

护栏（Guardrails）以纵深防御的方式实现约束/验证/纠正层：

- **输入侧**：相关性分类器、安全分类器、内容审核、基于规则的防护
- **执行侧**：工具风险评级（低/中/高），高风险操作需要人工确认
- **输出侧**：PII 过滤器、输出值与品牌价值的校验

<a name="workflow-vs-autonomous-choosing-the-right-pattern"></a>

### 工作流 vs. 自主模式：选择正确的模式

**工作流（Workflows）** 通过预定义的代码路径编排 LLM。执行路径是确定性的——关键步骤不会被跳过。一个航班预订工作流有四个固定节点：验证身份 → 搜索航班 → 完成支付 → 确认预订。系统不会在支付完成前就预订。

**自主 Agent（Autonomous Agents）** 在运行时根据环境反馈确定执行路径。用户说"帮我订一张下周三飞上海的机票"，Agent 动态地搜索、验证身份、根据中转情况调整条件等。

| 模式 | 优势 | 局限 |
|---|---|---|
| 工作流 | 严格的流程控制，安全性 | 缺乏灵活性 |
| 自主 Agent | 灵活，能适应意外情况 | 成本更高，错误会累积 |

实践中，二者并非互斥：有合规要求的关键流程用工作流，灵活的决策切换为自主模式。

构建高效 Agent 的三个核心原则：

1. **保持简单。** 从最简方案开始，只在必要时增加复杂度。
2. **保持透明。** 展示 Agent 的规划步骤、执行日志和决策轨迹。
3. **设计结构良好的工具接口（ACI）。** 工具名称应直观易懂；设计应防止可能的误操作（防呆设计/Poka-yoke）。

<a name="best-practices"></a>

## 最佳实践

基于上述概念，以下是构建 Agent 的实践指南：

**上下文设计**
- 系统提示和工具定义一旦确定就保持稳定——任何改动都会使 KV Cache 失效。
- 将动态信息（时间戳、状态）追加在上下文末尾，永远不要放在系统提示中。
- 使用结构化格式（XML 标签、Markdown）编写指令；提供流程驱动的 SOP，而非散落的规则。
- 将业务规则定义到可执行的精度："NEVER use percentage-based billing for refunds."

**记忆设计**
- 采用混合记忆方案：关键少量数据用高级 JSON 卡片，大量非关键事实用简单笔记。
- 用代码（正则函数）维护 Agent 状态栏，而非 LLM 摘要。
- 将状态栏准确率作为一线生产指标监控——模型无条件信任它。

**检索设计**
- 结合稠密检索和稀疏检索，再用神经重排序器，构建生产级 RAG。
- 在索引阶段应用上下文检索——在嵌入之前为分块生成上下文前缀。
- 对需要多跳推理的复杂问题使用 Agentic RAG；对明确、窄范围的查询使用简单 RAG。

**压缩设计**
- 在接近上下文限制时按批次压缩，而非每轮都压缩。
- 压缩时保留架构决策、关键约束、验证状态和未完成的 TODO。
- 保留精确的标识符（UUID、哈希、URL、文件名）——改一个数字就会导致后续工具调用失败。

**安全设计**
- 用来源标记标注外部内容，防止提示注入。
- 实施工具风险评级，高风险操作需要人工确认。
- 设置失败阈值和断路器，防止无限循环。
- 使用子 Agent 上下文隔离，将大量中间内容排除在主上下文之外。

<a name="faq"></a>

## 常见问题

**Q：如果模型越来越强，上下文工程还重要吗？**

方向上，模型会内化 Harness 的部分能力——工具调用和长期规划曾经是外部编排的功能，现在已是原生能力。但实际上，这种内化比直觉上认为的要慢得多。训练需要数月时间，模型不可能一次性内化所有真实业务的约束和偏好。模型当前的能力边界，恰恰是 Harness 创造价值的地方。

**Q：上下文内学习和真正的记忆有什么区别？**

上下文内学习快速但短暂——会话结束就消失了。其机制更接近模式匹配而非真正的学习；它让模型应用已经见过的模式，但无法发现全新的规则。用户记忆（持久、可审查的存储）和外化学习（知识库、工具代码）提供了上下文内学习无法提供的可靠性和持久性。

**Q：什么时候用工作流，什么时候用自主 Agent？**

从单次 LLM 调用开始。如果更好的提示就能解决问题，就不要构建 Agent。当需要多个步骤且任务可分解为固定子任务时，使用工作流。只有在需要动态决策和灵活执行路径时才使用自主 Agent。Agent 系统通常以延迟和成本换取更好的任务表现——评估这个权衡是否值得。

**Q：如何防止 Agent 中的提示注入？**

单一防御不够——需要纵深防御。在上下文层面：用来源标记标注外部内容（`<external_content source="webpage">`），严格使用结构化角色，过滤可疑模式。在执行层面：实施工具风险评级，高风险操作需要授权，防止检索到的内容直接触发不可逆操作。上下文层防御可以降低攻击成功率，但不能保证完全安全。

**Q：知识库应该选择哪种检索策略？**

如果查询主要是"找到包含这个信息的文档片段"，混合检索（稠密 + 稀疏 + 重排序）就足够了。如果查询需要跨文档综合或多层导航，投资结构化索引（RAPTOR 或 GraphRAG）。其成本是索引构建时 LLM 调用量的大幅跃升，因此只在简单方案不够用时再升级。

**Q：应该多频繁地压缩上下文？**

在上下文接近阈值（例如窗口大小的 80%）时按批次压缩，而非每轮都压缩。频繁压缩会反复破坏缓存。采用分层方法：先工具结果预算控制，再噪声删除，再 API 级微压缩，再归档摘要，最后全量压缩作为带有断路器的最后手段。

<a name="summary"></a>

## 总结

本文沿着三个层次梳理了现代 AI Agent 的核心思想：

**核心公式**：Agent = LLM + 上下文 + 工具。LLM 提供推理，上下文提供决策时的信息工作集，工具提供行动接口。ReAct 循环——推理、行动、观察、重复——将它们连接成一个可运作的系统。

**上下文工程**：上下文决定了 Agent 能力的天花板。在 API 层面，上下文是静态前缀（系统提示 + 工具定义）加上动态轨迹（消息历史）。KV Cache 要求前缀稳定。提示词工程编写 Agent 的操作手册。Agent 技能按需加载知识。Agent 状态栏将隐式状态转化为显式知识。上下文压缩控制长度并提升推理质量——不仅是管理长度，更是主动将原始数据提炼为高密度的结构化知识。

**从上下文到记忆**：用户记忆在跨会话中构建个人模型；知识库提供共享的领域专业知识。四种存储格式在简洁性和表达力之间权衡。RAG 将稠密检索和稀疏检索与神经重排序相结合。结构化索引（RAPTOR、GraphRAG）和 Agentic RAG 超越了扁平文本。上下文检索从根源修复分块问题。两层记忆架构——常驻 JSON Cards 提供概览，按需上下文检索提供细节——使主动服务成为可能。

**Harness 工程**：模型能力正在商品化；真正的差异化在于 Harness——围绕上下文和工具构建的约束、验证和纠正机制。随着模型能力趋同，竞争优势转向模型之外的工程。

贯穿始终的主线：**不要让模型被动地在海量信息中搜索；主动提供经过提炼的、结构化的知识。** 这一原则从提示设计贯穿到压缩再到两层记忆架构——它也是 Bitter Lesson（苦涩的教训）在工程时间尺度上的实践。
