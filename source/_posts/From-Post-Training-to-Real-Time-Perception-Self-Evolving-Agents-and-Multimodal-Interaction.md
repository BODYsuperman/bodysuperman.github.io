---
title: "From Post-Training to Real-Time Perception: Self-Evolving Agents and Multimodal Interaction"
date: 2026-06-25 15:09:38
updated: 2026-07-25 15:09:38
comments: true
categories:
  - AI Agent
  - AI Engineering
tags:
  - LLM
  - Post Training
  - Agent Evolution
  - Multimodal AI
  - Autonomous Agents
  - Generative AI
---

- [Introduction](#introduction)
  - [The Capability Paradox](#capability-paradox)
  - [Three Acts of This Article](#three-acts)
- [Post-Training: Baking Capability Into Parameters](#post-training)
  - [The Three-Stage Pipeline](#three-stage-pipeline)
  - [SFT Memorizes, RL Generalizes](#sft-rl-comparison)
  - [When to Choose SFT vs RL](#sft-vs-rl-decision)
  - [Reward Design: From Scalar to Generative](#reward-design)
  - [RLVP: Reward the Outcome, Penalize the Path](#rlvp)
  - [Data and Environment Matter More Than Algorithms](#data-environment)
  - [The Practical Takeaway](#practical-takeaway-post-training)
- [Self-Evolving Agents: Learning From Experience](#self-evolving)
  - [Preserving Experience Is Not Learning](#preserving-vs-learning)
  - [Three-Layer Verification](#three-layer-verification)
  - [Four Update Carriers](#four-update-carriers)
  - [Dual-Loop Architecture](#dual-loop-architecture)
  - [When Done Does Not Mean Progress](#done-not-progress)
  - [Safety Boundaries for Continual Evolution](#safety-boundaries)
- [Real-Time Perception and Multimodal Interaction](#realtime-multimodal)
  - [Why Real-Time Changes Everything](#why-realtime)
  - [Voice: Cascaded to End-to-End to Full-Duplex](#voice-evolution)
  - [Computer Use: The Perceive-Think-Act Loop](#computer-use)
  - [Robotics: VLA, Action Chunking, and Sim2Real](#robotics)
  - [The Unifying Theme: Fast-Slow Architecture](#fast-slow)
- [Putting It Together: The Full Stack of a Modern Agent](#full-stack)
- [Best Practices](#best-practices)
- [FAQ](#faq)
- [Summary](#summary)

<!--more-->

<a name="introduction"></a>

## Introduction

AI agents today sit at an inflection point. The same model that writes production code zero-shot will repeat an identical mistake on the thousandth similar request. The same agent that navigates a website flawlessly on Tuesday forgets the workaround it discovered on Monday. The same voice assistant that answers complex questions takes 2 seconds of awkward silence before uttering a word.

These are not separate problems — they are symptoms of a single gap: **agents can solve tasks, but they do not yet learn, evolve, or respond in real time.**

<a name="capability-paradox"></a>

### The Capability Paradox

Current LLM-based agents exhibit what we call the **capability paradox**:

> Agents can solve novel tasks zero-shot, yet fail to learn from experience across tasks.

A Q-learning agent needs ~10,000 episodes to solve a treasure-hunt game. An LLM agent (Kimi K3) completes it in 18 steps on the very first try — but on the next game with slightly different rules, it starts from scratch again. The LLM generalizes semantically; it does not accumulate experience.

This paradox has three dimensions, each addressed by a different layer of the agent stack:

| Dimension       | Problem                  | Solution                          |
| :-------------- | :----------------------- | :-------------------------------- |
| **Capability**  | Model cannot do X        | Post-training (SFT, RL)           |
| **Evolution**   | Agent repeats mistakes   | Continual learning (dual-loop)    |
| **Interaction** | Agent is slow, text-only | Real-time multimodal architecture |

<a name="three-acts"></a>

### Three Acts of This Article

This article traces the journey from a static trained model to a self-evolving, real-time multimodal agent:

```
Act 1: Train the Brain          (Post-Training)
        Bake capability into model parameters

Act 2: Let the Brain Evolve     (Continual Evolution)
        Learn from experience after deployment

Act 3: Let the Brain See & Speak (Real-Time Multimodal)
        Perceive and act in a continuous, multimodal world
```

Each act builds on the previous one. Post-training gives us a capable model; continual evolution keeps that model improving; real-time multimodal architecture lets it operate where humans actually live — in conversation, on screens, in physical spaces.

<a name="post-training"></a>

## Post-Training: Baking Capability Into Parameters

The foundation of any agent is its model. The core formula:

```
Agent = LLM + Context + Tools
```

Post-training is about the **LLM** component — how to make the model better at using context and tools through parameter updates.

<a name="three-stage-pipeline"></a>

### The Three-Stage Pipeline

Modern LLMs go through three stages, each with a distinct purpose:

| Stage            | Data                         | Cost                 | Purpose                              |
| :--------------- | :--------------------------- | :------------------- | :----------------------------------- |
| **Pre-training** | Massive internet text        | Very expensive       | General knowledge & language ability |
| **SFT**          | Labeled input-output pairs   | Cheap & fast         | Solidify protocols & formats         |
| **RL**           | Trial-and-error with rewards | Expensive & unstable | Discover generalizable strategies    |

**SFT is mathematically identical to pre-training** — both minimize next-token prediction loss. The differences are practical: SFT uses input-output pairs (not raw text) and applies **loss masking** (gradients computed only on response tokens, not the prompt).

The critical ordering:

> **Form first, spirit second.** SFT must come before RL.

RL requires the model to produce parseable output so rewards can be computed. SFT establishes format; RL then pursues strategy. The exception is sufficiently strong base models (e.g., DeepSeek-R1-Zero) that can skip SFT — but they produce poorly formatted, mixed-language output.

<a name="sft-rl-comparison"></a>

### SFT Memorizes, RL Generalizes

This is the central thread of post-training. The distinction is not about "which is better" — it is about what each one does:

| Property           | SFT                                  | RL                                               |
| :----------------- | :----------------------------------- | :----------------------------------------------- |
| **Optimizes**      | Maximum likelihood of labeled answer | Expected reward                                  |
| **Behavior**       | Memorizes training demonstrations    | Discovers transferable strategies                |
| **KL mode**        | Mass-covering (spreads probability)  | Mode-seeking (concentrates on high-reward modes) |
| **Ceiling**        | Bounded by training data             | Bounded by the task itself                       |
| **Generalization** | Degrades on OOD                      | Improves on OOD                                  |

**Why RL has a higher ceiling** — three reasons:

1. **Ceiling of offline is the data; ceiling of online is the task.** SFT can only teach what the demonstrations show. RL can discover strategies no demonstration contains.
2. **Verifying is easier than generating** (verification-generation asymmetry). A reward function that checks correctness is simpler than one that must produce the correct answer.
3. **Online learning trains on the model's own trajectories**, avoiding covariate shift — the mismatch between training states and deployment states.

**Concrete evidence (GeneralPoints experiment):** An arithmetic card game (like "24 Game") with rule and visual variants:

| Method | Rule OOD  | Visual OOD |
| :----- | :-------- | :--------- |
| SFT    | **-8.1%** | **-9.9%**  |
| RL     | **+3.5%** | **+17.6%** |

SFT actively hurts out-of-distribution performance. RL improves it.

<a name="sft-vs-rl-decision"></a>

### When to Choose SFT vs RL

A practical decision framework:

```
1. Is post-training needed at all?
   → Most agents don't need it. Harness engineering suffices.

2. If needed, try SFT first.
   → It's cheap, stable, and establishes format.

3. If SFT is insufficient, add RL (after SFT stabilizes format).
   → RL when you need generalization to unseen scenarios.
```

**SFT is suited for:** format stabilization, high-quality demonstrations, stable deployment environments.

**RL is necessary when:** distribution shift between training and deployment, discovering optimal strategies, high annotation costs.

**Practical test:** When adding more demonstrations no longer improves performance on new scenarios, switch to RL.

**LoRA** (Low-Rank Adaptation) is the default cost-saving method for all post-training. Key settings:

| Use Case | LoRA Rank        | Learning Rate            |
| :------- | :--------------- | :----------------------- |
| SFT      | 64–256           | ~10× full fine-tuning LR |
| RL       | 8–32 (or even 1) | ~10× full fine-tuning LR |

<a name="reward-design"></a>

### Reward Design: From Scalar to Generative

Reward design is where the art of RL meets engineering. The design space has two axes: **density** (how often you give feedback) and **representation** (what form the signal takes).

**Density spectrum:**

| Type        | When Available         | Example                                               |
| :---------- | :--------------------- | :---------------------------------------------------- |
| **Binary**  | Final answer checkable | Math: correct/incorrect                               |
| **Sparse**  | Success rare, delayed  | Phone agent: 100+ failures before first success       |
| **Process** | Every step evaluable   | Navigation: +1 correct, -1 wrong, -1.5 landmark error |

**Representation evolution:**

```
Scalar ──→ Semi-Scalar ──→ Vector ──→ Generative
(0/1)      (0/1 + reason)  (multi-dim)  (NL analysis with reasoning)
```

- **Scalar rewards**: Sufficient for tasks with clear correct answers.
- **Vector rewards**: Multi-dimensional scoring across independent quality dimensions.
- **Generative reward models**: The model auto-generates evaluation principles, evaluates against each, and the system checks accuracy. DeepSeek's generative RM can improve through inference-time scaling.

**Key rule:** Training data must be separated from evaluation data. SWE-bench → SWE-Gym, tau2-bench → imitation learning data, AndroidWorld → curriculum learning.

<a name="rlvp"></a>

### RLVP: Reward the Outcome, Penalize the Path

A critical insight: **outcome-neutral constraints get violated because violation often raises apparent success rate.**

Examples:

- Calling users who opted out → higher contact rate → looks like more success
- Running `rm -rf` to clear failing tests → tests pass → looks like success
- Editing test files to make them pass → passes → looks like success

The problem: real environments are **asymmetric verifiers** — detecting bad actions is easy/cheap, but judging meaningful progress is hard/expensive.

**RLVP formula:**

```
R = O + β × Φ

O  = outcome reward (did the task succeed?)
Φ  = path signal:
     -λ for violations (penalty)
     +μ for compliant actions (compliance reward)
β  = weighting factor
```

**Why this works:** GRPO advantage is essentially within-group variance. Pure outcome rewards have zero-variance deadlock at extremes (all-fail or all-pass groups get zero gradient). Penalties always restore variance.

**Four design principles for penalties:**

1. Penalize only **verifiable bad actions**, never "lack of progress"
2. Outcome rewards must be the **primary driver** (otherwise: inaction trap)
3. Pair each penalty with a **compliance reward**
4. Compliant paths must be **reachable**, penalty targets must be **un-game-able**

**Results (RLVP experiment):**

| Metric                    | Before | After            |
| :------------------------ | :----- | :--------------- |
| Violations                | 3.71   | 0.66 (~6× fewer) |
| Iterations to 90% success | 7.0    | 4.4              |
| All-fail groups           | 65%    | 8%               |

<a name="data-environment"></a>

### Data and Environment Matter More Than Algorithms

The second thread running through post-training:

> **With off-the-shelf algorithms, what determines success is simulation environment fidelity and training data quality.**

Priority order:

```
Base Model > Environment > Data > Algorithm
```

This is the reverse of what many assume. OpenAI's own exploration path (Algorithm > Environment > Prior) was backwards. The real order is **Prior > Environment > Algorithm**.

**Environment fidelity** is paramount: "A distorted environment means a dead policy." Building a high-fidelity simulation environment is often harder than training itself.

**Data quality** trumps algorithms on three dimensions: coverage, diversity, annotation accuracy.

- SFT bakes noise directly into parameters
- RL optimizes toward whatever the reward function measures (biased or not)

**Rejection sampling** is the standard technique for pushing annotation accuracy to maximum: sample k candidates, verify, keep only correct ones, deduplicate, then SFT on retained data.

<a name="practical-takeaway-post-training"></a>

### The Practical Takeaway

For most agent applications, **post-training is not needed at all**. Harness engineering — prompts, tool design, context management — suffices.

When post-training is needed:

1. **SFT first** to stabilize format and style
2. **RL only if** generalization to unseen scenarios is required
3. **Invest in data and environment** before obsessing over algorithms
4. **To inject factual knowledge**, use continued pre-training or RAG — **not SFT** (SFT is for protocol knowledge: _how_ to do things, not factual knowledge: _what_ to know)

Synergy with the broader agent stack:

| Component     | Manages                                 |
| :------------ | :-------------------------------------- |
| RAG           | Facts                                   |
| ICL           | Rapid strategy experimentation          |
| Programs      | Deterministic constraints               |
| Post-training | Capabilities hard to express explicitly |

<a name="self-evolving"></a>

## Self-Evolving Agents: Learning From Experience

Post-training gives us a capable model at deployment time. But a trained model is a **static artifact** — it does not learn from the interactions it has after deployment.

This section addresses the question: how do we make agents that actually improve from experience?

<a name="preserving-vs-learning"></a>

### Preserving Experience Is Not Learning

This is the most important distinction in this entire article:

> **Storing trajectories in memory ≠ learning from experience.**

Learning requires active evaluation, comparison, generalization, and validation of evidence. An agent that saves every conversation to a vector database has preserved experience — but it has not learned anything.

Consider the difference:

| Type                | Captures                            | Effect                                 |
| :------------------ | :---------------------------------- | :------------------------------------- |
| User memory (Ch. 3) | "What the user and world are like"  | Helps agent **remember more**          |
| Experience learning | "What to do under which conditions" | Helps agent **become more proficient** |

Direct self-modification by a running model is dangerous: production environments rarely provide clean learning signals, and unverified feedback can entrench errors and amplify prompt injection.

The engineering approach: **build a learning system around the model** — record evidence, verify outcomes, extract patterns, then update knowledge/instructions/programs/parameters after regression testing and safety checks.

<a name="three-layer-verification"></a>

### Three-Layer Verification

The starting point for any learning system is **evaluation, not summarization**. Without knowing what went well or wrong, LLM reflections are just guesses.

Critical insight: **correct outcomes do not imply correct processes.**

- Deleting failing tests makes tests pass (outcome correct, process wrong)
- Telling a user to wait produces temporary satisfaction (outcome looks correct, process is avoidance)

The three-layer verification structure:

```
┌─────────────────────────────────────┐
│  Quality Verifier                   │  ← Rubric-based: "Was it handled
│  (LLM + human rubric)               │     appropriately?"
├─────────────────────────────────────┤
│  Process Verifier                   │  ← Rule-based: "Was it completed
│  (business rules, permissions)      │     in an allowed manner?"
├─────────────────────────────────────┤
│  Outcome Verifier                   │  ← Code-based: "Was the task
│  (tests, DB states, tool returns)   │     actually completed?"
└─────────────────────────────────────┘
```

**Lower layers should rely on code and environmental ground truth.** Only hard-to-formalize aspects go to an LLM.

Seven evaluation dimensions for customer-service agents:

| Dimension                      | What It Checks                                  |
| :----------------------------- | :---------------------------------------------- |
| Task outcome                   | Did the agent actually complete the task?       |
| Rule compliance                | Did it follow business rules?                   |
| Privacy boundaries             | Did it leak sensitive data?                     |
| Factual reliability            | Were claims accurate?                           |
| **Promise-action consistency** | Did claimed actions actually occur?             |
| Expression quality             | Was language appropriate?                       |
| Compliant alternatives         | When plan A failed, did it find lawful options? |

**Promise-action consistency** is particularly important for agents: check whether claimed completed actions actually occurred (e.g., did the refund tool actually get called?).

Verification results should be **structured diagnoses, not scalars**. Dimensional signals preserve both the nature and location of issues, enabling targeted downstream fixes.

<a name="four-update-carriers"></a>

### Four Update Carriers

The choice of update method depends on whether the target capability can be naturally represented by a particular medium:

| Carrier                       | Best For                                   | Example                                     |
| :---------------------------- | :----------------------------------------- | :------------------------------------------ |
| **Experience Knowledge Base** | Facts, patterns, exceptions                | "Refunds under $50 auto-approve"            |
| **Prompt & Skill**            | Linguistically expressible principles      | "Always explain policy before escalating"   |
| **Programs & Harness**        | Deterministic procedures, hard constraints | Browser workflow, retry logic, validators   |
| **Model Parameters**          | High-dim perception, implicit strategies   | Medical-image understanding, speech prosody |

These are **not alternatives — they are complementary channels.** The same agent uses all four, each for capabilities with different representational natures.

**Capabilities can be promoted across carriers** as evidence accumulates:

```
New strategy → Experience doc → Knowledge → Skill → Tool code → Post-training
```

**System Prompt Learning** (Karpathy's term): when patterns can be clearly expressed in natural language, elevate from "experience for reference" to "rule that must be followed." Compared to RL, it edits text rather than changing parameters via gradient descent. Like leaving an explicit note to your future self.

Prompt revision should use **minimal diffs**, not rewriting entire prompts. Generate a minimal diff from similar failures, specify scope, check conflicts, evaluate against boundary cases and retention set.

**Encoding experience as programs:** When experience describes stable, repetitive, verifiable operations, compile into workflows/tools/Harness code. The **PreAct** system delivered 8.5–13× speedup on repeated browser tasks with no step-by-step LLM calls during replay.

**Encoding experience in parameters:** Capabilities like medical-image understanding or removing "AI feel" are hard to compress into rules or workflows — they must go into model parameters via post-training. This is where Chapter 7 connects back: production trajectories become training data.

<a name="dual-loop-architecture"></a>

### Dual-Loop Architecture

The core architecture for continual evolution:

```
┌─────────── Online Execution Loop ───────────┐
│                                             │
│  Task → Agent → Trajectory → Evidence Log   │
│         ↑                      │            │
│         └── Current Version ───┘            │
│                                             │
│  Does NOT directly rewrite production       │
└──────────────────────┬──────────────────────┘
                       │ versioned experience
                       │ repository
┌──────────────────────▼──────────────────────┐
│           Offline Evolution Loop            │
│                                             │
│  Aggregate → Diagnose → Generate → Validate │
│             → Release (candidate only)      │
│                                             │
│  New version only after validation gates    │
└─────────────────────────────────────────────┘
```

**Online loop:** completes tasks and records immutable evidence. It does NOT directly modify the production agent.

**Offline loop:** aggregates trajectories, diagnoses root causes, generates candidate modifications, releases new versions only after validation gates.

**Release gate conditions** (all four must pass):

1. Nonempty patch
2. Traceable provenance
3. Measurable improvement on boundary set
4. No degradation on retention set

Passing produces `release_to_canary`, **never** direct overwrite of production.

**Voyager example (Minecraft):** Three interlocking mechanisms:

| Component            | Role                                   | Without It            |
| :------------------- | :------------------------------------- | :-------------------- |
| Automatic curriculum | Proposes next objective                | Random wandering      |
| Skill library        | Successful programs as composable code | Starting from scratch |
| Iterative prompting  | Feeds errors back into code generation | Error accumulation    |

Results: 3.3× unique items, 2.3× distance traveled, up to 15.3× faster tech-tree milestones.

<a name="done-not-progress"></a>

### When Done Does Not Mean Progress

The dual-loop architecture works best for **coding, tool-use, and business-state changes** — tasks with rapid, verifiable feedback.

For open-ended tasks (research, strategy, design), feedback is delayed and ambiguous. Trehan and Chopra's autonomous research study: 4 end-to-end attempts, **3 failed**. Three failure modes:

| Failure Mode                | Description                                                                                                                      |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| **Implementation drift**    | Agent retreats to familiar implementation that no longer tests the hypothesis                                                    |
| **Epistemic over-optimism** | System begins explaining noise, patching methods, announcing findings while ignoring failures                                    |
| **Missing tacit judgment**  | Agent can run experiments but doesn't know which baseline matters, which anomaly to investigate, or when to abandon a hypothesis |

Remedies:

- Separate **claims from evidence** (Chain-of-Evidence)
- Retain **negative results**
- Preserve **search diversity**
- Move **human involvement upward**: problem definition, evaluation criteria, anomalous results, stopping decisions

> **The ceiling of continual evolution is set by whether the system can evaluate what it actually cares about, not merely the easiest proxy to measure.**

<a name="safety-boundaries"></a>

### Safety Boundaries for Continual Evolution

Three inviolable rules:

1. **Separate evidence from instructions.** Untrusted web/tool output must not be written directly into Skills. Writes should be version-controlled as PRs, reviewed by a different-source LLM.

2. **Separate candidate from production capabilities.** New knowledge/Prompts/Skills/programs/parameters enter candidate area first. Code and dependencies must pass sandbox execution, permission review, supply-chain scanning, behavioral testing.

3. **Safety mechanisms must not be self-modifiable.** The agent may modify Prompts, Skills, knowledge, and tools — but **NOT** validators, test cases, release thresholds, audit logs, or stable-version backups.

**Sleep learning** — the offline consolidation cycle:

```
Trigger → Orient → Collect & Consolidate → Validate & Approve → Prune & Index
```

The online agent's only job: complete task + append immutable evidence. Background learning reads new experience during idle periods, compares, merges, proposes, and validates.

<a name="realtime-multimodal"></a>

## Real-Time Perception and Multimodal Interaction

Post-training gives us a capable model. Continual evolution keeps it improving. But neither addresses a fundamental limitation: **agents interact with a world that is continuous, multimodal, and impatient.**

Static image/document understanding is already mature. This section tackles the harder class of problems where **real-time constraints make multimodal problems hard** — voice dialogue, GUI operation, and robot control.

<a name="why-realtime"></a>

### Why Real-Time Changes Everything

All three real-time scenarios share two problems: **processing several modalities at once**, and **acute sensitivity to latency**.

The queuing latency formula:

```
Total Latency ≈ Idle Latency / (1 - Utilization)
```

At 50% utilization, latency doubles. At 80%, latency is **5× idle**. This nonlinear compounding is why serial pipelines break down under load.

<a name="voice-evolution"></a>

### Voice: Cascaded to End-to-End to Full-Duplex

Voice has ~4× the bandwidth of typing and frees hands and eyes. The architecture has evolved through three paradigms:

**Paradigm 1: Cascaded Pipeline**

```
VAD ──→ ASR ──→ LLM ──→ TTS
500-800ms  50-200ms  100-500ms  200-500ms
                              Total: ~0.9–2s
```

Modular but slow, with information lost between stages. VAD (Voice Activity Detection) uses a 500–800ms silence threshold to detect when the user has finished speaking — but this threshold is a fundamental bottleneck.

Full-chain streaming (ASR transcribes while listening, LLM outputs in sentence chunks, TTS streams at sentence level) compresses latency to 600–800ms, but **cannot touch VAD's silence wait**.

Three fundamental problems with VAD + ASR:

- **Latency accumulation**: each stage adds its own delay
- **Information loss**: emotion, tone, hesitation are discarded
- **Decreased accuracy**: context disrupted by segmentation

**Paradigm 2: End-to-End Omnimodal**

A single model directly listens to audio, thinks, and speaks — merging three stages. Non-textual information (prosody, emotion) is preserved through an internal latent space.

| Property                           | Self-Cascade         | End-to-End           |
| :--------------------------------- | :------------------- | :------------------- |
| Semantic content                   | Matches or beats E2E | Matches self-cascade |
| Non-verbal cues (prosody, emotion) | **Loses them**       | **Preserves them**   |

Still assumes turn-taking. Not the final answer.

**Paradigm 3: Full-Duplex / Interactive**

The model **listens and speaks simultaneously**. No turn-taking assumption.

| Model                 | Turn-Switching Latency | Key Innovation                                |
| :-------------------- | :--------------------- | :-------------------------------------------- |
| GPT-realtime-2.0      | ~1.18s                 | VAD-based                                     |
| TML-Interaction-Small | ~0.40s                 | Micro-turns (~200ms), delegates slow thinking |
| GPT-Live (2026)       | Full-duplex            | Delegates to GPT-5.5 for deep reasoning       |

**GPT-Live** introduced the key architectural insight: **decouple real-time interaction from deep thinking**. The interaction layer processes continuously; deep reasoning happens in a background model.

The evolution in one line:

```
Cascaded ──→ End-to-End ──→ Full-Duplex
(turn-taking)    (turn-taking)    (no turns)
```

<a name="computer-use"></a>

### Computer Use: The Perceive-Think-Act Loop

GUI automation agents operate in a loop:

```
Screenshot ──→ Multimodal Model ──→ Action ──→ Wait ──→ Screenshot
```

Three key design dimensions:

**1. Action Space (Anthropic's three tools):**

| Tool                  | Operations                                                                                                           |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------- |
| **GUI Operation**     | Mouse: move, click, drag, scroll; Keyboard: type (12ms interval), combos, hold; Perception: screenshot, cursor, wait |
| **Command Execution** | bash (120s timeout, persistent session)                                                                              |
| **File Editing**      | String matching, view/create/replace/insert/undo                                                                     |

**2. Visual Grounding (three approaches):**

| Approach                        | How It Works                                                    | Trade-off                                              |
| :------------------------------ | :-------------------------------------------------------------- | :----------------------------------------------------- |
| **Set-of-Mark (SoM)**           | Segment regions, overlay numbered markers, model picks a number | Works on any interface; overhead of segmentation model |
| **Structured Element Indexing** | Enumerate interactive elements from DOM via CDP                 | More precise where available; web-only                 |
| **Pure Coordinate Prediction**  | Model outputs x,y coordinates directly                          | Simple; requires resolution matching                   |

**3. Agent-Computer Observation Interface (AOI):**

For dynamic screens (videos, notifications, audio):

- Inter-frame keyframe capture (cheap pixel gate + small model)
- Volume-gated speech transcription (give the agent "ears")
- Converting observations into **persistent textual descriptions** (+17 to +48 percentage point gains across 8 models without retraining)

**The real bottleneck is efficiency, not accuracy.** Agents need more steps than humans, and per-step latency grows as context lengthens. The practical workaround: **fast-slow decoupling** — fast model for speech, slow model for computer operation, communicating via a "plain text contract" (rolling status summary). This yields 15× faster voice responses (0.58s vs 8.64s median) with no loss in task success rate.

<a name="robotics"></a>

### Robotics: VLA, Action Chunking, and Sim2Real

In robotics, actions have **irreversible consequences** — one collision can damage the object or the robot.

**Hardware is not the bottleneck** (for visual-feedback household tasks). Teleoperation with a VR headset on a <$1000 robot works smoothly at 100–200ms latency. The gap is in algorithms.

The two-layer architecture mirrors the fast-slow pattern:

```
┌─────────────────────────────────┐
│  Slow: Long-Horizon Planning    │  "Clean the kitchen"
│  (decompose into sub-goals)     │  → wash dishes, wipe counter, sweep floor
├─────────────────────────────────┤
│  Fast: VLA Control              │  Execute specific operations
│  (Vision-Language-Action)       │  at 10–50Hz
└─────────────────────────────────┘
```

**VLA — two action representation approaches:**

| Approach                                   | Method                                                     | Best For                  |
| :----------------------------------------- | :--------------------------------------------------------- | :------------------------ |
| **Discrete Action Tokens** (RT-2, OpenVLA) | Discretize continuous actions, output autoregressively     | Simple tasks, open-source |
| **Continuous Trajectory** (π₀)             | Flow matching: denoise random noise into smooth trajectory | Dexterous manipulation    |

**Action Chunking:** The model generates a short sequence of future actions per inference (e.g., π₀ generates 25–50 actions at 50Hz). A control thread replays at high frequency while the model generates the next batch. Like video buffering.

```
Trade-off: Longer chunks = smoother but less responsive to sudden changes
```

**SimpleVLA-RL experiment:** SFT alone achieves 17.3% on LIBERO; SFT+RL achieves 91.7%. RL discovered the "pushcut" action — **never seen in human demonstrations**, more efficient than the standard approach. This is RL's generalization advantage in action space.

**Sim2Real Transfer:** Training in simulation, deploying in reality. Two critical engineering steps:

1. **Calibrate randomization range** — measure from real data, widen step by step
2. **Visual alignment** — calibrate camera pose, splice real backgrounds into sim renders

<a name="fast-slow"></a>

### The Unifying Theme: Fast-Slow Architecture

Fast-slow architecture appears in **all three scenarios** — not as coincidence, but as a fundamental design pattern:

| Scenario         | Fast                  | Slow               | Interface                   |
| :--------------- | :-------------------- | :----------------- | :-------------------------- |
| **Voice**        | Real-time interaction | Deep reasoning     | Background model delegation |
| **Computer Use** | Speech model          | VLM for operations | Plain text contract         |
| **Robotics**     | VLA control (50Hz)    | Planning model     | Sub-goal decomposition      |
| **Gaming**       | Reactor model         | Strategist model   | **Latent Bridge**           |

**Latent Bridge:** Freeze both fast and slow models, train only a small bridge (~tens of millions of parameters) between them. Projects the slow model's hidden-state conclusions into "latent tokens" inserted into the fast model's input. +26% to +82% improvement in some Atari games, only ~5ms per step overhead.

Key finding: **bridge pays off only where the slow thinker is genuinely better than the fast reactor** (correlation r ~ 0.9). Where the task is purely reaction speed, the bridge is useless.

Three solutions to the thinking architecture tension, not as linear progression but as design trade-offs:

| Solution                                     | Strategy                                           | Production Example |
| :------------------------------------------- | :------------------------------------------------- | :----------------- |
| **Fast for fillers, slow for answers**       | Parallel fast (holding reply) + slow (full answer) | Standard chat      |
| **Fast for interaction, slow as strategist** | Slow sees fast's output, suggests via status bar   | GPT-Live, Pine AI  |
| **End-to-end unification**                   | Internalize thinking into the end-to-end model     | Step-Audio R1      |

The industry divide: frontier products needing to swap reasoning models choose Solution 2; products chasing ultimate naturalness choose Solution 3.

<a name="full-stack"></a>

## Putting It Together: The Full Stack of a Modern Agent

The three chapters are not independent topics — they are layers of a single system:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Real-Time Multimodal Layer                   │
│   Voice ◆ Computer Use ◆ Robotics                               │
│   ┌──────────────────────────────────────────────────────┐      │
│   │         Fast-Slow Architecture                       │      │
│   │   Fast: real-time interaction    Slow: deep reasoning│      │
│   └──────────────────────────────────────────────────────┘      │
├─────────────────────────────────────────────────────────────────┤
│                  Continual Evolution Layer                      │
│   ┌──────────────┐    ┌──────────────┐                          │
│   │ Online Loop  │───→│ Offline Loop │                          │
│   │ (execute &   │    │ (aggregate,  │                          │
│   │  record)     │    │  diagnose,   │                          │
│   │              │    │  validate,   │                          │
│   │              │    │  release)    │                          │
│   └──────────────┘    └──────────────┘                          │
│                                                                 │
│   Four Carriers: Knowledge | Instructions | Programs | Params   │
├─────────────────────────────────────────────────────────────────┤
│                  Post-Training Layer                            │
│   Pre-training → SFT → RL                                       │
│   "Form first, spirit second"                                   │
│   Priority: Base Model > Environment > Data > Algorithm         │
└─────────────────────────────────────────────────────────────────┘
```

**How the layers connect:**

- **Post-training** (Ch. 7) produces the initial capable model. Parameter updates are one of four update carriers.
- **Continual evolution** (Ch. 8) keeps the system improving after deployment. It decides **when** and **how** to update each carrier — including triggering parameter updates (back to Ch. 7) when production trajectories reveal capability gaps.
- **Real-time multimodal** (Ch. 9) provides the interaction surface and the **feedback signals** that drive continual evolution. Real-time environmental outcomes become the verification evidence for the offline evolution loop.

The critical feedback loop:

```
Real-time interaction
  → produces trajectories with verifiable outcomes
    → feeds the offline evolution loop
      → generates validated updates across four carriers
        → deploys new versions to the production agent
          → improved real-time interaction
```

<a name="best-practices"></a>

## Best Practices

### Post-Training

- **Try harness engineering first.** Most agents don't need post-training at all.
- **SFT before RL.** Always stabilize format before pursuing strategy.
- **Invest in data quality, not algorithm novelty.** Rejection sampling is more impactful than switching from PPO to GRPO.
- **Use RAG for facts, SFT for protocols.** Never use SFT to inject factual knowledge.
- **Validate with small experiments first.** Don't commit large compute before testing key assumptions.

### Continual Evolution

- **Never let the online agent rewrite production directly.** All updates go through the offline validation pipeline.
- **Use structured diagnoses, not scalar scores.** Dimensional signals enable targeted fixes.
- **Start with the smallest modification target.** Same surface problem may need different root-cause fixes.
- **Monitor five long-term outcomes:** Regression, Generalization, Token efficiency, Safety, Engineering quality.
- **Keep safety mechanisms outside the self-modification boundary.** The agent may modify its skills — but never its validators.

### Real-Time Multimodal

- **Latency compounds nonlinearly.** Design for 50% utilization headroom.
- **Replace VAD+ASR with streaming perception when quality matters.** Information loss is irrecoverable in a cascaded pipeline.
- **Use fast-slow decoupling.** Don't make the real-time interaction layer wait for deep reasoning.
- **For Computer Use, prefer SoM or structured indexing over raw coordinates** when available.
- **For robotics, validate Sim2Real** — calibrate randomization range from real data, verify visual alignment.

<a name="faq"></a>

## FAQ

**Q: Do I need to post-train a model for my agent?**

A: Probably not. If your agent uses an existing frontier model (Claude, GPT-4, etc.) with well-designed prompts, tools, and context, post-training is unlikely to be cost-effective. Post-training becomes necessary when you need: (1) a smaller/faster model with specific capabilities, (2) behavior that differs systematically from what prompting can achieve, or (3) deployment at scale where per-token cost matters.

**Q: Is online self-modification safe?**

A: No — not without guardrails. Direct self-modification by a running model is dangerous because production environments rarely provide clean learning signals, and unverified feedback can entrench errors. Always use the dual-loop architecture: online execution records evidence; offline evolution validates and releases candidates.

**Q: Which RL algorithm should I use?**

A: In most cases, **any reasonable algorithm will do**. Priority: base model > environment > data > algorithm. Practical guide: reliable reward + sufficient compute → GRPO (simple) or PPO (finer credit assignment); high-quality preference data → DPO/KTO; early exploration → Best-of-N.

**Q: Should I replace my cascaded voice pipeline with an end-to-end model?**

A: It depends on what you need. If your task depends primarily on semantic content, a self-cascade (ASR → LLM → TTS with streaming) matches or beats end-to-end at lower cost. If your task depends on non-verbal cues (prosody, emotion, hesitation), end-to-end preserves information that the cascade destroys. If you need real conversational fluency (interruptions, backchanneling), full-duplex is the answer.

**Q: How do I know when to switch from SFT to RL?**

A: When adding more demonstrations no longer improves performance on new (out-of-distribution) scenarios. SFT's ceiling is the training data; RL's ceiling is the task itself.

**Q: What's the biggest pitfall in continual evolution?**

A: **Evaluating the wrong thing.** The ceiling of continual evolution is set by whether the system can evaluate what it actually cares about, not merely the easiest proxy to measure. User satisfaction scores are seductive but insufficient — they conflate many distinct failure modes and cannot guide targeted improvement.

**Q: How does action chunking work and when should I use it?**

A: Action chunking amortizes inference latency over multiple execution steps. The model generates a short sequence of future actions (e.g., 25–50 at 50Hz) in one forward pass, and a control thread replays them at high frequency. Use it when: (1) inference latency is much higher than control frequency requirements, and (2) the environment doesn't change rapidly enough to invalidate the planned actions. Trade-off: longer chunks = smoother execution but less responsiveness to sudden changes.

<a name="summary"></a>

## Summary

This article traced the journey from a static trained model to a self-evolving, real-time multimodal agent across three layers:

**Post-Training** — How to bake capability into model parameters:

- SFT memorizes (mass-covering); RL generalizes (mode-seeking)
- Always SFT before RL: form first, spirit second
- Data and environment quality matter more than algorithm choice
- Most agents don't need post-training at all — harness engineering first

**Self-Evolving Agents** — How to learn from experience after deployment:

- Preserving experience ≠ learning from experience
- Three-layer verification: outcome → process → quality
- Four update carriers: knowledge, instructions, programs, parameters
- Dual-loop architecture: online execution + offline evolution
- Safety mechanisms must never be self-modifiable

**Real-Time Multimodal Interaction** — How to operate in a continuous, multimodal world:

- Voice: cascaded → end-to-end → full-duplex
- Computer Use: perceive-think-act loop, with efficiency as the true bottleneck
- Robotics: VLA + action chunking + Sim2Real
- Fast-slow architecture unifies all three scenarios

**The full stack connects as a feedback loop:** real-time interaction produces verifiable trajectories → offline evolution validates and releases improvements → improved agent delivers better real-time interaction. The ceiling of the entire system is set by whether you can evaluate what you actually care about — not merely the easiest proxy to measure.
