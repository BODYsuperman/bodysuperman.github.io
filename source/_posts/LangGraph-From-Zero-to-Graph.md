---
title: "LangGraph from Zero: Environment Setup, State Management, and Control Flow in Practice"
date: 2026-09-06 10:00:00
updated: 2026-09-27 10:00:00
comments: true
categories:
  - AI
  - AI Agent
  - LangGraph
tags:
  - LangGraph
  - LangChain
  - AI Agent
  - Workflow
  - State Machine
---

- [Introduction](#introduction)
- [Environment Setup](#environment-setup)
  - [Installing Miniconda and Creating the Environment](#miniconda-and-conda-env)
  - [Installing Dependencies and Configuring API Keys](#dependencies-and-api-key)
  - [Verification and Checklist](#verification-checklist)
- [What Is LangGraph](#what-is-langgraph)
  - [LangChain vs. LangGraph](#langchain-vs-langgraph)
- [Core Concepts: The Three Elements and the Runtime Model](#core-concepts)
  - [State, Node, Edge](#state-node-edge)
  - [The Superstep Execution Model](#superstep-execution-model)
  - [The Checkpoint Snapshot Sequence](#checkpoint-snapshots)
- [Graph API vs Functional API](#graph-api-vs-functional-api)
- [Your First Graph: Define, Compile, Invoke](#first-graph)
  - [Building a State Graph in Three Steps](#define-compile-invoke)
  - [Graph Visualization](#graph-visualization)
- [State Management](#state-management)
  - [Three Ways to Define a Schema](#defining-state-schema)
  - [Validation Behavior Compared](#schema-validation-behavior)
  - [State Reducers: How Updates Are Merged](#state-reducers)
  - [Default Overwrite Behavior and the Overwrite Wrapper](#default-overwrite-and-overwrite)
  - [Multi Schema: Input, Output, and Private State](#multi-schema)
  - [Predefined States: MessagesState and AgentState](#predefined-states)
- [Control Flow](#control-flow)
  - [Sequential Structure](#sequential-structure)
  - [Branching](#branching)
    - [Parallel Nodes](#parallel-nodes)
    - [Conditional Branching: add_conditional_edges](#conditional-edges)
    - [Deferred Nodes: defer](#deferred-nodes)
    - [Dynamic Fan-out: Send](#dynamic-fan-out-send)
    - [Dynamic Jumping: Command(goto)](#command-goto)
  - [Fan-in: Merging Multiple Branches](#fan-in)
    - [Static Fan-in: AND Trigger vs. OR Trigger](#static-fan-in)
    - [Dynamic Fan-in: The MapReduce Pattern](#mapreduce)
  - [Loops: The ReAct Pattern](#loops)
    - [Static vs. Dynamic Implementation](#react-static-vs-dynamic)
    - [Recursion Limits and Graceful Exit](#recursion-limit)
- [Edges: A Systematic Summary](#edges-summary)
- [Node Execution and Fault Tolerance](#fault-tolerance)
  - [Retries: RetryPolicy](#retry-policy)
  - [Default Retry Rules: default_retry_on](#default-retry-rules)
  - [Timeouts and Error Handling](#timeout-and-error-handling)
  - [Node Caching: CachePolicy](#node-caching)
- [Best Practices](#best-practices)
- [FAQ](#faq)
- [Summary](#summary)

<!--more-->

<a name="introduction"></a>

## Introduction

When building agent applications on top of LLMs, you quickly run into a class of problems: the flow is no longer "one question, one answer" but a complex workflow involving branches, loops, parallelism, human intervention, and long-running execution. Organizing this with plain Python function calls quickly becomes unmaintainable — and if the process crashes, all intermediate state is lost.

LangGraph is an orchestration framework built exactly for this. It models a workflow as a **state graph**: nodes do the computation, edges define the flow, and state carries data between nodes. More importantly, its runtime natively supports persistence, streaming, and fault-tolerant recovery.

This article is a consolidated tutorial covering the complete path from zero:

1. **Environment setup**: Miniconda, dependencies, API key configuration;
2. **Core concepts**: the State / Node / Edge trio and the Superstep execution model;
3. **State management**: schema definitions, the reducer merging mechanism, Multi Schema;
4. **Control flow**: sequences, branches, fan-out/fan-in, loops, and recursion limits;
5. **Fault tolerance**: retries, timeouts, error handling, and node caching.

All code has been verified against `langgraph 1.1.x` + Python 3.13. Examples use DeepSeek as the model, which you can swap for any model supported by LangChain.

<a name="environment-setup"></a>

## Environment Setup

<a name="miniconda-and-conda-env"></a>

### Installing Miniconda and Creating the Environment

Conda is a package and environment manager. **Miniconda** is its minimal distribution — small and fast to install. Download the installer for your system from the official page: https://docs.anaconda.com/miniconda/

| OS      | Recommended installer                                                       |
| ------- | --------------------------------------------------------------------------- |
| Windows | `Miniconda3 Windows 64-bit` (.exe)                                          |
| macOS   | `macOS Apple M1 64-bit` (Apple Silicon) or `macOS Intel x86 64-bit` (Intel) |
| Linux   | `Miniconda3 Linux 64-bit` (.sh)                                             |

On Windows, **make sure to check** "Add Miniconda3 to my PATH environment variable". On macOS / Linux, run the install script in a terminal and type `yes` when prompted to run `conda init`.

After installation, verify and create the project environment:

```bash
conda --version

# Create an environment named langgraph with Python 3.13
conda create -n langgraph python=3.13

# Activate it — your prompt will be prefixed with (langgraph)
conda activate langgraph
```

Conda commands you will use regularly:

| Command                        | Purpose                       |
| ------------------------------ | ----------------------------- |
| `conda info --envs`            | List all virtual environments |
| `conda activate <name>`        | Enter an environment          |
| `conda deactivate`             | Leave the current environment |
| `conda remove -n <name> --all` | Delete an environment         |

A virtual environment is an isolated Python runtime — environments never interfere with each other, which is the sanest way to manage dependencies across projects.

<a name="dependencies-and-api-key"></a>

### Installing Dependencies and Configuring API Keys

Install LangGraph and related dependencies (trim as needed):

```bash
pip install langgraph langchain langchain-core langchain-openai \
    langchain-deepseek langchain-anthropic python-dotenv loguru jupyter
```

Key packages:

| Package                                                           | Purpose                                                 |
| ----------------------------------------------------------------- | ------------------------------------------------------- |
| `langgraph`                                                       | Core library for building state graphs                  |
| `langgraph-checkpoint`                                            | Checkpoint mechanism                                    |
| `langgraph-prebuilt`                                              | Prebuilt agent components                               |
| `langchain-core`                                                  | LangChain base abstractions (messages, Runnables, etc.) |
| `langchain-deepseek` / `langchain-openai` / `langchain-anthropic` | Model provider integrations                             |
| `python-dotenv`                                                   | Loads `.env` environment files                          |

Next, configure your API key. Using DeepSeek as an example (new accounts get free credits), create a key at [platform.deepseek.com](https://platform.deepseek.com/), then create a `.env` file in the project root:

```properties
# Required: examples default to DeepSeek
DEEPSEEK_API_KEY=sk-your-api-key

# Optional: other providers
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
```

Load it uniformly with two lines at the top of your code. The SDK then reads keys from environment variables automatically — **never hard-code them**:

```python
from dotenv import load_dotenv
load_dotenv(override=True)
```

> Add `.env` to `.gitignore` so secrets are never committed to Git.

<a name="verification-checklist"></a>

### Verification and Checklist

Use a script to verify everything is ready:

```python
# test_env.py
import sys
from importlib.metadata import version as pkg_version
from dotenv import load_dotenv
import os

print(f"Python version: {sys.version}")
print(f"LangGraph version: {pkg_version('langgraph')}")

load_dotenv(override=True)
key = os.getenv("DEEPSEEK_API_KEY")
if key:
    print(f"DeepSeek API key configured: {key[:8]}...{key[-4:]}")
    from langchain_deepseek import ChatDeepSeek
    model = ChatDeepSeek(model="deepseek-chat")
    response = model.invoke("Reply with exactly: all good")
    print(f"Model call test: {response.content}")
else:
    print("DEEPSEEK_API_KEY not found — configure it in .env")
```

Before moving on, confirm each item:

- [ ] Miniconda installed; `conda --version` works
- [ ] `langgraph` environment created (Python 3.13) and activated
- [ ] Core dependencies installed; `pip show langgraph` has output
- [ ] `.env` created with an API key that has available credits
- [ ] The verification script passes end to end

<a name="what-is-langgraph"></a>

## What Is LangGraph

<a name="langchain-vs-langgraph"></a>

### LangChain vs. LangGraph

**LangChain 1.x** changed its positioning significantly: legacy Chains, Retrievers, Memory, and similar components moved to `langchain-classic`. LangChain now focuses on agent development, with `create_agent` as the core entry point, providing high-level abstractions around models, tools, messages, structured output, middleware, and memory management.

**LangGraph** is the lower-level **orchestration framework and agent runtime**. It executes complex workflows and stateful agents, providing runtime capabilities such as persistence, streaming, durable execution, and human-in-the-loop. `create_agent` is itself built on top of LangGraph.

| Dimension        | LangChain                        | LangGraph                                                                   |
| ---------------- | -------------------------------- | --------------------------------------------------------------------------- |
| Positioning      | High-level agent framework       | Low-level orchestration framework & agent runtime                           |
| Core entry point | `create_agent`                   | `StateGraph` / `@entrypoint`                                                |
| Best for         | Straightforward agent apps       | Complex workflows, persistent state, long-running tasks, human intervention |
| Flow control     | Agent loop managed automatically | Fine-grained control over nodes, edges, conditional branches                |
| Learning curve   | Lower                            | Higher                                                                      |

In one sentence: **LangChain provides easy-to-use high-level agent abstractions; LangGraph provides reliable, persistent, and finely controllable low-level execution.** Start most agent projects with `create_agent`; bring in LangGraph when you need complex workflow orchestration, a mix of deterministic and agentic steps, or low-level state control.

Under the hood, the LangGraph runtime is built on a custom Pregel runtime, borrowing core ideas from Google's Pregel computation model for organizing and executing complex graph computations.

<a name="core-concepts"></a>

## Core Concepts: The Three Elements and the Runtime Model

<a name="state-node-edge"></a>

### State, Node, Edge

The LangGraph runtime consists of three basic elements:

- **State**: the shared data structure during graph execution — a snapshot of the application at a given moment. It carries context, intermediate results, and data that downstream nodes need to read. It is the core vehicle for passing information between nodes.
- **Node**: the unit of execution, usually a function. A node reads the current State, runs its business logic, and returns a **partial update** to the State. Nodes never modify global state directly — merging and committing are handled by the runtime.
- **Edge**: defines the flow between nodes, deciding which node runs after the current one. Edges can be fixed, or conditional on the current State — enabling branches, loops, and other complex control flow.

The simplest possible graph has two nodes:

```
START --> node_1 --> node_2 --> END
```

<a name="superstep-execution-model"></a>

### The Superstep Execution Model

Graph execution in LangGraph is organized and advanced in **Supersteps**. Think of a Superstep as one "tick" of the graph; a full run is a series of consecutive Supersteps.

Each Superstep has three phases:

```
┌─────────────────────── Superstep N ───────────────────────┐
│                                                           │
│  ① Plan / Routing                                         │
│     Based on the current State and Edge logic,            │
│     decide which nodes run this tick                      │
│                     │                                     │
│                     ▼                                     │
│  ② Execution                                              │
│     Run the selected nodes (possibly in parallel).        │
│     Each node computes against the state snapshot         │
│     taken at the start of this tick and outputs           │
│     partial updates — updates produced by one node        │
│     are NOT visible to the others during this phase       │
│                     │                                     │
│                     ▼                                     │
│  ③ Update / Commit                                        │
│     When all nodes finish, the runtime merges their       │
│     outputs into the State, producing a new snapshot      │
│     that becomes the input of the next Superstep          │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

Two key takeaways from this model:

1. **Parallel nodes execute within the same Superstep**, each reading the same state snapshot, isolated from one another;
2. **State updates commit at the end of the Superstep** — which is exactly why writing to the same field in parallel requires a reducer (more below).

<a name="checkpoint-snapshots"></a>

### The Checkpoint Snapshot Sequence

At each Superstep boundary, LangGraph can produce a **Checkpoint** snapshot recording the current `metadata.step`, `next` (the pending tasks), and the State. For `START → node_1 → node_2 → END`, one run yields the following sequence:

| Snapshot         | step | next        | Notes                                                           |
| ---------------- | ---- | ----------- | --------------------------------------------------------------- |
| Input Checkpoint | -1   | `__start__` | Created from the `graph.invoke` input; no user node has run yet |
| Checkpoint 0     | 0    | `node_1`    | Input written into State                                        |
| Checkpoint 1     | 1    | `node_2`    | `node_1`'s result committed (recorded in `tasks.result`)        |
| Checkpoint 2     | 2    | `()`        | `node_2` done, no pending tasks, run finished                   |

Note that `END` is a termination boundary — **it produces no extra node-execution snapshot**. Checkpoints are the foundation of persistence, time-travel debugging, and human-in-the-loop. This article establishes the concept; a follow-up will go deeper.

<a name="graph-api-vs-functional-api"></a>

## Graph API vs Functional API

LangGraph offers two APIs for building graphs. They share the same underlying runtime and can be combined in one application.

The **Graph API** is declarative: you explicitly define State, Nodes, and Edges, organizing the business flow into a visual graph structure. It suits complex branching, state shared across many nodes, parallel execution with result aggregation, and teams that benefit from the graph as a debugging and communication artifact.

The **Functional API** is imperative: `@entrypoint` marks the workflow entry, `@task` marks checkpointable tasks, and the flow is organized with ordinary `if/else`, loops, and function calls. It suits minimally refactoring existing procedural code, mostly linear flows, simple branching, and rapid prototyping.

| Aspect            | Graph API                                                 | Functional API                                            |
| ----------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| Style             | Declarative graph structure                               | Imperative function flow                                  |
| Core abstractions | State, Node, Edge                                         | entrypoint, task                                          |
| State management  | Explicit global State                                     | Mostly function arguments and return values               |
| Flow expression   | Nodes and edges                                           | Ordinary Python control flow                              |
| Visualizability   | Strong — natural fit for diagrams and debugging           | Weak — looks like regular code                            |
| Best for          | Complex workflows, multi-branch, multi-node collaboration | Simple flows, quick prototypes, refactoring existing code |
| Learning curve    | Higher                                                    | Lower                                                     |

**Guidance**: building from scratch or facing a complex structure — use the Graph API; refactoring existing code, prototyping, or a simple linear flow — use the Functional API. When learning LangGraph, master the Graph API first: it best embodies the core idea of describing an executable computation graph explicitly through State, Node, and Edge. The rest of this article uses the Graph API.

<a name="first-graph"></a>

## Your First Graph: Define, Compile, Invoke

<a name="define-compile-invoke"></a>

### Building a State Graph in Three Steps

Building and running a graph has three stages: **define the state graph → compile it → invoke it**.

First, define the global state and the node functions, then assemble them into a `StateGraph`:

```python
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from operator import add

# 1. Define the global state
class OverAllState(TypedDict):
    logs: Annotated[list[str], add]   # field with a reducer: append-merge
    cur_id: str                        # field without a reducer: overwrite

# 2. Define nodes: read State, return a partial update
def node_1(state: OverAllState) -> OverAllState:
    pre_id = state["cur_id"]
    return {
        "logs": ["node_1 finished"],
        "cur_id": pre_id + ", node_1"
    }

def node_2(state: OverAllState) -> OverAllState:
    pre_id = state["cur_id"]
    return {
        "logs": ["node_2 finished"],
        "cur_id": pre_id + ", node_2"
    }

# 3. Assemble the graph structure
builder = StateGraph(state_schema=OverAllState)
builder.add_node("node_1", node_1)
builder.add_node("node_2", node_2)
builder.add_edge(START, "node_1")
builder.add_edge("node_1", "node_2")
builder.add_edge("node_2", END)

# 4. Compile into an executable graph
graph = builder.compile()

# 5. Invoke
print(graph.invoke({"cur_id": "start"}))
```

Output:

```
{'logs': ['node_1 finished', 'node_2 finished'], 'cur_id': 'start, node_1, node_2'}
```

Look closely at `logs`: each node returned a single-element list, yet the final result **concatenates** them — that is the reducer declared via `Annotated[list[str], add]` at work. `cur_id`, with no reducer, is handled manually: each node reads the old value and returns the concatenated string.

<a name="graph-visualization"></a>

### Graph Visualization

LangGraph can express the graph structure in mermaid (a text markup language that renders directly into flowcharts):

```python
raw_mermaid = graph.get_graph().draw_mermaid()
print(raw_mermaid)
```

Everything from `graph TD;` onward is the mermaid source:

```
graph TD;
    __start__([<p>__start__</p>]):::first
    node_1(node_1)
    node_2(node_2)
    __end__([<p>__end__</p>]):::last
    __start__ --> node_1;
    node_1 --> node_2;
    node_2 --> __end__;
```

You can also render it to PNG bytes:

```python
png_bytes = graph.get_graph().draw_mermaid_png()

# Display inline in Jupyter
from IPython.display import display, Image
display(Image(png_bytes))

# Or save to a file
with open("first_demo_graph.png", "wb") as f:
    f.write(png_bytes)
```

> `draw_mermaid_png()` calls an online rendering service under the hood (default: https://mermaid.ink). It may fail on flaky networks — retrying usually works, and you can point `base_url` at an alternative renderer.

In Jupyter there is an even shorter path:

```python
from IPython.display import display
display(graph)   # render the compiled graph directly
```

<a name="state-management"></a>

## State Management

<a name="defining-state-schema"></a>

### Three Ways to Define a Schema

Defining state really means declaring the state's **Schema** — a complete description of its fields. Three approaches are officially recommended: TypedDict, dataclass, and Pydantic. Graphs built with any of the three behave identically; the differences are limited to field access style and validation behavior.

**TypedDict** — fields accessed as `state["field"]`:

```python
from typing import TypedDict, Annotated
from operator import add

class OverAllState(TypedDict):
    logs: Annotated[list[str], add]
    cur_id: str
```

**dataclass** — fields accessed as `state.field`:

```python
from dataclasses import dataclass

@dataclass
class OverAllState:
    logs: Annotated[list[str], add]
    cur_id: str
```

**Pydantic** — field access same as dataclass:

```python
from pydantic import BaseModel

class OverAllState(BaseModel):
    logs: Annotated[list[str], add]
    cur_id: str
```

<a name="schema-validation-behavior"></a>

### Validation Behavior Compared

All three require exact field-name matches; they just fail differently:

| Scenario                   | TypedDict         | dataclass          | Pydantic                 |
| -------------------------- | ----------------- | ------------------ | ------------------------ |
| Input field mismatch       | raises `KeyError` | raises `TypeError` | raises `ValidationError` |
| Node returns unknown field | update ignored    | update ignored     | update ignored           |

**TypedDict is the recommended default**, and most official examples use it, because:

- Compared with a plain `dict`, it provides explicit field constraints and type hints;
- Compared with `dataclass`, it fits LangGraph's update model better — nodes return "partial state update" dicts, not complete objects;
- Compared with a `Pydantic BaseModel`, it is lighter, with no extra validation overhead.

<a name="state-reducers"></a>

### State Reducers: How Updates Are Merged

A reducer is LangGraph's core mechanism for merging state updates. It defines how multiple updates to the same state key — especially from parallel nodes — combine into a single final value.

Key characteristics:

- **Signature**: `(Value, Value) -> Value` — takes the current value and the incoming update, returns the merged value;
- **Declaration**: attached to a state key via `Annotated[Type, reducer_function]`;
- **Default**: keys without a reducer use last-write-wins (overwrite).

A custom reducer is just a two-argument merge function:

```python
def my_reducer(left: list[str], right: list[str]) -> list[str]:
    return left + right
```

`left` is the accumulated current value; `right` is the new update. Associate it with a field via `Annotated`:

```python
class OverAllState(TypedDict):
    logs: Annotated[list[str], my_reducer]  # append across updates
    cur_id: str                              # no reducer → overwrite
```

`Annotated[]` is Python's type-annotation extension mechanism: the first argument is the underlying type, the rest is metadata. `Annotated` itself assigns no meaning to the metadata — frameworks decide how to interpret it. LangGraph uses it to declare a field's **type** and its **merge rule** in one place.

The two built-in reducers you will use most:

**1. `operator.add`**: Python's built-in addition, equivalent to `a + b` — works for numeric accumulation and list concatenation:

```python
from operator import add

add(1, 2)                  # 3
add([1, 2], [3, 4])        # [1, 2, 3, 4]
```

**2. `add_messages`**: the reducer dedicated to conversation message lists. It maintains a sequence of `BaseMessage` objects (`HumanMessage`, `AIMessage`, `SystemMessage`, `ToolMessage`, ...). It is **not** simple list concatenation — it merges **by message `id`**:

- If an incoming message's `id` does not exist in the current list, it is appended;
- If the `id` matches an existing message, the new message **replaces** the old one.

```python
from langgraph.graph.message import add_messages
from langchain.messages import HumanMessage, AIMessage, SystemMessage

left = [
    SystemMessage(content="You are a helpful assistant", id='1'),
    HumanMessage(content="Hi", id='2'),
    AIMessage(content="Hello!", id='3'),
]

right = [
    HumanMessage(content="I'm Wang, you're Xiao Wang", id='2'),  # id exists -> replace
    AIMessage(content="Got it, I'll remember", id='3'),           # id exists -> replace
    HumanMessage(content="Who are you?", id='4'),                 # new id -> append
    AIMessage(content="I'm Xiao Wang", id='5'),                   # new id -> append
]

merged = add_messages(left, right)
```

The merged result keeps the `id='1'` system message, replaces `id='2'` and `id='3'` with the new content, and appends `id='4'` and `id='5'`. This "append + replace-by-id" semantics is the foundation of multi-turn conversations and agent message flows.

<a name="default-overwrite-and-overwrite"></a>

### Default Overwrite Behavior and the Overwrite Wrapper

**Default behavior**: fields without a reducer are simply overwritten by each update:

```python
class OverAllState(TypedDict):
    logs: list[str]   # note: no reducer
    id: str

def node_a(state: OverAllState):
    return {"logs": ["node_a"], "id": "node_a"}

def node_b(state: OverAllState):
    return {"logs": ["node_b"], "id": "node_b"}

# START -> node_a -> node_b -> END
result = graph.invoke({"logs": ["START"], "id": "start"})
# {'logs': ['node_b'], 'id': 'node_b'}   ← old values overwritten
```

The core rule for node updates can be summarized as:

> A node returns only the fields it wants to change; fields it does not return stay unchanged; returned fields are merged via their reducer, or overwritten if none is defined.

**Overwrite — bypassing the reducer**: when a field has a reducer but one particular update should replace the value outright, wrap it in `Overwrite`:

```python
from langgraph.types import Overwrite

def node_b(state: OverAllState):
    return {
        "logs": Overwrite(["node_b"]),   # skip the add reducer for this update
        "id": "node_b"
    }
```

For `START -> node_a -> node_b -> node_c` with `logs` bound to `add`:

- Without `Overwrite`: `['START', 'node_a', 'node_b', 'node_c']`;
- With `Overwrite` in `node_b`: `['node_b', 'node_c']`.

`Overwrite` affects only the current update — it does not change the field's reducer definition. `node_c`'s normal return still goes through append-merge.

<a name="multi-schema"></a>

### Multi Schema: Input, Output, and Private State

LangGraph supports multiple state schemas in one graph, separating the graph's boundary from its internal data flow:

| State type              | Declared via                                | Purpose                                                                      |
| ----------------------- | ------------------------------------------- | ---------------------------------------------------------------------------- |
| Global / internal state | `StateGraph(state_schema=...)`              | The main state used inside the graph                                         |
| Input state             | `input_schema=...`                          | Constrains which fields callers may pass in                                  |
| Output state            | `output_schema=...`                         | Constrains which fields the finished graph returns                           |
| Private state           | Type annotation on a node's first parameter | Temporary data passed between specific nodes; not part of graph input/output |

Input/output states face the **graph boundary**; global/private states face **internal data passing**.

A complete example — three nodes demonstrating global, private, and output state:

```python
from typing import TypedDict
from langgraph.graph import StateGraph, START, END

class InputState(TypedDict):
    username: str

class OutputState(TypedDict):
    graph_output: str

class OverAllState(TypedDict):
    username: str
    nickname: str
    graph_output: str

class PrivateState(TypedDict):
    greeting: str

def node_1(state: InputState) -> OverAllState:
    # write to global state
    return {"nickname": "Dear " + state["username"]}

def node_2(state: OverAllState) -> PrivateState:
    # read global state, write private state
    return {"greeting": state["nickname"] + ", good morning~"}

def node_3(state: PrivateState) -> OutputState:
    # read private state, write output state
    return {"graph_output": state["greeting"] + " Nice to meet you!"}

builder = StateGraph(OverAllState, input_schema=InputState, output_schema=OutputState)
builder.add_node("node_1", node_1)
builder.add_node("node_2", node_2)
builder.add_node("node_3", node_3)
builder.add_edge(START, "node_1")
builder.add_edge("node_1", "node_2")
builder.add_edge("node_2", "node_3")
builder.add_edge("node_3", END)

graph = builder.compile()
print(graph.invoke({"username": "Xiao Huang"}))
```

Output:

```json
{ "graph_output": "Dear Xiao Huang, good morning~ Nice to meet you!" }
```

Internally the graph held `username`, `nickname`, and `greeting` as well, but the final result contains only `graph_output` — because the output is trimmed to `output_schema`.

Under the hood, LangGraph splits state into multiple **Channels** (roughly one per state field). When the `StateGraph` is created, fields from `state_schema`, `input_schema`, and `output_schema` are recorded; at `add_node()` time, new fields from the node's parameter annotation (e.g., private state) are recorded too. At runtime:

- Graph input is trimmed to `input_schema`;
- Each node receives state trimmed to its parameter type;
- Node returns are partial updates, written to channels by field name;
- The final output is trimmed to `output_schema`.

**Design conventions** (engineering best practices):

1. Input/output states should usually be subsets of the global state;
2. Private state fields should not share names with global state fields;
3. Node functions should explicitly declare parameter and return state types;
4. Never access fields inside a node that its parameter type does not declare (you'll get a `KeyError`);
5. Keep the returned dict consistent with the declared return type.

<a name="predefined-states"></a>

### Predefined States: MessagesState and AgentState

**MessagesState** is the official predefined state for LLM scenarios. Its source is a single declaration:

```python
class MessagesState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
```

It pre-defines the `messages` field together with its `add_messages` merge rule. For chatbots, agents, and tool-calling flows, just subclass it and add your own fields:

```python
from langgraph.graph.message import MessagesState

class OverAllState(MessagesState):
    username: str
    output: str

def node_a(state: OverAllState) -> OverAllState:
    return {"messages": [HumanMessage("Hi, I'm " + state["username"])]}

def llm_node(state: OverAllState) -> OverAllState:
    res = model.invoke(state["messages"])
    return {"messages": [res], "output": res.content}
```

At runtime, the `HumanMessage` returned by `node_a` and the `AIMessage` returned by `llm_node` are both merged into `messages` via `add_messages`, so the final state contains the full conversation.

**AgentState** (`langchain.agents.middleware.types.AgentState`) is the state type used internally by LangChain agents. It has three fields:

- `messages`: the message list, also using `add_messages`;
- `jump_to`: a control field for the LangChain agent middleware system, expressing a flow-jump intent. **It is not a general-purpose jump mechanism** — a custom `StateGraph` will not jump automatically even if this field is defined; use `Command(goto=...)` for flow control in plain graphs;
- `structured_response`: where the agent's structured output lands; the `OmitFromInput` marker means it is generated internally, never accepted as external input.

`AgentState` is purpose-built for the LangChain agent runtime — custom LangGraph projects **should not** extend it directly.

<a name="control-flow"></a>

## Control Flow

<a name="sequential-structure"></a>

### Sequential Structure

**`add_edge`** adds a directed edge between two nodes — the most basic control-flow building block:

```python
builder.add_edge(START, "node_a")    # the graph starts at node_a
builder.add_edge("node_a", "node_b") # node_b runs after node_a
builder.add_edge("node_b", END)      # the flow ends after node_b
```

For a chain of sequential nodes, **`add_sequence`** is a shortcut:

```python
builder.add_sequence([node_a, node_b])
# roughly equivalent to:
# builder.add_node("node_a", node_a)
# builder.add_node("node_b", node_b)
# builder.add_edge("node_a", "node_b")
```

Function names become node names by default and edges are added between neighbors — ideal for simple linear flows.

**Can the edge to END be omitted?** Yes, but it shouldn't be. Mechanically, LangGraph computes each Superstep's task list from updated channels; when no new nodes are activated, the run ends naturally — `END` is never an actually-executed node, it just expresses "termination semantics". But explicit `END` edges make the graph complete and its visualization clearer, which pays off especially in branching and looping scenarios.

Unlike `END`, **`START` generally cannot be omitted**: it tells LangGraph which nodes to execute first. Without an edge leaving `START` (or another way to declare entry points), the runtime cannot determine the initial nodes.

<a name="branching"></a>

### Branching

Branches come in two flavors, distinguished by one core question:

> **Downstream candidates known at compile time → static branch; targets or task counts decided at runtime → dynamic branch.**

<a name="parallel-nodes"></a>

#### Parallel Nodes

Parallel nodes are the simplest static branch: multiple nodes triggered by the same upstream node are activated in the **same Superstep**:

```python
builder.add_edge(START, "node_a")
builder.add_edge(START, "node_b")   # node_a and node_b run in parallel
```

Things to keep in mind:

- "Parallel" here primarily means **parallel in scheduling semantics** — there is no ordering dependency between the two nodes;
- Their outputs are merged into the state **together at the end of the Superstep**;
- If both write to the **same state field**, that field needs a suitable reducer — otherwise you get an `InvalidUpdateError`.

<a name="conditional-edges"></a>

#### Conditional Branching: add_conditional_edges

`add_conditional_edges` selects downstream nodes at runtime based on state. Three core parameters:

- **`source`**: the node the branch starts from;
- **`path`**: the routing rule (usually a function). Its return value is the jump target — a single node name / `END`, or a sequence of them;
- **`path_map`**: maps routing return values to real node names; optional.

**Without path_map**, the router must return valid node names directly:

```python
def router(state: OverAllState) -> Literal["node_a", "node_b"]:
    if "poem" in state["content_type"]:
        return "node_a"
    return "node_b"

builder.add_conditional_edges(START, router)
```

**With path_map**, the router can return business-meaningful labels that map onto nodes:

```python
def router(state: OverAllState) -> Literal["a", "b"]:
    return "a" if "poem" in state["content_type"] else "b"

builder.add_conditional_edges(
    START,
    router,
    path_map={"a": "node_a", "b": "node_b"}
)
```

Benefits: the router returns labels with clear business meaning, node names stay engineering-oriented, and the rendered graph **shows the route labels on the edges**, making it much easier to read. In visualizations, conditional edges render as **dashed lines** (fixed edges are solid).

**Routing to multiple nodes**: return a sequence to trigger several downstream nodes at once:

```python
def router(state) -> Sequence[Literal["node_a", "node_b", "node_c"]]:
    if "poem" in state["content_type"]:
        return ["node_a", "node_c"]   # trigger both
    return ["node_b", "node_c"]
```

In this case, pass `path_map=["node_a", "node_b", "node_c"]` explicitly (the list form is equivalent to an identity-mapping dict). Otherwise the renderer cannot infer the mapping from the return value, and the nodes appear "detached" from the drawn structure.

<a name="deferred-nodes"></a>

#### Deferred Nodes: defer

When certain nodes (logging, auditing, result aggregation, cleanup) should run **after all regular tasks finish**, add them with `defer=True`:

```python
builder.add_node("audit_node", audit_node, defer=True)
builder.add_edge(START, "audit_node")
```

Although `audit_node` is also triggered by `START`, it does not run immediately — it waits until the regular flow ends, then executes in an **extra Superstep**. It therefore sees the committed state of every task node:

```python
def audit_node(state: OverAllState) -> OverAllState:
    logger.info(f"All task nodes finished; poem {'generated' if state['poem'] else 'missing'}")
```

How it works under the hood (for the curious): at compile time LangGraph creates a special channel type, `LastValueAfterFinish`, for the incoming edges of `defer=True` nodes (regular nodes get `EphemeralValue`). During normal execution the channel is written but never triggers its node; once no new regular nodes remain, the runtime calls `finish()` on all channels, the special channel becomes available, and the deferred node is triggered in the extra Superstep.

<a name="dynamic-fan-out-send"></a>

#### Dynamic Fan-out: Send

**Fan-out** means one upstream node dispatches multiple downstream tasks, like opening a fan. Unlike static parallelism, `Send` decides **task count and per-task input at runtime** — e.g., spawning one processing task per element of a list.

The router returns a sequence of `Send` instances, each describing one independent task dispatch:

```python
from langgraph.types import Send

# Send(node, arg)
#   node: target node name (must be registered)
#   arg:  private state passed to that task only — visible solely to that
#         node instance; each Send gets its own independent arg
```

Full example — dynamically generate a poem, a ci poem, and a joke for a topic, all dispatched to the same `worker_node`:

```python
CONTENT_TYPES = ["poem", "ci_poem", "joke"]

class WorkerState(TypedDict):
    """Private state, visible only to the worker task"""
    content_type: Literal["poem", "ci_poem", "joke"]
    prompt: str

def worker_node(state: WorkerState) -> OutputState:
    content = model.invoke([HumanMessage(state["prompt"])]).content
    return {state["content_type"]: content}

def router(state: InputState) -> Sequence[Send]:
    prompts = {"poem": "a poem", "ci_poem": "a ci poem", "joke": "a joke"}
    return [
        Send("worker_node", {
            "content_type": ct,
            "prompt": f"Write {prompts[ct]} about {state['topic']}"
        })
        for ct in CONTENT_TYPES
    ]

builder.add_conditional_edges(START, router, path_map=["worker_node"])
```

At runtime, three tasks pointing at `worker_node` are created dynamically. They run the same node function but receive different private states, so they produce a poem, a ci poem, and a joke respectively — all in parallel within the same Superstep.

Two important points:

- `path_map=["worker_node"]` must be declared explicitly — since `Send` targets and counts are decided at runtime, the renderer cannot infer them; declaring the candidates makes the conditional edge render correctly;
- If multiple parallel tasks write to the **same** state field, that field must have a reducer to merge the outputs. Here the three tasks write to three different fields (`poem`, `ci_poem`, `joke`), so there is no concurrent-merge issue.

<a name="command-goto"></a>

#### Dynamic Jumping: Command(goto)

**`Command`** is LangGraph's multi-purpose primitive for controlling graph execution. Its constructor takes four arguments:

| Argument | Purpose                                                                           |
| -------- | --------------------------------------------------------------------------------- |
| `update` | Updates graph state, equivalent to returning a state-update dict from the node    |
| `goto`   | Specifies the jump target after the node finishes — runtime conditional branching |
| `graph`  | With subgraphs, specifies which graph level the jump happens in                   |
| `resume` | Resumes an interrupted graph run (human-in-the-loop scenarios)                    |

When a node needs to **both update state and decide the next hop**, `Command` fits better than conditional edges:

```python
from langgraph.types import Command

def router(state: OverAllState) -> Command[Literal["poem_node", "joke_node", END]]:
    content_type = state["content_type"]
    if content_type == "poem":
        return Command(goto="poem_node")
    elif content_type == "joke":
        return Command(goto="joke_node")
    return Command(goto=END)   # fallback for invalid values: end the graph
```

Three caveats:

1. The return annotation `Command[Literal[...]]` is **not validated at runtime**. It exists so LangGraph and type checkers know the node's possible jump targets — this matters a lot for graph rendering; without it, the rendered graph cannot express the potential transitions;
2. A node using `Command(goto=...)` should **not also have regular downstream edges** — otherwise both the edge and the command may fire, triggering multiple downstream nodes;
3. Targets of both `Send` and `Command` must be registered in advance. "Dynamic" means deciding **task count, task input, or jump path at runtime** — not creating new nodes at runtime.

**Send vs. Command**:

| Scenario        | Typical API                        | In one line                                 |
| --------------- | ---------------------------------- | ------------------------------------------- |
| Dynamic fan-out | `Send` + `add_conditional_edges()` | How many task instances to start at runtime |
| Dynamic jump    | `Command(goto=...)`                | Where to go after the current node finishes |

<a name="fan-in"></a>

### Fan-in: Merging Multiple Branches

Opposite to fan-out, **fan-in** means multiple upstream branches converge on one downstream node. Depending on the trigger condition, there are two kinds:

- **AND trigger**: the downstream node runs only after _all_ upstream branches arrive;
- **OR trigger**: the downstream node runs whenever _any_ branch arrives.

("AND/OR" is an explanatory analogy, not official terminology.)

<a name="static-fan-in"></a>

#### Static Fan-in: AND Trigger vs. OR Trigger

The two semantics look similar in code but behave completely differently:

```python
# AND trigger: node_e waits for BOTH node_c and node_d, then runs once
builder.add_edge(["node_c", "node_d"], "node_e")

# OR trigger (independent): node_c and node_d each trigger node_e separately
builder.add_edge("node_c", "node_e")
builder.add_edge("node_d", "node_e")
```

Verify with a five-node graph (`START → node_a → {node_b, node_c}`, `node_b → node_d`). Nodes read the current Superstep number through the `config` parameter:

```python
from langchain_core.runnables import RunnableConfig

def node_a(state: EmptyState, config: RunnableConfig) -> EmptyState:
    cur_step = config["metadata"]["langgraph_step"]
    logger.info("cur_step: {}, node_a triggered", cur_step)
    return {}
```

**AND trigger** (`add_edge(["node_c", "node_d"], "node_e")`) logs:

```
cur_step: 1, node_a triggered
cur_step: 2, node_b triggered
cur_step: 2, node_c triggered
cur_step: 3, node_d triggered
cur_step: 4, node_e triggered      ← runs once, after all upstream nodes
```

`node_c` finished at step 2, but `node_e` waited until step 4 (after `node_d`).

**OR trigger** (two independent edges) logs:

```
cur_step: 1, node_a triggered
cur_step: 2, node_b triggered
cur_step: 2, node_c triggered
cur_step: 3, node_d triggered
cur_step: 3, node_e triggered      ← fires right after node_c
cur_step: 4, node_e triggered      ← fires again after node_d
```

`node_e` ran **twice**. This is one of the easiest traps in parallel-aggregation scenarios — pick the form that matches your business semantics.

<a name="mapreduce"></a>

#### Dynamic Fan-in: The MapReduce Pattern

Fan out subtasks dynamically with `Send`, merge their intermediate results through a **reducer** (fan-in), and aggregate them in a reduce node — that is the classic **MapReduce** pattern:

```
Input                            Map: emit intermediate key-value pairs
  |                                 |
  | "hello world"                   | (hello,1),(world,1)
  | "hello Atguigu"      ──►        | (hello,1),(Atguigu,1)
  | "hello LLM"                     | (hello,1),(LLM,1)
  v                                 v
Shuffle/Group: group by key      Reduce: aggregate
  |                                 |
  | hello -> [1,1,1]                | hello -> 3
  | world -> [1]         ──►        | world -> 1
  | ...                             | ...
```

Implementing a word-count task:

```python
class OverAllState(TypedDict):
    input_values: list[str]
    entries: Annotated[list[tuple[str, int]], add]   # reducer merges mapper outputs
    word_counts: dict[str, int]

def router_map(state: OverAllState) -> Sequence[Send]:
    # one mapper task per input line
    return [Send("mapper_node", {"input_value": v}) for v in state["input_values"]]

class MapperInputState(TypedDict):
    input_value: str

def mapper_node(state: MapperInputState) -> OverAllState:
    words = state["input_value"].split(" ")
    return {"entries": [(w, 1) for w in words]}

def reducer_node(state: OverAllState) -> OverAllState:
    shuffle_dict = {}
    for k, v in state["entries"]:            # Shuffle / Group
        shuffle_dict.setdefault(k, []).append(v)
    return {"word_counts": {k: sum(v) for k, v in shuffle_dict.items()}}  # Reduce

builder = StateGraph(state_schema=OverAllState)
builder.add_node("mapper_node", mapper_node)
builder.add_node("reducer_node", reducer_node)
builder.add_conditional_edges(START, router_map, path_map=["mapper_node"])
builder.add_edge("mapper_node", "reducer_node")   # AND trigger: wait for all mappers
builder.add_edge("reducer_node", END)

graph = builder.compile()
print(graph.invoke({"input_values": ["hello world", "hello Atguigu", "hello LLM"]}))
```

Output:

```json
{
  "word_counts": { "hello": 3, "world": 1, "Atguigu": 1, "LLM": 1 }
}
```

The key mechanics: three `mapper_node` task instances run in parallel, each returning `entries`; because that field carries the `add` reducer, the three intermediate results merge into a single state field; the `mapper_node → reducer_node` edge is an AND trigger, so `reducer_node` runs once after all mappers complete, doing the grouping and summing.

> `display(graph)` shows the **node-level** graph (one `mapper_node`), while at runtime `Send` dynamically creates multiple **task instances** based on the input data.

<a name="loops"></a>

### Loops: The ReAct Pattern

The graph architecture underneath LangChain agents is exactly the **ReAct** (Reason + Action) loop:

1. **Reason**: the LLM reasons over the current messages and decides whether to call a tool;
2. **Action**: if so, it emits tool-call requests;
3. **Observation**: tool results come back to the LLM as `ToolMessage`s;
4. **Loop**: the LLM reasons over the new observations and decides whether to call more tools;
5. **Final Answer**: when no more tool calls are made, it produces the final answer and the flow ends.

Essentially an "LLM → Tool → LLM → Tool → ... → LLM" loop:

```
START
  ↓
input_node
  ↓
llm_node ◄────────────┐
  ├── has tool_calls → tool_node
  └── no tool_calls  → output_node → END
```

<a name="react-static-vs-dynamic"></a>

#### Static vs. Dynamic Implementation

The same ReAct loop can be implemented two ways. **The essential difference is not whether it can loop, but where the routing logic lives.**

**Static implementation** — routing logic sits in a standalone `router()` function, wired up with `add_conditional_edges()`. "Static" means the downstream candidate set is fixed at compile time; runtime only picks among them:

```python
def llm_node(state: OverAllState) -> OverAllState:
    ai_msg = model_with_tools.invoke(state["messages"])
    return {"messages": [ai_msg]}

def router(state: OverAllState) -> Literal["tool_node", "output_node"]:
    if state["messages"][-1].tool_calls:
        return "tool_node"
    return "output_node"

builder.add_edge(START, "input_node")
builder.add_edge("input_node", "llm_node")
builder.add_conditional_edges("llm_node", router)
builder.add_edge("tool_node", "llm_node")   # the loop: tool results go back to the LLM
builder.add_edge("output_node", END)
```

**Dynamic implementation** — routing logic is cohesive inside the node's return value. `llm_node` uses `Command` to do "state update + next-hop control" in one shot; no separate `router()` or conditional edge needed:

```python
def llm_node(state: OverAllState) -> Command[Literal["tool_node", "output_node"]]:
    ai_msg = model_with_tools.invoke(state["messages"])
    goto = "tool_node" if ai_msg.tool_calls else "output_node"
    return Command(
        update={"messages": [ai_msg]},
        goto=goto,
    )

builder.add_edge(START, "input_node")
builder.add_edge("input_node", "llm_node")
builder.add_edge("tool_node", "llm_node")
builder.add_edge("output_node", END)
```

|                  | Static                                         | Dynamic                                      |
| ---------------- | ---------------------------------------------- | -------------------------------------------- |
| Routing location | Standalone `router()` function                 | Inside the node's return value               |
| Graph expression | Explicit conditional edges — more visual       | Cohesive control logic — more compact        |
| Best for         | Independent routing rules, graph clarity first | Node result directly determines the next hop |

One subtlety about tool-call retries: the demo drives retries with a system prompt like `"If a tool call fails, you must call it again until it succeeds"` — **whether to retry is decided by the LLM, not enforced by program logic**. If the model gives up after repeated failures and answers anyway, the graph will not stop it. When you need a hard guarantee, implement retries in code — in `tool_node` or in the routing logic.

<a name="recursion-limit"></a>

#### Recursion Limits and Graceful Exit

A loop without a reachable stop condition can run forever. LangGraph provides the **recursion limit**: `recursion_limit` caps the number of Supersteps in a single run; when exhausted, a `GraphRecursionError` is raised:

```python
graph.invoke(input, config={"recursion_limit": 10})
```

> **The default value is unreliable**: it varies by version and runtime — 25 in `langchain_core.runnables.config` (applies to LangChain agents), 10000 in `langgraph._internal._config` (applies to custom graphs), 10011 on the LangGraph API server side. **Best practice: always pass `recursion_limit` explicitly.**

There are two ways to handle the limit:

**Proactive approach** — use the `RemainingSteps` managed value to check remaining steps inside the graph and exit gracefully:

```python
from langgraph.managed import RemainingSteps

class OverAllState(TypedDict):
    remaining_steps: RemainingSteps   # filled by the runtime automatically

def router(state: OverAllState) -> Literal["loop_node", END]:
    if state["remaining_steps"] < 3:
        logger.info("Not enough steps remaining — terminating graph")
        return END
    return "loop_node"
```

The current step number plus the remaining steps equals `recursion_limit`. When steps run low, route to `END`: the graph **finishes normally**, raises no exception, and can still save intermediate state to a checkpoint or return partial results.

**Reactive approach** — catch the exception outside the graph:

```python
from langgraph.errors import GraphRecursionError

try:
    graph.invoke({}, config={"recursion_limit": 10})
except GraphRecursionError as e:
    logger.info("Recursion limit reached: {}", e)
```

The graph run is aborted by the exception, but the process survives and errors can be handled centrally.

| Approach                               | Detection        | Handling                             | Control flow                   |
| -------------------------------------- | ---------------- | ------------------------------------ | ------------------------------ |
| Proactive (`RemainingSteps`)           | Before the limit | Conditional routing inside the graph | Graph continues, ends normally |
| Reactive (catch `GraphRecursionError`) | After the limit  | `try/except` outside the graph       | Graph run aborted by exception |

**Guidance**: when the loop is part of the business logic (ReAct loops, multi-round reflection, self-correction, tool retries), prefer the proactive approach for graceful degradation inside the graph; keep the reactive approach as the last line of defense at the outermost layer.

<a name="edges-summary"></a>

## Edges: A Systematic Summary

Pulling together everything about edges:

| Edge type                | Syntax                                           | Semantics                                             |
| ------------------------ | ------------------------------------------------ | ----------------------------------------------------- |
| Normal edge              | `add_edge("a", "b")`                             | b runs right after a                                  |
| Conditional edge         | `add_conditional_edges("a", router)`             | after a, the router decides which node(s) run next    |
| Entry point              | `add_edge(START, "a")` or `set_entry_point("a")` | a runs first when the graph starts (equivalent forms) |
| Conditional entry point  | `add_conditional_edges(START, router)`           | a conditional edge starting at START                  |
| Finish point             | `add_edge("a", END)` or `set_finish_point("a")`  | the flow ends after a (equivalent forms)              |
| Conditional finish point | router returns `END`                             | state decides whether to continue or terminate        |

Three notes:

1. A node can have multiple outgoing edges — their targets run **in parallel** in the next Superstep;
2. Conditional edges can also be expressed by returning `Command(goto=...)` from a node — different mechanism, identical nature and effect;
3. **Use only one routing mechanism per node** — do not mix normal edges with conditional edges or `Command`, or multiple paths may fire simultaneously and the run diverges from expectations.

Also, `END` is not a regular business node but a special termination marker: in the compiled graph, terminal edges and `END` have no corresponding channel or node. Terminal edges can be omitted (the runtime stops naturally when no nodes are active), but declaring them explicitly is better for readability and correct visualization.

<a name="fault-tolerance"></a>

## Node Execution and Fault Tolerance

An unhandled node failure can take down the whole graph run. LangGraph provides a mechanism for each of four problem classes:

| Problem / scenario                                   | Mechanism                       | Type            | Version       |
| ---------------------------------------------------- | ------------------------------- | --------------- | ------------- |
| Transient failures (network jitter, flaky endpoints) | Retries: `RetryPolicy`          | Fault tolerance | Available now |
| A node runs too long                                 | Timeouts: `TimeoutPolicy`       | Fault tolerance | langgraph≥1.2 |
| Fallback needed after retries are exhausted          | Error handling: `error_handler` | Fault tolerance | langgraph≥1.2 |
| Same input repeatedly hits an expensive node         | Caching: `CachePolicy`          | Performance     | Available now |

The overall failure-handling order:

```
Node execution fails
    ↓
RetryPolicy: should this exception be retried?
    ↓ yes, attempts remain        ↓ retries exhausted
Re-run the node               Enter error_handler
                                  ↓ none configured
                              Exception propagates; graph run fails
```

<a name="retry-policy"></a>

### Retries: RetryPolicy

Retries are the most common and fundamental tolerance feature, configured per node via `retry_policy=` in `add_node`:

```python
from langgraph.types import RetryPolicy
from requests.exceptions import HTTPError

def node_a(state: EmptyState) -> EmptyState:
    logger.info("node a running")
    raise HTTPError("network timeout...")

builder.add_node(
    "node_a",
    node_a,
    retry_policy=RetryPolicy(max_attempts=3, jitter=False)
)
```

The logs show the node invoked 3 times (about 0.5s and 1s apart — exponential backoff). After all attempts fail, the exception propagates and can be caught by an outer `try/except`.

`RetryPolicy` parameters:

| Parameter          | Default            | Description                                          |
| ------------------ | ------------------ | ---------------------------------------------------- |
| `max_attempts`     | `3`                | Maximum attempts (**including the first execution**) |
| `initial_interval` | `0.5`              | Seconds to wait before the first retry               |
| `backoff_factor`   | `2.0`              | Multiplier applied to the wait after each retry      |
| `max_interval`     | `128.0`            | Maximum wait between two retries, in seconds         |
| `jitter`           | `True`             | Whether to add random jitter to retry intervals      |
| `retry_on`         | `default_retry_on` | Which exceptions trigger a retry                     |

Key points:

- `max_attempts=3` means 3 total executions (first + 2 retries), not 3 retries after the first failure;
- Exponential backoff: with `initial_interval=0.5, backoff_factor=2.0`, waits go roughly `0.5s → 1s → 2s → 4s...`, capped by `max_interval`;
- **Jitter**: when many concurrent tasks fail together and retry on a fixed schedule, they can slam the recovering service all at once. Random jitter spreads retries out and flattens the spike. Keep the default `jitter=True` in production;
- `retry_on` accepts three forms: a single exception type `retry_on=HTTPError`, a tuple `retry_on=(HTTPError, ConnectionError)`, or a predicate `retry_on=lambda exc: isinstance(exc, HTTPError)`.

<a name="default-retry-rules"></a>

### Default Retry Rules: default_retry_on

Without an explicit `retry_on`, the default `default_retry_on` applies. Its core logic:

```python
def default_retry_on(exc: Exception) -> bool:
    if isinstance(exc, ConnectionError):
        return True                       # connection errors: retry
    if isinstance(exc, httpx.HTTPStatusError):
        return 500 <= exc.response.status_code < 600   # only 5xx
    if isinstance(exc, requests.HTTPError):
        return 500 <= exc.response.status_code < 600 if exc.response else True
    if isinstance(exc, (ValueError, TypeError, ArithmeticError, ImportError,
                        LookupError, NameError, SyntaxError, RuntimeError,
                        ReferenceError, StopIteration, StopAsyncIteration,
                        OSError)):
        return False                      # code/type/syntax/runtime errors: don't retry
    return True                           # everything else: retry
```

The design rationale:

- **4xx: no retry** — client errors (bad parameters, auth failure, missing resource) won't fix themselves;
- **5xx: retry** — transient server-side failures (unavailable service, gateway errors) are exactly what retries recover from;
- `ValueError`, `TypeError`, `SyntaxError`, etc. are code-level bugs — retrying them is pointless.

<a name="timeout-and-error-handling"></a>

### Timeouts and Error Handling

Both features require `langgraph>=1.2`; covered here conceptually.

**Timeouts (TimeoutPolicy)** cap how long a single node execution may take, preventing a node from blocking the graph on an unresponsive external service:

```python
from langgraph.types import TimeoutPolicy

builder.add_node("call_model", call_model, timeout=TimeoutPolicy(run_timeout=60))
```

After 60 seconds a `NodeTimeoutError` is raised, handed to `RetryPolicy` for a retry decision, and only reaching error handling once retries are exhausted. Common parameters: `run_timeout` (max duration of one run), `idle_timeout` (max time without observable progress), `refresh_on` (how idle time gets refreshed).

> **Note**: node-level timeouts apply **only to async nodes** (`async def`). A synchronous node blocks its thread once started, and Python has no safe general mechanism for killing a running sync function from outside. For sync nodes, use the `timeout` parameters provided by the libraries inside (HTTP clients, database drivers, etc.).

**Error handling (error_handler)** runs fallback logic after a node finally fails:

```python
builder.add_node(
    "call_api",
    call_api,
    retry_policy=RetryPolicy(max_attempts=3),
    error_handler=handle_api_error
)
```

`handle_api_error` can return a state update or route elsewhere via `Command`. Use cases: returning fallback results after an API failure, switching to a backup service, running compensation logic in multi-step business flows, and keeping a single node failure from terminating the whole graph.

<a name="node-caching"></a>

### Node Caching: CachePolicy

Node caching means: store a node's historical results; when the node later receives **identical input**, skip execution and return the cached result — cutting repeated computation, latency, and cost.

It fits when all of the following hold:

1. **The node is deterministic**: same input → same output;
2. **Execution is expensive**: LLM calls, API requests, heavy computation;
3. **Identical inputs recur**: repeated debugging, repeated flows, branches reusing an intermediate result;
4. **The input can be stably hashed by the cache-key function**: the default uses `pickle` serialization, so inputs should be simple serializable structures (`str`/`int`/`dict`/`list`, ...); with file handles, DB connections, model instances, or other complex objects, provide a custom `key_func`.

Configuration takes **two steps**, both required:

```python
from langgraph.cache.memory import InMemoryCache
from langgraph.types import CachePolicy

# Step 1: declare the cache policy on the node
builder.add_node("node_a", node_a, cache_policy=CachePolicy(ttl=10))

# Step 2: provide a cache backend at compile time
graph = builder.compile(cache=InMemoryCache())
```

Setting `cache_policy` without passing `cache=` silently does nothing. `CachePolicy` has just two parameters:

| Parameter  | Description                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------- |
| `key_func` | Generates the cache key from node input; default `default_cache_key` (pickle serialization) |
| `ttl`      | Cache lifetime in seconds; `None` means never expires                                       |

Verify the behavior with a node simulating a 3-second operation:

```python
def node_a(state: EmptyState) -> EmptyState:
    logger.info("node_a called, user: {}", state["user"])
    time.sleep(3)   # simulate expensive work
    return {"invoke_counts": 1}
```

| Call              | Input                  | Cache hit? | Observed behavior                    |
| ----------------- | ---------------------- | ---------- | ------------------------------------ |
| 1st               | `user=Alice`           | miss       | Node runs (3s), result cached        |
| 2nd               | `user=Alice` (same)    | **hit**    | Node skipped, cached result returned |
| 3rd               | `user=Bob` (different) | miss       | Node runs, new entry cached          |
| after ttl expires | `user=Alice`           | miss       | Node runs again, cache rewritten     |

> **A note on ttl**: if a node depends on external state (current time, remote API data, database contents, prompt/model versions, etc.), do not cache forever — set an appropriate `ttl`, or fold those variables into the cache-key computation.

Additionally, `langgraph>=1.2` offers **graph defaults** via `set_node_defaults`, applying default `retry_policy`, `timeout`, `error_handler`, and `cache_policy` to all nodes at once instead of repeating the configuration in every `add_node`.

<a name="best-practices"></a>

## Best Practices

**Environment and configuration**

- Keep API keys in `.env`, listed in `.gitignore`; load them with `load_dotenv()` — never hard-code;
- Isolate project dependencies in a dedicated conda environment.

**State design**

- Prefer `TypedDict` for State schemas;
- Any field written by multiple nodes (especially parallel ones) must have a reducer — otherwise `InvalidUpdateError`;
- Use `input_schema` / `output_schema` to constrain the graph boundary; keep private state fields distinct from global ones;
- Nodes return only the fields they change; keep the returned dict consistent with the declared return type.

**Graph structure**

- Declare edges to `END` explicitly — the structure stays complete and visualizations stay clear;
- Use exactly one routing mechanism per node; never mix normal edges with conditional edges or `Command`;
- With `Command(goto=...)` or `Send`, declare possible targets via type annotations / `path_map` so the graph renders correctly;
- Independent routing rules and graph clarity first → conditional edges; node result directly decides the next hop, cohesion first → `Command`.

**Loops and fault tolerance**

- **Pass `recursion_limit` explicitly** — never rely on version-dependent defaults;
- For business loops (ReAct, reflection, retries), exit gracefully with `RemainingSteps`, and keep an outer `GraphRecursionError` catch as a safety net;
- In production, keep `jitter=True` and narrow retryable exceptions with `retry_on`;
- Enable caching only for deterministic, expensive nodes with recurring inputs — and set a sensible `ttl`.

<a name="faq"></a>

## FAQ

**Q1: `conda` command not found?**

Windows: make sure "Add Miniconda3 to my PATH" was checked during installation, or just open Anaconda Prompt from the Start menu. macOS / Linux: run `~/miniconda3/bin/conda init` and restart the terminal.

**Q2: `import langgraph` raises `ModuleNotFoundError`?**

The package isn't installed in the current environment. Run `conda activate langgraph`, check with `pip show langgraph`, and reinstall if missing.

**Q3: Model calls raise `AuthenticationError`?**

Check in order: is the key in `.env` correct, is `.env` in the project root, and does the code run `load_dotenv(override=True)` before creating the client?

**Q4: Parallel nodes writing the same field raise `InvalidUpdateError`?**

Multiple updates to one field within the same Superstep conflict when no reducer is defined. Attach a suitable reducer (`operator.add`, `add_messages`, ...), or have the nodes write different fields.

**Q5: What's the difference between `add_edge(["a", "b"], "c")` and two separate edges into `c`?**

The former is an AND trigger: `c` runs once after both `a` and `b` complete. The latter is an OR trigger: `a` and `b` each fire `c` independently (it may run twice). They are not equivalent — choose by business semantics.

**Q6: In the rendered graph, my conditionally-routed nodes float detached from the structure?**

When the router returns a sequence or `Send` objects, the renderer cannot infer the mapping. Pass `path_map` explicitly to declare the candidate downstream nodes.

**Q7: The graph loops forever and finally raises `GraphRecursionError`?**

Either the loop has no reachable stop condition, or `recursion_limit` is too small. Review the routing logic, set `recursion_limit` explicitly, and consider a graceful exit via `RemainingSteps`.

**Q8: I configured `CachePolicy` but caching doesn't work?**

Caching takes two steps: `cache_policy=` on the node **and** `cache=InMemoryCache()` at compile time — missing either disables it. Also confirm the two inputs are truly identical and the entry hasn't outlived its `ttl`.

**Q9: `draw_mermaid_png()` fails to render?**

It calls an online service (mermaid.ink by default); network hiccups cause failures, and retrying usually works. You can also point the `base_url` parameter at an alternative renderer.

**Q10: Can I use the `jump_to` field to control jumps in my own graph?**

No. It's an internal field of the LangChain agent middleware system; a plain `StateGraph` will not jump because of it. Use `Command(goto=...)` for flow control in custom graphs.

<a name="summary"></a>

## Summary

This article consolidated the core of getting started with LangGraph, from zero:

- **Environment**: Miniconda + Python 3.13 + `.env` for API keys, with a verification script to confirm readiness;
- **Positioning**: LangChain offers high-level agent abstractions; LangGraph provides the low-level orchestration and runtime — `create_agent` itself is built on LangGraph;
- **Core model**: the State / Node / Edge trio, driven by Supersteps (plan → execute → commit), with checkpoints recorded at Superstep boundaries;
- **State management**: TypedDict as the schema of choice; reducers decide merge vs. overwrite; Multi Schema separates the graph boundary from internal data flow; `MessagesState` works out of the box for LLM scenarios;
- **Control flow**: sequences, parallelism, conditional branches, `defer` for wrap-up nodes, `Send` for dynamic fan-out, `Command` for dynamic jumps, fan-in aggregation, MapReduce, ReAct loops, and proactive/reactive exit strategies under `recursion_limit`;
- **Fault tolerance**: `RetryPolicy` (exponential backoff + jitter + exception filtering) and node caching (two-step configuration) are available today; timeouts and error handling require `langgraph>=1.2`.

With these in hand, you can build workflows in LangGraph that are well-structured, persistent, and fault-tolerant. Natural next topics: persistence and memory management, interrupts and human-in-the-loop, and LangGraph deployment.

## References

- LangGraph documentation: https://docs.langchain.com/oss/python/langgraph
- Functional API: https://docs.langchain.com/oss/python/langgraph/functional-api
- Fault tolerance: https://docs.langchain.com/oss/python/langgraph/fault-tolerance
- Miniconda downloads: https://docs.anaconda.com/miniconda/
