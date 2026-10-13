---
title: "多模态 AI Agent 应用实战：AI 私厨"
lang: zh-CN
date: 2026-05-11 12:48:28
updated: 2026-06-10 00:00:00
comments: true
categories:
  - Python
  - AI
tags:
  - LangChain
  - LangSmith
  - LangGraph
  - AI Agent
  - LLM
  - MultiModal
---

- [引言](#introduction)
- [我们要构建什么？](#what-are-we-building)
  - [功能概览](#feature-overview)
  - [架构概览](#architecture-overview)
- [实现策略](#implementation-strategy)
  - [模型选择](#model-selection)
  - [工具选择](#tool-selection)
  - [记忆策略](#memory-strategy)
  - [系统提示词设计](#system-prompt-design)
- [在 Jupyter 中制作原型](#prototyping-in-jupyter)
  - [环境配置](#environment-configuration)
  - [依赖](#dependencies)
  - [加载配置](#loading-configuration)
  - [定义工具](#defining-tools)
  - [初始化多模态模型](#initializing-the-multimodal-model)
  - [记忆管理](#memory-management)
  - [创建 Agent](#creating-the-agent)
  - [图片输入测试](#testing-with-image-input)
  - [对话记忆测试](#testing-conversation-memory)
- [使用 LangGraph 与 LangSmith 部署](#deploying-with-langgraph-and-langsmith)
  - [LangSmith 配置](#langsmith-setup)
  - [开发 Agent](#developing-the-agent)
  - [使用 LangGraph CLI 本地部署](#local-deployment-with-langgraph-cli)
  - [在 LangSmith Studio 中测试](#testing-in-langsmith-studio)
  <!--more-->
- [构建生产级应用](#building-the-production-application)
  - [为什么不用 Base64？OSS 方案](#why-not-base64-the-oss-approach)
  - [FastAPI 服务端](#fastapi-server)
  - [阿里云 OSS 配置](#alibaba-cloud-oss-configuration)
  - [添加 Checkpointer](#adding-checkpointer)
  - [实现 API 端点](#implementing-api-endpoints)
  - [端到端测试](#end-to-end-testing)
- [最佳实践](#best-practices)
- [常见问题](#faq)
- [总结](#summary)

---

<a name="introduction"></a>

## 引言

在上一篇文章中，我们介绍了 LangChain 的核心组件：**模型（Models）、消息（Messages）、提示词（Prompts）、工具（Tools）和记忆（Memory）**。每个组件各司其职——模型负责推理，工具负责执行，记忆负责保留上下文。

现在，是时候把它们组合起来了。

这篇文章将完整走一遍构建多模态 AI Agent 应用的过程：**AI 私厨**。你只需拍一张冰箱的照片，Agent 就能识别出食材、搜索菜谱，并按营养价值和烹饪难度进行排序推荐。

我们将从 Jupyter 中的原始原型开始，到用 LangGraph 部署 Agent，最终构建一个生产级的 FastAPI 应用，并使用阿里云 OSS 处理文件上传。

<a name="what-are-we-building"></a>

## 我们要构建什么？

AI 私厨是一个由多模态 AI 驱动的菜谱推荐 Agent。用户上传一张食材照片（或直接输入食材清单），Agent 会：

1. 从图片中识别食材
2. 在网上搜索匹配的菜谱
3. 按营养和难度对菜谱进行评分排序
4. 返回结构化的推荐报告

<a name="feature-overview"></a>

### 功能概览

| 功能           | 描述                                   |
| -------------- | -------------------------------------- |
| 📸 图像识别    | 上传美食照片，自动识别食材             |
| 🔍 智能搜索    | 基于识别出的食材搜索菜谱               |
| 🍽️ 智能排序    | 按营养评分和难度对菜谱排序             |
| 💡 创意建议    | 没有精确匹配时，给出创意搭配建议       |
| 💬 聊天界面    | 支持图片 + 文字输入的对话式 UI         |

<a name="architecture-overview"></a>

### 架构概览

整个应用遵循一条清晰的流水线：

```
User (image + text)
       ↓
   Multimodal Model (qwen3.5-plus)
       ↓
  Identify Ingredients
       ↓
   Tavily Web Search
       ↓
 Score & Rank Recipes
       ↓
 Structured Report Output
```

在生产部署中，架构会扩展为包含文件上传和持久化：

```
Frontend (Next.js)
       ↓
FastAPI Gateway (port 8001)
  ├── POST /chat/stream    →  Stream agent responses
  ├── GET  /chat/messages   →  Fetch conversation history
  ├── DELETE /chat/messages →  Clear conversation history
  └── POST /oss/upload-url  →  Generate OSS presigned URL
       ↓
Alibaba Cloud OSS  ←  Frontend uploads files directly
       ↓
LangChain Agent (model + tools + memory)
```

<a name="implementation-strategy"></a>

## 实现策略

在写任何代码之前，先把关键的设计决策确定下来。

<a name="model-selection"></a>

### 模型选择

由于 Agent 必须处理图片，我们需要一个支持图像输入的**多模态模型**。一个不错的选择是阿里云 DashScope 平台的 **qwen3.5-plus**——它支持图像、文本、音频和视频。

我们通过 DashScope 提供的 OpenAI 兼容 API 访问它，使用 `init_chat_model` 并设置 `model_provider="openai"`。

<a name="tool-selection"></a>

### 工具选择

Agent 需要在网上搜索菜谱。**Tavily** 是一个为 AI Agent 优化的搜索 API——它返回结构化结果，便于模型解析。

LangChain 通过 `langchain-tavily` 提供了内置集成。

<a name="memory-strategy"></a>

### 记忆策略

在原型阶段，我们使用 **SqliteSaver** 作为 checkpointer（检查点持久化组件）来保存对话记忆。每个会话由一个 `thread_id` 标识。

使用 LangGraph 部署时，记忆会自动处理——无需自己添加 checkpointer。

<a name="system-prompt-design"></a>

### 系统提示词设计

系统提示词是影响 Agent 行为的最重要因素。经过测试，下面这个版本效果很好：

```python
system_prompt = """
You are a private chef. When receiving a user's ingredient photo or list, follow these steps:
1. Identify and evaluate ingredients: If the user provides a photo, identify all visible ingredients first. Assess freshness and available quantity based on appearance, then compile a "Current Available Ingredients List".
2. Smart recipe search: Prioritize calling the web_search tool using the "Available Ingredients List" as core keywords to find feasible recipes.
3. Multi-dimensional evaluation and ranking: Score candidate recipes from two dimensions — nutritional value and preparation difficulty — then rank by score. Simpler and more nutritious recipes rank higher.
4. Structured output: Organize the ranked recipes into a clear recommendation report including recipe information, scores, reasons for recommendation, and reference images.

Strictly follow the process. Prioritize calling the web_search tool to search for recipes. Only improvise when search returns no results.
"""
```

关键设计要点：

- **分步指令** —— 模型遵循清晰的流水线，而不是随意发挥
- **工具优先** —— 明确告诉 Agent 先搜索，不要靠猜
- **结构化输出** —— 要求报告格式，让结果可读

<a name="prototyping-in-jupyter"></a>

## 在 Jupyter 中制作原型

先在 Jupyter notebook 里验证 Agent 逻辑。

<a name="environment-configuration"></a>

### 环境配置

在项目根目录创建 `.env` 文件：

```properties
# Alibaba Cloud DashScope
DASHSCOPE_API_KEY=sk-your-dashscope-api-key
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# Tavily Web Search
TAVILY_API_KEY=tvly-dev-your-tavily-api-key
```

<a name="dependencies"></a>

### 依赖

把以下内容加入 `pyproject.toml`：

```toml
[project]
name = "food-recipe-recommender"
version = "0.1.0"
description = "AI-powered recipe recommender based on uploaded food images"
readme = "README.md"
requires-python = ">=3.10"
dependencies = [
    "langchain>=0.3.0",
    "langchain-community>=0.3.0",
    "langchain-openai>=0.2.0",
    "langchain-core>=0.3.0",
    "streamlit>=1.40.0",
    "pillow>=11.0.0",
    "python-dotenv>=1.0.0",
    "tavily-python>=0.5.0",
    "langchain-tavily>=0.1.0",
    "fastapi>=0.109.0",
    "uvicorn>=0.27.0",
    "python-multipart>=0.0.6",
    "alibabacloud-oss-v2>=1.2.4",
    "langgraph-checkpoint-sqlite>=3.0.3",
]

[tool.uv]
dev-dependencies = [
    "pytest>=8.0.0",
    "black>=24.0.0",
]
```

<a name="loading-configuration"></a>

### 加载配置

```python
# Load environment variables
from dotenv import load_dotenv

load_dotenv()
```

<a name="defining-tools"></a>

### 定义工具

```python
from langchain_tavily import TavilySearch

# Web search tool using Tavily
web_search = TavilySearch(
    max_results=5,
    topic="general",
)
```

就这么简单——一行代码定义一个网络搜索工具。Tavily 负责 API 调用、结果解析和格式化。

<a name="initializing-the-multimodal-model"></a>

### 初始化多模态模型

```python
from langchain.chat_models import init_chat_model
import os

model = init_chat_model(
    model="qwen3.5-plus",       # Multimodal model supporting images
    model_provider="openai",     # DashScope is OpenAI-compatible
    base_url=os.getenv("DASHSCOPE_BASE_URL"),
    api_key=os.getenv("DASHSCOPE_API_KEY")
)
```

由于 DashScope 不是 LangChain 原生的 provider，我们设置 `model_provider="openai"` 来使用 OpenAI 兼容的 API 格式，并手动提供 `base_url` 和 `api_key`。

<a name="memory-management"></a>

### 记忆管理

```python
from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3

# Connect to SQLite
connection = sqlite3.connect("resources/personal_chief.db", check_same_thread=False)
# Initialize checkpointer
checkpointer = SqliteSaver(connection)
# Auto-create tables
checkpointer.setup()
```

<a name="creating-the-agent"></a>

### 创建 Agent

```python
from langchain.agents import create_agent

system_prompt = """
You are a private chef. When receiving a user's ingredient photo or list, follow these steps:
1. Identify and evaluate ingredients: If the user provides a photo, identify all visible ingredients first. Assess freshness and available quantity based on appearance, then compile a "Current Available Ingredients List".
2. Smart recipe search: Prioritize calling the web_search tool using the "Available Ingredients List" as core keywords to find feasible recipes.
3. Multi-dimensional evaluation and ranking: Score candidate recipes from two dimensions — nutritional value and preparation difficulty — then rank by score. Simpler and more nutritious recipes rank higher.
4. Structured output: Organize the ranked recipes into a clear recommendation report including recipe information, scores, reasons for recommendation, and reference images.

Strictly follow the process. Prioritize calling the web_search tool to search for recipes. Only improvise when search returns no results.
"""

agent = create_agent(
    model=model,
    tools=[web_search],
    system_prompt=system_prompt,
    checkpointer=checkpointer
)
```

<a name="testing-with-image-input"></a>

### 图片输入测试

用一张网上的冰箱照片来测试：

```python
from langchain.messages import HumanMessage

# Prepare multimodal message — online image URL + text prompt
multimodal_message = HumanMessage(
    content=[
        {"type": "image",
         "url": "https://img.freepik.com/free-photo/arrangement-different-foods-organized-fridge_23-2149099882.jpg"},
        {"type": "text", "text": "What can I make with these ingredients?"}
    ])

config = {"configurable": {"thread_id": "6"}}

response = agent.invoke({"messages": [multimodal_message]}, config)

# Friendly print
for message in response['messages']:
    message.pretty_print()
```

Agent 识别出食材（蘑菇、番茄、三文鱼、鸡胸肉、西兰花、生菜、红椒、胡萝卜、花菜），搜索菜谱，并返回排序后的结果：

```
================================ Human Message =================================
[{'type': 'image', 'url': 'https://img.freepik.com/...'}, {'type': 'text', 'text': 'What can I make with these ingredients?'}]
================================== Ai Message ==================================
These ingredients are very rich... I will search for recipes based on these ingredients.
Tool Calls:
  tavily_search (call_5f30eac22b4b4f8c8b7927)
  Args:
    query: recipes with mushrooms, tomatoes, salmon, chicken breast, broccoli...
================================= Tool Message =================================
Name: tavily_search
{"query": "recipes with mushrooms, tomatoes, salmon...", "results": [...]}
================================== Ai Message ==================================
### 1. Salmon Broccoli Roast
- Ingredients: salmon, broccoli, red pepper, mushrooms, carrots
- Nutritional value: 9/10, Difficulty: 3/10
- ...

### 2. Chicken Broccoli Fried Rice
- Ingredients: chicken breast, broccoli, mushrooms, red pepper, carrots
- ...
```

<a name="testing-conversation-memory"></a>

### 对话记忆测试

现在追问一个问题：

```python
response = agent.invoke(
    {"messages": [HumanMessage(content="I like the first recipe. Can you give me more details?")]},
    config
)

response['messages'][-1].pretty_print()
```

Agent 记得之前的对话，并围绕第一个菜谱展开详细步骤、技巧和营养信息——这证明 checkpointer 正常工作。

<a name="deploying-with-langgraph-and-langsmith"></a>

## 使用 LangGraph 与 LangSmith 部署

原型跑通了。现在来专业地部署它。

LangChain Agent 底层构建在 **LangGraph** 之上，它自带服务器部署能力和完整的 REST API——无需额外工作。而 **LangSmith** 提供了用于调试、监控和一键云端部署的图形界面。

<a name="langsmith-setup"></a>

### LangSmith 配置

1. 在 [smith.langchain.com](https://smith.langchain.com) 注册
2. 进入 **Settings → API Keys** 创建一个 key
3. 添加到 `.env`：

```properties
# LangSmith
LANGSMITH_API_KEY=lsv2_pt_your-langsmith-api-key
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=lc-course
```

就这样——不需要任何额外代码。LangChain 会自动把 trace 发送到 LangSmith。

<a name="developing-the-agent"></a>

### 开发 Agent

创建 `app/agents/personal_chief.py`：

```python
from langchain.chat_models import init_chat_model
from langchain_tavily import TavilySearch
from langchain.agents import create_agent
import os

# 1. Load environment variables
from dotenv import load_dotenv
load_dotenv()

# 2. Web search tool
web_search = TavilySearch(
    max_results=5,
    topic="general"
)

# 3. Multimodal model
model = init_chat_model(
    model="qwen3.5-plus",
    model_provider="openai",
    base_url=os.getenv("DASHSCOPE_BASE_URL"),
    api_key=os.getenv("DASHSCOPE_API_KEY")
)

# 4. System prompt
system_prompt = """
You are a private chef. When receiving a user's ingredient photo or list, follow these steps:
1. Identify and evaluate ingredients: If the user provides a photo, identify all visible ingredients first. Based on their appearance, assess freshness and available quantity, then compile a "Current Available Ingredients List".
2. Smart recipe search: Prioritize calling the web_search tool using the "Available Ingredients List" as core keywords to find feasible recipes.
3. Multi-dimensional evaluation and ranking: Score candidate recipes on two dimensions — nutritional value and preparation difficulty — then rank by score. Simpler and more nutritious recipes rank higher.
4. Structured output: Organize the ranked recipes into a clear recommendation report including recipe information, scores, reasons for recommendation, and reference images.

Strictly follow the process. Prioritize calling the web_search tool. Only improvise when search returns no results.
"""

# 5. Create agent
agent = create_agent(
    model=model,
    tools=[web_search],
    system_prompt=system_prompt
)
```

与 Jupyter 原型的两个重要区别：

- **没有 checkpointer** —— LangGraph 会自动管理记忆
- **职责分离** —— Agent 定义独立成模块

<a name="local-deployment-with-langgraph-cli"></a>

### 使用 LangGraph CLI 本地部署

安装 LangGraph CLI：

```bash
uv add langgraph-cli[inmem]
```

在项目根目录创建 `langgraph.json`：

```json
{
  "dependencies": ["."],
  "graphs": {
    "chief_agent": "./app/agents/personal_chief.py:agent"
  },
  "env": ".env"
}
```

graph 配置格式为 `[file_path]:[variable_name]`。这里 `agent` 是 `personal_chief.py` 中的变量名。

启动服务器：

```bash
uv run langgraph dev
```

你会看到确认 Agent 正在运行的输出。LangGraph 提供了完整的 REST API——访问 `http://127.0.0.1:2024/docs` 可以浏览所有端点。

<a name="testing-in-langsmith-studio"></a>

### 在 LangSmith Studio 中测试

由于我们已经配置了 LangSmith，打开：

```
https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024
```

LangSmith Studio 提供了一个 GUI 聊天界面，可以交互式地测试你的 Agent。你可以：

- **与 Agent 对话** —— 直接发送消息和图片
- **查看执行 trace** —— 看到每一次模型调用、工具调用和中间步骤
- **调试问题** —— 精确定位 Agent 出错的环节

LangSmith 也提供一键云端部署，但需要付费套餐。对大多数开发者来说，开发阶段用 LangSmith 做测试和调试就足够了——生产环境部署到别处。

<a name="building-the-production-application"></a>

## 构建生产级应用

LangGraph 部署非常适合测试，但真实用户需要定制的前端和完善的文件处理。还剩两个问题：

1. **图片处理**：把图片 Base64 编码进消息里，内存开销大、速度慢
2. **用户体验**：没有定制的前端

<a name="why-not-base64-the-oss-approach"></a>

### 为什么不用 Base64？OSS 方案

给多模态模型发送图片有两种方式：

| 方案     | 工作原理                                 | 优点                                   | 缺点                                      |
| -------- | ---------------------------------------- | -------------------------------------- | ----------------------------------------- |
| Base64   | 把图片字节编码进消息                     | 简单，无需外部服务                     | 内存占用高、消息臃肿、速度慢              |
| OSS URL  | 把图片上传到对象存储，发送 URL           | 消息干净、CDN 友好、可扩展             | 需要配置 OSS                              |

标准的生产方案：

1. 前端向服务端请求一个预签名上传 URL
2. 前端把文件直接上传到 OSS（不占用服务端带宽）
3. 前端把 OSS URL 发给 Agent

```
Frontend → Server (request upload URL)
Frontend → OSS (upload file directly)
Frontend → Server (send message with OSS URL)
Server   → Agent (process with image URL)
```

<a name="fastapi-server"></a>

### FastAPI 服务端

生产服务端暴露以下端点：

| 方法   | 路径              | 描述                              |
| ------ | ----------------- | --------------------------------- |
| POST   | `/chat/stream`    | 流式返回 Agent 响应（SSE）        |
| GET    | `/chat/messages`  | 获取对话历史                      |
| DELETE | `/chat/messages`  | 清空对话历史                      |
| POST   | `/oss/upload-url` | 生成 OSS 预签名上传 URL           |

项目结构：

```
app/
├── main.py                    # FastAPI entry point
├── agents/
│   └── personal_chief.py      # Agent logic
├── api/
│   └── v1/
│       ├── chat.py            # Chat endpoints
│       └── oss.py             # OSS upload signing
├── models/
│   └── schemas.py             # Pydantic request/response models
├── common/
│   └── logger.py              # Logging configuration
└── static/                    # Compiled frontend assets
    ├── index.html
    └── _next/
```

<a name="alibaba-cloud-oss-configuration"></a>

### 阿里云 OSS 配置

配置 OSS 分三步：

**第 1 步：注册并创建 Bucket**

1. 打开 [oss.console.aliyun.com](https://oss.console.aliyun.com/overview)
2. 如果还没开通 OSS，先开通（按量付费，非常便宜）
3. 创建一个名称唯一的 Bucket

**第 2 步：配置权限**

开发阶段，把 Bucket 设为**公共读**，这样上传的图片可以直接通过 URL 访问：

> ⚠️ **重要**：生产环境中，Bucket 必须保持**私有**，通过 CDN 或签名 URL 访问。公共读只用于测试——测试完记得关闭！

同时配置 **CORS 规则**，允许你的前端域名上传。

**第 3 步：创建 API 凭证**

1. 打开 [RAM 访问控制](https://ram.console.aliyun.com/overview)
2. 创建一个具有**编程访问**权限的新用户
3. 保存 **AccessKey ID** 和 **AccessKey Secret**
4. 给该用户授予 `AliyunOSSFullAccess` 权限
5. 把凭证添加到 `.env`：

```properties
# Alibaba Cloud OSS
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_BUCKET=your-bucket-name
```

<a name="adding-checkpointer"></a>

### 添加 Checkpointer

由于我们不再使用 LangGraph 的托管部署，需要自己处理记忆。添加 SqliteSaver checkpointer：

```python
from langchain.chat_models import init_chat_model
from langchain_tavily import TavilySearch
from langchain.agents import create_agent
import os
from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Web search tool
web_search = TavilySearch(
    max_results=5,
    topic="general"
)

# Multimodal model
model = init_chat_model(
    model="qwen3.5-plus",
    model_provider="openai",
    base_url=os.getenv("DASHSCOPE_BASE_URL"),
    api_key=os.getenv("DASHSCOPE_API_KEY")
)

# Initialize checkpointer
connection = sqlite3.connect("db/personal_chief.db", check_same_thread=False)
checkpointer = SqliteSaver(connection)
checkpointer.setup()

# System prompt
system_prompt = """
You are a private chef. When receiving a user's ingredient photo or list, follow these steps:
1. Identify and evaluate ingredients: If the user provides a photo, identify all visible ingredients first. Based on appearance, assess freshness and available quantity, then compile a "Current Available Ingredients List".
2. Smart recipe search: Prioritize calling the web_search tool using the "Available Ingredients List" as core keywords to find feasible recipes.
3. Multi-dimensional evaluation and ranking: Score candidate recipes on two dimensions — nutritional value and preparation difficulty — then rank by score. Simpler and more nutritious recipes rank higher.
4. Structured output: Organize the ranked recipes into a clear recommendation report including recipe information, scores, reasons for recommendation, and reference images.

Strictly follow the process. Prioritize calling the web_search tool. Only improvise when search returns no results.
"""

# Create agent with checkpointer
agent = create_agent(
    model=model,
    tools=[web_search],
    checkpointer=checkpointer,
    system_prompt=system_prompt
)
```

<a name="implementing-api-endpoints"></a>

### 实现 API 端点

现在在 `agents/personal_chief.py` 中实现三个核心功能：

```python
from langchain_core.messages import HumanMessage, AIMessageChunk, AIMessage
from langchain_tavily import TavilySearch
from langchain.agents import create_agent
from app.common.logger import logger
import os
from langgraph.checkpoint.sqlite import SqliteSaver
import sqlite3

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Web search tool
tavily = TavilySearch(
    max_results=5,
    topic="general"
)

# Multimodal model
model = init_chat_model(
    model="qwen3-omni-flash",
    model_provider="openai",
    base_url=os.getenv("DASHSCOPE_BASE_URL"),
    api_key=os.getenv("DASHSCOPE_API_KEY")
)

# Checkpointer
checkpointer = SqliteSaver(sqlite3.connect("db/personal_chief.db", check_same_thread=False))
checkpointer.setup()

# System prompt
system_prompt = """
You are a private chef. When receiving a user's ingredient photo or list, follow these steps:
1. Identify and evaluate ingredients: If the user provides a photo, identify all visible ingredients first. Based on appearance, assess freshness and available quantity, then compile a "Current Available Ingredients List".
2. Smart recipe search: Prioritize calling the web_search tool using the "Available Ingredients List" as core keywords to find feasible recipes.
3. Multi-dimensional evaluation and ranking: Score candidate recipes on two dimensions — nutritional value and preparation difficulty — then rank by score. Simpler and more nutritious recipes rank higher.
4. Structured output: Organize the ranked recipes into a clear recommendation report including recipe information, scores, reasons for recommendation, and reference images.

Strictly follow the process. Prioritize calling the web_search tool. Only improvise when search returns no results.
"""

# Create agent
agent = create_agent(
    model=model,
    tools=[tavily],
    checkpointer=checkpointer,
    system_prompt=system_prompt
)


# Stream chat
async def search_recipes(prompt: str, image: str, thread_id: str):
    """Call agent to search for recipes"""
    logger.info(f"[User]: {prompt}, image: {image}, thread_id: {thread_id}")
    try:
        # Different message format depending on whether image is provided
        if not image or image.strip() == "":
            message = HumanMessage(content=prompt)
        else:
            message = HumanMessage(content=[
                {"type": "image", "url": image},
                {"type": "text", "text": prompt}
            ])

        # Stream agent response
        for chunk, metadata in agent.stream(
            {"messages": [message]},
            {"configurable": {"thread_id": thread_id}},
            stream_mode="messages"
        ):
            if isinstance(chunk, AIMessageChunk) and chunk.content:
                yield chunk.content

    except Exception as e:
        logger.error(f"\n[Error]: {str(e)}")
        yield "Search failed. Try typing your ingredient list manually?"


# Clear conversation
def clear_messages(thread_id: str):
    """Clear conversation history"""
    logger.info(f"Clearing history, thread_id: {thread_id}")
    checkpointer.delete_thread(thread_id)


# Get conversation history
def get_messages(thread_id: str) -> list[dict[str, str]]:
    """Get conversation history"""
    logger.info(f"Fetching history, thread_id: {thread_id}")

    # Query checkpoint by thread_id
    checkpoint = checkpointer.get({"configurable": {"thread_id": thread_id}})

    if not checkpoint:
        return []

    channel_values = checkpoint.get("channel_values")
    if not channel_values:
        return []

    messages = channel_values.get("messages", [])
    if not messages:
        return []

    # Convert message format
    result = []
    for msg in messages:
        if not msg.content:
            continue

        if isinstance(msg, HumanMessage):
            result.append({"role": "user", "content": msg.content})
        elif isinstance(msg, AIMessage):
            result.append({"role": "assistant", "content": msg.content})

    return result
```

然后把它们接入 `api/v1/chat.py` 的 FastAPI 路由：

```python
from fastapi import APIRouter
from app.models.schemas import ChatRequest
from fastapi.responses import StreamingResponse
from app.agents.personal_chief import search_recipes, get_messages, clear_messages

router = APIRouter()


@router.post("/chat/stream")
async def chat_endpoint(request: ChatRequest):
    """Stream chat response"""
    return StreamingResponse(
        search_recipes(request.message, request.image_url, request.thread_id),
        media_type="text/event-stream"
    )


@router.get("/chat/messages")
async def get_chat_messages(thread_id: str):
    """Get conversation history"""
    messages = get_messages(thread_id)
    return {"messages": messages}


@router.delete("/chat/messages")
async def clear_chat_messages(thread_id: str):
    """Clear conversation history"""
    clear_messages(thread_id)
    return {"success": True}
```

<a name="end-to-end-testing"></a>

### 端到端测试

启动服务器：

```bash
python -m app.main
```

访问 `http://localhost:8001`。你应该能够：

1. 上传一张食材照片（会先传到 OSS）
2. 看到图片预览
3. 发送消息并收到流式返回的菜谱推荐
4. 通过追问继续对话

实际效果请看下面的演示：

<!--
![pic1](img1.png) -->

<!-- <video controls width="100%" preload="metadata" poster="/A-Multimodal-AI-Agent-Application-AI-Private-Chef/img1.png">
  <source src="/A-Multimodal-AI-Agent-Application-AI-Private-Chef/aichief.mp4" type="video/mp4">
  你的浏览器不支持 MP4 播放
</video> -->

<!-- <video
  controls
  preload="metadata"
  poster="/videos/img1.png"
  width="100%">

  <source src="/videos/aichief.mp4" type="video/mp4">
</video> -->

<video controls style="width:100%;" preload="metadata">
<source src="/videos/aichief.mp4" type="video/mp4">
</video>

<a name="best-practices"></a>

## 最佳实践

| 领域             | 建议                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| **图片处理**     | 先上传到 OSS，把 URL 发给模型——永远不要把 base64 塞进消息里                                                       |
| **记忆**         | 开发用 SqliteSaver，生产用 PostgresSaver                                                                          |
| **系统提示词**   | 明确工具的优先级——告诉 Agent 先搜索、后猜测                                                                       |
| **工具设计**     | 工具描述保持简洁；像 TavilySearch 这样的复杂工具可以包装成更简单的 `@tool` 函数                                   |
| **OSS 安全**     | 上传用预签名 URL；生产环境 Bucket 保持私有；开发阶段配置 CORS 规则                                                |
| **LangSmith**    | 开发阶段用它做 trace 和调试；生产环境关闭 `LANGSMITH_TRACING` 以减少开销                                          |
| **错误处理**     | 在流式生成器中捕获异常，返回用户友好的兜底消息                                                                    |

<a name="faq"></a>

## 常见问题

**问：为什么选 qwen3.5-plus 而不是 GPT-4o 或 Claude？**
答：qwen3.5-plus 是可以通过阿里云 DashScope API 使用的强大多模态模型。对中文场景来说性价比很高，并且开箱即用地支持图像。你可以轻松换用其他模型——只需修改 `init_chat_model` 的 `model` 参数。

**问：可以不用 Tavily，换别的搜索工具吗？**
答：可以。LangChain 支持多种搜索集成（SerpAPI、Google Search 等）。推荐 Tavily 是因为它为 AI Agent 做了优化——结果干净、结构化，还带相关性评分。

**问：对话太长会发生什么？**
答：上下文窗口有限制。对于长对话，可以使用 LangChain 的 `SummarizationMiddleware` 自动摘要旧消息，同时保留最近的消息。详见 LangChain 关于记忆管理策略的文档。

**问：为什么不直接用 LangGraph cloud 部署？**
答：LangGraph 云端部署方便但昂贵。生产环境下，把 FastAPI 服务器部署在自己的基础设施上（配合 Docker），可控性更强、成本更低。

**问：OSS Bucket 设成公共读真的安全吗？**
答：不安全！公共读意味着任何人都能访问上传的文件。只在开发阶段使用。生产环境中，Bucket 保持私有，通过 CDN 分发文件或生成限时签名 URL。

<a name="summary"></a>

## 总结

我们从零构建了一个完整的多模态 AI Agent：

1. **原型** —— 在 Jupyter 中用 `create_agent`、多模态模型、Tavily 搜索和 SqliteSaver 验证了整条流水线
2. **LangGraph 部署** —— 用 `langgraph dev` 部署，并通过 LangSmith Studio 测试
3. **生产应用** —— 构建了带 OSS 文件上传、流式响应和持久化记忆的 FastAPI 网关

关键要点：

- 一个能用的 Agent 只需要**模型 + 工具 + 提示词 + 记忆**——仅此而已
- **系统提示词**是控制 Agent 行为最有影响力的杠杆
- **OSS 上传**是生产环境处理图片的正确方式——而不是 base64
- **LangSmith** 对开发阶段的调试极其有价值，但生产环境你需要自己的部署
