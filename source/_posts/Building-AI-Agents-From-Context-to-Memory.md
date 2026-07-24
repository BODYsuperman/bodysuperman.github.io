---
title: 'Building AI Agents: From Context to Memory'
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

- [Introduction](#introduction)
- [What Is an AI Agent](#what-is-an-ai-agent)
  - [The Core Formula: LLM + Context + Tools](#the-core-formula-llm-context-tools)
  - [The ReAct Loop: How Agents Actually Work](#the-react-loop-how-agents-actually-work)
- [Context Engineering: The Ceiling of Agent Capability](#context-engineering-the-ceiling-of-agent-capability)
  - [Context at the API Level: Static Prefix + Dynamic Trajectory](#context-at-the-api-level-static-prefix-dynamic-trajectory)
  - [KV Cache: Why Prefix Stability Matters](#kv-cache-why-prefix-stability-matters)
  - [Prompt Engineering: Writing the Agent's Operating Manual](#prompt-engineering-writing-the-agents-operating-manual)
  - [Agent Skills: Load Knowledge On Demand](#agent-skills-load-knowledge-on-demand)
  - [Agent Status Bar: From Implicit State to Explicit Knowledge](#agent-status-bar-from-implicit-state-to-explicit-knowledge)
  - [Context Compression: When Less Is More](#context-compression-when-less-is-more)
- [From Context to Memory: Making Agents Remember](#from-context-to-memory-making-agents-remember)
  - [User Memory: Building a Model of the User](#user-memory-building-a-model-of-the-user)
  - [Four Storage Formats: From Simple Notes to Advanced JSON Cards](#four-storage-formats-from-simple-notes-to-advanced-json-cards)
  - [RAG: Giving Agents a Knowledge Base](#rag-giving-agents-a-knowledge-base)
  - [Beyond Flat Text: Structured Indexing and Agentic RAG](#beyond-flat-text-structured-indexing-and-agentic-rag)
  - [Contextual Retrieval: Fixing Chunking at the Root](#contextual-retrieval-fixing-chunking-at-the-root)
  - [The Two-Tier Memory Architecture](#the-two-tier-memory-architecture)
- [Harness Engineering: Reliability Beyond the Demo](#harness-engineering-reliability-beyond-the-demo)
  - [Constrain, Verify, Correct: The Three Safety Layers](#constrain-verify-correct-the-three-safety-layers)
  - [Workflow vs. Autonomous: Choosing the Right Pattern](#workflow-vs-autonomous-choosing-the-right-pattern)
- [Best Practices](#best-practices)
- [FAQ](#faq)
- [Summary](#summary)

<!--more-->

## Introduction

If you have used Cursor to write code and watched it search your codebase, edit multiple files, and rerun tests until they pass, you have already used an AI Agent. The same is true if you have used Deep Research to investigate a topic through repeated searching and reading, or had Manus control a browser to finish online tasks.

These products take many forms, but they share a common trait: they are no longer passive "you ask, it answers" conversations. They plan their own execution steps, call the tools each task requires, and adjust their strategy as results come in.

This article walks through the core ideas behind modern AI Agents, from the foundational formula, to context engineering within a single session, to persistent memory across sessions. The goal is to give you a mental model you can use to build your own agents.

## What Is an AI Agent

### The Core Formula: LLM + Context + Tools

The essence of a modern Agent system fits into one concise formula:

**Agent = LLM + Context + Tools**

Each term is broader than it first appears:

- **The LLM is the reasoning engine.** It is the decision-making core, responsible for understanding intent, reasoning, planning, and judgment. Its capabilities come from world knowledge acquired during pre-training, plus decision-making strategies encoded through post-training.
- **Context is the working set of information.** Not just the text fed into the model, but everything available at each decision point—the environment, user memory, domain knowledge, the agent's own state, and task progress.
- **Tools are the action interfaces.** The full set of ways the agent can act—from predefined tool calls to skills loaded on demand, from generating code to delegating work to sub-agents.

Put more intuitively: **Agent = Reasoning Engine + Working Context + Action Interfaces**. The model reasons and decides, the context provides the information those decisions depend on, and the tools provide the interfaces through which decisions affect the outside world.

Different kinds of agents compare across these three dimensions:

| Agent Product | Working Context | Action Interfaces | Strategy |
|---|---|---|---|
| Coding Agents (Cursor) | Requirements, codebase, terminal | Code search, file read/write, command execution | Understand → search → edit → test → debug |
| Search Agents (Deep Research) | Web resources, databases | Search queries, web reading, summary generation | Iterative deepening based on existing information |
| Computer Control (Manus) | Screen, browser, file system | Clicking, typing, scrolling, screenshots | Visual perception + operation |
| Phone Assistants (Doubao) | Phone screen, installed apps | Clicking, swiping, opening apps | Intent understanding + app control |
| Task Agents (Pine AI) | Account info, historical bills | Making calls, sending emails, filling forms | Multi-step task execution |

These systems share three features: an **open-ended action space** (generating arbitrary natural language and code, not picking from fixed buttons), **internal reasoning** (planning before acting), and **continuous interaction** (adjusting strategy based on feedback).

### The ReAct Loop: How Agents Actually Work

The core execution pattern is called **ReAct** (Reasoning + Acting). Despite the name mentioning only reasoning and acting, the actual loop has three stages: the model first **reasons** about what to do next, then calls a tool to **act**, then **observes** the tool's result and reasons about the subsequent step.

```
Reason → Act → Observe → Reason → Act → Observe → ... (until task is done)
```

Consider aggregating revenue across multiple currencies. The user asks: "Based on the company's quarterly revenue: Q1 2.5M USD, Q2 2.1M EUR, Q3 1.8M GBP, Q4 380M JPY, calculate total annual revenue."

The agent's **trajectory**—the message history that accumulates as it works—looks like this:

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

A complex multi-step task was completed in 3 iterations and 4 tool calls. The elegance lies in the **cumulative nature of the context**: every LLM call receives the complete trajectory, so the model knows which stage it is in, what was tried before, and what the outcome was.

The key insight: **Agent context = static prefix + trajectory**. The static prefix (system prompt + tool definitions) stays fixed; the trajectory (user messages + assistant messages + tool results) grows with each interaction.

## Context Engineering: The Ceiling of Agent Capability

Large language models achieve strong results on benchmarks, but often underperform in real-world settings. The reason is straightforward: model capabilities are general-purpose, while concrete tasks depend on local knowledge—product architecture, business rules, operational constraints. This information is absent from the model's parameters.

Consider a Coding Agent given the instruction "Help me fix this bug." The quality of the context it receives determines whether it can complete the task:

- **Code context**: codebase structure, module responsibilities, coding standards. Without this, the agent may produce syntactically correct code that violates the project's architecture.
- **Process requirements**: Git branching strategy, commit conventions, CI/CD requirements. Without this, the agent may commit untested code directly to main.
- **Environment configuration**: dev setup, test database connection strings, API key management. Without this, a fix that works locally fails in test.

The model's inherent capability is only the foundation; **context sets the ceiling**. A moderately capable model with well-organized context can often outperform a stronger model operating with insufficient context.

### Context at the API Level: Static Prefix + Dynamic Trajectory

At the API level, the context of each LLM call consists of five parts:

- **System Prompt**: Developer-written instructions defining the agent's identity, permissions, and rules of conduct. Stays fixed for the whole conversation.
- **Tool Definitions**: Declares the names, descriptions, and parameter formats of available tools. Without them, the agent cannot recognize or call any tools.
- **User Messages**: Input from the user, possibly containing external knowledge retrieved via RAG.
- **Assistant Messages**: Previous model outputs, including `reasoning`, `content`, and `tool_calls`.
- **Tool Results**: Output returned after the framework executes a tool.

The first two form the **static prefix**; the last three form the **dynamic trajectory** that grows with every interaction.

An ablation study reveals what happens when each component is removed:

| Removed Component | Effect on Agent |
|---|---|
| Tool Definitions | Agent cannot recognize or call any tools—completely incapable of action |
| Tool Results | Agent receives no execution feedback, calls the same tool repeatedly in an infinite loop |
| Reasoning in assistant messages | Consecutive decisions start contradicting each other |
| Message history | Agent loses task continuity, restarts from the beginning, repeats done steps |

The core insight: **context determines what information the agent has at decision time, and the agent can only decide based on that information**.

### KV Cache: Why Prefix Stability Matters

Every time the model generates a token, it refers back to intermediate computation results of preceding tokens. Recomputing those from scratch on every round would be expensive. **KV Cache** stores the key-value states so later computation can reuse them. The prerequisite: **the prefix must stay completely unchanged**.

A production incident illustrates the stakes. A team's customer service agent handled 100,000 conversations a day. An engineer added a line `Current time: {{now}}` to the system prompt so the agent would know the current time. The next day, monitoring alerts fired: time-to-first-token increased from 0.5 seconds to 3–5 seconds, and the monthly inference bill nearly doubled.

That one timestamp line invalidated the KV Cache on every request. The system prompt was now different each time, forcing the model to recompute the key-value pairs for the prefix from scratch.

Three practical principles follow:

1. **Once the system prompt and tool definitions are finalized, do not change them.** Any modification invalidates the entire cache.
2. **Always append dynamic information to the end.** Timestamps and user status should be new messages at the end of the conversation, not modifications to the system prompt.
3. **Use the standard API format; do not manually concatenate messages.** Structured messages are translated by the Chat Template into a fixed token sequence the model saw during training.

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

### Prompt Engineering: Writing the Agent's Operating Manual

A practical litmus test: an LLM is like a highly capable new team member who is completely unfamiliar with your specific workflows. If such a person, after reading your system prompt, still does not know what to do, neither will the agent.

Several dimensions matter:

**Tone and style** shape the user experience. Uppercase words like "NEVER do X" increase instruction salience, but overuse dilutes the effect—reserve them for truly critical constraints.

**Structured prompts** work because models are trained on structured data. XML tags carry semantic information (`<working_directory>` is immediately clear), and Markdown organizes content for both human and machine readers.

**Process-driven prompts** beat rule stacking. Imagine giving a new team member a manual with hundreds of scattered rules and no flowcharts. A process-driven prompt provides a clear Standard Operating Procedure:

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

**Business rule refinement** is the most critical—and most overlooked—piece. Vague rules like "choose the appropriate billing type based on the task situation" lead to unstable agent behavior. Rules must be defined to the point where they are executable: "NEVER use percentage-based billing for refunds. Use fixed_fee instead."

An ablation study on prompt engineering found that removing structure from the system prompt (keeping all the rule content but converting the ordered process into an unstructured collection) dropped the task success rate by over 30%.

### Agent Skills: Load Knowledge On Demand

As an agent handles more scenarios, the system prompt tends to grow: refund rules, coding standards, formatting requirements. Placing everything into a single prompt creates two problems: **wasted tokens** (most content is irrelevant to the current task) and **diluted attention** (irrelevant information drowns out key content).

Agent Skills solve this through **Progressive Disclosure**: instead of loading all knowledge at once, let the agent load knowledge on demand. Each Skill is a modular knowledge package with three layers:

- **Layer 1 (Metadata)**: A `SKILL.md` file with `name` and `description` fields, injected into context at startup. Usually only a few hundred tokens.
- **Layer 2 (Core Workflow)**: When the agent determines a skill is needed, it loads the full `SKILL.md` via a dedicated tool. The content appears as a tool result.
- **Layer 3 (Details)**: File references allow deeper navigation into sub-documents as needed.

The production implementation (used by Claude Code) injects the metadata list as a **user-role meta message at the end of the context**, wrapped in `<system-reminder>` tags. This does not modify the system prompt, so the KV Cache prefix remains stable. Full content is then loaded on demand via a dedicated tool.

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

### Agent Status Bar: From Implicit State to Explicit Knowledge

The prompt engineering section solved "what static instructions to give the model." But during execution, the agent also needs to track its own state dynamically. The **Agent Status Bar** addresses this.

The closest analogy is the status bar of an operating system. On a phone, the top of the screen displays time, battery level, and signal strength—giving users immediate access to device state. The Agent Status Bar serves a similar purpose for the model: it is a **state summary** injected at the end of the context.

Why is this needed? The theoretical basis is a fundamental property of attention: **in-context learning is more retrieval-like than reasoning-like**. The model is good at finding information that already exists in the context, but less reliable at actively summarizing and deriving aggregate state during a single forward pass.

Consider a phone-calling agent that must call each merchant no more than three times. After three calls, it often miscounts and makes a fourth. The problem: "How many times have I called?" is not automatically distilled into an explicit fact. It remains scattered across raw call records.

When we directly include the call count in each tool result:

```xml
<agent_status>
Current State:
- Tool call summary: 'phone_call' invoked 3 times (Xfinity: 3/3)
- Constraint check: Maximum calls reached (3/3)
- TODO: [1] Cancel plan (in_progress)
</agent_status>
```

The model can immediately recognize the limit is reached and stop. Experiments showed that for weak models, a precomputed status bar recovered accuracy by 40–54 percentage points; for strong models, it reduced reasoning tokens by 80–90% or more.

Three actionable lessons emerged:

1. **Maintain the status bar with code, not with an LLM.** A 20-line regex function achieved ground-truth accuracy; a frontier model summarizing the full history produced many incorrect entries.
2. **Before deleting original context, confirm the status bar covers all questions.** The status bar is a lossy projection. If a question asks for information it wasn't designed to capture, accuracy can collapse.
3. **Monitor status bar accuracy as a first-line production metric.** The model almost unconditionally trusts the status bar—if it says "called 3 times," the model accepts that value without checking.

### Context Compression: When Less Is More

As multi-turn interactions deepen, the context keeps expanding. Compression has two distinct motivations:

1. **Addressing length and cost constraints.** The context window is limited, and a few rounds of tool calls can fill it.
2. **Improving reasoning quality.** Summarized knowledge is more useful to the model than raw information.

The second motivation is deeper and easier to overlook. Suppose an agent accumulates information through 10 web searches. The raw results are scattered across tens of thousands of tokens. When the agent must make a final decision, its attention becomes diffuse.

After the 10th search, a single LLM call could produce a structured summary: "Currently known: A is..., B is..., information on C is still missing." The model can then use this refined knowledge without re-extracting from raw data.

A phenomenon called **Context Rot** makes this critical. Context rot is different from context overflow: overflow means "cannot fit any more," while rot means "it fits but cannot be found." The agent appears to be working normally while decision quality quietly deteriorates.

Six compression strategies were compared in a research task (tracking OpenAI co-founders' employment status):

| Strategy | Compression Ratio | Tokens | Iterations | Notes |
|---|---|---|---|---|
| No Compression | N/A | overflow | 5 | Fails at 128K limit |
| Individual Summarization | 10.9% | 276,608 | 12 | Information fragmentation |
| Combined Summarization | 4.3% | 93,449 | 10 | May lose info at end |
| Context-Aware | 3.0% | 40,157 | 7 | Best efficiency |
| Context-Aware + Citations | 4.1% | 222,992 | — | Verifiable |
| Adaptive Windowing | varies | 174,601 | — | Compresses only near limit |

Context-aware compression—incorporating current query intent into the compression decision—reduced token usage by over 75% compared to naive approaches.

Production-grade systems like Claude Code use a **hierarchical compression mechanism** with five layers, applied in order of increasing cost:

1. **Tool result budget control**: Large outputs stored on disk; model sees only a preview.
2. **Direct noise deletion**: Low-value content removed without summarization.
3. **API-level micro-compression**: Server removes specific tool results from prefix.
4. **Archival summarization**: Structured round-by-round summarization (like `git log`).
5. **Full compression**: LLM-driven complete compression, as a last resort with a circuit breaker.

What compression most easily loses is not the details themselves, but **early architectural decisions, the reasoning behind constraints, and failed paths**. Explicit retention priorities prevent this loss.

## From Context to Memory: Making Agents Remember

The previous section addressed context management within a single session. But how do you enable an agent to remember users and retain knowledge even after a conversation ends?

This persistent memory system operates at two scales:

- **User Memory** is personalized memory for an individual—the agent gradually learns each user's preferences, habits, and needs.
- **Knowledge Base** is collective knowledge shared across all users—industry regulations, company procedures, specialized documentation.

### User Memory: Building a Model of the User

Memory is not a transcript of everything a user says. We don't remember the raw content of every conversation with a friend; through repeated interaction we form a mental model of them.

After a conversation about booking a flight to Tokyo, the agent framework calls a dedicated LLM to extract information worth remembering:

```
Extracted memories:
- User prefers window seats (preference)
- User is vegetarian, needs special meals (dietary restriction)
- User's United MileagePlus number: 12345678 (loyalty program)
- User has travel plans to Tokyo (recent activity)
```

Key characteristics: **Selectivity** (transient info is forgotten), **Abstraction** (specific instances become general preferences), and **Structure** (each memory is tagged with a type).

A three-level evaluation framework measures memory capabilities:

| Level | Capability | Example |
|---|---|---|
| Level 1: Basic Recall | Store and retrieve directly-provided info | "My membership number is 12345" |
| Level 2: Multi-Session Retrieval | Reason over info spanning different sessions | User with two cars asks to "schedule maintenance"—agent finds both |
| Level 3: Proactive Service | Synthesize across sessions to offer predictive help | Booking international flight → surface expiring passport |

Memory is divided into hierarchical levels, mirroring human cognition:

- **Trajectory**: Complete history of a single session, append-only, never rewritten.
- **User Long-Term Memory**: Persistent storage across sessions, repeatedly rewritten, merged, and pruned.

From a cognitive science perspective, long-term memory has three types, each with an agent counterpart:

| Cognitive Type | Human Example | Agent Counterpart |
|---|---|---|
| Episodic Memory | "Great dinner with colleagues last Wednesday" | "User booked ANA flight to Tokyo next Friday" |
| Semantic Memory | "Capital of Italy is Rome" | "User is vegetarian, prefers window seats" |
| Procedural Memory | Ability to ride a bicycle | "First search direct flights → confirm seat → use FF number" |

### Four Storage Formats: From Simple Notes to Advanced JSON Cards

The same piece of user information can be represented with different granularities:

**Simple Notes** — Each memory is a minimal, indivisible fact ("User email: john@example.com"). Minimal overhead, but associations between facts are lost entirely. "Works as Senior Engineer at TechCorp on recommendation systems" becomes three disconnected fragments.

**Enhanced Notes** — Each memory is a paragraph with complete context. Preserves narrative structure, but suffers from storage redundancy, update complexity, and paragraphs too long for accurate retrieval.

**JSON Cards** — A three-level nested structure (Category → Subcategory → Key-Value), mimicking how humans categorize. Supports partial updates, but forces information into single categories.

**Advanced JSON Cards** — Each card records facts plus narrative context (backstory), subject identity (person), and relationship. Solves disambiguation: "Dr. Zhang" could be the user's dentist or the user's father's cardiologist.

| Format | Strength | Weakness |
|---|---|---|
| Simple Notes | O(1) operations, minimal overhead | Associations lost |
| Enhanced Notes | Semantically complete | Redundancy, hard to update |
| JSON Cards | Structured, partial updates | Forces single categorization |
| Advanced JSON Cards | Disambiguation, rich context | High maintenance cost |

A hybrid approach works best in practice: Advanced JSON Cards for **critical, low-volume** data; Simple Notes for **large volumes of non-critical** facts.

### RAG: Giving Agents a Knowledge Base

The core technology for building a shared knowledge base is **Retrieval-Augmented Generation (RAG)**. The central idea: combine the LLM's reasoning with the breadth and timeliness of an external knowledge base.

A typical RAG system has two parts: a **retriever** (finds relevant fragments) and a **generator** (uses fragments as context to generate an answer).

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

The quality of the retriever directly determines RAG's effectiveness. Two main retrieval approaches complement each other:

**Dense Embeddings** map text into a vector space where semantically similar content has close vector distances. They understand that "kitty" and "cat" are related, but may miss exact keyword matches.

**Sparse Embeddings** (like BM25) are rooted in traditional keyword matching. A sparse vector has most dimensions zero—only dimensions for words in the document are non-zero. BM25 improves on TF-IDF by introducing term frequency saturation and document length normalization.

```
Query: "model distillation"
Word "model"  → appears in 60/100 docs → low IDF → low discriminative power
Word "distillation" → appears in 3/100 docs → high IDF → high discriminative power

BM25 ranking weights "distillation" much more heavily than "model"
```

**Hybrid retrieval** combines both: run both engines in parallel, merge results using Reciprocal Rank Fusion (RRF), then apply a neural reranker for the final ordering.

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

### Beyond Flat Text: Structured Indexing and Agentic RAG

Simple chunking has a fundamental limitation: it flattens knowledge, ignoring structure and cross-document relationships. Two cases illustrate this:

**The Black Cat Counting Problem**: If a knowledge base has 100 case documents (90 black cats, 10 white cats) and the user asks "What is the ratio?", top-k retrieval returns only a sample. The model sees 15 black cats and 3 white cats and draws incorrect conclusions. A pre-generated summary ("Total: 90 black, 10 white") solves this instantly.

**The Xfinity Discount Problem**: Three isolated cases—Veteran John got a discount, Doctor Sarah got a discount, Teacher Mike was ineligible. When a nurse inquires, the retriever prioritizes Sarah's case (semantic similarity between "nurse" and "doctor") and misses Mike's case, leading to an incorrect inference that nurses are eligible.

Both cases point to the same conclusion: **naive RAG is not enough**. The model's attention is a similarity-based soft retrieval system, not a thinking engine that actively summarizes. Compute must be invested at the indexing stage.

**RAPTOR** builds a tree hierarchy: cluster similar leaf nodes, generate parent summaries, and recurse upward. Retrieval can work at any abstraction level.

**GraphRAG** models knowledge as an entity-relationship graph. Its irreplaceable capability is **multi-hop reasoning**: "What is the address of my doctor's hospital?" requires traversing user → doctor → hospital → address.

| Method | Structure | Best For |
|---|---|---|
| RAPTOR | Tree hierarchy | Drilling down from concept to details |
| GraphRAG | Entity-relationship graph | "How does A relate to B?" queries |

**Agentic RAG** turns retrieval from a fixed pipeline into a dynamic, iterative exploration. The knowledge base becomes a tool the agent calls at any time, following the ReAct loop:

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

### Contextual Retrieval: Fixing Chunking at the Root

Even with agentic RAG, traditional chunking remains a bottleneck. An isolated fragment like "The company's second-quarter revenue grew by 3%" is ambiguous—Which company? When? Which product line?

**Contextual Retrieval** fixes this at the source: before indexing, use an LLM to generate a short context prefix for each chunk, then concatenate it with the original text.

```
Original chunk: "Revenue grew by 3%"

With context prefix:
"[Excerpted from 'Key Performance Indicators' section of ACME Corp 2025 Q2 Financial Report]
 Revenue grew by 3%"
```

This strengthens both retrieval modes: BM25 gets rich matchable keywords ("ACME", "2025 Q2"), and dense embeddings get accurate semantic background. According to Anthropic research, combining this with BM25 reduces the retrieval failure rate by 49%, and by 67% when combined with a reranker.

### The Two-Tier Memory Architecture

The highest level of user memory—**Proactive Service**—demands both a global overview and precise details at once. Resident context alone loses details to capacity limits; retrieval alone misses hidden cross-session connections.

The solution is a **two-tier memory architecture**:

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

When the user books an international flight:

1. **Fact Review**: Agent reviews JSON Cards, identifies "Tokyo trip" and "passport info"
2. **Association Reasoning**: Flight date (January) is close to passport expiry (February)
3. **Detail Verification**: Uses Contextual Retrieval to find original conversations about passport and flights
4. **Proactive Service**: "Your passport is about to expire; I recommend expedited renewal."

## Harness Engineering: Reliability Beyond the Demo

The core formula describes the agent's internal composition. But between a working demo and a reliable product lies a substantial gap. **Harness Engineering** is the implementation-level view: treat the LLM as one core component (the Model), and call all supporting code the Harness.

The expanded production-grade composition:

> **Agent = LLM + [Context + Tools + Constrain + Verify + Correct] = Model + Harness**

A concrete example shows the value. Suppose you ask an agent to refund a user's order placed 3 days ago:

| Without Harness | With Harness |
|---|---|
| No refund policy received (no context) | System prompt specifies 7-day refund policy |
| Doesn't know which API to call (no tools) | Calls `query_order` and `process_refund` tools |
| Fabricates refund result (no verification) | Framework checks refund doesn't exceed order total |
| User discovers refund never happened (no correction) | Confirms against database; auto-retries on timeout |

### Constrain, Verify, Correct: The Three Safety Layers

| Function | Core Principle | Practical Example |
|---|---|---|
| **Context** | Information Sufficiency | System prompts, knowledge bases |
| **Tools** | Clear Interface | Tool names are intuitive, parameters have examples |
| **Constrain** | Fail-Safe Defaults | Every tool requires user authorization by default |
| **Verify** | Input Isolation | Security checks only look at structured data, not free-form text |
| **Correct** | Hide intermediate states until failure confirmed | Silent retries, circuit breaker on consecutive failures |

Guardrails implement the constrain/verify/correct layer as defense in depth:

- **Input-side**: Relevance classifiers, safety classifiers, content moderation, rule-based protections
- **Execution-side**: Tool risk rating (low/medium/high), with high-risk operations requiring human confirmation
- **Output-side**: PII filters, output validation against brand values

### Workflow vs. Autonomous: Choosing the Right Pattern

**Workflows** orchestrate LLMs through predefined code paths. The execution path is deterministic—critical steps are never skipped. A flight-booking workflow has four fixed nodes: Verify Identity → Search Flights → Complete Payment → Confirm Booking. The system won't book before payment is completed.

**Autonomous Agents** determine their execution path at runtime based on environmental feedback. The user says "Book me a flight to Shanghai next Wednesday" and the agent dynamically searches, verifies identity, adjusts criteria based on layovers, etc.

| Pattern | Advantage | Limitation |
|---|---|---|
| Workflow | Strict process control, security | Lack of flexibility |
| Autonomous Agent | Flexible, adapts to unexpected events | Higher cost, errors compound |

In practice, they are not mutually exclusive: critical processes with compliance requirements run as workflows, while flexible decisions switch to autonomous mode.

Three core principles for building effective agents:

1. **Keep it simple.** Start with the simplest solution and add complexity only when necessary.
2. **Keep it transparent.** Show the agent's planning steps, execution logs, and decision trajectory.
3. **Design a well-structured tool interface (ACI).** Tool names should be intuitive; the design should prevent likely mistakes (Poka-yoke).

## Best Practices

Based on the concepts above, here are practical guidelines for building agents:

**Context Design**
- Keep the system prompt and tool definitions stable once finalized—any change invalidates the KV Cache.
- Append dynamic information (timestamps, status) at the end of the context, never in the system prompt.
- Use structured formats (XML tags, Markdown) for instructions; provide process-driven SOPs, not scattered rules.
- Define business rules to executable precision: "NEVER use percentage-based billing for refunds."

**Memory Design**
- Use a hybrid memory approach: Advanced JSON Cards for critical low-volume data, Simple Notes for large-volume non-critical facts.
- Maintain the Agent Status Bar with code (regex functions), not with LLM summarization.
- Monitor status bar accuracy as a first-line production metric—the model unconditionally trusts it.

**Retrieval Design**
- Combine dense and sparse retrieval, then apply a neural reranker for production-grade RAG.
- Apply Contextual Retrieval at the indexing phase—generate context prefixes for chunks before embedding.
- Use Agentic RAG for complex questions requiring multi-hop reasoning; use simple RAG for clear, narrow queries.

**Compression Design**
- Compress in batches when approaching the context limit, not every round.
- Preserve architectural decisions, key constraints, verification status, and unresolved TODOs during compression.
- Keep exact identifiers (UUIDs, hashes, URLs, filenames)—changing one digit breaks subsequent tool calls.

**Safety Design**
- Tag external content with source markers to prevent prompt injection.
- Implement tool risk ratings with human confirmation for high-risk operations.
- Set failure thresholds and circuit breakers to prevent infinite loops.
- Use sub-agent context isolation to keep bulky intermediate content out of the main context.

## FAQ

**Q: If models keep getting stronger, will context engineering still matter?**

Directionally, models will internalize parts of the Harness—tool calling and long-horizon planning were once external orchestration and are now native capabilities. But in practice, this internalization is much slower than intuition suggests. Training takes months, and a model cannot internalize all constraints and preferences of real businesses in one pass. The model's current capability boundary is exactly where the Harness creates value.

**Q: What's the difference between in-context learning and true memory?**

In-context learning is fast but transient—it disappears when the session ends. Its mechanism is closer to pattern matching than true learning; it lets the model apply patterns it has already seen but cannot discover entirely new rules. User memory (persistent, reviewable storage) and externalized learning (knowledge bases, tool code) provide the reliability and longevity that in-context learning cannot.

**Q: When should I use a workflow vs. an autonomous agent?**

Start with a single LLM call. If better prompts solve the problem, don't build an agent. When multiple steps are needed and the task decomposes into fixed sub-tasks, use a workflow. Use an autonomous agent only when you need dynamic decisions and a flexible execution path. Agent systems typically trade latency and cost for better task performance—evaluate whether that trade is worth it.

**Q: How do I prevent prompt injection in my agent?**

No single defense is sufficient—use layered defense. At the context level: tag external content with source markers (`<external_content source="webpage">`), use structured roles strictly, and sanitize suspicious patterns. At the execution level: implement tool risk ratings, require authorization for high-risk operations, and prevent retrieved content from directly triggering irreversible actions. Context-level defenses reduce the attack success rate but cannot guarantee complete security.

**Q: Which retrieval strategy should I choose for my knowledge base?**

If queries are primarily "find the document fragment containing this information," hybrid retrieval (dense + sparse + reranking) is sufficient. If queries require cross-document synthesis or multi-level navigation, invest in structured indexing (RAPTOR or GraphRAG). Its cost is a large jump in LLM calls at index-construction time, so upgrade only when simpler options fall short.

**Q: How often should I compress the context?**

Compress in batches when the context approaches the threshold (e.g., 80% of window size), not every round. Frequent compression repeatedly breaks the cache. Use a hierarchical approach: tool result budget control first, then noise deletion, then API-level micro-compression, then archival summarization, and finally full compression as a last resort with a circuit breaker.

## Summary

This article walked through the core ideas behind modern AI Agents along three layers:

**The Core Formula**: Agent = LLM + Context + Tools. The LLM provides reasoning, context supplies the working set of information at decision time, and tools provide action interfaces. The ReAct loop—reason, act, observe, repeat—connects them into a working system.

**Context Engineering**: Context sets the ceiling of agent capability. At the API level, context is a static prefix (system prompt + tool definitions) plus a dynamic trajectory (message history). KV Cache requires prefix stability. Prompt engineering writes the agent's operating manual. Agent Skills load knowledge on demand. The Agent Status Bar converts implicit state into explicit knowledge. Context compression controls length and improves reasoning quality—not just by managing length, but by actively summarizing raw data into high-density structured knowledge.

**From Context to Memory**: User memory builds a model of the individual across sessions; the knowledge base provides shared domain expertise. Four storage formats trade off simplicity against expressiveness. RAG combines dense and sparse retrieval with neural reranking. Structured indexing (RAPTOR, GraphRAG) and Agentic RAG move beyond flat text. Contextual Retrieval fixes chunking at the root. The two-tier memory architecture—resident JSON Cards for overview, on-demand Contextual Retrieval for details—makes proactive service feasible.

**Harness Engineering**: Model capability is commoditizing; the real differentiator is the Harness—constrain, verify, and correct mechanisms built around context and tools. As models converge in capability, competitive advantage shifts to the engineering outside the model.

The common thread: **do not let the model passively search through vast amounts of information; proactively provide refined, structured knowledge.** This principle runs from prompt design through compression to the two-tier memory architecture—and it is the practice of the Bitter Lesson on an engineering timescale.
