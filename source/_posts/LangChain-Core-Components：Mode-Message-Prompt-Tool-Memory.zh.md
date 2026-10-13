---
title: "LangChain 核心组件：模型、消息、提示词、工具、记忆"
lang: zh-CN
date: 2026-05-04 12:48:28
updated: 2026-06-06 00:00:00
comments: true
categories:
  - Python
  - AI
tags:
  - LangChain
  - LangSmith
  - AI Agent
  - LLM
  - MultiModal
---

- [什么是 LangChain？](#what-is-langchain)
  - [平台概览](#the-platform)
  - [什么是 Agent？](#what-is-an-agent)
  - [LLM 与 Agent 的区别](#llm-vs-agent-the-difference)
- [模型（Model）—— 大脑](#models--the-brain)
  - [初始化模型](#initializing-a-model)
  - [自定义模型与参数](#custom-models-and-parameters)
  - [使用模型类](#using-model-classes)
  - [调用模型：invoke 与 stream](#calling-the-model-invoke-vs-stream)
  - [在 Agent 中使用模型](#using-models-in-an-agent)
- [消息（Message）—— 对话的基本单元](#messages--the-building-blocks-of-conversation)
  - [消息类型](#message-types)
  - [多模态消息](#multimodal-messages)
- [提示词（Prompt）—— 引导输出](#prompts--steering-the-output)
  - [系统提示词](#system-prompts)
  - [提示词工程](#prompt-engineering)
  - [结构化输出](#structured-output)
- [工具（Tool）—— 双手](#tools--the-hands)
  - [定义工具](#defining-tools)
  - [自定义工具](#custom-tools)
  - [预定义工具：Tavily 搜索](#predefined-tools-tavily-search)
  - [工具与 Agent 的结合](#combining-tools-with-an-agent)
- [记忆（Memory）—— 让 Agent 记住一切](#memory--making-the-agent-remember)
  - [短期记忆与长期记忆](#short-term-vs-long-term-memory)
  - [使用 InMemorySaver 实现短期记忆](#short-term-memory-with-inmemorysaver)
  - [持久化记忆（可选）](#persistent-memory-optional)
  - [记忆管理策略](#memory-management-strategies)
  <!--more-->
- [综合实战](#putting-it-all-together)
- [最佳实践](#best-practices)
- [常见问题](#faq)
- [总结](#summary)

---

## 什么是 LangChain？ <a name="what-is-langchain"></a>

### 平台概览 <a name="the-platform"></a>

LangChain 由 Harrison Chase 于 2022 年 10 月创建。它是一个用于 **Agent 工程（Agent Engineering）** 的平台——构建能够推理、规划和行动的 AI Agent。

LangChain 不仅仅是一个框架，而是一个包含多个组件的完整平台：

| 组件        | 用途                                               |
| ----------- | -------------------------------------------------- |
| LangChain   | 快速构建 Agent，兼容任意模型提供商                 |
| LangGraph   | 底层 Agent 控制：记忆、人机协作（Human-in-the-Loop）|
| Deep Agents | 复杂的多步骤任务 Agent                             |
| LangSmith   | 测试、观测、评估和部署 Agent                       |

官方网站：[https://www.langchain.com](https://www.langchain.com)

### 什么是 Agent？ <a name="what-is-an-agent"></a>

这个问题没有唯一标准答案。但 LangChain 创始人 Harrison Chase 给出了一个技术定义：

> AI Agent 是一个使用 LLM 来决定应用程序控制流的系统。

更通俗地说：**Agent** 是一个智能系统，能够 **感知环境、推理、自主决策并采取行动** 以达成目标。

| 特性     | 传统 LLM                           | AI Agent                                  |
| -------- | ---------------------------------- | ----------------------------------------- |
| 交互方式 | 被动：问一个，答一个               | 主动：目标驱动的规划                      |
| 执行能力 | 仅生成文本                         | 操作软件、发送邮件、分析数据              |
| 自主性   | 需要明确的逐步指令                 | 给定目标后，自行寻找实现路径              |

**LLM = 大脑。Agent = 大脑 + 双手 + 逻辑。**

### LLM 与 Agent 的区别 <a name="llm-vs-agent-the-difference"></a>

假设我们要构建一个 **AI 旅行助手**。

**传统 LLM 方式：**

1. 用户："规划一个 5 天的北京行程，预算 8000 元，我喜欢历史。"
2. LLM 根据训练数据生成一个简单的计划——没有实时价格、天气或可用性信息。

**Agent 方式：**

1. 同样的用户请求。
2. Agent 将任务拆解：
   - 调用航班/酒店 API 获取实时价格
   - 调用天气 API 获取天气预报
   - 搜索景点 API 获取开放时间
   - 动态调整计划（"故宫周一闭馆，调整到周二"）
3. 返回一个具体的、预算内的可执行计划。

---

## 模型（Model）—— 大脑 <a name="models--the-brain"></a>

模型（LLM）能够理解人类语言并生成内容、翻译、摘要和回答问题。

现代 LLM 还具备一些特殊能力：

| 能力            | 描述                                                     |
| --------------- | -------------------------------------------------------- |
| 工具调用（Tool Calling）    | 调用外部工具（API、数据库）并将结果用于回答 |
| 结构化输出（Structured Output） | 将响应约束为特定格式（如 JSON）              |
| 多模态（Multimodality）       | 处理和返回非文本数据：图片、音频、视频       |
| 推理（Reasoning）             | 执行多步推理以得出结论                       |

LangChain 通过 **统一 API** 支持大多数 LLM，可以轻松切换提供商。

### 初始化模型 <a name="initializing-a-model"></a>

最简单的方式是使用 `init_chat_model`：

```python
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv

load_dotenv()

# LangChain auto-detects provider, base_url, and api_key
model = init_chat_model(model="deepseek-chat")
```

测试一下：

```python
print(type(model))  # <class 'langchain_deepseek.chat_models.ChatDeepSeek'>
```

想切换模型？只需更改名称——无需修改其他代码。

### 自定义模型与参数 <a name="custom-models-and-parameters"></a>

对于未原生支持的提供商（例如阿里巴巴通过 DashScope 使用的 Qwen），需要手动指定参数：

```python
import os
from langchain.chat_models import init_chat_model

model = init_chat_model(
    model="qwen-max",
    model_provider="openai",       # DashScope is OpenAI-compatible
    base_url=os.getenv("DASHSCOPE_BASE_URL"),
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    temperature=1.5,               # Higher = more creative
)
```

常用模型参数：

| 参数            | 控制内容                                   |
| --------------- | ------------------------------------------ |
| `temperature`   | 随机性：低值 = 确定性输出，高值 = 更有创造力 |
| `max_tokens`    | 最大响应长度                               |
| `top_p`         | 输出多样性                                 |
| `timeout`       | 请求超时时间                               |
| `max_retries`   | 最大重试次数                               |

### 使用模型类 <a name="using-model-classes"></a>

对于社区支持的模型，使用对应的模型类：

```bash
uv add langchain-community dashscope
```

```python
from langchain_community.chat_models.tongyi import ChatTongyi

model = ChatTongyi(model="qwen-plus")
```

### 调用模型：invoke 与 stream <a name="calling-the-model-invoke-vs-stream"></a>

**阻塞式调用** —— 等待完整响应：

```python
response = model.invoke("What is the capital of the moon?")
print(response)
```

**流式调用** —— 实时查看 token 输出：

```python
stream = model.stream("What is the capital of the moon?")

for chunk in stream:
    print(chunk.content, end="", flush=True)
```

### 在 Agent 中使用模型 <a name="using-models-in-an-agent"></a>

可以传入模型名称（自动初始化）或模型对象：

```python
from langchain.agents import create_agent

# Option A: By model name
agent = create_agent(model="deepseek-chat")

# Option B: With a pre-built model
from langchain_community.chat_models.tongyi import ChatTongyi
model = ChatTongyi(model="qwen-plus")
agent = create_agent(model=model)
```

Agent 同样支持 `invoke` 和 `stream`：

```python
# Blocking
response = agent.invoke({
    "messages": [{"role": "user", "content": "Hello"}]
})

# Streaming
for token, metadata in agent.stream(
    {"messages": [{"role": "user", "content": "Hello"}]},
    stream_mode="messages"
):
    if token.content:
        print(token.content, end="", flush=True)
```

Agent 的流式模式：

| 模式       | 返回内容                                  |
| ---------- | ----------------------------------------- |
| `messages` | 每个 LLM token（用于实时输出）            |
| `updates`  | 每个 Agent 事件（LLM 调用、工具调用）     |
| `custom`   | 自定义流式写入器的输出                    |

---

## 消息（Message）—— 对话的基本单元 <a name="messages--the-building-blocks-of-conversation"></a>

每条发送给 LLM 或从 LLM 返回的消息都包含：

- **role**：消息发送者（system、user、assistant、tool）
- **content**：消息内容
- **metadata**（可选）：ID、token 使用量等

### 消息类型 <a name="message-types"></a>

LangChain 根据角色将消息封装为 `BaseMessage` 的子类：

| 类              | 角色        | 用途                                   |
| --------------- | ----------- | -------------------------------------- |
| `SystemMessage` | `system`    | 设定模型的行为和上下文                 |
| `HumanMessage`  | `user`      | 用户输入                               |
| `AIMessage`     | `assistant` | LLM 的响应（文本、工具调用、元数据）   |
| `ToolMessage`   | `tool`      | 工具执行的结果                         |

示例：

```python
from langchain.messages import HumanMessage, AIMessage, SystemMessage
from langchain.agents import create_agent

agent = create_agent(model="deepseek-chat")

response = agent.invoke({
    "messages": [
        SystemMessage(content="You are a helpful travel guide."),
        HumanMessage(content="Hi, I'm Alex"),
        AIMessage(content="Hi Alex! Where would you like to go?"),
        HumanMessage(content="What's my name?")
    ]
})

for message in response['messages']:
    message.pretty_print()
```

输出：

```
================================ System Message ================================
You are a helpful travel guide.
================================ Human Message ================================
Hi, I'm Alex
================================== Ai Message =================================
Hi Alex! Where would you like to go?
================================ Human Message ================================
What's my name?
================================== Ai Message =================================
You said your name is Alex! How can I help you plan your trip today?
```

**提示**：手动传递消息历史可以让 LLM 拥有"记忆"。但这种方式很繁琐——我们将在记忆章节中学习自动记忆管理。

### 多模态消息 <a name="multimodal-messages"></a>

LangChain 支持向多模态模型（如 `qwen3.5-plus`、`gpt-5-nano`）发送图片、音频和视频。

**在线图片（通过 URL）：**

```python
from langchain.chat_models import init_chat_model
from langchain.messages import HumanMessage
from langchain.agents import create_agent
import os

model = init_chat_model(
    model="qwen3.5-plus",
    model_provider="openai",
    base_url=os.getenv("DASHSCOPE_BASE_URL"),
    api_key=os.getenv("DASHSCOPE_API_KEY")
)

agent = create_agent(model=model)

multimodal_message = HumanMessage(content=[
    {"type": "image",
     "url": "https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20241022/emyrja/dog_and_girl.jpeg"},
    {"type": "text", "text": "What does this image depict?"}
])

for token, metadata in agent.stream(
    {"messages": [multimodal_message]},
    stream_mode="messages"
):
    if token.content:
        print(token.content, end="", flush=True)
```

**本地图片（通过 base64）：**

```python
import base64

# Suppose img_bytes is your uploaded image data
img_b64 = base64.b64encode(img_bytes).decode("utf-8")

multimodal_message = HumanMessage(content=[
    {"type": "image", "base64": img_b64, "mime_type": "image/jpeg"},
    {"type": "text", "text": "Tell me about this city"}
])

response = agent.invoke({"messages": [multimodal_message]})
print(response['messages'][-1].content)
```

---

## 提示词（Prompt）—— 引导输出 <a name="prompts--steering-the-output"></a>

发送给 LLM 的所有内容都可以称为 **提示词（Prompt）**。其中 **系统提示词**（`SystemMessage`）最为重要——它设定了 AI 的角色、规则和上下文。

### 系统提示词 <a name="system-prompts"></a>

在创建 Agent 时设置一次即可：

```python
from langchain.agents import create_agent
from langchain.messages import HumanMessage

agent = create_agent(
    model="deepseek-chat",
    system_prompt="Speak like a pirate."
)

for token, metadata in agent.stream(
    {"messages": [HumanMessage(content="Who are you?")]},
    stream_mode="messages"
):
    print(token.content, end="", flush=True)
```

没有系统提示词时，AI 使用默认人格。加上 `Speak like a pirate` 后，输出风格会发生巨大变化：

```
Ahoy! I be yer parrot, an AI assistant sailing the digital seas! Want to chat about treasure, sailing, or tales of the seven seas? Bring it on, matey!
```

### 提示词工程 <a name="prompt-engineering"></a>

**提示词工程（Prompt Engineering）** 是迭代优化系统提示词以获得更好输出的过程。

一个结构良好的提示词通常包含：

| 部分           | 用途                                        |
| -------------- | ------------------------------------------- |
| **身份**       | AI 是谁？沟通风格、总体目标                 |
| **指令**       | 需要遵守的规则。该做什么、不该做什么        |
| **示例**       | 展示期望格式的输入/输出对                   |
| **上下文**     | 额外信息（RAG 数据、参考文档）              |

使用 **Markdown** 组织结构，使用 **XML 标签** 标记边界：

```python
system_prompt = """
# Identity
You are a labeling assistant that classifies product reviews
as Positive, Negative, or Neutral.

# Instructions
- Output only a single word: Positive, Negative, or Neutral
- No additional formatting or commentary

# Examples
<product_review id="1">
I absolutely love these headphones — sound quality is amazing!
</product_review>
<assistant_response id="1">
Positive
</assistant_response>

<product_review id="2">
Battery life is okay, but the ear pads feel cheap.
</product_review>
<assistant_response id="2">
Neutral
</assistant_response>
"""
```

#### 少样本示例（Few-Shot Examples）

当期望的风格难以用文字描述时，直接展示示例：

```python
system_prompt = """
# Identity
You are a sci-fi writer creating space capitals.

# Examples
user: What is the capital of the Moon?
assistant: Lunara — a crystal-domed city nestled in the Sea of Tranquility crater, powered by a tidal energy tower.

user: What is the capital of Mars?
assistant: Aresia — a hive city embedded in Olympus Mons lava tubes, with spiral spires of Martian clay above ground.
"""

agent = create_agent(model="deepseek-chat", system_prompt=system_prompt)

for token, metadata in agent.stream(
    {"messages": [HumanMessage(content="What is the capital of Venus?")]},
    stream_mode="messages"
):
    print(token.content, end="", flush=True)
```

输出：

```
Aurum — a magnificent floating city above the sulfuric clouds, forged from reflective alloy, eternally refracting the dim yellow sunlight.
```

### 结构化输出 <a name="structured-output"></a>

无需解析原始文本，直接约束模型输出结构化数据。

**第一步**：定义 Pydantic 模型：

```python
from pydantic import BaseModel, Field

class CapitalInfo(BaseModel):
    name: str
    location: str
    vibe: str
    economy: str
```

**第二步**：将其作为 `response_format` 传入：

```python
agent = create_agent(
    model="deepseek-chat",
    system_prompt="You are a sci-fi writer creating space capitals.",
    response_format=CapitalInfo
)

response = agent.invoke(
    {"messages": [HumanMessage(content="What is the capital of the Moon?")]}
)

city = response['structured_response']
print(f"{city.name} is located {city.location}. Vibe: {city.vibe}. Economy: {city.economy}.")
```

输出：

```
Lunara is located at the edge of the Aitken Basin on the lunar south pole. Vibe: A serene city blending high-tech with classical Eastern aesthetics, featuring transparent domed gardens and floating architecture. Economy: Helium-3 mining, quantum computing centers, space tourism, lunar agriculture and scientific research.
```

---

## 工具（Tool）—— 双手 <a name="tools--the-hands"></a>

一个 Agent 至少需要两个部分：

- **模型**：大脑（推理、规划）
- **工具**：双手（执行任务、与外部世界交互）

### 定义工具 <a name="defining-tools"></a>

使用 `@tool` 装饰器：

```python
from langchain.tools import tool
from langchain.agents import create_agent
from langchain.messages import HumanMessage

@tool
def get_weather(location: str) -> str:
    """Get the weather in a given location.
    Args:
        location: city name or coordinates
    """
    return f"Current weather in {location} is sunny"

agent = create_agent(model="deepseek-chat", tools=[get_weather])

response = agent.invoke(
    {"messages": [HumanMessage(content="How's the weather in Hangzhou today?")]},
)

for message in response['messages']:
    message.pretty_print()
```

输出：

```
================================ Human Message =================================
How's the weather in Hangzhou today?
================================== Ai Message ==================================
Let me check the weather in Hangzhou for you.
Tool Calls:
  get_weather (call_00_FETE4MIR9p1Gr6uszgjcko6m)
 Call ID: call_00_FETE4MIR9p1Gr6uszgjcko6m
  Args:
    location: 杭州
================================= Tool Message =================================
Name: get_weather

Current weather in 杭州 is sunny
================================== Ai Message ==================================

Based on the query result, the weather in Hangzhou today is sunny. Great weather for outdoor activities!
```

**工作原理：**

1. 用户提问
2. LLM 分析："我不知道天气情况，需要使用 `get_weather` 工具"
3. LLM 返回包含工具名称和参数的 JSON
4. LangChain 解析并调用对应函数
5. 结果返回给 LLM
6. LLM 生成最终回答

```
User Question → LLM Reasoning → Tool Call → Tool Result → LLM Final Answer
```

### 自定义工具 <a name="custom-tools"></a>

默认情况下，工具的元数据来源如下：

| 信息         | 来源         |
| ------------ | ------------ |
| 工具名称     | 函数名       |
| 工具输入     | 函数参数     |
| 工具描述     | 文档字符串   |

可以通过装饰器覆盖：

```python
@tool("square_root", description="Calculate the square root of a number")
def tool1(x: float) -> float:
    return x ** 0.5
```

对于详细的参数约束，使用 Pydantic：

```python
from pydantic import BaseModel, Field
from typing import Literal

class WeatherInput(BaseModel):
    """Input parameters for weather query."""
    location: str = Field(description="City name or coordinates")
    units: Literal["celsius", "fahrenheit"] = Field(
        default="celsius",
        description="Temperature unit preference"
    )
    include_forecast: bool = Field(
        default=False,
        description="Include 5-day forecast"
    )

@tool(args_schema=WeatherInput)
def get_weather(location: str, units: str = "celsius",
                include_forecast: bool = False) -> str:
    """Get current weather and optional forecast."""
    temp = 22 if units == "celsius" else 72
    result = f"Current weather in {location}: {temp}° {units[0].upper()}"
    if include_forecast:
        result += "\nNext 5 days: Sunny"
    return result
```

**注意**：LangChain 工具中有两个保留的参数名——`config` 和 `runtime`。不要将它们用作自定义参数名。

### 预定义工具：Tavily 搜索 <a name="predefined-tools-tavily-search"></a>

LangChain 内置了许多预构建工具。其中很受欢迎的是用于网页搜索的 **Tavily**。

**第一步**：在 [https://www.tavily.com](https://www.tavily.com) 注册，获取 API 密钥。

**第二步**：添加到 `.env`：

```
TAVILY_API_KEY=your_key_here
```

**第三步**：安装依赖：

```bash
uv add langchain-tavily
```

**第四步**：使用：

```python
from langchain_tavily import TavilySearch

tool = TavilySearch(max_results=5, topic="general")
result = tool.invoke("What's the weather in Beijing today?")
print(result)
```

### 工具与 Agent 的结合 <a name="combining-tools-with-an-agent"></a>

```python
from langchain.agents import create_agent
from langchain.messages import HumanMessage
from langchain_tavily import TavilySearch

tavily = TavilySearch(max_results=5, topic="general")

agent = create_agent(
    model="deepseek-chat",
    tools=[tavily],
    system_prompt="You are a helpful assistant. Use tools to answer questions."
)

response = agent.invoke(
    {"messages": [HumanMessage(content="What's the weather forecast for Beijing for the next 5 days?")]}
)

for message in response['messages']:
    message.pretty_print()
```

使用 `stream_mode="updates"`，可以看到每个步骤：

```python
for chunk in agent.stream(
    {"messages": [HumanMessage(content="Calculate the square root of 467 and 529")]},
    stream_mode="updates"
):
    for step, data in chunk.items():
        print(f"step: {step}")
        print(f"content: {data['messages'][-1].content_blocks}")
        print()
```

输出：

```
step: model
content: [{'type': 'text', 'text': 'Let me calculate both square roots.'},
          {'type': 'tool_call', 'name': 'square_root', 'args': {'x': 467}},
          {'type': 'tool_call', 'name': 'square_root', 'args': {'x': 529}}]

step: tools
content: [{'type': 'text', 'text': '21.61018278497431'}]

step: tools
content: [{'type': 'text', 'text': '23.0'}]

step: model
content: [{'type': 'text', 'text': 'Results:\n- √467 ≈ 21.6102\n- √529 = 23.0'}]
```

---

## 记忆（Memory）—— 让 Agent 记住一切 <a name="memory--making-the-agent-remember"></a>

模型默认没有记忆。每次调用都是独立的。

### 短期记忆与长期记忆 <a name="short-term-vs-long-term-memory"></a>

**不要被名称误导！** 短期 ≠ 临时，长期 ≠ 永久。

|            | 短期记忆           | 长期记忆                             |
| ---------- | ------------------ | ------------------------------------ |
| 生命周期   | 当前会话           | 跨会话/跨任务                        |
| 内容       | 当前任务状态       | 知识、经验、偏好                     |
| 跨任务     | ❌                 | ✅                                   |
| 存储       | Redis / 内存       | 数据库 / 向量数据库                  |

**短期记忆** = 当前对话的工作上下文。

**长期记忆** = 跨对话积累的经验与知识。

### 使用 InMemorySaver 实现短期记忆 <a name="short-term-memory-with-inmemorysaver"></a>

LangChain 通过 **Checkpointer** 对象自动管理对话历史。

```python
from langchain.agents import create_agent
from langchain.messages import HumanMessage
from langgraph.checkpoint.memory import InMemorySaver

# 1. Create checkpointer
checkpointer = InMemorySaver()

# 2. Create agent with checkpointer
agent = create_agent(
    model="deepseek-chat",
    checkpointer=checkpointer
)

# 3. Define thread_id to identify the conversation
config = {"configurable": {"thread_id": "thread_1"}}

# 4. First call — tell the AI something
response = agent.invoke(
    {"messages": [HumanMessage(content="Hi, I'm Alex. I love cats.")]},
    config
)

# 5. Second call — ask about previous context
response = agent.invoke(
    {"messages": [HumanMessage(content="What's my favorite animal?")]},
    config  # Same thread_id = same conversation
)

for message in response["messages"]:
    message.pretty_print()
```

输出：

```
================================ Human Message =================================
Hi, I'm Alex. I love cats.
================================== Ai Message ==================================
Hi Alex! Nice to meet you! 🐱 People who love cats have gentle hearts~
================================ Human Message =================================
What's my favorite animal?
================================== Ai Message ==================================
You mentioned you love cats, so your favorite animal is **cats**! 🐱
```

**关键点**：相同的 `thread_id` = 同一对话。不同的 `thread_id` = 隔离的对话。

### 持久化记忆（可选） <a name="persistent-memory-optional"></a>

`InMemorySaver` 在重启后会丢失数据。在生产环境中，应使用持久化的 checkpointer。

**SQLite 示例：**

```bash
uv add langgraph-checkpoint-sqlite
```

```python
import sqlite3
from langgraph.checkpoint.sqlite import SqliteSaver

checkpointer = SqliteSaver(
    sqlite3.connect("checkpoint.db", check_same_thread=False)
)
checkpointer.setup()

agent = create_agent(
    model="deepseek-chat",
    checkpointer=checkpointer,
)
```

其他选项：`PostgresSaver`、`CosmosDBSaver`。

### 记忆管理策略 <a name="memory-management-strategies"></a>

随着对话增长，消息历史可能会超出 LLM 的上下文窗口（例如 DeepSeek 的 128K）。这会导致：

- 上下文丢失（遗忘较早的消息）
- 响应质量下降（"注意力稀释"）
- 响应变慢

三种策略：

| 策略             | 工作原理                             | 优点                        | 缺点                       |
| ---------------- | ------------------------------------ | --------------------------- | -------------------------- |
| **裁剪消息**     | 仅将最近的消息发送给 LLM             | 简单、快速                  | 丢失较早的上下文           |
| **删除消息**     | 从状态中完全移除旧消息               | 永久释放存储空间            | 不可逆                     |
| **摘要消息**     | 对旧消息进行摘要，保留最近消息的原文   | 保留上下文且适应窗口大小    | 需要额外的 LLM 调用来摘要  |

#### SummarizationMiddleware

LangChain 内置的解决方案：

```python
from langchain.agents import create_agent
from langchain.agents.middleware import SummarizationMiddleware
from langgraph.checkpoint.memory import InMemorySaver
from langchain_core.runnables import RunnableConfig

checkpointer = InMemorySaver()

middleware = SummarizationMiddleware(
    model="deepseek-chat",
    trigger=("messages", 3),   # Summarize when messages > 3
    keep=("messages", 1),      # Keep 1 recent message after summarization
)

agent = create_agent(
    model="deepseek-chat",
    middleware=[middleware],
    checkpointer=checkpointer,
)

config: RunnableConfig = {"configurable": {"thread_id": "1"}}

# Build up conversation history
agent.invoke({"messages": "Hi, I'm Alex."}, config)
agent.invoke({"messages": "My favorite sport is ping pong."}, config)
agent.invoke({"messages": "My favorite animal is cats."}, config)

# Test memory with summarization
final_response = agent.invoke({"messages": "Do you remember me?"}, config)

for message in final_response["messages"]:
    message.pretty_print()
```

输出：

```
================================ Human Message =================================
Here is a summary of the conversation to date:
User's name is Alex. Favorite sport is ping pong. Favorite animal is cats.
================================ Human Message =================================
Do you remember me?
================================== Ai Message ==================================
Of course, Alex! You love ping pong and cats. We were chatting about your
favorite sport and pets. Want to continue? 😄
```

---

## 综合实战 <a name="putting-it-all-together"></a>

```python
from langchain.agents import create_agent
from langchain.messages import HumanMessage
from langchain.agents.middleware import SummarizationMiddleware
from langgraph.checkpoint.memory import InMemorySaver
from langchain_tavily import TavilySearch
from pydantic import BaseModel, Field
from langchain.tools import tool

# --- Tools ---
tavily = TavilySearch(max_results=3, topic="general")

@tool
def calculate(expression: str) -> str:
    """Evaluate a math expression. Example: '2 + 3 * 4'."""
    return str(eval(expression))

# --- Structured Output ---
class TravelPlan(BaseModel):
    destination: str = Field(description="Travel destination")
    budget: str = Field(description="Estimated budget")
    activities: list[str] = Field(description="List of recommended activities")

# --- Memory ---
checkpointer = InMemorySaver()
middleware = SummarizationMiddleware(
    model="deepseek-chat",
    trigger=("messages", 10),
    keep=("messages", 4),
)

# --- Agent ---
agent = create_agent(
    model="deepseek-chat",
    tools=[tavily, calculate],
    system_prompt="""
    # Identity
    You are a travel planning assistant.

    # Instructions
    - Use tools to find real-time information
    - Provide budget estimates when asked
    - Be concise and friendly
    """,
    response_format=TravelPlan,
    middleware=[middleware],
    checkpointer=checkpointer,
)

# --- Run ---
config = {"configurable": {"thread_id": "trip_1"}}

response = agent.invoke(
    {"messages": [HumanMessage(content="Plan a 3-day Tokyo trip under $1500")]},
    config
)

plan = response['structured_response']
print(f"Destination: {plan.destination}")
print(f"Budget: {plan.budget}")
print(f"Activities: {', '.join(plan.activities)}")
```

---

## 最佳实践 <a name="best-practices"></a>

| 实践                                   | 重要性                                     |
| -------------------------------------- | ------------------------------------------ |
| 为每个对话使用 `thread_id`             | 防止不同用户之间的记忆泄漏                 |
| 在生产环境中持久化 checkpointer        | 避免重启后丢失对话数据                     |
| 编写清晰的工具文档字符串               | LLM 依赖描述来选择工具                     |
| 使用结构化输出                         | 消除脆弱的文本解析                         |
| 事实性任务设置 `temperature=0`         | 更确定性的输出，减少幻觉                   |
| 长对话使用摘要策略                     | 避免上下文窗口溢出                         |
| 系统提示词使用 Markdown + XML 格式     | 便于 LLM 解析内容边界                      |

---

## 常见问题 <a name="faq"></a>

**问：可以在不修改代码的情况下切换模型吗？**

答：可以，只需更改模型名称。LangChain 会处理其余部分。

```python
# DeepSeek
model = init_chat_model(model="deepseek-chat")

# Qwen
model = init_chat_model(
    model="qwen-max",
    model_provider="openai",
    base_url=os.getenv("DASHSCOPE_BASE_URL"),
    api_key=os.getenv("DASHSCOPE_API_KEY")
)
```

**问：`ChatModel` 和 `LLM` 有什么区别？**

答：`ChatModel` 接收消息列表并返回消息。`LLM` 接收字符串并返回字符串。大多数现代模型使用 Chat 接口。

**问：Agent 可以在一次调用中调用多个工具吗？**

答：可以。LLM 可以同时返回多个工具调用：

```python
# LLM may return both:
# tool_call: square_root(x=467)
# tool_call: square_root(x=529)
```

**问：如果工具执行失败会怎样？**

答：异常会被捕获并作为带有错误信息的 `ToolMessage` 传回给 LLM。LLM 随后决定如何处理（重试、报告错误等）。

**问：InMemorySaver 和持久化 checkpointer 怎么选？**

答：`InMemorySaver` 用于开发阶段。生产环境应使用 `SqliteSaver`、`PostgresSaver` 等，确保数据在重启后仍然存在。

---

## 总结 <a name="summary"></a>

我们涵盖了 LangChain 的五个核心组件：

| 组件        | 角色       | 核心要点                                                |
| ----------- | ---------- | ------------------------------------------------------- |
| **模型**    | 大脑       | 统一 API，轻松切换提供商                                |
| **消息**    | 对话单元   | System/Human/AI/Tool 类型，支持多模态                   |
| **提示词**  | 控制输出   | 系统提示词 + 提示词工程 + 结构化输出                    |
| **工具**    | 双手       | `@tool` 装饰器，自定义 + 预定义，驱动 Agent 行动        |
| **记忆**    | 记住上下文 | 短期（checkpointer）+ 长期（跨会话）                    |

**Agent 公式：**

```
Agent = Model + Tools + Memory + Prompts
```

**后续学习方向：**

- 学习 LangGraph 实现细粒度 Agent 控制
- 构建多 Agent 系统（MAS）
- 添加 RAG 实现领域特定知识
- 使用 LangSmith 部署并进行监控

---

## 参考资料

- [LangChain 官方文档](https://docs.langchain.com)
- [LangChain GitHub](https://github.com/langchain-ai/langchain)
- [LangGraph 文档](https://langchain-ai.github.io/langgraph)
- [Tavily 搜索 API](https://www.tavily.com)
