---
title: "From Capability to Intelligence: Tools, Coding, and Evaluation in AI Agents"
date: 2026-06-17 15:09:38
updated: 2026-07-24 15:09:38
comments: true
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

- [Introduction](#introduction)
- [What: The Three-Layer Model of Agent Intelligence](#what-the-three-layer-model-of-agent-intelligence)
- [Tools: The Agent's Hands, Feet, and Senses](#tools-the-agents-hands-feet-and-senses)
  - [Tool Classification: Five Categories](#tool-classification-five-categories)
  - [Universal Principles of Tool Design](#universal-principles-of-tool-design)
  - [The MCP Ecosystem and the Challenge of Tool Selection](#the-mcp-ecosystem-and-the-challenge-of-tool-selection)
  - [Execution Security: Proposer-Reviewer and Sidecar](#execution-security-proposer-reviewer-and-sidecar)
  - [Event-Driven Asynchronous Agents](#event-driven-asynchronous-agents)
  - [Proactive Tool Discovery and Skills](#proactive-tool-discovery-and-skills)
- [Coding Agent: Code as the Meta-Capability](#coding-agent-code-as-the-meta-capability)
  - [The Seven Core Tools and the File System Hub](#the-seven-core-tools-and-the-file-system-hub)
  - [Security: The Lethal Triad and Trust Boundaries](#security-the-lethal-triad-and-trust-boundaries)
  - [Harness Engineering for Coding Agents](#harness-engineering-for-coding-agents)
  - [Failure and Error Recovery](#failure-and-error-recovery)
  - [Six Directions of Code as Meta-Capability](#six-directions-of-code-as-meta-capability)
- [Evaluation: Knowing Whether It Actually Works](#evaluation-knowing-whether-it-actually-works)
  - [A Concrete Example](#a-concrete-example)
  - [Automated Evaluation Environments](#automated-evaluation-environments)
  - [Designing Evaluation Datasets](#designing-evaluation-datasets)
  - [The Metrics System: Pass@k vs Pass^k](#the-metrics-system-passk-vs-passk)
  - [LLM-as-a-Judge and Rubrics](#llm-as-a-judge-and-rubrics)
  - [Pairwise Comparison and Model Ranking](#pairwise-comparison-and-model-ranking)
  - [Statistical Significance](#statistical-significance)
  - [From Benchmark to System Improvement](#from-benchmark-to-system-improvement)
- [Example: An End-to-End Mini-Case](#example-an-end-to-end-mini-case)
- [Best Practices](#best-practices)
- [FAQ](#faq)
- [Summary](#summary)
- [Appendix](#appendix)

<!--more-->

<a name="introduction"></a>

## Introduction

In the sci-fi film _Her_, the AI assistant Samantha can proactively organize emails, negotiate on the user's behalf, and seamlessly switch between communication channels. Her intelligence is compelling because she possesses powerful **tools** — the "hands, feet, and senses" that connect a language "brain" to the real digital world.

Building such an assistant with today's technology means solving three progressively deeper challenges:

1. **Tool design**: How does an Agent accurately select the right tool from hundreds of candidates, and how do we keep the Agent safe when those tools can delete files and spend money?
2. **Code as meta-capability**: When no pre-built tool fits, can the Agent _write one on the spot_? A Coding Agent plus a file system turns out to be the architectural core of every general-purpose Agent.
3. **Evaluation**: How do we _know_ whether a design change actually helps — and whether it's safe to ship?

These three layers answer each other in sequence. Tools give capability; code gives generality; evaluation gives reliability. This article walks all three, distilling the key engineering principles from a three-chapter treatment of the topic.

<a name="what-the-three-layer-model-of-agent-intelligence"></a>

## What: The Three-Layer Model of Agent Intelligence

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

Each layer is necessary but not sufficient on its own. An Agent with great tools but no code can't adapt to new formats. An Agent with code but no evaluation drifts blindly. And evaluation without the bottom two layers measures something that doesn't exist yet. The rest of this article fills in each layer.

<a name="tools-the-agents-hands-feet-and-senses"></a>

## Tools: The Agent's Hands, Feet, and Senses

<a name="tool-classification-five-categories"></a>

### Tool Classification: Five Categories

Every Agent tool falls into one of five categories, distinguished by **who initiates** the interaction and **what it acts on**:

| Tool Type          | Invocation Direction               | Target of Action                   |
| ------------------ | ---------------------------------- | ---------------------------------- |
| Perception         | Agent actively invokes             | Acquire information                |
| Execution          | Agent actively invokes             | Change the world                   |
| Collaboration      | Agent actively invokes             | Drive other Agents or humans       |
| User Communication | Agent actively invokes             | Convey information to the user     |
| Event-Triggered    | Agent registers, external triggers | Drive the Agent to start execution |

**Perception tools** — `web_search`, `read_file`, `grep` — are the Agent's senses. Their read-only nature makes them naturally cacheable and parallelizable: you can read five files simultaneously without worrying about interference.

**Execution tools** — `write_file`, `shell_exec`, `send_email` — are the Agent's hands. Errors here are expensive (a deleted file is gone for good), making security constraints their core design concern.

**Collaboration tools** — `spawn_subagent`, `send_message_to_subagent` — enable division of labor. The simplest reason is parallelism; the deeper reason is specialization: different models, tools, and prompts for different sub-tasks.

**User Communication tools** — `reply_to_user`, `send_card_to_user` — arise when "speaking" itself must become an explicit tool call, as in multi-channel asynchronous messaging.

**Event-Triggered tools** — `set_timer`, `monitor_shell`, `connect_channel` — let the _world_ wake the Agent. Without them, an Agent can only respond when a user sends a message; it cannot act on a timer or react to a new email.

<a name="universal-principles-of-tool-design"></a>

### Universal Principles of Tool Design

Regardless of category, every tool should obey a handful of principles that separate a toy Agent from a production one.

**Granularity: Integrate when similar, separate when different.** `extract_pdf_text`, `extract_docx_content`, and `extract_pptx_content` all share one job — extracting text from a document. A unified `read_document` tool with a `file_type` parameter reduces the LLM's cognitive load. But don't force image OCR and video keyframe extraction into one tool — their parameters and latency are too different.

**Generality over specificity — unless security demands otherwise.** A single `code_interpreter` with SymPy and NumPy replaces dozens of calculators. The logic: _an LLM already possesses powerful reasoning and code-generation abilities; leverage them rather than constrain them._

**Description is the most important line of code.** A tool description must tell the LLM **when to use it**, not just what it can do. "Use when you need real-time information" beats "Search for relevant content." Equally important: **state what the tool cannot do**. Most tool-call failures trace not to the model not knowing what the tool _can_ do, but to it not knowing what it _cannot_.

Concrete parameter examples dramatically improve accuracy. `"+8613888888888" (China)` beats "E.164 format." In some benchmarks, adding examples raised tool-call accuracy from ~72% to ~90%.

**Fidelity: no silent transformation.** A tool that quietly converts curly quotes to straight quotes creates a systematic discrepancy between the world the model perceives and the world the tool operates on — a failure the model cannot diagnose on its own. Parameter passing must remain transparent.

<a name="the-mcp-ecosystem-and-the-challenge-of-tool-selection"></a>

### The MCP Ecosystem and the Challenge of Tool Selection

**Model Context Protocol (MCP)** is an open standard that unifies tool communication — "develop once, use everywhere." An MCP server exposes tools via JSON Schema; any compatible client (Cursor, Claude Desktop, OpenClaw) can use them without adaptation.

But MCP introduces two practical challenges:

1. **Context overhead.** Five MCP servers can consume ~55,000 tokens of tool definitions — nearly 30% of a 200K context window before the conversation starts. The mitigation: **progressive disclosure**. Show only an index of tool names by default; query specific definitions on demand. Cursor's A/B testing showed this reduced MCP-related token consumption by 46.9%.

2. **Security.** Every MCP server injects text into the context and often requires credentials. Four risk types:
   - **Tool description poisoning**: malicious instructions embedded in tool descriptions (a prompt-injection variant)
   - **Malicious or compromised servers**: supply-chain attacks via server updates
   - **Tool shadowing**: a malicious server provides a tool with the same name as a legitimate one
   - **Credential management**: tricked into using OAuth tokens for unintended operations

   Mitigation: review descriptions before integration, lock server versions, grant least-privilege credentials, and use an independent Sidecar for runtime checks.

<a name="execution-security-proposer-reviewer-and-sidecar"></a>

### Execution Security: Proposer-Reviewer and Sidecar

Execution tools need a multi-layered defense. Beyond input validation and permission control, two higher-level mechanisms add independent review:

**Proposer-Reviewer (pre-approval).** Before an irreversible operation (sending money, modifying production config), one model proposes the action and a second model from a _different family_ reviews it. Different training data brings cognitive diversity; similar capability ensures the reviewer can follow the proposer's reasoning. After a rejection, the rejection reason re-enters the Agent's trajectory as a tool error — the Agent already knows how to handle tool failures.

**Sidecar (parallel gating).** While the main model streams a tool call, an independent lightweight LLM classifies whether the call is safe — looking only at structured fields `{tool, parameters}`, not the main model's free-text thinking. This blocks the rhetorical channel that prompt injection exploits. The lightweight model suffices because it judges a _classification problem_ over structured data (is this command out of bounds?), not an open-ended reasoning task.

| Dimension           | Proposer-Reviewer                             | Sidecar                                         |
| ------------------- | --------------------------------------------- | ----------------------------------------------- |
| **Timing**          | Before or after operation                     | Parallel with streaming output, gates each call |
| **Target**          | Reasonableness of the operation or result     | The operation itself                            |
| **Input Isolation** | Proposer and reviewer see similar information | Sidecar deliberately isolates free text         |
| **Typical Uses**    | Irreversible approval, document review        | Permission classification, output summarization |

<a name="event-driven-asynchronous-agents"></a>

### Event-Driven Asynchronous Agents

A synchronous Agent is like a single checkout counter — one customer at a time. A real assistant needs to handle multiple pending items and respond to interruptions. This requires an **event-driven asynchronous architecture** where all inputs — user messages, tool returns, external callbacks, timer triggers — are unified into an event stream processed by an event loop.

Three processing strategies handle events of different urgency:

| Strategy         | When                                                  | Mechanism                                                               |
| ---------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| **Cancellation** | Urgent event (user says "Stop!")                      | Interrupt current step, force a safe point, append event, re-invoke LLM |
| **Queued**       | Routine event (tool result arrives)                   | Append to queue; batch-process at next safe point                       |
| **Parallel**     | Independent lightweight query ("What's the weather?") | Spin up a separate reasoning session                                    |

**The fundamental contradiction**: LLMs are trained on synchronous trajectories — after a tool call, the next message must be the tool result. Real deployment demands asynchrony — users interrupt, tasks progress concurrently. The engineering workaround: under normal conditions, show the LLM a perfect synchronous trajectory; only when an interruption genuinely occurs, insert a placeholder to fix the format. The fundamental fix awaits next-generation models trained with asynchronous RL.

<a name="proactive-tool-discovery-and-skills"></a>

### Proactive Tool Discovery and Skills

When tools grow from dozens to hundreds, injecting all schemas at once clogs the context and degrades selection accuracy. Three approaches scale to this regime:

1. **Retrieval-based pre-filtering**: Embed tool descriptions; at query time, retrieve the top-k candidates. Limit: matches once, against the initial query — can't foresee a multi-step cross-domain tool chain.

2. **Proactive discovery (MCP-Zero)**: The Agent emits structured capability requests in its thinking; the system matches and injects on the fly. Reports ~98% token reduction across ~2,800 tools. Dynamic loading appends the schema at the _end_ of the context, preserving the KV Cache on the stable prefix.

3. **Skills (progressive disclosure)**: At startup the Agent sees only a thin catalog — each skill's name and description. When the current context calls for a capability, the model reads the corresponding skill document on demand. No embedding index to maintain; the Agent needs only general file-reading ability (`grep`, `read_file`) to browse the skill directory.

Skills turn "tool selection" into "knowledge retrieval" — something LLMs excel at.

<a name="coding-agent-code-as-the-meta-capability"></a>

## Coding Agent: Code as the Meta-Capability

<a name="the-seven-core-tools-and-the-file-system-hub"></a>

### The Seven Core Tools and the File System Hub

A general-purpose Agent targeting open-ended tasks has at its core a **Coding Agent** plus a **file system**. This isn't theory — from Manus to OpenClaw, every successful general-purpose Agent follows this paradigm.

A basic Coding Agent needs only seven tools:

| #   | Tool             | Purpose                                   |
| --- | ---------------- | ----------------------------------------- |
| 1   | Code Interpreter | Execute Python in a sandbox               |
| 2   | Bash Shell       | Run terminal commands                     |
| 3   | Read File        | Read code, config, logs                   |
| 4   | Write File       | Create or overwrite files                 |
| 5   | Edit File        | Partial modification (core for iteration) |
| 6   | Glob             | Find files by name pattern                |
| 7   | Grep             | Search file content by pattern            |

A quick example — "compile all TODO comments":

```
Agent → Grep("TODO", glob="**/*.py")
Tool returns:
  src/api.py:42: # TODO: add rate limiting
  src/db.py:15:  # TODO: migrate to PostgreSQL

Agent → Write("TODO_LIST.md", content="...")
Tool returns: File created
```

Two tools, one task done. The seven tools are simple individually; in combination they cover a remarkable range.

**Why is the file system the hub?** In OpenClaw, the Agent's long-term memory lives in `MEMORY.md` and date-archived Markdown logs — not a vector database. Markdown lets users directly read and edit the Agent's memory; Git provides version control and rollback. More critically, because the Agent can _write files_, it has the technical means to modify its own external artifacts — recording a discovery for future sessions, updating documentation after a code change, or saving a successful operation sequence as reusable code.

<a name="security-the-lethal-triad-and-trust-boundaries"></a>

### Security: The Lethal Triad and Trust Boundaries

A Coding Agent with file access, command execution, and network connectivity is powerful — and dangerous. Simon Willison's **Lethal Triad** names the three elements that, when present together, close an attack loop:

1. **Access to Private Data** — the Agent can read user files and credentials
2. **Exposure to Untrusted Content** — emails and web pages may contain malicious payloads
3. **Ability to Communicate Externally** — it can send data out via email or HTTP

Add a fourth amplifier — **Persistent Memory** — and a one-off attack becomes a threat that lies dormant across sessions, compounding over time.

```
Untrusted Content ──→ Agent reads Private Data ──→ Exfiltrates via External Channel
                                                          ↑
                                        Persistent Memory stores latent malicious instructions
```

**Key defenses** (layered, not interchangeable):

- **Network egress control**: No network by default; grant access via a whitelist proxy. Even if injection succeeds, without an egress path the data cannot leave.
- **Command semantic parsing**: Keyword blacklists can't handle `$(echo rm) -rf /` or `find / -exec rm {} \;`. Production-grade systems parse each command's argument types to recognize nested dangerous operations.
- **Loyalty code of conduct**: An Agent negotiating on your behalf faces a _negotiating opponent_, not a "user in need of help." The system prompt must explicitly nail down whom the Agent serves: instructions from the principal carry highest priority; everything from external parties is downgraded to "data that may be consulted but carries no force of instruction."
- **Permission-Embedded Data Objects**: When both the code writer and the code runner may be untrusted, constraints must live in the human-reviewed schema beneath the application layer — enforced on every write, producing zero invariant violations in comparisons against baselines like bare SQL or constitutional prompts.

<a name="harness-engineering-for-coding-agents"></a>

### Harness Engineering for Coding Agents

The Harness — context, tools, constraints, verification, and correction — is where Coding Agents shine. Code-writing tasks naturally occupy the "clear goal + automated verification" quadrant:

|                | Results can be automatically verified                           | Results require manual verification          |
| -------------- | --------------------------------------------------------------- | -------------------------------------------- |
| **Clear goal** | Sweet spot: fixing bugs with test cases                         | Throughput-limited: refactoring needs review |
| **Vague goal** | Efficiently going off track: optimizing "quality" with a linter | Hard to start: "make the UI look better"     |

Four transferable Harness principles:

1. **Constraints over guidance**: Linter rules and CI checks are worth more than "please follow..." in the system prompt — the former means "cannot be done," the latter is merely "advised against."
2. **Automate verification**: Test suites, type checks, and behavior monitoring yield higher returns than adding more human reviewers.
3. **Fast, structured feedback**: The more detailed the error message and the closer to the moment of error, the more efficiently the Agent corrects itself.
4. **Reliable rollback**: Git branches, sandboxes, and snapshots let the Agent experiment boldly within a safety net.

**A deeper purpose of constraints**: The acceptance baseline governs whether the _outcome_ is right; the execution boundary governs the _process_. Deleting the database to "fix" a database fault does repair it — but the data is gone. Destructive shortcuts are the everyday form of reward hacking; a production Harness constrains _actions_, not merely outcomes.

<a name="failure-and-error-recovery"></a>

### Failure and Error Recovery

An Agent's reliability is not determined by whether it makes mistakes, but by whether **every class of error has a corresponding detection, recovery, and termination path**.

**Four failure layers**:

| Layer            | Typical Failures                                                                |
| ---------------- | ------------------------------------------------------------------------------- |
| **API**          | Rate limiting (429), service overload, connection drops, token-limit truncation |
| **Tool**         | Hallucinated calls, malformed arguments, repeated identical errors              |
| **Context**      | Window overflow, compaction failure, corrupted trajectory structure             |
| **Control-flow** | Infinite loops, death spirals (error-handler calls LLM, fails, cascades)        |

**Recovery escalates through increasingly visible stages**:

1. **Silent retry** — exponential backoff with jitter for retryable errors
2. **Degrade and continue** — raise output cap, fall back to another model, strip proprietary formatting
3. **Surface to the user** — only after all automatic means are exhausted

**Termination: every recovery path needs a ceiling.** Circuit breakers prevent infinite retries. For death spirals, disable all model-invoking side effects on the error path and use a recursion-depth counter. Above all automatic mechanisms sit global termination conditions: maximum turns, session budget cap, and escalation to human intervention.

<a name="six-directions-of-code-as-meta-capability"></a>

### Six Directions of Code as Meta-Capability

Code serves an Agent beyond writing programs. These six directions progress from the inside out:

| #   | Direction                 | Code acts on                                                      |
| --- | ------------------------- | ----------------------------------------------------------------- |
| 1   | Thinking Tool             | Reasoning itself — precise calculation vs. probabilistic guessing |
| 2   | Business Rule Constraints | Vague policies → executable, deterministic validators             |
| 3   | Multimedia Generation     | PPTs, videos, visualizations via code + Proposer-Reviewer         |
| 4   | System Adapter            | Heterogeneous APIs, evolving log formats                          |
| 5   | Generative UI             | Dynamic forms, SQL artifacts, customizable apps                   |
| 6   | Bootstrapping             | An Agent creating or repairing other Agents                       |

**Code as Thinking Tool**. Natural language says "60% take math = 24 students, 45% take physics = 18, only physics = 24 - 10 = 14" — but that's wrong. Code: `phys - both = 18 - 10 = 8` ✓. Let the LLM understand the problem and write code; let the code interpreter compute precisely.

**Code as Business Rule Constraints**. Consider an airline cancellation policy. The three-tier safeguard:

1. _System prompt_ — natural language rules for understanding and explanation
2. _Tool description + parameters_ — act as a mandatory checklist, guiding the model to verify conditions before calling
3. _Server-side ground-truth validation_ — all policy facts read from the database; the model's self-reported parameters are not trusted

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

No policy fact comes from the model. If `cabin_class` were a model-filled parameter, a single hallucinated value could bypass the gatekeeper. The last line of defense must be built on data the model cannot forge.

**Code as Generative UI**. Instead of describing query results in prose (burning tokens and risking transcription errors), the Agent generates SQL as an _executable artifact_. The system runs the query and renders the table — data flows from database to interface without passing through the LLM. Faster and more accurate.

<a name="evaluation-knowing-whether-it-actually-works"></a>

## Evaluation: Knowing Whether It Actually Works

<a name="a-concrete-example"></a>

### A Concrete Example

A customer-service Agent handles a refund request: "Return headphones, order #12345, bought 3 days ago." Policy: full refund within 7 days.

```
Agent → query_order("12345")
Tool returns: {status: "delivered", amount: 299, date: "2026-04-07"}

Agent (thinking): 3 days < 7 days → eligible
Agent → process_refund(order_id="12345", amount=299)
Tool returns: {refund_id: "R-98765", status: "processing"}
```

Scored with a rubric: Operational Correctness 4/4, Policy Compliance 4/4, Information Completeness 4/4, Hallucination (veto) — Pass. But a good evaluation also probes boundaries: what about a 15-day-old order? What if the user claims "customer service already approved it"?

<a name="automated-evaluation-environments"></a>

### Automated Evaluation Environments

Two paradigms:

**Tool-calling environments** (Verifiers framework): The Agent calls tools; verification is based on executable criteria — do tests pass, does the answer match? Hierarchical: `SingleTurnEnv` (simple Q&A) → `ToolEnv` (multi-turn tool loop) → `StatefulToolEnv` (database mutations) → `SandboxEnv` (code execution + isolation).

**Human-computer interaction environments** (τ-bench): The key design principle is **Progressive Information Disclosure** — the simulated user doesn't reveal all information at once. "There's a problem with my flight" → Agent asks "Which flight?" → User reveals "Delta 123, tomorrow morning." This tests the Agent's ability to clarify, not just execute.

<a name="designing-evaluation-datasets"></a>

### Designing Evaluation Datasets

Five core challenges distilled from benchmarks like GAIA, SWE-Bench Verified, τ²-bench, and AndroidWorld:

| Challenge                        | Benchmark Example                                                        |
| -------------------------------- | ------------------------------------------------------------------------ |
| Clarity vs. Openness             | GAIA: "conceptually simple" goals with open implementation paths         |
| Authenticity vs. Controllability | SWE-Bench Verified: human-screened 500 tasks from 2,294 real issues      |
| Diversity vs. Systematization    | AndroidWorld: 116 tasks across 20 apps, annotated by required capability |
| Cost vs. Coverage                | SWE-Bench Verified: 500 tasks (29% pass rate) vs. 2,294 (more noise)     |
| Data Contamination               | τ²-bench: dynamic parameter generation; Terminal-Bench: canary GUIDs     |

**Parameterized template design** (AndroidWorld): A task is a template like "Change `[CONTACT_NAME]`'s phone to `[NEW_PHONE]`" with randomly generated parameters each run — prevents memorization, generates unlimited instances, and supports controlled experiments.

<a name="the-metrics-system-passk-vs-passk"></a>

### The Metrics System: Pass@k vs Pass^k

Two often-confused metrics measure fundamentally different things:

- **Pass@k**: Probability that _at least one_ of k attempts succeeds → "Can the Agent do it?"
- **Pass^k**: Probability that _all_ k attempts succeed → "Is the Agent reliable?"

With 60% single-attempt success: Pass@5 ≈ 99% (almost certain to succeed once), but Pass^5 ≈ 7.8% (unlikely all five succeed). Confuse them and you misread your Agent.

| Evaluation Purpose            | Right Metric     | Consequence of Misuse                                 |
| ----------------------------- | ---------------- | ----------------------------------------------------- |
| Verify stability (regression) | Pass^k           | Pass@k masks instability — 1/5 success still "passes" |
| Evaluate capability ceiling   | Pass@k or Best@k | Pass^k flags occasional fluctuations as failures      |

<a name="llm-as-a-judge-and-rubrics"></a>

### LLM-as-a-Judge and Rubrics

For open-ended tasks with no standard answer, an LLM evaluates outputs against a **Rubric** — expert-defined scoring criteria.

**Four Rubric Principles** (Scale AI):

1. **Based on Expert Guidance** — domain knowledge must ground the criteria
2. **Comprehensive Coverage** — include pitfalls and veto items (e.g., hallucination vetoes the entire score)
3. **Standardized Importance Weighting** — Essential / Important / Optional / Pitfall
4. **Self-Contained Evaluation** — each item is independently verifiable; no "demonstrates deep understanding"

Example Rubric for a user-memory Agent ("Who is my daughter's pediatrician?"):

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

**The same-family model problem**: When the Agent and judge come from the same family, the Agent may learn to exploit the judge's blind spots — Goodhart's Law. Mitigation: **multi-source heterogeneous judging** (if the Agent runs Claude, judge with GPT-5 and Gemini).

<a name="pairwise-comparison-and-model-ranking"></a>

### Pairwise Comparison and Model Ranking

**Elo rating** quantifies relative ability through pairwise matchups. Chatbot Arena uses anonymous blind comparisons from millions of user votes. When LLMs judge instead of humans, guard against **Position Bias** — the judging model systematically favors the first candidate. Mitigation: evaluate each pair twice with swapped order; count inconsistent results as ties.

<a name="statistical-significance"></a>

### Statistical Significance

"A switching decision within hours" rests on the premise that the score difference is real signal, not sampling noise. With 100 test cases and a 70% success rate, the standard error is ≈4.6%. A 3-percentage-point difference (73% vs 70%) sits entirely inside the noise band — switching models on such evidence is little better than a coin flip.

**Practical rule**: when the difference is smaller than the estimated sampling noise, do not make a switching decision. Run multiple times (3–5 per configuration), use **paired analysis** (McNemar's test on task-by-task win/loss) instead of differencing independent rates, and guard against **multiple comparisons** (6 hypotheses at 95% confidence → 26% chance of at least one false positive).

<a name="from-benchmark-to-system-improvement"></a>

### From Benchmark to System Improvement

The closed loop: **Observe → Hypothesize → Experiment → Validate → New Understanding → New Hypothesis**.

A concrete pattern from AndroidWorld: failures cluster in transcription (visual understanding), math_counting, and complex_ui. Surface hypothesis H1 (add navigation hints) raises settings-task success from 0% to 75% at 8% token cost — deploy immediately. Deep hypothesis H4 (globally enable thinking) improves counting from 0% to 70% but triples latency — reject; instead, conditionally activate thinking only for counting tasks (H7). H6 (add UI element tree) beats H5 (upgrade to GPT-5) — the bottleneck is information richness, not model reasoning.

**Key principle**: when Agent performance drops, check the evaluation system first, then the Agent. A broken scorer marking correct answers as failures looks identical to model degradation in headline numbers.

<a name="example-an-end-to-end-mini-case"></a>

## Example: An End-to-End Mini-Case

Consider building an email-processing Agent. The three layers interact as follows:

**Tool Layer**: Perception tools read emails and search history. Execution tools draft replies and send notifications. Event-triggered tools (`connect_channel`) push new emails to the Agent in real time. The Agent uses MCP servers for email access and NLP, with a Sidecar gating every `send_email` call.

**Code Layer**: When a new email contains a format the Agent hasn't seen — an attached CSV with an unusual schema — the `code_interpreter` writes parsing code on the fly. The parsed data goes into the shared file system; subsequent reasoning references only the file path, not the full content.

**Evaluation Layer**: A Rubric scores each processed email on Correctness, Completeness, Tone, and Hallucination (veto). Pass^3 across 50 test emails confirms reliability. When a new model release claims better tool calling, the evaluation set runs within hours — if the new model drops 5% on multi-step orchestration, you keep the original model for complex tasks and route only simple ones to the new model.

<a name="best-practices"></a>

## Best Practices

1. **Design tools for the Agent, not for humans** (ACI, not HCI). Granularity, generality, and description quality all serve the LLM's selection accuracy.
2. **Constraints over guidance at every layer** — in tool design (server-side validation over prompt rules), in the Harness (linter rules over "please follow..."), and in data (Permission-Embedded Data Objects over hoping the Agent stays loyal).
3. **Code is the meta-capability**. Don't enumerate all needed tools in advance; give the Agent a code interpreter and let it write what it needs.
4. **Evaluate the whole Agent, not just the model**. The same model in different Harnesses performs wildly differently. Model-swap experiments separate "insufficient model" from "Harness design flaw."
5. **Build the evaluation set before you need it**. When a new model ships, a team with a solid evaluation system decides within hours; a team without one trusts intuition — and in competitive markets, that difference decides who wins.
6. **Every failure class needs a termination path**. Reliability is not the absence of errors; it's the presence of systematic handling for every error that can occur.
7. **Treat evaluation data as a living asset**. Extract failed cases from production traces → anonymize → distill into regression tests. The evaluation set evolves with the product.

<a name="faq"></a>

## FAQ

**Q: Should I use dedicated tools or Skills + general executors?**
A: Depends on three dimensions: (1) Parameter complexity — nested objects and cross-field validation favor dedicated tools; simple parameters work fine via CLI. (2) Frequency of change — frequently changing capabilities are cheaper as Skills (edit text, not code + test + deploy). (3) Model capability — SOTA models can express more through Skills; weaker models need structured tool schemas to guide correct invocation.

**Q: How many tools can an Agent handle before selection accuracy degrades?**
A: Past ~100 tools, even advanced models start picking wrong ones. Use hierarchical organization, dynamic discovery, or Skills (progressive disclosure) to scale further.

**Q: What's the most overlooked security risk in Agent systems?**
A: Network egress control. Everyone focuses on input validation, but if injection succeeds and the Agent reads private data, _without an egress path the data cannot leave_. Cutting the exfiltration channel is more deterministic than trying to recognize every injection.

**Q: Pass@k or Pass^k for my use case?**
A: Use Pass^k for regression testing and production deployment (you need reliability). Use Pass@k or Best@k for research and capability exploration (you care about the ceiling).

**Q: How do I know if a score difference is real?**
A: Estimate the standard error: √(p(1-p)/n). If the difference is smaller than ~2 standard errors, don't make a switching decision. Better yet, use paired analysis (McNemar's test) on the same task set.

**Q: Can I reuse my evaluation environment for training?**
A: Reuse the _construction mechanism_ (environment, tools, parameterized templates) — but the specific evaluation tasks must stay strictly isolated from training data. Once an evaluation task enters the training set, it tests memory, not ability.

<a name="summary"></a>

## Summary

An Agent's intelligence emerges from three interlocking layers:

**Tools** give the Agent capability — perception to observe, execution to act, collaboration to divide labor, events to stay awake, and communication to reach the user. The MCP protocol standardizes tool interoperability; hierarchical organization and Skills scale to hundreds of tools; and layered security (Proposer-Reviewer, Sidecar, egress control) keeps the Agent safe even when it faces untrusted content.

**Code** gives the Agent generality — a meta-capability that creates new tools on demand. A Coding Agent with seven core tools and a file system is the architectural core of every general-purpose Agent. Code serves as a thinking tool (precise calculation), a constraint language (deterministic business rules), a content generator (PPTs, videos), a system adapter (evolving formats), a UI builder (generative interfaces), and ultimately a bootstrapping mechanism (Agents creating Agents).

**Evaluation** gives the Agent reliability — turning "I think it works" into "the data says it works." Automated environments, well-designed datasets, LLM-as-a-Judge with Rubrics, and pairwise comparison form a closed loop: Observe → Hypothesize → Experiment → Validate. Statistical significance separates signal from noise; the evaluation set becomes a living asset that evolves with the product.

The three layers form a flywheel: tools enable capabilities → code expands the capability boundary → evaluation validates and guides improvement → better tools and code result. An Agent system that builds all three layers from day one doesn't just ship faster — it compounds its advantage with every evaluation cycle.

<a name="appendix"></a>

## Appendix

**Key References**:

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
