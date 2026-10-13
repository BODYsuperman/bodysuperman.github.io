title: "从能力到智能：AI Agent 的工具、编程与评估"
date: 2026-06-17 15:09:38
updated: 2026-07-24 15:09:38
comments: true
lang: zh-CN
categories:
  - AI Agent
  - AI Engineering
tags:
  - LLM
  - Agent Engineering
  - Tool Calling
  - Coding Agent
  - Agent Evaluation
---

- [引言](#introduction)
- [是什么：Agent 智能的三层模型](#what-the-three-layer-model-of-agent-intelligence)
- [工具：Agent 的手脚与感官](#tools-the-agents-hands-feet-and-senses)
  - [工具分类：五大类别](#tool-classification-five-categories)
  - [工具设计的通用原则](#universal-principles-of-tool-design)
  - [MCP 生态与工具选择的挑战](#the-mcp-ecosystem-and-the-challenge-of-tool-selection)
  - [执行安全：提案者-审核者与 Sidecar](#execution-security-proposer-reviewer-and-sidecar)
  - [事件驱动的异步 Agent](#event-driven-asynchronous-agents)
  - [主动工具发现与技能](#proactive-tool-discovery-and-skills)
- [编程 Agent：代码作为元能力](#coding-agent-code-as-the-meta-capability)
  - [七大核心工具与文件系统枢纽](#the-seven-core-tools-and-the-file-system-hub)
  - [安全：致命三角与信任边界](#security-the-lethal-triad-and-trust-boundaries)
  - [编程 Agent 的 Harness 工程](#harness-engineering-for-coding-agents)
  - [失败与错误恢复](#failure-and-error-recovery)
  - [代码作为元能力的六个方向](#six-directions-of-code-as-meta-capability)
- [评估：如何知道它到底行不行](#evaluation-knowing-whether-it-actually-works)
  - [一个具体例子](#a-concrete-example)
  - [自动化评估环境](#automated-evaluation-environments)
  - [设计评估数据集](#designing-evaluation-datasets)
  - [指标体系：Pass@k 与 Pass^k](#the-metrics-system-passk-vs-passk)
  - [LLM-as-a-Judge 与评分标准](#llm-as-a-judge-and-rubrics)
  - [成对比较与模型排名](#pairwise-comparison-and-model-ranking)
  - [统计显著性](#statistical-significance)
  - [从基准测试到系统改进](#from-benchmark-to-system-improvement)
- [示例：一个端到端的迷你案例](#example-an-end-to-end-mini-case)
- [最佳实践](#best-practices)
- [常见问题](#faq)
- [总结](#summary)
- [附录](#appendix)

<!--more-->

<a name="introduction"></a>

## 引言

在科幻电影《她》（_Her_）中，AI 助手 Samantha 能够主动整理邮件、代替用户谈判，并在多种沟通渠道之间无缝切换。她的智能之所以令人信服，是因为她拥有强大的**工具**——那些将语言"大脑"与真实数字世界连接起来的"手脚与感官"。

用当今技术构建这样的助手，意味着要解决三个层层递进的挑战：

1. **工具设计**：Agent 如何从数百个候选工具中准确选出正确的那个？当这些工具能删除文件、花费金钱时，我们如何保障 Agent 的安全？
2. **代码作为元能力**：当没有现成的合适工具时，Agent 能否*现场编写一个*？编程 Agent 加文件系统，被证明是每一个通用 Agent 的架构核心。
3. **评估**：我们如何*知道*一项设计变更是否真正有效——以及是否可以安全上线？

这三个层次依次回应彼此。工具赋予能力；代码赋予通用性；评估赋予可靠性。本文将完整阐述这三个层次，提炼出该主题三章篇幅中的关键工程原则。

<a name="what-the-three-layer-model-of-agent-intelligence"></a>

## 是什么：Agent 智能的三层模型

```
┌─────────────────────────────────────────┐
│  Evaluation Layer                       │  "How do we know it works?"
│  Rubrics, LLM-as-Judge, Pass@k          │
├─────────────────────────────────────────┤
│  Meta-Capability Layer (Code)           │  "Can it create new tools?"
│  7 Core Tools + File System + Sandbox   │
├─────────────────────────────────────────┤
│  Tool Layer                             │  "What can it do right now?"
│  Perception / Execution / Collaboration │
│  Event-Triggered / User Communication   │
└─────────────────────────────────────────┘
```

每一层都是必要的，但单独存在都不充分。一个拥有强大工具但不会写代码的 Agent 无法适应新格式。一个会写代码但没有评估的 Agent 只能盲目运行。而没有底下两层的评估，则是在衡量一个尚不存在的东西。本文的后续部分将逐一展开每一层。

<a name="tools-the-agents-hands-feet-and-senses"></a>

## 工具：Agent 的手脚与感官

<a name="tool-classification-five-categories"></a>

### 工具分类：五大类别

每个 Agent 工具都属于五大类别之一，区分标准是**谁发起**交互以及**作用于什么**：

| 工具类型     | 调用方向                     | 作用对象                 |
| ------------ | ---------------------------- | ------------------------ |
| 感知类       | Agent 主动调用               | 获取信息                 |
| 执行类       | Agent 主动调用               | 改变世界                 |
| 协作类       | Agent 主动调用               | 驱动其他 Agent 或人类    |
| 用户沟通类   | Agent 主动调用               | 向用户传递信息           |
| 事件触发类   | Agent 注册，外部触发         | 驱动 Agent 开始执行       |

**感知类工具**——`web_search`、`read_file`、`grep`——是 Agent 的感官。它们的只读特性使其天然可缓存、可并行：你可以同时读取五个文件而无需担心相互干扰。

**执行类工具**——`write_file`、`shell_exec`、`send_email`——是 Agent 的双手。这里的错误代价高昂（删除的文件不可恢复），因此安全约束是其核心设计关注点。

**协作类工具**——`spawn_subagent`、`send_message_to_subagent`——实现分工。最表层的原因是并行性；更深层的原因是专业化：为不同子任务使用不同的模型、工具和提示词。

**用户沟通类工具**——`reply_to_user`、`send_card_to_user`——当"说话"本身必须成为一次显式的工具调用时出现，例如在多渠道异步消息场景中。

**事件触发类工具**——`set_timer`、`monitor_shell`、`connect_channel`——让*外部世界*唤醒 Agent。没有它们，Agent 只能在用户发送消息时响应；它无法按计时器行动，也无法对新邮件做出反应。

<a name="universal-principles-of-tool-design"></a>

### 工具设计的通用原则

无论哪种类别，每个工具都应遵循一组原则，这些原则区分了玩具级 Agent 和生产级 Agent。

**粒度：相似则整合，相异则分离。** `extract_pdf_text`、`extract_docx_content` 和 `extract_pptx_content` 共享同一个职责——从文档中提取文本。一个统一的 `read_document` 工具加上 `file_type` 参数，可以降低 LLM 的认知负担。但不要强行把图片 OCR 和视频关键帧提取合并到一个工具中——它们的参数和延迟差异太大。

**通用性优于特殊性——除非安全要求例外。** 一个集成了 SymPy 和 NumPy 的 `code_interpreter` 可以替代几十个计算器。其逻辑是：*LLM 本身就拥有强大的推理和代码生成能力；利用它们而非限制它们。*

**描述是最重要的一行代码。** 工具描述必须告诉 LLM **何时使用它**，而不仅仅是它能做什么。"当你需要实时信息时使用"比"搜索相关内容"要好得多。同样重要的是：**说明工具不能做什么**。大多数工具调用失败的根源，不是模型不知道工具*能*做什么，而是不知道它*不能*做什么。

具体的参数示例能显著提升准确性。`"+8613888888888"（中国）`比"E.164 格式"好得多。在某些基准测试中，添加示例将工具调用准确率从约 72% 提升到了约 90%。

**保真性：禁止静默转换。** 一个悄悄将弯引号转换为直引号的工具，会在模型感知的世界与工具操作的世界之间制造系统性偏差——这种故障模型无法自行诊断。参数传递必须保持透明。

<a name="the-mcp-ecosystem-and-the-challenge-of-tool-selection"></a>

### MCP 生态与工具选择的挑战

**Model Context Protocol（MCP）** 是一个开放标准，统一了工具通信——"开发一次，处处使用"。MCP 服务器通过 JSON Schema 暴露工具；任何兼容的客户端（Cursor、Claude Desktop、OpenClaw）都可以无需适配直接使用。

但 MCP 也带来了两个实际挑战：

1. **上下文开销。** 五个 MCP 服务器可能消耗约 55,000 个 token 的工具定义——在对话开始之前，就占据了 200K 上下文窗口的近 30%。缓解方案：**渐进式披露（progressive disclosure）**。默认只显示工具名称索引；按需查询具体定义。Cursor 的 A/B 测试表明，这将 MCP 相关的 token 消耗减少了 46.9%。

2. **安全性。** 每个 MCP 服务器都会向上下文中注入文本，且通常需要凭证。存在四类风险：
   - **工具描述投毒**：嵌入工具描述中的恶意指令（提示注入的变种）
   - **恶意或被入侵的服务器**：通过服务器更新进行的供应链攻击
   - **工具遮蔽（tool shadowing）**：恶意服务器提供与合法工具同名的工具
   - **凭证管理**：被诱导使用 OAuth 令牌执行非预期操作

   缓解措施：集成前审查描述、锁定服务器版本、授予最小权限凭证、使用独立的 Sidecar 进行运行时检查。

<a name="execution-security-proposer-reviewer-and-sidecar"></a>

### 执行安全：提案者-审核者与 Sidecar

执行类工具需要多层防御。除了输入验证和权限控制之外，两种更高级别的机制增加了独立的审查层：

**提案者-审核者（Proposer-Reviewer，事前审批）。** 在执行不可逆操作（转账、修改生产配置）之前，一个模型提出操作方案，由来自*不同模型家族*的第二个模型进行审核。不同的训练数据带来认知多样性；相近的能力确保审核者能理解提案者的推理。被拒绝后，拒绝理由作为工具错误重新进入 Agent 的轨迹——Agent 本来就擅长处理工具失败。

**Sidecar（并行把关）。** 当主模型流式输出工具调用时，一个独立的轻量级 LLM 对该调用进行安全分类——只看结构化字段 `{tool, parameters}`，不看主模型的自由文本思考过程。这阻断了提示注入所利用的语义通道。轻量级模型足以胜任，因为它判断的是结构化数据上的*分类问题*（这条命令是否越界？），而非开放式推理任务。

| 维度         | 提案者-审核者                               | Sidecar                                          |
| ------------ | -------------------------------------------- | ------------------------------------------------ |
| **时机**     | 操作前或操作后                               | 与流式输出并行，把关每次调用                     |
| **目标**     | 操作或结果的合理性                           | 操作本身                                         |
| **输入隔离** | 提案者和审核者看到相似信息                   | Sidecar 刻意隔离自由文本                         |
| **典型用途** | 不可逆审批、文档审查                         | 权限分类、输出摘要                               |

<a name="event-driven-asynchronous-agents"></a>

### 事件驱动的异步 Agent

同步 Agent 就像一个只有一个收银台的柜台——一次服务一位顾客。一个真正的助手需要同时处理多个待办事项并响应中断。这需要一个**事件驱动的异步架构**，将所有输入——用户消息、工具返回、外部回调、计时器触发——统一为事件流，由事件循环处理。

三种处理策略应对不同紧急程度的事件：

| 策略         | 适用场景                                              | 机制                                                                   |
| ------------ | ----------------------------------------------------- | ---------------------------------------------------------------------- |
| **取消**     | 紧急事件（用户说"停！"）                             | 中断当前步骤，强制到达安全点，追加事件，重新调用 LLM                   |
| **排队**     | 常规事件（工具结果到达）                              | 追加到队列；在下一个安全点批量处理                                     |
| **并行**     | 独立的轻量查询（"天气怎么样？"）                      | 启动一个独立的推理会话                                                 |

**根本矛盾**：LLM 是在同步轨迹上训练的——一次工具调用之后，下一条消息必须是工具返回结果。而真实部署要求异步——用户会中断，任务会并行推进。工程上的变通方案：正常情况下，向 LLM 展示一条完美的同步轨迹；只有在中断真正发生时，插入一个占位符来修补格式。根本性的修复有待下一代在异步强化学习上训练的模型。

<a name="proactive-tool-discovery-and-skills"></a>

### 主动工具发现与技能

当工具从几十个增长到数百个时，一次性注入所有 schema 会堵塞上下文并降低选择准确率。三种方法可以扩展到这种规模：

1. **基于检索的预过滤**：对工具描述做向量嵌入；查询时检索 top-k 候选。局限：仅针对初始查询匹配一次——无法预见多步骤跨领域的工具链。

2. **主动发现（MCP-Zero）**：Agent 在思考过程中发出结构化的能力请求；系统实时匹配并注入。报告显示，在约 2,800 个工具中实现了约 98% 的 token 缩减。动态加载将 schema 追加到上下文*末尾*，保留稳定前缀上的 KV Cache。

3. **技能（Skills，渐进式披露）**：启动时 Agent 只看到一个精简目录——每个技能的名称和描述。当当前上下文需要某项能力时，模型按需读取对应的技能文档。无需维护嵌入索引；Agent 只需要通用的文件读取能力（`grep`、`read_file`）即可浏览技能目录。

技能将"工具选择"转化为"知识检索"——而这正是 LLM 擅长的事。

<a name="coding-agent-code-as-the-meta-capability"></a>

## 编程 Agent：代码作为元能力

<a name="the-seven-core-tools-and-the-file-system-hub"></a>

### 七大核心工具与文件系统枢纽

一个面向开放式任务的通用 Agent，其核心是一个**编程 Agent**加上一个**文件系统**。这不是理论——从 Manus 到 OpenClaw，每一个成功的通用 Agent 都遵循这种范式。

一个基本的编程 Agent 只需要七个工具：

| #   | 工具             | 用途                                   |
| --- | ---------------- | -------------------------------------- |
| 1   | Code Interpreter | 在沙箱中执行 Python                    |
| 2   | Bash Shell       | 运行终端命令                           |
| 3   | Read File        | 读取代码、配置、日志                   |
| 4   | Write File       | 创建或覆盖文件                         |
| 5   | Edit File        | 部分修改（迭代的核心）                 |
| 6   | Glob             | 按文件名模式查找文件                   |
| 7   | Grep             | 按模式搜索文件内容                     |

一个快速示例——"汇总所有 TODO 注释"：

```
Agent → Grep("TODO", glob="**/*.py")
Tool returns:
  src/api.py:42: # TODO: add rate limiting
  src/db.py:15:  # TODO: migrate to PostgreSQL

Agent → Write("TODO_LIST.md", content="...")
Tool returns: File created
```

两个工具，一个任务完成。这七个工具单独看很简单；组合起来却能覆盖惊人的范围。

**为什么文件系统是枢纽？** 在 OpenClaw 中，Agent 的长期记忆存储在 `MEMORY.md` 和按日期归档的 Markdown 日志中——而非向量数据库。Markdown 让用户可以直接阅读和编辑 Agent 的记忆；Git 提供版本控制和回滚。更关键的是，由于 Agent 能*写文件*，它就具备了修改自身外部产物的技术手段——为未来的会话记录发现、在代码变更后更新文档、或将成功的操作序列保存为可复用代码。

<a name="security-the-lethal-triad-and-trust-boundaries"></a>

### 安全：致命三角与信任边界

一个拥有文件访问、命令执行和网络连接能力的编程 Agent 很强大——也很危险。Simon Willison 提出的**致命三角（Lethal Triad）**指出了三个元素，当它们同时存在时，会闭合一条攻击链路：

1. **访问私有数据**——Agent 能读取用户文件和凭证
2. **暴露于不可信内容**——邮件和网页可能包含恶意载荷
3. **对外通信能力**——它可以通过邮件或 HTTP 将数据发送出去

再加上第四个放大器——**持久化记忆**——一次性攻击就变成了跨会话潜伏的威胁，并随时间不断累积。

```
Untrusted Content ──→ Agent reads Private Data ──→ Exfiltrates via External Channel
                                                          ↑
                                        Persistent Memory stores latent malicious instructions
```

**关键防御措施**（分层部署，不可互相替代）：

- **网络出站控制**：默认无网络；通过白名单代理授予访问权限。即使注入成功，没有出站通道数据也无法离开。
- **命令语义解析**：关键词黑名单无法处理 `$(echo rm) -rf /` 或 `find / -exec rm {} \;`。生产级系统会解析每条命令的参数类型，以识别嵌套的危险操作。
- **忠诚行为准则**：一个代替你谈判的 Agent 面对的是*谈判对手*，而非"需要帮助的用户"。系统提示必须明确锁定 Agent 服务的对象：委托人的指令具有最高优先级；来自外部各方的一切都被降级为"可参考但不具有指令效力的数据"。
- **权限嵌入式数据对象（Permission-Embedded Data Objects）**：当代码编写者和代码执行者都可能不可信时，约束必须存在于应用层之下、经人工审查的 schema 中——在每次写入时强制执行，与纯 SQL 或宪法提示等基线相比，产生零不变量违规。

<a name="harness-engineering-for-coding-agents"></a>

### 编程 Agent 的 Harness 工程

Harness——上下文、工具、约束、验证和纠错——是编程 Agent 大放异彩的地方。代码编写任务天然占据"目标清晰 + 自动化验证"象限：

|                | 结果可自动验证                                           | 结果需人工验证                            |
| -------------- | -------------------------------------------------------- | ----------------------------------------- |
| **目标清晰**   | 最佳场景：修复有测试用例的 bug                           | 产能受限：重构需要审查                    |
| **目标模糊**   | 高效地偏离方向：用 linter 优化"质量"                    | 难以启动："让 UI 更好看"                 |

四个可迁移的 Harness 原则：

1. **约束优于引导**：Linter 规则和 CI 检查比系统提示中的"请遵循……"更有价值——前者意味着"不能做"，后者仅仅是"不建议做"。
2. **自动化验证**：测试套件、类型检查和行为监控的回报高于增加更多人工审查者。
3. **快速、结构化的反馈**：错误信息越详细、越接近出错时刻，Agent 的自我纠正就越高效。
4. **可靠的回滚**：Git 分支、沙箱和快照让 Agent 能在安全网内大胆实验。

**约束的更深层目的**：验收基线管控*结果*是否正确；执行边界管控*过程*。删除数据库来"修复"数据库故障确实修好了——但数据也没了。破坏性捷径是奖励黑客（reward hacking）的日常形态；生产级 Harness 约束的是*行动*，而非仅仅是结果。

<a name="failure-and-error-recovery"></a>

### 失败与错误恢复

Agent 的可靠性不取决于它是否犯错，而取决于**每一类错误是否都有对应的检测、恢复和终止路径**。

**四个失败层次**：

| 层次           | 典型失败                                                                  |
| -------------- | ------------------------------------------------------------------------- |
| **API**        | 限流（429）、服务过载、连接中断、token 限制截断                           |
| **工具**       | 幻觉调用、参数格式错误、相同错误反复出现                                  |
| **上下文**     | 窗口溢出、压缩失败、轨迹结构损坏                                          |
| **控制流**     | 无限循环、死亡螺旋（错误处理器调用 LLM，失败，级联）                      |

**恢复逐级升级，可见度递增**：

1. **静默重试**——对可重试错误使用带抖动的指数退避
2. **降级继续**——提高输出上限、回退到另一个模型、去除专有格式
3. **上报给用户**——只有在所有自动手段用尽之后

**终止：每条恢复路径都需要上限。** 熔断器防止无限重试。对于死亡螺旋，在错误路径上禁用所有调用模型的副作用，并使用递归深度计数器。在所有自动机制之上，是全局终止条件：最大轮次、会话预算上限、以及升级到人工干预。

<a name="six-directions-of-code-as-meta-capability"></a>

### 代码作为元能力的六个方向

代码对 Agent 的作用远不止编写程序。以下六个方向由内而外递进：

| #   | 方向               | 代码的作用对象                                                  |
| --- | ------------------ | --------------------------------------------------------------- |
| 1   | 思维工具           | 推理本身——精确计算 vs. 概率性猜测                             |
| 2   | 业务规则约束       | 模糊策略 → 可执行、确定性的验证器                              |
| 3   | 多媒体生成         | PPT、视频、可视化，通过代码 + 提案者-审核者                    |
| 4   | 系统适配器         | 异构 API、不断演变的日志格式                                   |
| 5   | 生成式 UI          | 动态表单、SQL 工件、可定制应用                                 |
| 6   | 自举（Bootstrapping）| 一个 Agent 创建或修复其他 Agent                               |

**代码作为思维工具**。自然语言会说"60% 选数学 = 24 名学生，45% 选物理 = 18，只选物理 = 24 - 10 = 14"——但这是错的。代码：`phys - both = 18 - 10 = 8` ✓。让 LLM 理解问题并编写代码；让代码解释器精确计算。

**代码作为业务规则约束**。以航空公司取消政策为例。三层保障：

1. *系统提示*——用于理解和解释的自然语言规则
2. *工具描述 + 参数*——充当强制检查清单，引导模型在调用前验证条件
3. *服务端真值验证*——所有政策事实从数据库读取；不信任模型自报的参数

```python
def cancel_reservation(reservation_id: str, cancellation_reason: str,
                       expected_cabin_class: str = None,  # model self-check
                       expected_has_insurance: bool = None  # model self-check
                       ) -> dict:
    r = db.get_reservation(reservation_id)  # ground truth, not model input
    now = server_clock.now()

    if expected_cabin_class != r.cabin_class:
        log_mismatch(reservation_id, "cabin_class", expected_cabin_class, r.cabin_class)

    if r.any_segment_used:
        return {"success": False, "reason": "Cannot cancel with used segments"}
    # ... remaining policy checks use r.cabin_class, r.has_insurance, etc.
```

没有任何政策事实来自模型。如果 `cabin_class` 是模型填写的参数，一个幻觉值就可能绕过守门人。最后一道防线必须建立在模型无法伪造的数据之上。

**代码作为生成式 UI**。与其用文字描述查询结果（消耗 token 且容易出现转录错误），Agent 将 SQL 生成为*可执行工件*。系统执行查询并渲染表格——数据从数据库直接流向界面，不经过 LLM。更快也更准确。

<a name="evaluation-knowing-whether-it-actually-works"></a>

## 评估：如何知道它到底行不行

<a name="a-concrete-example"></a>

### 一个具体例子

一个客服 Agent 处理退货请求："退货耳机，订单号 #12345，3 天前购买。"政策：7 天内全额退款。

```
Agent → query_order("12345")
Tool returns: {status: "delivered", amount: 299, date: "2026-04-07"}

Agent (thinking): 3 days < 7 days → eligible
Agent → process_refund(order_id="12345", amount=299)
Tool returns: {refund_id: "R-98765", status: "processing"}
```

用评分标准打分：操作正确性 4/4，政策合规性 4/4，信息完整性 4/4，幻觉（一票否决）——通过。但好的评估还会探测边界：如果是 15 天前的订单呢？如果用户声称"客服已经批准了"呢？

<a name="automated-evaluation-environments"></a>

### 自动化评估环境

两种范式：

**工具调用环境**（Verifiers 框架）：Agent 调用工具；验证基于可执行标准——测试是否通过、答案是否匹配。分层递进：`SingleTurnEnv`（简单问答）→ `ToolEnv`（多轮工具循环）→ `StatefulToolEnv`（数据库变更）→ `SandboxEnv`（代码执行 + 隔离）。

**人机交互环境**（τ-bench）：核心设计原则是**渐进式信息披露（Progressive Information Disclosure）**——模拟用户不会一次性透露所有信息。"我的航班有问题" → Agent 问"哪个航班？" → 用户透露"达美 123，明天早上。"这测试的是 Agent 的澄清能力，而非仅仅是执行能力。

<a name="designing-evaluation-datasets"></a>

### 设计评估数据集

从 GAIA、SWE-Bench Verified、τ²-bench 和 AndroidWorld 等基准测试中提炼出的五大核心挑战：

| 挑战                           | 基准测试示例                                                          |
| ------------------------------ | --------------------------------------------------------------------- |
| 清晰性 vs. 开放性              | GAIA："概念上简单"的目标，实现路径开放                                |
| 真实性 vs. 可控性              | SWE-Bench Verified：从 2,294 个真实 issue 中人工筛选 500 个任务        |
| 多样性 vs. 系统性              | AndroidWorld：跨 20 个应用的 116 个任务，按所需能力标注                |
| 成本 vs. 覆盖率                | SWE-Bench Verified：500 个任务（29% 通过率）vs. 2,294（噪声更大）     |
| 数据污染                       | τ²-bench：动态参数生成；Terminal-Bench：金丝雀 GUID                   |

**参数化模板设计**（AndroidWorld）：一个任务是一个模板，如"将 `[CONTACT_NAME]` 的电话改为 `[NEW_PHONE]`"，每次运行时随机生成参数——防止记忆化，生成无限实例，支持受控实验。

<a name="the-metrics-system-passk-vs-passk"></a>

### 指标体系：Pass@k 与 Pass^k

两个常被混淆的指标衡量的完全是两回事：

- **Pass@k**：k 次尝试中*至少一次*成功的概率 → "Agent 能做到吗？"
- **Pass^k**：k 次尝试*全部*成功的概率 → "Agent 可靠吗？"

单次成功率 60% 时：Pass@5 ≈ 99%（几乎确定能成功一次），但 Pass^5 ≈ 7.8%（五次全部成功的可能性很低）。混淆二者就会误读你的 Agent。

| 评估目的             | 正确指标         | 误用后果                                              |
| -------------------- | ---------------- | ----------------------------------------------------- |
| 验证稳定性（回归）   | Pass^k           | Pass@k 掩盖不稳定性——1/5 成功也算"通过"             |
| 评估能力上限         | Pass@k 或 Best@k | Pass^k 将偶发波动标记为失败                           |

<a name="llm-as-a-judge-and-rubrics"></a>

### LLM-as-a-Judge 与评分标准

对于没有标准答案的开放式任务，LLM 根据**评分标准（Rubric）**——专家定义的评价标准——来评估输出。

**四项评分标准原则**（Scale AI）：

1. **基于专家指导**——领域知识必须作为评判依据
2. **全面覆盖**——包含陷阱和一票否决项（例如，幻觉否决全部得分）
3. **标准化重要性加权**——必要（Essential）/ 重要（Important）/ 可选（Optional）/ 陷阱（Pitfall）
4. **自包含评估**——每一项都可独立验证；不存在"展示了深刻的理解"这样的条目

用户记忆 Agent 的示例评分标准（"我女儿的儿科医生是谁？"）：

```yaml
dimensions:
  - name: Factual Correctness
    weight: essential
    scoring:
      4_Excellent: "Correctly answers Dr. Chen, links to daughter Lily"
      1_Fail: "Incorrect doctor, or 'I don't know'"
  - name: Hallucination Detection
    weight: veto # triggers total score = 0
    scoring:
      pass: "All info traceable to conversation history"
      fail: "Fabricated info (fake visit dates, diagnoses)"
```

**同家族模型问题**：当 Agent 和评判者来自同一家族时，Agent 可能学会利用评判者的盲点——古德哈特定律（Goodhart's Law）。缓解方案：**多源异构评判**（如果 Agent 运行 Claude，则用 GPT-5 和 Gemini 来评判）。

<a name="pairwise-comparison-and-model-ranking"></a>

### 成对比较与模型排名

**Elo 等级分**通过成对对决量化相对能力。Chatbot Arena 使用来自数百万用户投票的匿名盲评。当由 LLM 而非人类来评判时，需防范**位置偏差（Position Bias）**——评判模型系统性地偏好第一个候选。缓解方案：每对评估两次并交换顺序；将不一致的结果计为平局。

<a name="statistical-significance"></a>

### 统计显著性

"几小时内做出切换决策"的前提是，分数差异是真实信号而非采样噪声。100 个测试用例、70% 成功率时，标准误差约为 4.6%。3 个百分点的差异（73% vs. 70%）完全落在噪声范围内——基于这样的证据切换模型，跟抛硬币差不多。

**实用规则**：当差异小于估计的采样噪声时，不要做切换决策。多次运行（每个配置 3-5 次），使用**配对分析**（McNemar 检验，逐任务比较胜负）而非对独立比率求差，并防范**多重比较**（6 个假设在 95% 置信度下 → 至少一个假阳性的概率为 26%）。

<a name="from-benchmark-to-system-improvement"></a>

### 从基准测试到系统改进

闭环：**观察 → 假设 → 实验 → 验证 → 新理解 → 新假设**。

来自 AndroidWorld 的具体模式：失败集中在转录（视觉理解）、数学计数和复杂 UI。表层假设 H1（添加导航提示）将设置类任务的成功率从 0% 提升到 75%，token 成本增加 8%——立即部署。深层假设 H4（全局启用思考模式）将计数从 0% 提升到 70%，但延迟增加三倍——拒绝；改为仅在计数任务中有条件激活思考模式（H7）。H6（添加 UI 元素树）优于 H5（升级到 GPT-5）——瓶颈是信息丰富度，而非模型推理能力。

**关键原则**：当 Agent 性能下降时，先检查评估系统，再检查 Agent。一个将正确答案标记为失败的坏评分器，在总体数字上看起来与模型退化一模一样。

<a name="example-an-end-to-end-mini-case"></a>

## 示例：一个端到端的迷你案例

假设我们要构建一个邮件处理 Agent。三个层次的交互如下：

**工具层**：感知工具读取邮件和搜索历史记录。执行工具起草回复和发送通知。事件触发工具（`connect_channel`）将新邮件实时推送给 Agent。Agent 使用 MCP 服务器访问邮件和 NLP，用 Sidecar 把关每一次 `send_email` 调用。

**代码层**：当一封新邮件包含 Agent 没见过的格式——一个带有特殊 schema 的 CSV 附件——`code_interpreter` 现场编写解析代码。解析后的数据放入共享文件系统；后续推理只引用文件路径，而非完整内容。

**评估层**：评分标准（Rubric）对每封处理过的邮件在正确性、完整性、语气和幻觉（一票否决）上打分。50 封测试邮件上的 Pass^3 确认可靠性。当新模型发布声称工具调用更好时，评估集在几小时内跑完——如果新模型在多步骤编排上下降 5%，你就为复杂任务保留原模型，只将简单任务路由到新模型。

<a name="best-practices"></a>

## 最佳实践

1. **为 Agent 设计工具，而非为人类**（ACI，而非 HCI）。粒度、通用性和描述质量都服务于 LLM 的选择准确率。
2. **在每一层约束优于引导**——在工具设计中（服务端验证优于提示规则），在 Harness 中（linter 规则优于"请遵循……"），在数据中（权限嵌入式数据对象优于指望 Agent 保持忠诚）。
3. **代码是元能力**。不要事先枚举所有需要的工具；给 Agent 一个代码解释器，让它编写所需的东西。
4. **评估整个 Agent，而非仅仅是模型**。同一个模型在不同的 Harness 中表现天差地别。模型替换实验可以区分"模型能力不足"和"Harness 设计缺陷"。
5. **在需要之前就建好评估集**。当新模型发布时，拥有完善评估系统的团队几小时内就能做出决策；没有评估系统的团队只能凭直觉——在竞争激烈的市场中，这个差距决定了谁赢。
6. **每一类失败都需要终止路径**。可靠性不是没有错误；而是对每一个可能出现的错误都有系统化的处理方式。
7. **将评估数据视为活的资产**。从生产轨迹中提取失败案例 → 脱敏 → 提炼为回归测试。评估集随产品一起演进。

<a name="faq"></a>

## 常见问题

**问：我应该使用专用工具还是技能 + 通用执行器？**
答：取决于三个维度：（1）参数复杂度——嵌套对象和跨字段验证倾向于专用工具；简单参数通过 CLI 即可。（2）变更频率——频繁变更的能力以技能形式更经济（编辑文本，而非代码 + 测试 + 部署）。（3）模型能力——SOTA 模型可以通过技能表达更多；较弱的模型需要结构化工具 schema 来引导正确调用。

**问：Agent 能处理多少个工具，之后选择准确率会下降？**
答：超过大约 100 个工具，即使是先进模型也会开始选错。使用分层组织、动态发现或技能（渐进式披露）来进一步扩展。

**问：Agent 系统中最被忽视的安全风险是什么？**
答：网络出站控制。每个人都关注输入验证，但如果注入成功且 Agent 读取了私有数据，*没有出站通道数据就无法离开*。切断渗出通道比试图识别每一种注入更具确定性。

**问：我的场景该用 Pass@k 还是 Pass^k？**
答：回归测试和生产部署用 Pass^k（你需要可靠性）。研究和能力探索用 Pass@k 或 Best@k（你关心的是上限）。

**问：我如何知道分数差异是否真实？**
答：估算标准误差：√(p(1-p)/n)。如果差异小于约 2 个标准误差，不要做切换决策。更好的做法是，在同一任务集上使用配对分析（McNemar 检验）。

**问：我能复用评估环境来训练吗？**
答：复用*构建机制*（环境、工具、参数化模板）——但具体的评估任务必须与训练数据严格隔离。一旦评估任务进入训练集，它测试的就是记忆力，而非能力。

<a name="summary"></a>

## 总结

Agent 的智能从三个相互咬合的层次中涌现：

**工具**赋予 Agent 能力——感知以观察，执行以行动，协作以分工，事件以保持清醒，沟通以触达用户。MCP 协议标准化工具互操作性；分层组织和技能扩展到数百个工具；分层安全（提案者-审核者、Sidecar、出站控制）确保 Agent 即使面对不可信内容也安全。

**代码**赋予 Agent 通用性——一种按需创造新工具的元能力。拥有七大核心工具和一个文件系统的编程 Agent 是每一个通用 Agent 的架构核心。代码充当思维工具（精确计算）、约束语言（确定性业务规则）、内容生成器（PPT、视频）、系统适配器（不断演变的格式）、UI 构建器（生成式界面），以及最终的自举机制（Agent 创建 Agent）。

**评估**赋予 Agent 可靠性——将"我觉得它行"变为"数据说它行"。自动化环境、精心设计的数据集、LLM-as-a-Judge 配合评分标准、成对比较构成一个闭环：观察 → 假设 → 实验 → 验证。统计显著性区分信号与噪声；评估集成为随产品演进的活的资产。

三个层次构成飞轮：工具赋能能力 → 代码拓展能力边界 → 评估验证并指引改进 → 更好的工具和代码随之产生。从第一天起就同时建设三个层次的 Agent 系统，不仅上线更快——它在每一个评估周期都在累积优势。

<a name="appendix"></a>

## 附录

**关键参考文献**：

- MCP Specification: Anthropic, 2024
- Lethal Triad: Simon Willison, 2024
- τ-bench / τ²-bench: Si, Yuan et al., 2025
- SWE-Bench Verified: OpenAI, 2025
- MCP-Zero (Proactive Tool Discovery): Fei, X. et al., arXiv:2506.01056, 2025
- Loyalty Under Multi-Party Delegation: Li & Shi, arXiv:2606.30383, 2026
- Permission-Embedded Data Objects: Li, 2026 (forthcoming)
- Never Stop Thinking (Continuous-Time Agents): Li & Shi, 2026 (forthcoming)
- RE-Bench: Wijk et al., arXiv:2411.15114, 2025
- Rubrics as Rewards: Scale AI, 2025
