---
title: "LangChain 运行时与中间件：核心原则与实践指南"
lang: zh-CN
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

- [引言](#introduction)
- [是什么](#what)
  - [什么是运行时（Runtime）？](#what-is-runtime)
  - [什么是中间件（Middleware）？](#what-is-middleware)
- [为什么](#why)
  - [为什么运行时很重要](#why-runtime-matters)
  - [为什么中间件很重要](#why-middleware-matters)
- [怎么做](#how)
  - [运行时深入](#runtime-deep-dive)
    - [State — 短期记忆](#state-short-term-memory)
    - [Store — 长期记忆](#store-long-term-memory)
    - [Context — 运行时上下文](#context-runtime-context)
  - [中间件深入](#middleware-deep-dive)
    - [预置中间件](#prebuilt-middleware)
      - [PIIMiddleware](#piimiddleware)
      - [ModelFallbackMiddleware](#modelfallbackmiddleware)
      - [HumanInTheLoopMiddleware](#humanintheloopmiddleware)
      - [批准、拒绝、编辑](#approve-reject-edit)
    - [自定义中间件](#custom-middleware)
      - [Node 风格钩子](#node-style-hooks)
      - [Wrap 风格钩子](#wrap-style-hooks)
      - [基于类的中间件](#class-based-middleware)
      <!--more-->
  - [高级用法](#advanced-usage)
    - [动态修改请求](#dynamic-request-modification)
    - [使用 jump_to 进行条件跳转](#conditional-jump-with-jump-to)
- [示例](#example)
- [最佳实践](#best-practices)
- [常见问题](#faq)
- [总结](#summary)

## Introduction

当你使用 LangChain 构建 AI Agent 时，最先学到的是如何定义工具（tools）和编写提示词（prompts）。但当你的智能体开始承担真实工作——处理用户、管理对话状态、应对故障——你很快就会碰壁：**如何在不重写一切的前提下，洞察智能体的内部运作并控制其行为？**

这就是 **Runtime（运行时）** 和 **Middleware（中间件）** 发挥作用的地方。

Runtime 为你提供了一个窗口，让你看到智能体的内部状态——它记住了什么、它知道什么、以及它在和谁对话。Middleware 让你能够挂钩到智能体的执行循环中，在每一个阶段注入自定义逻辑——模型调用前后、工具调用前后等等。

二者结合，能将一个脆弱的脚本转变为生产就绪的系统。

## What

### What is Runtime?

Runtime 是 LangChain 智能体的执行上下文。它将三个核心概念打包在一起，共同代表智能体在任意时刻"知道"和"拥有"的一切：

| 概念        | 描述                                                 | 生命周期       |
| ----------- | ---------------------------------------------------- | -------------- |
| **State**   | 短期记忆——对话历史、任务计数器、临时标志             | 单次调用       |
| **Store**   | 长期记忆——用户偏好、领域知识、过往经验               | 跨会话         |
| **Context** | 运行时上下文——用户身份、配置参数、请求元数据         | 单次调用       |

可以这样理解：

```
State  = "我现在正在做什么？"
Store  = "我总体知道些什么？"
Context = "谁在什么条件下向我提出的请求？"
```

### What is Middleware?

Middleware 是一种机制，让你能够 **拦截并控制** 智能体的执行循环。它在智能体生命周期的特定节点注册钩子（hooks）——模型调用之前、工具完成之后等等。

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

没有 Runtime，你的智能体就是一个无状态的函数。它记不住对话中发生了什么，回想不起上周的用户偏好，也不知道是谁在发起请求。

Runtime 解决了三个实际问题：

- **状态跟踪** —— 统计模型调用次数、跟踪任务进度、存储中间结果
- **知识注入** —— 将外部数据（用户画像、领域文档）注入智能体的决策过程
- **请求感知** —— 知道是哪个用户在提问、他们有什么权限、应应用什么配置

### Why Middleware Matters

没有 Middleware，每一个横切关注点——日志、重试、PII 脱敏、人工审批——都会纠缠在你的工具和提示词中。你在每个工具里复制粘贴同样的 try/catch 块，在每次智能体调用中添加同样的重试逻辑，代码变得一团糟。

Middleware 通过 **关注点分离** 解决了这个问题。你只需写一次逻辑，将它作为钩子挂载上去，它就会在合适的时机自动运行——无需侵入业务代码。

## How

### Runtime Deep Dive

#### State — Short-term Memory

State 存储 **当前调用** 的所有信息：消息历史、任务计数器、临时标志等。调用结束后即重置。

默认情况下，智能体使用 `AgentState`，其中只包含 `messages`。如果需要跟踪其他内容，你需要定义自定义状态：

```python
from langchain.agents import AgentState
from typing import NotRequired

class CustomState(AgentState):
    """Extended agent state with custom fields."""
    model_call_count: NotRequired[int]   # How many times the model was called
    session_start: NotRequired[str]       # When this session started
```

**在工具中访问 State**

LangChain 在工具中提供了一个保留的 `runtime` 参数。通过它可以读取 state：

```python
from langchain.tools import tool, ToolRuntime

@tool
def my_tool(runtime: ToolRuntime):
    """A tool that reads agent state."""
    count = runtime.state.get("model_call_count", 0)
    return f"Model has been called {count} times so far."
```

**在工具中修改 State**

要更新 state，返回一个带有 `update` 字典的 `Command`：

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

**注册自定义 State**

创建智能体时，指向你的自定义 state schema：

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

**检查 State**

调用结束后，你可以获取完整的 state 快照：

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

State 是短暂的，而 **Store 跨会话持久化**。它用来存放用户偏好、领域知识、故障日志以及一切需要超越单次对话而存在的数据。

LangChain 提供了几种 Store 实现：

| Store           | 适用场景                     |
| --------------- | ---------------------------- |
| `InMemoryStore` | 开发和测试                   |
| `PostgresStore` | 生产环境，关系型数据         |
| `RedisStore`    | 生产环境，低延迟需求         |

**基本操作**

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

**向量存储（Vector-backed Store）**

为了支持语义搜索，你可以用嵌入模型（embedding model）来支撑 store。这样就能按语义含义搜索，而不仅仅是精确字段匹配：

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

使用向量存储后，可以进行语义搜索：

```python
results = memory_store.search(
    ("users",),
    query="technical staff",   # semantic search
    limit=5
)
for item in results:
    print(f"Score: {item.score:.3f} | Data: {item.value}")
```

`score` 越高表示相似度越高。

**在工具中访问 Store**

和 State 一样，Store 也可以通过 `runtime` 访问：

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

**将 Store 注册到智能体**

```python
agent = create_agent(
    model="deepseek-chat",
    tools=[get_user_info],
    store=memory_store      # Attach the store
)
```

#### Context — Runtime Context

Context 携带 **请求级别的元数据**：用户是谁、有什么权限、配置覆盖等。它只在单次调用的生命周期内存在。

**定义 Context Schema**

有两种方式可以定义：

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

**在工具中使用 Context**

Context 通过 `runtime.context` 访问：

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

**在调用时传入 Context**

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

LangChain 内置了几种开箱即用的中间件。我们介绍三种核心的。

##### PIIMiddleware

`PIIMiddleware` 自动检测并处理模型输入输出中的个人身份信息（PII）——邮箱地址、电话号码、身份证号等。

它支持四种处理策略：

| 策略     | 行为                            | 示例                                  |
| -------- | ------------------------------- | ------------------------------------- |
| `block`  | 抛出异常，中止调用              | —                                     |
| `redact` | 替换为 `[REDACTED_{TYPE}]`      | `huge@itcast.cn` → `[REDACTED_EMAIL]` |
| `mask`   | 用 `****` 掩码                  | `13698023405` → `****-****-****-3405` |
| `hash`   | 替换为哈希值                    | `huge@itcast.cn` → `a3f2b8...`        |

用法：

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

由于电话号码的策略是 `block`，任何包含电话号码的输入都会立即抛出异常。

##### ModelFallbackMiddleware

`ModelFallbackMiddleware` 提供回退链——如果主模型失败，会自动尝试下一个模型。

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

如果 `gpt-4o-mini` 不可用，中间件会透明地回退到 `deepseek-chat`。调用方完全感知不到错误。

##### HumanInTheLoopMiddleware

`HumanInTheLoopMiddleware`（HITL）在执行指定工具之前暂停智能体，等待人类批准、拒绝或编辑操作。

这对于高风险操作至关重要：转账、发送邮件、执行脚本、修改文件等。

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

当智能体尝试调用 `transfer_money` 时，它会暂停并发出一个中断（interrupt）：

```python
config = {"configurable": {"thread_id": "3"}}
response = agent.invoke(
    {"messages": [HumanMessage("Transfer 2000 to account 6123008415124395223")]},
    config=config
)
```

工具 **不会** 被执行。响应中包含一个 `__interrupt__` 字段，记录了待处理操作的详情。

##### Approve, Reject, Edit

要继续执行，再次调用智能体并传入一个携带人类决策的 `Command`：

**批准** —— 让工具按原样执行：

```python
from langgraph.types import Command

response = agent.invoke(
    Command(resume={"decisions": [{"type": "approve"}]}),
    config=config
)
```

**拒绝** —— 阻止工具执行并告知智能体原因：

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

**编辑** —— 在执行前修改工具参数：

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

当预置中间件不够用时，你可以构建自己的。LangChain 提供两种风格的钩子：

| 钩子风格       | 可用钩子                                                       | 用途                                                                                   |
| -------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Node 风格**  | `before_agent`、`before_model`、`after_model`、`after_agent`  | 日志记录、状态更新、生命周期边界的条件逻辑                                             |
| **Wrap 风格**  | `wrap_model_call`、`wrap_tool_call`                              | 拦截并修改请求/响应对（重试、转换、覆盖）                                              |

##### Node-style Hooks

Node 风格钩子在智能体生命周期的特定节点运行。它们接收当前的 `state` 和 `runtime`，返回一个状态更新字典。

例如，统计模型调用次数——之前我们用专用工具拼凑出来的任务——用 `after_model` 钩子变得轻而易举：

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

函数签名 **必须** 遵循 `(state, runtime) -> dict[str, Any]`。

注册并测试：

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

计数器自动递增——无需额外的工具调用，不浪费 token。

##### Wrap-style Hooks

Wrap 风格钩子 **包裹** 一次调用（模型或工具）。它们接收请求和一个执行实际调用的 `handler` 函数。这让你可以在失败时重试、转换输入/输出、或者直接短路。

示例——模型调用的重试中间件：

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

签名 **必须** 遵循 `(request, handler) -> response`。

##### Class-based Middleware

当一个中间件需要多个钩子时，使用继承自 `AgentMiddleware` 的类：

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

用法：

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

输出：

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

在 `wrap_model_call` 钩子内部，你可以使用 `request.override()` 覆盖任何请求参数——模型、工具、系统提示词——：

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

测试：

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

在 Node 风格钩子中，你可以返回一个 `jump_to` 指令来跳转到指定的智能体节点——最常用的是 `"end"` 来终止循环。

示例——限制模型调用次数的速率限制器：

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

测试：

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

下面是一个完整的示例，将 Runtime 和 Middleware 结合在一起——一个带有用户偏好、PII 保护和速率限制的银行助手：

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

这个示例的关键要点：

- **State** 跟踪模型调用次数以实现速率限制
- **Store** 存放用户偏好和账户余额
- **Context** 携带已登录的用户 ID
- **Middleware** 提供自动 PII 脱敏和速率限制——工具逻辑零修改

## Best Practices

| 领域               | 建议                                                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **State**          | 保持最小化。只存储智能体在会话内真正需要跟踪的数据。过大的 State 会拖慢检查点（checkpointing）速度。                                      |
| **Store**          | 使用命名空间合理组织数据：`("preferences",)`、`("accounts",)`、`("history",)`。不要把所有数据塞进一个命名空间。                          |
| **Context**        | 通过 Context 传递用户身份和配置，而不是 State。Context 有类型约束且不会污染智能体的记忆。                                                 |
| **Middleware**     | 每个中间件只负责一个关注点。不要把 PII 脱敏和速率限制混在同一个类中。                                                                      |
| **中间件顺序**     | 中间件按注册顺序执行。将保护性中间件（PII、速率限制）放在前面，日志放在最后。                                                              |
| **HITL**           | 始终将 `HumanInTheLoopMiddleware` 与 `checkpointer` 搭配使用。没有检查点机制，就无法在中断后恢复执行。                                    |
| **测试**           | 先独立测试中间件。在与完整智能体集成之前，Mock `state` 和 `runtime` 对象。                                                                |
| **重试逻辑**       | 在 `wrap_model_call` 的重试中加入指数退避（exponential backoff）。裸循环会猛击 API 并消耗 token。                                         |

## FAQ

**问：不通过 Runtime 能访问 State 和 Store 吗？**
答：在工具中不行——`runtime` 是唯一的接口。但在中间件中，`state` 和 `runtime` 直接作为函数参数传入。

**问：中间件抛出异常会怎样？**
答：智能体执行会中止，异常会传播给调用方。如果你希望优雅降级，在中间件逻辑中用 try/except 包裹。

**问：中间件能修改系统提示词吗？**
答：可以，在 `wrap_model_call` 钩子中使用 `request.override(system_prompt="...")`。

**问：Store 在所有线程（thread）之间共享吗？**
答：是的。Store 是智能体级别的，不是线程级别的。使用不同的命名空间来隔离每个用户或租户的数据。

**问：什么时候用 State，什么时候用 Store？**
答：如果数据需要在当前调用之后继续存在（如用户偏好），用 Store。如果只对当前会话有意义（如调用计数器、临时标志），用 State。

**问：能同时使用多个 `wrap_model_call` 中间件吗？**
答：可以——它们以栈的方式组合。第一个注册的中间件是最外层的包装器。每个中间件调用 `handler(request)`，即调用链中的下一个中间件。

**问：`runtime` 是 `@tool` 中的保留参数名——能用来做自己的参数吗？**
答：不能。LangChain 会拦截 `runtime: ToolRuntime` 来注入运行时上下文。如果你把自己的参数命名为 `runtime`，会产生冲突。请选用其他名称。

## Summary

LangChain 的 Runtime 和 Middleware 是生产级智能体工程的两大支柱：

| 概念           | 角色                                              | 生命周期             | 访问方式                                   |
| -------------- | ------------------------------------------------- | -------------------- | ------------------------------------------ |
| **State**      | 短期记忆——对话历史、计数器                       | 单次调用             | `runtime.state` / 中间件 `state` 参数      |
| **Store**      | 长期记忆——用户数据、领域知识                     | 跨会话               | `runtime.store`                            |
| **Context**    | 请求元数据——用户 ID、配置                        | 单次调用             | `runtime.context`                          |
| **Middleware** | 执行钩子——拦截、修改、控制流                     | 在智能体创建时注册   | 装饰器或 `AgentMiddleware` 子类            |

心智模型：

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

**State** 回答"现在正在发生什么？"
**Store** 回答"我们知道什么？"
**Context** 回答"谁在提问？"
**Middleware** 回答"中间应该发生什么？"

掌握这四个概念，你就能构建可观测、可控、安全的智能体——不只是聪明，而是智能！
