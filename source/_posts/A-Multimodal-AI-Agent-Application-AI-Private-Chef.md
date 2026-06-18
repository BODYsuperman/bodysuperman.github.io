---
title: "A Multimodal AI Agent Application: AI Private Chef"
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

- [Introduction](#introduction)
- [What Are We Building?](#what-are-we-building)
  - [Feature Overview](#feature-overview)
  - [Architecture Overview](#architecture-overview)
- [Implementation Strategy](#implementation-strategy)
  - [Model Selection](#model-selection)
  - [Tool Selection](#tool-selection)
  - [Memory Strategy](#memory-strategy)
  - [System Prompt Design](#system-prompt-design)
- [Prototyping in Jupyter](#prototyping-in-jupyter)
  - [Environment Configuration](#environment-configuration)
  - [Dependencies](#dependencies)
  - [Loading Configuration](#loading-configuration)
  - [Defining Tools](#defining-tools)
  - [Initializing the Multimodal Model](#initializing-the-multimodal-model)
  - [Memory Management](#memory-management)
  - [Creating the Agent](#creating-the-agent)
  - [Testing with Image Input](#testing-with-image-input)
  - [Testing Conversation Memory](#testing-conversation-memory)
- [Deploying with LangGraph and LangSmith](#deploying-with-langgraph-and-langsmith)
  - [LangSmith Setup](#langsmith-setup)
  - [Developing the Agent](#developing-the-agent)
  - [Local Deployment with LangGraph CLI](#local-deployment-with-langgraph-cli)
  - [Testing in LangSmith Studio](#testing-in-langsmith-studio)
  <!--more-->
- [Building the Production Application](#building-the-production-application)
  - [Why Not Base64? The OSS Approach](#why-not-base64-the-oss-approach)
  - [FastAPI Server](#fastapi-server)
  - [Alibaba Cloud OSS Configuration](#alibaba-cloud-oss-configuration)
  - [Adding Checkpointer](#adding-checkpointer)
  - [Implementing API Endpoints](#implementing-api-endpoints)
  - [End-to-End Testing](#end-to-end-testing)
- [Best Practices](#best-practices)
- [FAQ](#faq)
- [Summary](#summary)

---

## Introduction

In the previous post, we covered LangChain's core components: **Models, Messages, Prompts, Tools, and Memory**. Each component plays a specific role — models reason, tools execute, memory retains context.

Now it's time to put them together.

This post walks through building a complete multimodal AI agent application: **AI Private Chef**. You'll take a photo of your fridge, and the agent identifies the ingredients, searches for recipes, and ranks them by nutrition and ease of cooking.

We'll go from a raw Jupyter prototype to a LangGraph-deployed agent, and finally to a production-ready FastAPI application with Alibaba Cloud OSS for file uploads.

## What Are We Building?

AI Private Chef is a recipe recommendation agent powered by multimodal AI. The user uploads a photo of ingredients (or types a list), and the agent:

1. Identifies ingredients from the image
2. Searches the web for matching recipes
3. Scores and ranks recipes by nutrition and difficulty
4. Returns a structured recommendation report

### Feature Overview

| Feature                 | Description                                         |
| ----------------------- | --------------------------------------------------- |
| 📸 Image Recognition    | Upload a food photo, auto-identify ingredients      |
| 🔍 Smart Search         | Search recipes based on identified ingredients      |
| 🍽️ Smart Ranking        | Sort recipes by nutrition score and difficulty      |
| 💡 Creative Suggestions | Suggest creative pairings when no exact match found |
| 💬 Chat Interface       | Conversational UI supporting image + text input     |

### Architecture Overview

The application follows a straightforward pipeline:

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

For the production deployment, the architecture expands to include file uploads and persistence:

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

## Implementation Strategy

Before writing any code, let's pin down the key design decisions.

### Model Selection

Since the agent must process images, we need a **multimodal model** that supports image input. A good choice is **qwen3.5-plus** from Alibaba Cloud's DashScope platform — it supports images, text, audio, and video.

We access it through the OpenAI-compatible API provided by DashScope, using `init_chat_model` with `model_provider="openai"`.

### Tool Selection

The agent needs to search recipes on the web. **Tavily** is a search API optimized for AI agents — it returns structured results that are easy for models to parse.

LangChain provides built-in integration via `langchain-tavily`.

### Memory Strategy

For the prototype, we use **SqliteSaver** as the checkpointer to persist conversation memory. Each conversation is identified by a `thread_id`.

When deploying with LangGraph, memory is handled automatically — no need to add a checkpointer yourself.

### System Prompt Design

The system prompt is the single most important factor in agent behavior. After testing, here's what works well:

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

Key design points:

- **Step-by-step instructions** — the model follows a clear pipeline rather than improvising
- **Prioritize tool use** — explicitly tell the agent to search first, not guess
- **Structured output** — request a report format so results are readable

## Prototyping in Jupyter

Let's validate the agent logic in a Jupyter notebook first.

### Environment Configuration

Create a `.env` file in your project root:

```properties
# Alibaba Cloud DashScope
DASHSCOPE_API_KEY=sk-your-dashscope-api-key
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# Tavily Web Search
TAVILY_API_KEY=tvly-dev-your-tavily-api-key
```

### Dependencies

Add these to your `pyproject.toml`:

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

### Loading Configuration

```python
# Load environment variables
from dotenv import load_dotenv

load_dotenv()
```

### Defining Tools

```python
from langchain_tavily import TavilySearch

# Web search tool using Tavily
web_search = TavilySearch(
    max_results=5,
    topic="general",
)
```

That's it — one line to define a web search tool. Tavily handles the API calls, result parsing, and formatting.

### Initializing the Multimodal Model

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

Since DashScope is not a LangChain-native provider, we set `model_provider="openai"` to use the OpenAI-compatible API format, and manually provide `base_url` and `api_key`.

### Memory Management

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

### Creating the Agent

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

### Testing with Image Input

Let's test with a fridge photo from the web:

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

The agent identifies ingredients (mushrooms, tomatoes, salmon, chicken breast, broccoli, lettuce, red pepper, carrots, cauliflower), searches for recipes, and returns ranked results:

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

### Testing Conversation Memory

Now ask a follow-up question:

```python
response = agent.invoke(
    {"messages": [HumanMessage(content="I like the first recipe. Can you give me more details?")]},
    config
)

response['messages'][-1].pretty_print()
```

The agent remembers the previous conversation and expands on the first recipe with detailed steps, tips, and nutritional information — proof that the checkpointer is working.

## Deploying with LangGraph and LangSmith

The prototype works. Now let's deploy it professionally.

LangChain agents are built on **LangGraph** under the hood, which provides built-in server deployment with a full REST API — no extra work needed. And **LangSmith** adds a GUI for debugging, monitoring, and one-click cloud deployment.

### LangSmith Setup

1. Register at [smith.langchain.com](https://smith.langchain.com)
2. Go to **Settings → API Keys** and create a key
3. Add to `.env`:

```properties
# LangSmith
LANGSMITH_API_KEY=lsv2_pt_your-langsmith-api-key
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=lc-course
```

That's it — no additional code needed. LangChain will automatically send traces to LangSmith.

### Developing the Agent

Create `app/agents/personal_chief.py`:

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

Two important differences from the Jupyter prototype:

- **No checkpointer** — LangGraph manages memory automatically
- **Clean separation** — the agent definition lives in its own module

### Local Deployment with LangGraph CLI

Install the LangGraph CLI:

```bash
uv add langgraph-cli[inmem]
```

Create `langgraph.json` in the project root:

```json
{
  "dependencies": ["."],
  "graphs": {
    "chief_agent": "./app/agents/personal_chief.py:agent"
  },
  "env": ".env"
}
```

The graph config format is `[file_path]:[variable_name]`. Here `agent` is the variable name in `personal_chief.py`.

Launch the server:

```bash
uv run langgraph dev
```

You should see output confirming the agent is running. LangGraph provides a full REST API — visit `http://127.0.0.1:2024/docs` to explore the endpoints.

### Testing in LangSmith Studio

Since we configured LangSmith, open:

```
https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024
```

LangSmith Studio gives you a GUI chat interface to test your agent interactively. You can:

- **Chat with the agent** — send messages and images directly
- **Inspect execution traces** — see every model call, tool invocation, and intermediate step
- **Debug issues** — trace exactly where the agent goes wrong

LangSmith also offers one-click cloud deployment, but it requires a paid plan. For most developers, using LangSmith for testing and debugging during development is sufficient — deploy elsewhere for production.

## Building the Production Application

The LangGraph deployment is great for testing, but real users need a custom frontend and proper file handling. Two issues remain:

1. **Image handling**: Base64 encoding images into messages is memory-heavy and slow
2. **User experience**: No custom frontend

### Why Not Base64? The OSS Approach

When sending images to multimodal models, you have two options:

| Approach | How It Works                             | Pros                                   | Cons                                      |
| -------- | ---------------------------------------- | -------------------------------------- | ----------------------------------------- |
| Base64   | Encode image bytes into the message      | Simple, no external services           | High memory usage, bloated messages, slow |
| OSS URL  | Upload image to Object Storage, send URL | Clean messages, CDN-friendly, scalable | Needs OSS setup                           |

The standard production approach:

1. Frontend requests a presigned upload URL from the server
2. Frontend uploads the file directly to OSS (no server throughput)
3. Frontend sends the OSS URL to the agent

```
Frontend → Server (request upload URL)
Frontend → OSS (upload file directly)
Frontend → Server (send message with OSS URL)
Server   → Agent (process with image URL)
```

### FastAPI Server

The production server exposes these endpoints:

| Method | Path              | Description                       |
| ------ | ----------------- | --------------------------------- |
| POST   | `/chat/stream`    | Stream agent responses (SSE)      |
| GET    | `/chat/messages`  | Get conversation history          |
| DELETE | `/chat/messages`  | Clear conversation history        |
| POST   | `/oss/upload-url` | Generate OSS presigned upload URL |

Project structure:

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

### Alibaba Cloud OSS Configuration

Setting up OSS involves three steps:

**Step 1: Register and create a bucket**

1. Go to [oss.console.aliyun.com](https://oss.console.aliyun.com/overview)
2. Activate OSS if not already done (pay-as-you-go, very cheap)
3. Create a new bucket with a unique name

**Step 2: Configure permissions**

For development, set the bucket to **public read** so uploaded images are directly accessible via URL:

> ⚠️ **Important**: In production, keep buckets **private** and use CDN or signed URLs for access. Public read is only for testing — disable it after testing!

Also configure **CORS rules** to allow frontend uploads from your domain.

**Step 3: Create API credentials**

1. Go to [RAM Access Control](https://ram.console.aliyun.com/overview)
2. Create a new user with **programmatic access**
3. Save the **AccessKey ID** and **AccessKey Secret**
4. Grant the user `AliyunOSSFullAccess` permission
5. Add credentials to `.env`:

```properties
# Alibaba Cloud OSS
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_BUCKET=your-bucket-name
```

### Adding Checkpointer

Since we're no longer using LangGraph's managed deployment, we need to handle memory ourselves. Add the SqliteSaver checkpointer:

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

### Implementing API Endpoints

Now implement the three core features in `agents/personal_chief.py`:

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

Then wire these into the FastAPI router in `api/v1/chat.py`:

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

### End-to-End Testing

Start the server:

```bash
python -m app.main
```

Visit `http://localhost:8001`. You should be able to:

1. Upload an ingredient photo (it goes to OSS first)
2. See the image preview
3. Send the message and receive a streamed recipe recommendation
4. Continue the conversation with follow-up questions

Please see below how it works like:

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

## Best Practices

| Area               | Recommendation                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Image handling** | Upload to OSS first, send URLs to the model — never embed base64 in messages                                      |
| **Memory**         | Use SqliteSaver for development, PostgresSaver for production                                                     |
| **System prompt**  | Be explicit about tool priority — tell the agent to search first, guess second                                    |
| **Tool design**    | Keep tool descriptions concise; wrap complex tools like TavilySearch in simpler `@tool` functions                 |
| **OSS security**   | Use presigned URLs for uploads; keep buckets private in production; add CORS rules during development             |
| **LangSmith**      | Use it during development for tracing and debugging; disable `LANGSMITH_TRACING` in production to reduce overhead |
| **Error handling** | Catch exceptions in streaming generators and yield user-friendly fallback messages                                |

## FAQ

**Q: Why qwen3.5-plus instead of GPT-4o or Claude?**
A: qwen3.5-plus is a strong multimodal model available through Alibaba Cloud's DashScope API. It's cost-effective for Chinese-language use cases and supports images out of the box. You can swap models easily — just change the `model` parameter in `init_chat_model`.

**Q: Can I use a different search tool instead of Tavily?**
A: Yes. LangChain supports various search integrations (SerpAPI, Google Search, etc.). Tavily is recommended because it's optimized for AI agents — results are clean, structured, and include relevance scores.

**Q: What happens when the conversation gets too long?**
A: The context window has a limit. For long conversations, use LangChain's `SummarizationMiddleware` to automatically summarize old messages while keeping recent ones intact. See the LangChain documentation on memory management strategies.

**Q: Why not just deploy with LangGraph cloud?**
A: LangGraph cloud deployment is convenient but expensive. For production, deploying the FastAPI server on your own infrastructure (with Docker) gives you more control and lower costs.

**Q: Is the OSS bucket really safe with public read?**
A: No! Public read means anyone can access uploaded files. Only use it during development. In production, keep buckets private and serve files through a CDN or generate time-limited signed URLs.

## Summary

We built a complete multimodal AI agent from scratch:

1. **Prototype** — Validated the pipeline in Jupyter using `create_agent`, a multimodal model, Tavily search, and SqliteSaver
2. **LangGraph deployment** — Deployed with `langgraph dev` and tested via LangSmith Studio
3. **Production app** — Built a FastAPI gateway with OSS file uploads, streaming responses, and persistent memory

Key takeaways:

- A working agent needs **model + tools + prompt + memory** — nothing more
- **System prompts** are the most impactful lever for controlling agent behavior
- **OSS uploads** are the right way to handle images in production — not base64
- **LangSmith** is invaluable for debugging during development, but you'll want your own deployment for production
