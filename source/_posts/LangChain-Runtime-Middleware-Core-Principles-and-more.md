---
title: "LangChain Runtime & Middleware: Core Principles and Practical Guide"
date: 2026-05-18 12:00:00
updated: 2026-06-03 12:00:00
comments: true
categories:
  - Python
  - AI
tags:
  - LangChain
  - LangChain Runtime
  - Middleware
  - AI Agent
  - LLM
  - LLM Engineering
  - Large Language Model
---

- [Introduction](#introduction)
- [What](#what)
  - [What is Runtime?](#what-is-runtime)
  - [What is Middleware?](#what-is-middleware)
- [Why](#why)
  - [Why Runtime Matters](#why-runtime-matters)
  - [Why Middleware Matters](#why-middleware-matters)
- [How](#how)
  - [Runtime Deep Dive](#runtime-deep-dive)
    - [State — Short-term Memory](#state-short-term-memory)
    - [Store — Long-term Memory](#store-long-term-memory)
    - [Context — Runtime Context](#context-runtime-context)
  - [Middleware Deep Dive](#middleware-deep-dive)
    - [Prebuilt Middleware](#prebuilt-middleware)
      - [PIIMiddleware](#piimiddleware)
      - [ModelFallbackMiddleware](#modelfallbackmiddleware)
      - [HumanInTheLoopMiddleware](#humanintheloopmiddleware)
      - [Approve, Reject, Edit](#approve-reject-edit)
    - [Custom Middleware](#custom-middleware)
      - [Node-style Hooks](#node-style-hooks)
      - [Wrap-style Hooks](#wrap-style-hooks)
      - [Class-based Middleware](#class-based-middleware)
      <!--more-->
  - [Advanced Usage](#advanced-usage)
    - [Dynamic Request Modification](#dynamic-request-modification)
    - [Conditional Jump with jump_to](#conditional-jump-with-jump-to)
- [Example](#example)
- [Best Practices](#best-practices)
- [FAQ](#faq)
- [Summary](#summary)

## Introduction

When you build an AI Agent with LangChain, the first thing you learn is how to define tools and write prompts. But once your agent starts doing real work — handling users, managing conversation state, dealing with failures — you quickly hit a wall: **how do you peek inside the agent's brain and control its behavior without rewriting everything?**

That's where **Runtime** and **Middleware** come in.

Runtime gives you a window into the agent's internal state — what it remembers, what it knows, and who it's talking to. Middleware lets you hook into the agent's execution loop and inject custom logic at every stage — before and after model calls, tool calls, and more.

Together, they turn a fragile script into a production-ready system.

## What

### What is Runtime?

Runtime is the execution context of a LangChain agent. It bundles three core concepts that together represent everything the agent "knows" and "has" at any given moment:

| Concept     | Description                                                              | Lifecycle         |
| ----------- | ------------------------------------------------------------------------ | ----------------- |
| **State**   | Short-term memory — conversation history, task counters, temporary flags | Single invocation |
| **Store**   | Long-term memory — user preferences, domain knowledge, past experience   | Cross-session     |
| **Context** | Runtime context — user identity, config parameters, request metadata     | Single invocation |

Think of it this way:

```
State  = "What am I doing right now?"
Store  = "What do I know in general?"
Context = "Who asked me and under what conditions?"
```

### What is Middleware?

Middleware is a mechanism that lets you **intercept and control** the agent's execution loop. It registers hooks at specific points in the agent's lifecycle — before the model is called, after a tool finishes, and so on.

```
Without Middleware:                          With Middleware:
┌──────────────┐                            ┌──────────────┐
│   User Input │                            │   User Input │
└──────┬───────┘                            └──────┬───────┘
       ▼                                           ▼
┌──────────────┐                            ┌──────────────┐
│  Model Call  │                            │  Hook: before│
└──────┬───────┘                            │  model call  │
       ▼                                           │
┌──────────────┐                            └──────┬───────┘
│  Tool Call   │                                   ▼
└──────┬───────┘                            ┌──────────────┐
       ▼                                    │  Model Call  │
┌──────────────┐                            └──────┬───────┘
│   Response   │                                   ▼
└──────────────┘                            ┌──────────────┐
                                            │  Hook: after │
                                            │  model call  │
                                            └──────┬───────┘
                                                   ▼
                                            ┌──────────────┐
                                            │  Tool Call   │
                                            └──────┬───────┘
                                                   ▼
                                            ┌──────────────┐
                                            │  Hook: wrap  │
                                            │  tool call   │
                                            └──────┬───────┘
                                                   ▼
                                            ┌──────────────┐
                                            │   Response   │
                                            └──────────────┘
```

## Why

### Why Runtime Matters

Without Runtime, your agent is a stateless function. It can't remember what happened in the conversation, it can't recall user preferences from last week, and it has no idea who's making the request.

Runtime solves three real problems:

- **State tracking** — Count model calls, track task progress, store intermediate results
- **Knowledge grounding** — Inject external data (user profiles, domain docs) into the agent's decision-making
- **Request awareness** — Know which user is asking, what permissions they have, what config to apply

### Why Middleware Matters

Without Middleware, every cross-cutting concern — logging, retries, PII redaction, human approval — ends up tangled inside your tools and prompts. You copy-paste the same try/catch block into every tool. You add the same retry logic to every agent call. Your code becomes a mess.

Middleware solves this by **separating concerns**. You write the logic once, attach it as a hook, and it runs automatically at the right point — no invasion of your business code.

## How

### Runtime Deep Dive

#### State — Short-term Memory

State stores everything about the **current invocation**: the message history, task counters, temporary flags, and so on. It resets when the invocation ends.

By default, an agent uses `AgentState`, which only contains `messages`. To track anything else, you define a custom state:

```python
from langchain.agents import AgentState
from typing import NotRequired

class CustomState(AgentState):
    """Extended agent state with custom fields."""
    model_call_count: NotRequired[int]   # How many times the model was called
    session_start: NotRequired[str]       # When this session started
```

**Accessing State in a Tool**

LangChain provides a reserved `runtime` parameter in tools. Through it, you can read state:

```python
from langchain.tools import tool, ToolRuntime

@tool
def my_tool(runtime: ToolRuntime):
    """A tool that reads agent state."""
    count = runtime.state.get("model_call_count", 0)
    return f"Model has been called {count} times so far."
```

**Modifying State in a Tool**

To update state, return a `Command` with an `update` dict:

```python
from langgraph.types import Command
from langchain.messages import ToolMessage
from datetime import datetime

@tool
def update_state(runtime: ToolRuntime):
    """A tool that updates agent state."""
    messages = runtime.state["messages"]
    message_count = len(messages)

    updates = {
        "model_call_count": runtime.state.get("model_call_count", 0) + 1,
        "messages": [ToolMessage("State updated", tool_call_id=runtime.tool_call_id)]
    }

    # Record session start time on the first interaction
    if message_count <= 2:
        updates["session_start"] = datetime.now()

    return Command(update=updates)
```

**Registering Custom State**

When creating the agent, point it to your custom state schema:

```python
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    "deepseek-chat",
    tools=[update_state],
    state_schema=CustomState,       # Tell the agent to use our state
    checkpointer=InMemorySaver(),
    system_prompt="You are a helpful assistant. Always call update_state to track your invocation."
)
```

**Inspecting State**

After an invocation, you can snapshot the full state:

```python
config = {"configurable": {"thread_id": "1"}}
response = agent.invoke(
    {"messages": [HumanMessage(content="Hi, my name is Alex")]},
    config
)

# View the full state snapshot
snapshot = agent.get_state(config)
print(snapshot.values)
```

#### Store — Long-term Memory

While State is ephemeral, **Store persists across sessions**. It's where you keep user preferences, domain knowledge, failure logs, and anything that should survive beyond a single conversation.

LangChain provides several Store implementations:

| Store           | Best For                          |
| --------------- | --------------------------------- |
| `InMemoryStore` | Development and testing           |
| `PostgresStore` | Production with relational data   |
| `RedisStore`    | Production with low-latency needs |

**Basic Operations**

```python
from langgraph.store.memory import InMemoryStore

# 1. Create a store
memory_store = InMemoryStore()

# 2. Write data (namespace + key + value)
memory_store.put(
    ("preferences",),       # namespace (tuple)
    "user_001",             # key (must be unique within namespace)
    {                       # value (JSON document)
        "style": "business_markdown",
        "language": "zh-CN"
    }
)

memory_store.put(("preferences",), "user_002", {
    "style": "casual",
    "language": "en-US"
})

# 3. Read data
# 3a. Get by key
user_pref = memory_store.get(("preferences",), "user_001")
print(user_pref.value)  # {'style': 'business_markdown', 'language': 'zh-CN'}

# 3b. Search with filters
results = memory_store.search(
    ("preferences",),
    filter={"language": "zh-CN"},
    limit=5
)
```

**Vector-backed Store**

For semantic search, you can back the store with an embedding model. This lets you search by meaning, not just exact field matches:

```python
from langgraph_cli.schemas import IndexConfig
from langchain_community.embeddings import DashScopeEmbeddings
import os

# Initialize embedding model
embedding_model = DashScopeEmbeddings(
    model="text-embedding-v4",
    dashscope_api_key=os.getenv("DASHSCOPE_API_KEY")
)

# Create vector-backed store
memory_store = InMemoryStore(index=IndexConfig(
    embed=embedding_model,
    dims=1024
))
```

With a vector-backed store, you can search semantically:

```python
results = memory_store.search(
    ("users",),
    query="technical staff",   # semantic search
    limit=5
)
for item in results:
    print(f"Score: {item.score:.3f} | Data: {item.value}")
```

Higher `score` means higher similarity.

**Accessing Store in a Tool**

Just like State, Store is accessible through `runtime`:

```python
@tool
def get_user_info(user_id: str, runtime: ToolRuntime) -> str:
    """Look up user info from the store."""
    if runtime.store is None:
        return "Store not available"

    user_info = runtime.store.get(("users",), user_id)
    if user_info is None:
        return "User not found"

    return f"User info: {user_info.value}"
```

**Registering Store with the Agent**

```python
agent = create_agent(
    model="deepseek-chat",
    tools=[get_user_info],
    store=memory_store      # Attach the store
)
```

#### Context — Runtime Context

Context carries **request-level metadata**: who the user is, what permissions they have, config overrides, and so on. It lives only for the duration of a single invocation.

**Defining a Context Schema**

There are two ways to define it:

```python
from dataclasses import dataclass
from typing_extensions import TypedDict

# Option 1: dataclass
@dataclass
class UserContext:
    """Runtime context for the agent."""
    user_id: str = ""

# Option 2: TypedDict
class UserContext2(TypedDict):
    """Runtime context for the agent."""
    user_id: str
```

**Using Context in a Tool**

Context is accessed via `runtime.context`:

```python
@tool
def get_users(runtime: ToolRuntime[UserContext]):
    """Query all users — requires clearance level 3+."""
    store = runtime.store
    if store is None:
        return "Store not available"

    # Who is making the request?
    user_id = runtime.context.user_id
    if user_id is None or user_id == "":
        return "User not logged in."

    # Check permissions
    user = store.get(("users",), user_id)
    if user is None:
        return "User not found."

    user_info = dict(user.value)
    if user_info.get("clearance_level", 0) < 3:
        return "Insufficient permissions!"

    results = store.search(("users",))
    return [item.value for item in results]


@tool
def get_user_preferences(runtime: ToolRuntime[UserContext]):
    """Get preferences for the current user."""
    user_id = runtime.context.user_id
    pref = runtime.store.get(("preferences",), user_id)
    if pref is None:
        return "No preferences found."
    return pref.value
```

**Passing Context at Invocation**

```python
agent = create_agent(
    model="deepseek-chat",
    tools=[get_users, get_user_preferences],
    store=memory_store,
    context_schema=UserContext,
    system_prompt="""
    # identity
    You are a helpful assistant that can look up user info and preferences.
    # instruction
    Always format results according to the user's preference style.
    """
)

response = agent.invoke(
    {"messages": [HumanMessage("Hello, show me all users")]},
    context=UserContext(user_id="user_001")   # Pass context here
)
```

### Middleware Deep Dive

#### Prebuilt Middleware

LangChain ships with several ready-to-use middleware. We'll cover three essential ones.

##### PIIMiddleware

`PIIMiddleware` automatically detects and sanitizes Personally Identifiable Information in model inputs and outputs — email addresses, phone numbers, ID numbers, and more.

It supports four sanitization strategies:

| Strategy | Behavior                            | Example                               |
| -------- | ----------------------------------- | ------------------------------------- |
| `block`  | Raises an exception, stops the call | —                                     |
| `redact` | Replaces with `[REDACTED_{TYPE}]`   | `huge@itcast.cn` → `[REDACTED_EMAIL]` |
| `mask`   | Masks with `****`                   | `13698023405` → `****-****-****-3405` |
| `hash`   | Replaces with a hash value          | `huge@itcast.cn` → `a3f2b8...`        |

Usage:

```python
from langchain.agents.middleware import PIIMiddleware

# Email redaction on output only
pii_email = PIIMiddleware(
    "email",
    strategy="redact",
    apply_to_input=False,
    apply_to_output=True
)

# Phone number blocking on input
pii_phone = PIIMiddleware(
    "phone_number",
    detector=r"(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}",
    strategy="block",
    apply_to_input=True
)

# Register both with the agent
agent = create_agent(
    model="deepseek-chat",
    middleware=[pii_email, pii_phone]
)
```

Since the phone strategy is `block`, any input containing a phone number will raise an exception immediately.

##### ModelFallbackMiddleware

`ModelFallbackMiddleware` provides a fallback chain — if the primary model fails, it automatically tries the next one.

```python
from langchain.agents.middleware import ModelFallbackMiddleware

fallback = ModelFallbackMiddleware(
    "gpt-4o-mini",     # Default model
    "deepseek-chat"    # Fallback model
)

agent = create_agent(
    model="deepseek-chat",
    middleware=[fallback]
)
```

If `gpt-4o-mini` is unreachable, the middleware transparently falls back to `deepseek-chat`. The caller never sees the error.

##### HumanInTheLoopMiddleware

`HumanInTheLoopMiddleware` (HITL) pauses the agent before executing specified tools, waiting for a human to approve, reject, or edit the action.

This is critical for high-stakes operations: money transfers, email sends, script execution, file modifications, etc.

```python
from langchain.agents.middleware import HumanInTheLoopMiddleware

hitl = HumanInTheLoopMiddleware(
    interrupt_on={
        "transfer_money": {
            "description": "Please confirm the transfer",
            "allowed_decisions": ["approve", "reject", "edit"]
        }
    }
)

agent = create_agent(
    model="deepseek-chat",
    tools=[transfer_money],
    middleware=[hitl],
    checkpointer=InMemorySaver(),
    system_prompt="You are an account management assistant. Help users transfer money."
)
```

When the agent tries to call `transfer_money`, it pauses and emits an interrupt:

```python
config = {"configurable": {"thread_id": "3"}}
response = agent.invoke(
    {"messages": [HumanMessage("Transfer 2000 to account 6123008415124395223")]},
    config=config
)
```

The tool is **not** executed. The response contains an `__interrupt__` field with the pending action details.

##### Approve, Reject, Edit

To resume, call the agent again with a `Command` that carries the human's decision:

**Approve** — let the tool execute as-is:

```python
from langgraph.types import Command

response = agent.invoke(
    Command(resume={"decisions": [{"type": "approve"}]}),
    config=config
)
```

**Reject** — block the tool and tell the agent why:

```python
response = agent.invoke(
    Command(resume={
        "decisions": [{
            "type": "reject",
            "message": "User canceled the transfer."
        }]
    }),
    config=config
)
```

**Edit** — modify the tool arguments before execution:

```python
response = agent.invoke(
    Command(resume={
        "decisions": [{
            "type": "edit",
            "edited_action": {
                "name": "transfer_money",
                "args": {"amount": 1000, "to": "Wang Xiaoming"}
            }
        }]
    }),
    config=config
)
```

#### Custom Middleware

When the prebuilt middleware isn't enough, you can build your own. LangChain provides two styles of hooks:

| Hook Style     | Available Hooks                                              | Use Case                                                                           |
| -------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| **Node-style** | `before_agent`, `before_model`, `after_model`, `after_agent` | Logging, state updates, conditional logic at lifecycle boundaries                  |
| **Wrap-style** | `wrap_model_call`, `wrap_tool_call`                          | Intercepting and modifying request/response pairs (retries, transforms, overrides) |

##### Node-style Hooks

Node-style hooks run at a specific point in the agent lifecycle. They receive the current `state` and `runtime`, and return a dict of state updates.

For example, counting model calls — a task we previously hacked together with a dedicated tool — becomes trivial with an `after_model` hook:

```python
from langgraph.runtime import Runtime
from langchain.agents import AgentState
from typing import NotRequired, Any
from langchain.agents.middleware import after_model

# 1. Define custom state with a counter
class CustomAgentState(AgentState):
    """Extended state with a model call counter."""
    model_call_count: NotRequired[int]

# 2. Define the middleware
@after_model(state_schema=CustomAgentState)
def increment_counter(state: CustomAgentState, runtime: Runtime) -> dict[str, Any]:
    """After each model call, bump the counter."""
    current = state.get("model_call_count", 0)
    return {"model_call_count": current + 1}
```

The function signature **must** follow `(state, runtime) -> dict[str, Any]`.

Register and test:

```python
agent = create_agent(
    model="deepseek-chat",
    middleware=[increment_counter],
    checkpointer=InMemorySaver(),
    state_schema=CustomAgentState
)

config = {"configurable": {"thread_id": "1"}}
response = agent.invoke(
    {"messages": [HumanMessage("Hello")], "model_call_count": 0},
    config
)
print(response["model_call_count"])  # 1
```

The counter increments automatically — no extra tool calls, no wasted tokens.

##### Wrap-style Hooks

Wrap-style hooks **wrap** a call (model or tool). They receive the request and a `handler` function that performs the actual call. This lets you retry on failure, transform inputs/outputs, or short-circuit entirely.

Example — a retry middleware for model calls:

```python
from langchain.agents.middleware import (
    wrap_model_call,
    ModelRequest,
    ModelResponse,
)
from typing import Callable

@wrap_model_call
def retry_model(
    request: ModelRequest,
    handler: Callable[[ModelRequest], ModelResponse],
) -> ModelResponse:
    """Retry model calls up to 3 times on failure."""
    for attempt in range(3):
        try:
            return handler(request)
        except Exception as e:
            print(f"Retry {attempt + 1}/3 after error: {e}")
            if attempt == 2:
                raise
    return None  # unreachable, but satisfies the type checker


agent = create_agent(
    model="deepseek-chat",
    middleware=[retry_model]
)
```

The signature **must** follow `(request, handler) -> response`.

##### Class-based Middleware

When one middleware needs multiple hooks, use a class that inherits from `AgentMiddleware`:

```python
from langchain.agents.middleware import AgentMiddleware
from langchain.agents.middleware.types import ModelCallResult, ToolCallRequest
from langgraph.types import Command
from typing import Callable

class LoggingMiddleware(AgentMiddleware):

    def wrap_model_call(
        self,
        request: ModelRequest,
        handler: Callable[[ModelRequest], ModelResponse],
    ) -> ModelCallResult:
        try:
            print(f"\n=== Calling model with {len(request.messages)} messages ===")
            return handler(request)
        except Exception as e:
            print(f"\n=== [ERROR]: {str(e)} ===")
            return AIMessage("Model call failed, please retry.")

    def wrap_tool_call(
        self,
        request: ToolCallRequest,
        handler: Callable[[ToolCallRequest], ToolMessage | Command],
    ) -> ToolMessage | Command:
        print(f"\n=== Calling tool: {request.tool_call['name']} ===")
        print(f"    Args: {request.tool_call['args']}")
        try:
            result = handler(request)
            print("\n=== Tool call succeeded ===")
            return result
        except Exception as e:
            print(f"\n=== Tool call failed: {e} ===")
            raise
```

Usage:

```python
agent = create_agent(
    model="deepseek-chat",
    middleware=[LoggingMiddleware()],
    tools=[get_weather],
)

for chunk, metadata in agent.stream(
    {"messages": [HumanMessage("How's the weather in Hangzhou?")]},
    stream_mode="messages"
):
    if chunk and chunk.content:
        print(chunk.content, end="", flush=True)
```

Output:

```
=== Calling model with 1 messages ===
Let me check the weather in Hangzhou for you.
=== Calling tool: get_weather ===
    Args: {'location': 'Hangzhou'}

=== Tool call succeeded ===
The weather in Hangzhou is sunny, 25°C — perfect for going out! 🌞
```

### Advanced Usage

#### Dynamic Request Modification

Inside a `wrap_model_call` hook, you can override any request parameter — model, tools, system prompt — using `request.override()`:

```python
from langchain.agents.middleware import wrap_model_call
from collections.abc import Callable
from pydantic.dataclasses import dataclass
from langchain.chat_models import init_chat_model

# Initialize two models
reasoning_model = init_chat_model(model="deepseek-reasoner")
chat_model = init_chat_model(model="deepseek-chat")

# Context to control which model to use
@dataclass
class UserContext:
    reasoning: bool = False

@wrap_model_call
def dynamic_model_selector(
    request: ModelRequest,
    handler: Callable[[ModelRequest], ModelResponse],
) -> ModelResponse:
    """Pick a model based on the runtime context."""
    is_reasoning = getattr(request.runtime.context, 'reasoning', False)
    selected = reasoning_model if is_reasoning else chat_model
    print(f"Selected model: {selected.model_name} (reasoning={is_reasoning})")

    modified_request = request.override(model=selected)
    return handler(modified_request)
```

Test:

```python
agent = create_agent(
    model="deepseek-chat",
    middleware=[dynamic_model_selector],
    checkpointer=InMemorySaver(),
    context_schema=UserContext
)

# Use the reasoning model for this invocation
response = agent.invoke(
    {"messages": [HumanMessage("Solve this math problem: ...")]},
    context=UserContext(reasoning=True)
)
```

#### Conditional Jump with jump_to

Inside a node-style hook, you can return a `jump_to` directive to skip to a specific agent node — most commonly `"end"` to terminate the loop.

Example — a rate limiter that caps model calls:

```python
from langgraph.runtime import Runtime
from typing import NotRequired, Any
from langchain.agents.middleware import AgentMiddleware, hook_config, AgentState

class CustomAgentState(AgentState):
    """State with a call counter."""
    model_call_count: NotRequired[int]

class ModelCallLimitMiddleware(AgentMiddleware[CustomAgentState]):

    def __init__(self, max_limit: int = 10):
        super().__init__()
        self.max_limit = max_limit

    # Count calls after the model runs
    def after_model(self, state: CustomAgentState, runtime: Runtime) -> dict[str, Any] | None:
        current = state.get("model_call_count", 0)
        return {"model_call_count": current + 1}

    # Check the limit before the model runs
    @hook_config(can_jump_to=["end"])
    def before_model(self, state: CustomAgentState, runtime: Runtime) -> dict[str, Any] | None:
        current = state.get("model_call_count", 0) + 1
        print(f"Model call count: {current}/{self.max_limit}")
        if current > self.max_limit:
            return {
                "jump_to": "end",
                "messages": AIMessage(f"Model call limit exceeded: {self.max_limit}!")
            }
        return None
```

Test:

```python
agent = create_agent(
    model="deepseek-chat",
    middleware=[ModelCallLimitMiddleware(max_limit=2)],
    checkpointer=InMemorySaver(),
    state_schema=CustomAgentState
)

config = {"configurable": {"thread_id": "1"}}
response = agent.invoke(
    {"messages": [HumanMessage("Hello")], "model_call_count": 0},
    config
)
print(response["model_call_count"])  # Will stop after 2 model calls
```

## Example

Here's a complete example that ties Runtime and Middleware together — a banking assistant with user preferences, PII protection, and rate limiting:

```python
import os
from datetime import datetime
from dataclasses import dataclass
from typing import NotRequired, Any, Callable

from langchain.agents import create_agent, AgentState
from langchain.tools import tool, ToolRuntime
from langchain.agents.middleware import (
    PIIMiddleware,
    LoggingMiddleware as LoggingMW,
    after_model,
    wrap_model_call,
    ModelRequest,
    ModelResponse,
)
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.store.memory import InMemoryStore
from langgraph.types import Command
from langchain.messages import HumanMessage, AIMessage, ToolMessage

# ── 1. Custom State ──────────────────────────────────────────────
class BankingState(AgentState):
    model_call_count: NotRequired[int]
    session_start: NotRequired[str]

# ── 2. Custom Context ────────────────────────────────────────────
@dataclass
class BankingContext:
    user_id: str = ""

# ── 3. Store Setup ───────────────────────────────────────────────
store = InMemoryStore()
store.put(("preferences",), "user_001", {
    "style": "formal",
    "language": "en",
    "clearance_level": 5
})
store.put(("accounts",), "user_001", {
    "balance": 12500.00,
    "currency": "USD"
})

# ── 4. Tools ─────────────────────────────────────────────────────
@tool
def get_balance(runtime: ToolRuntime[BankingContext]) -> str:
    """Check the current user's account balance."""
    uid = runtime.context.user_id
    if not uid:
        return "User not logged in."
    acct = runtime.store.get(("accounts",), uid)
    if not acct:
        return "Account not found."
    info = acct.value
    return f"Your balance is {info['balance']} {info['currency']}."

@tool
def get_preferences(runtime: ToolRuntime[BankingContext]) -> str:
    """Get the current user's communication preferences."""
    uid = runtime.context.user_id
    pref = runtime.store.get(("preferences",), uid)
    if not pref:
        return "No preferences found."
    return str(pref.value)

# ── 5. Middleware ─────────────────────────────────────────────────
# Rate limiter
@after_model(state_schema=BankingState)
def rate_limiter(state: BankingState, runtime) -> dict[str, Any] | None:
    count = state.get("model_call_count", 0) + 1
    if count > 5:
        return {
            "jump_to": "end",
            "messages": AIMessage("Rate limit exceeded. Please try again later.")
        }
    return {"model_call_count": count}

# PII protection
pii_email = PIIMiddleware("email", strategy="redact", apply_to_input=True, apply_to_output=True)

# ── 6. Create Agent ──────────────────────────────────────────────
agent = create_agent(
    model="deepseek-chat",
    tools=[get_balance, get_preferences],
    store=store,
    state_schema=BankingState,
    context_schema=BankingContext,
    middleware=[rate_limiter, pii_email],
    checkpointer=InMemorySaver(),
    system_prompt="You are a banking assistant. Always match the user's preferred style."
)

# ── 7. Run ───────────────────────────────────────────────────────
config = {"configurable": {"thread_id": "bank-001"}}
response = agent.invoke(
    {
        "messages": [HumanMessage("Hi, what's my balance? My email is alex@bank.com")],
        "model_call_count": 0,
    },
    config,
    context=BankingContext(user_id="user_001")
)

for msg in response["messages"]:
    msg.pretty_print()
```

Key takeaways from this example:

- **State** tracks model call count for rate limiting
- **Store** holds user preferences and account balances
- **Context** carries the logged-in user ID
- **Middleware** provides automatic PII redaction and rate limiting — zero changes to tool logic

## Best Practices

| Area                 | Recommendation                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **State**            | Keep it minimal. Only store what the agent truly needs to track within a session. Large state slows down checkpointing.                   |
| **Store**            | Use namespaces to organize data logically: `("preferences",)`, `("accounts",)`, `("history",)`. Never dump everything into one namespace. |
| **Context**          | Pass user identity and config via Context, not State. Context is typed and doesn't pollute the agent's memory.                            |
| **Middleware**       | One concern per middleware. Don't mix PII redaction with rate limiting in the same class.                                                 |
| **Middleware order** | Middleware runs in registration order. Put protective middleware (PII, rate limits) first, logging last.                                  |
| **HITL**             | Always pair `HumanInTheLoopMiddleware` with a `checkpointer`. Without checkpointing, you can't resume after an interrupt.                 |
| **Testing**          | Test middleware in isolation first. Mock `state` and `runtime` objects before integrating with the full agent.                            |
| **Retry logic**      | In `wrap_model_call` retries, add exponential backoff. Bare loops hammer the API and burn tokens.                                         |

## FAQ

**Q: Can I access State and Store without Runtime?**
A: In tools, no — `runtime` is the only interface. But in middleware, you receive `state` and `runtime` directly as function parameters.

**Q: What happens if a middleware raises an exception?**
A: The agent execution halts and the exception propagates to the caller. Wrap your middleware logic in try/except if you want graceful degradation.

**Q: Can middleware modify the system prompt?**
A: Yes, via `request.override(system_prompt="...")` inside a `wrap_model_call` hook.

**Q: Is Store shared across all threads?**
A: Yes. Store is agent-level, not thread-level. Use different namespaces to isolate data per user or per tenant.

**Q: When should I use State vs. Store?**
A: If the data should survive past the current invocation (e.g., user preferences), use Store. If it's only relevant to the current session (e.g., call counters, temporary flags), use State.

**Q: Can I use multiple `wrap_model_call` middleware together?**
A: Yes — they compose as a stack. The first registered middleware is the outermost wrapper. Each one calls `handler(request)`, which invokes the next middleware in the chain.

**Q: `runtime` is a reserved parameter name in `@tool` — can I use it for my own arguments?**
A: No. LangChain intercepts `runtime: ToolRuntime` to inject the runtime context. If you name your own parameter `runtime`, you'll get a conflict. Choose a different name.

## Summary

LangChain's Runtime and Middleware are the two pillars of production-grade agent engineering:

| Concept        | Role                                               | Lifetime                     | Access                                     |
| -------------- | -------------------------------------------------- | ---------------------------- | ------------------------------------------ |
| **State**      | Short-term memory — conversation history, counters | Single invocation            | `runtime.state` / middleware `state` param |
| **Store**      | Long-term memory — user data, domain knowledge     | Cross-session                | `runtime.store`                            |
| **Context**    | Request metadata — user ID, config                 | Single invocation            | `runtime.context`                          |
| **Middleware** | Execution hooks — intercept, modify, control flow  | Registered at agent creation | Decorators or `AgentMiddleware` subclass   |

The mental model:

```
User Request
    │
    ▼
┌─────────────────────────────┐
│         Middleware Stack    │
│  before_agent → before_model│
│       ↓                     │
│  wrap_model_call            │
│       ↓                     │
│  after_model → wrap_tool    │
│       ↓                     │
│  after_agent                │
└──────────┬──────────────────┘
           ▼
       Response
```

**State** answers "what's happening now?"
**Store** answers "what do we know?"
**Context** answers "who's asking?"
**Middleware** answers "what should happen in between?"

Master these four concepts, and you can build agents that are observable, controllable, and safe — not just clever but intelligent!
