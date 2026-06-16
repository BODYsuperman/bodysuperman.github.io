---
title: "LangChain Core Components: Model, Message, Prompt, Tool, Memory"
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

- [What is LangChain?](#what-is-langchain)
  - [The Platform](#the-platform)
  - [What is an Agent?](#what-is-an-agent)
  - [LLM vs Agent: The Difference](#llm-vs-agent-the-difference)
- [Models — The Brain](#models--the-brain)
  - [Initializing a Model](#initializing-a-model)
  - [Custom Models and Parameters](#custom-models-and-parameters)
  - [Using Model Classes](#using-model-classes)
  - [Calling the Model: invoke vs stream](#calling-the-model-invoke-vs-stream)
  - [Using Models in an Agent](#using-models-in-an-agent)
- [Messages — The Building Blocks of Conversation](#messages--the-building-blocks-of-conversation)
  - [Message Types](#message-types)
  - [Multimodal Messages](#multimodal-messages)
- [Prompts — Steering the Output](#prompts--steering-the-output)
  - [System Prompts](#system-prompts)
  - [Prompt Engineering](#prompt-engineering)
  - [Structured Output](#structured-output)
- [Tools — The Hands](#tools--the-hands)
  - [Defining Tools](#defining-tools)
  - [Custom Tools](#custom-tools)
  - [Predefined Tools: Tavily Search](#predefined-tools-tavily-search)
  - [Combining Tools with an Agent](#combining-tools-with-an-agent)
- [Memory — Making the Agent Remember](#memory--making-the-agent-remember)
  - [Short-Term vs Long-Term Memory](#short-term-vs-long-term-memory)
  - [Short-Term Memory with InMemorySaver](#short-term-memory-with-inmemorysaver)
  - [Persistent Memory (Optional)](#persistent-memory-optional)
  - [Memory Management Strategies](#memory-management-strategies)
  <!--more-->
- [Putting It All Together](#putting-it-all-together)
- [Best Practices](#best-practices)
- [FAQ](#faq)
- [Summary](#summary)

---

## What is LangChain? <a name="what-is-langchain"></a>

### The Platform <a name="the-platform"></a>

LangChain was created by Harrison Chase in October 2022. It's a platform for **Agent Engineering** — building AI agents that can reason, plan, and act.

LangChain is not just one framework. It's a full platform with multiple components:

| Component   | Purpose                                                  |
| ----------- | -------------------------------------------------------- |
| LangChain   | Build agents quickly, compatible with any model provider |
| LangGraph   | Low-level agent control: Memory, Human-in-the-Loop       |
| Deep Agents | Complex, multi-step task agents                          |
| LangSmith   | Test, observe, evaluate, and deploy agents               |

Official site: [https://www.langchain.com](https://www.langchain.com)

### What is an Agent? <a name="what-is-an-agent"></a>

There's no single standard answer. But LangChain's founder Harrison Chase gives a technical definition:

> An AI agent is a system that uses an LLM to decide the control flow of an application.

In simpler terms: an **Agent** is an intelligent system that can **perceive its environment, reason, make autonomous decisions, and take action** to achieve a goal.

| Feature     | Traditional LLM                          | AI Agent                                    |
| ----------- | ---------------------------------------- | ------------------------------------------- |
| Interaction | Passive: ask one, answer one             | Active: goal-driven planning                |
| Execution   | Text generation only                     | Operate software, send emails, analyze data |
| Autonomy    | Needs explicit step-by-step instructions | Given a goal, finds its own path            |

**LLM = Brain. Agent = Brain + Hands + Logic.**

### LLM vs Agent: The Difference <a name="llm-vs-agent-the-difference"></a>

Imagine building an **AI Travel Assistant**.

**Traditional LLM approach:**

1. User: "Plan a 5-day Beijing trip, budget 8000 RMB, I love history."
2. LLM generates a simple plan from training data — no real-time prices, weather, or availability.

**Agent approach:**

1. Same user request.
2. Agent breaks it down:
   - Calls flight/hotel APIs for real prices
   - Calls weather API for forecast
   - Searches attraction APIs for opening hours
   - Adjusts plan dynamically ("The Forbidden City is closed Monday, moved to Tuesday")
3. Returns a concrete, executable plan within budget.

---

## Models — The Brain <a name="models--the-brain"></a>

Models (LLMs) understand human language and generate content, translate, summarize, and answer questions.

Modern LLMs also have special capabilities:

| Capability        | Description                                                        |
| ----------------- | ------------------------------------------------------------------ |
| Tool Calling      | Call external tools (APIs, databases) and use results in responses |
| Structured Output | Constrain responses to a defined format (e.g., JSON)               |
| Multimodality     | Process and return non-text data: images, audio, video             |
| Reasoning         | Execute multi-step reasoning to reach conclusions                  |

LangChain supports most LLMs with a **unified API**, making it easy to switch providers.

### Initializing a Model <a name="initializing-a-model"></a>

The simplest way is `init_chat_model`:

```python
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv

load_dotenv()

# LangChain auto-detects provider, base_url, and api_key
model = init_chat_model(model="deepseek-chat")
```

Test it:

```python
print(type(model))  # <class 'langchain_deepseek.chat_models.ChatDeepSeek'>
```

Switching models? Just change the name — no other code changes needed.

### Custom Models and Parameters <a name="custom-models-and-parameters"></a>

For providers not natively supported (like Alibaba's Qwen via DashScope), you must specify parameters manually:

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

Common model parameters:

| Parameter     | What It Controls                                 |
| ------------- | ------------------------------------------------ |
| `temperature` | Randomness: low = deterministic, high = creative |
| `max_tokens`  | Maximum response length                          |
| `top_p`       | Diversity of output                              |
| `timeout`     | Request timeout                                  |
| `max_retries` | Maximum retry attempts                           |

### Using Model Classes <a name="using-model-classes"></a>

For community-supported models, use the specific Model class:

```bash
uv add langchain-community dashscope
```

```python
from langchain_community.chat_models.tongyi import ChatTongyi

model = ChatTongyi(model="qwen-plus")
```

### Calling the Model: invoke vs stream <a name="calling-the-model-invoke-vs-stream"></a>

**Blocking call** — wait for the full response:

```python
response = model.invoke("What is the capital of the moon?")
print(response)
```

**Streaming call** — see tokens in real time:

```python
stream = model.stream("What is the capital of the moon?")

for chunk in stream:
    print(chunk.content, end="", flush=True)
```

### Using Models in an Agent <a name="using-models-in-an-agent"></a>

Pass a model name (auto-init) or a model object:

```python
from langchain.agents import create_agent

# Option A: By model name
agent = create_agent(model="deepseek-chat")

# Option B: With a pre-built model
from langchain_community.chat_models.tongyi import ChatTongyi
model = ChatTongyi(model="qwen-plus")
agent = create_agent(model=model)
```

Agent also supports `invoke` and `stream`:

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

Stream modes for Agent:

| Mode       | Returns                                   |
| ---------- | ----------------------------------------- |
| `messages` | Each LLM token (for real-time output)     |
| `updates`  | Every Agent event (LLM calls, tool calls) |
| `custom`   | Custom stream writer output               |

---

## Messages — The Building Blocks of Conversation <a name="messages--the-building-blocks-of-conversation"></a>

Every message sent to or from the LLM contains:

- **role**: who sent this message (system, user, assistant, tool)
- **content**: the message body
- **metadata** (optional): ID, token usage, etc.

### Message Types <a name="message-types"></a>

LangChain wraps messages into `BaseMessage` subclasses based on role:

| Class           | Role        | Purpose                                   |
| --------------- | ----------- | ----------------------------------------- |
| `SystemMessage` | `system`    | Set model behavior and context            |
| `HumanMessage`  | `user`      | User input                                |
| `AIMessage`     | `assistant` | LLM response (text, tool calls, metadata) |
| `ToolMessage`   | `tool`      | Result of a tool execution                |

Example:

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

Output:

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

**Tip**: Manually passing message history gives the LLM "memory." But this is tedious — we'll learn automatic memory management in the Memory section.

### Multimodal Messages <a name="multimodal-messages"></a>

LangChain supports sending images, audio, and video to multimodal models (e.g., `qwen3.5-plus`, `gpt-5-nano`).

**Online image (via URL):**

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

**Local image (via base64):**

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

## Prompts — Steering the Output <a name="prompts--steering-the-output"></a>

Everything sent to the LLM can be called a **Prompt**. The **System Prompt** (`SystemMessage`) is the most important — it sets the AI's role, rules, and context.

### System Prompts <a name="system-prompts"></a>

Set it once when creating the agent:

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

Without a system prompt, the AI uses its default persona. With `Speak like a pirate`, the output changes dramatically:

```
Ahoy! I be yer parrot, an AI assistant sailing the digital seas! Want to chat about treasure, sailing, or tales of the seven seas? Bring it on, matey!
```

### Prompt Engineering <a name="prompt-engineering"></a>

**Prompt Engineering** is the iterative process of optimizing the System Prompt for better outputs.

A well-structured prompt typically includes:

| Section          | Purpose                                           |
| ---------------- | ------------------------------------------------- |
| **Identity**     | Who is the AI? Communication style, overall goal  |
| **Instructions** | Rules to follow. What to do and what NOT to do    |
| **Examples**     | Input/output pairs showing the desired format     |
| **Context**      | Extra information (RAG data, reference documents) |

Use **Markdown** for structure and **XML tags** to mark boundaries:

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

#### Few-Shot Examples

When the desired style is hard to describe, show examples instead:

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

Output：

```
Aurum — a magnificent floating city above the sulfuric clouds, forged from reflective alloy, eternally refracting the dim yellow sunlight.
```

### Structured Output <a name="structured-output"></a>

Instead of parsing raw text, constrain the model to output structured data.

**Step 1**: Define a Pydantic model:

```python
from pydantic import BaseModel, Field

class CapitalInfo(BaseModel):
    name: str
    location: str
    vibe: str
    economy: str
```

**Step 2**: Pass it as `response_format`:

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

Output：

```
Lunara is located at the edge of the Aitken Basin on the lunar south pole. Vibe: A serene city blending high-tech with classical Eastern aesthetics, featuring transparent domed gardens and floating architecture. Economy: Helium-3 mining, quantum computing centers, space tourism, lunar agriculture and scientific research.
```

---

## Tools — The Hands <a name="tools--the-hands"></a>

An agent needs at least two parts:

- **Model**: The brain (reasoning, planning)
- **Tools**: The hands (executing tasks, interacting with the outside world)

### Defining Tools <a name="defining-tools"></a>

Use the `@tool` decorator:

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

Output：

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

**How it works:**

1. User asks a question
2. LLM analyzes: "I don't know the weather, I need the `get_weather` tool"
3. LLM returns a JSON with the tool name and arguments
4. LangChain parses it and calls the function
5. Result goes back to the LLM
6. LLM generates the final answer

```
User Question → LLM Reasoning → Tool Call → Tool Result → LLM Final Answer
```

### Custom Tools <a name="custom-tools"></a>

By default, tool metadata comes from:

| Info             | Source              |
| ---------------- | ------------------- |
| Tool name        | Function name       |
| Tool input       | Function parameters |
| Tool description | Docstring           |

Override with the decorator:

```python
@tool("square_root", description="Calculate the square root of a number")
def tool1(x: float) -> float:
    return x ** 0.5
```

For detailed parameter constraints, use Pydantic:

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

**Important**: Two parameter names are reserved in LangChain tools — `config` and `runtime`. Don't use them as custom parameter names.

### Predefined Tools: Tavily Search <a name="predefined-tools-tavily-search"></a>

LangChain includes many pre-built tools. A popular one is **Tavily** for web search.

**Step 1**: Register at [https://www.tavily.com](https://www.tavily.com), get your API key.

**Step 2**: Add to `.env`:

```
TAVILY_API_KEY=your_key_here
```

**Step 3**: Install dependency:

```bash
uv add langchain-tavily
```

**Step 4**: Use it:

```python
from langchain_tavily import TavilySearch

tool = TavilySearch(max_results=5, topic="general")
result = tool.invoke("What's the weather in Beijing today?")
print(result)
```

### Combining Tools with an Agent <a name="combining-tools-with-an-agent"></a>

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

With `stream_mode="updates"`, you can see each step:

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

Output：

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

## Memory — Making the Agent Remember <a name="memory--making-the-agent-remember"></a>

Models have no memory by default. Each call is independent.

### Short-Term vs Long-Term Memory <a name="short-term-vs-long-term-memory"></a>

**Don't confuse the names!** Short-term ≠ temporary, Long-term ≠ permanent.

|            | Short-Term Memory  | Long-Term Memory                   |
| ---------- | ------------------ | ---------------------------------- |
| Lifecycle  | Current session    | Across sessions/tasks              |
| Content    | Current task state | Knowledge, experience, preferences |
| Cross-task | ❌                 | ✅                                 |
| Storage    | Redis / In-memory  | DB / Vector DB                     |

**Short-term memory** = working context for the current conversation.

**Long-term memory** = accumulated experience and knowledge across conversations.

### Short-Term Memory with InMemorySaver <a name="short-term-memory-with-inmemorysaver"></a>

LangChain automatically manages conversation history via **Checkpointer** objects.

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

Output：

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

**Key point**: Same `thread_id` = same conversation. Different `thread_id` = isolated conversations.

### Persistent Memory (Optional) <a name="persistent-memory-optional"></a>

`InMemorySaver` loses data on restart. For production, use a persistent checkpointer.

**SQLite example:**

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

Other options: `PostgresSaver`, `CosmosDBSaver`.

### Memory Management Strategies <a name="memory-management-strategies"></a>

As conversations grow, message history can exceed the LLM's context window (e.g., 128K for DeepSeek). This causes:

- Context loss (forgotten earlier messages)
- Reduced response quality ("attention dilution")
- Slower responses

Three strategies:

| Strategy               | How It Works                                 | Pros                            | Cons                             |
| ---------------------- | -------------------------------------------- | ------------------------------- | -------------------------------- |
| **Trim messages**      | Only send recent messages to the LLM         | Simple, fast                    | Loses older context              |
| **Delete messages**    | Remove old messages from state entirely      | Frees storage permanently       | Irreversible                     |
| **Summarize messages** | Summarize old messages, keep recent ones raw | Preserves context + fits window | Extra LLM call for summarization |

#### SummarizationMiddleware

LangChain's built-in solution:

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

Output：

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

## Putting It All Together <a name="putting-it-all-together"></a>

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

## Best Practices <a name="best-practices"></a>

| Practice                                 | Why It Matters                             |
| ---------------------------------------- | ------------------------------------------ |
| Use `thread_id` per conversation         | Prevents memory leaking across users       |
| Persist checkpointer in production       | Don't lose conversations on restart        |
| Write clear tool docstrings              | LLM relies on descriptions to choose tools |
| Use structured output                    | Eliminates fragile text parsing            |
| Set `temperature=0` for factual tasks    | More deterministic, less hallucination     |
| Use summarization for long conversations | Avoids context window overflow             |
| Keep system prompts in Markdown + XML    | Easier for LLM to parse boundaries         |

---

## FAQ <a name="faq"></a>

**Q: Can I switch models without changing code?**

A: Yes, just change the model name. LangChain handles the rest.

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

**Q: What's the difference between `ChatModel` and `LLM`?**

A: `ChatModel` takes a list of messages and returns a message. `LLM` takes a string and returns a string. Most modern models use the Chat interface.

**Q: Can an agent call multiple tools in one turn?**

A: Yes. The LLM can return multiple tool calls simultaneously:

```python
# LLM may return both:
# tool_call: square_root(x=467)
# tool_call: square_root(x=529)
```

**Q: What happens if a tool fails?**

A: The exception is caught and passed back to the LLM as a `ToolMessage` with the error. The LLM can then decide how to handle it (retry, report error, etc.).

**Q: InMemorySaver vs persistent checkpointer?**

A: `InMemorySaver` is for development. Use `SqliteSaver`, `PostgresSaver`, etc. for production where data must survive restarts.

---

## Summary <a name="summary"></a>

We covered the five core components of LangChain:

| Component   | Role               | Key Takeaway                                                |
| ----------- | ------------------ | ----------------------------------------------------------- |
| **Model**   | The brain          | Unified API, switch providers easily                        |
| **Message** | Conversation units | System/Human/AI/Tool types, supports multimodal             |
| **Prompt**  | Control output     | System prompts + engineering + structured output            |
| **Tool**    | The hands          | `@tool` decorator, custom + predefined, powers Agent action |
| **Memory**  | Remember context   | Short-term (checkpointer) + Long-term (cross-session)       |

**The Agent formula:**

```
Agent = Model + Tools + Memory + Prompts
```

**Next steps:**

- Learn LangGraph for fine-grained Agent control
- Build multi-agent systems (MAS)
- Add RAG for domain-specific knowledge
- Deploy with LangSmith for monitoring

---

## References

- [LangChain Official Documentation](https://docs.langchain.com)
- [LangChain GitHub](https://github.com/langchain-ai/langchain)
- [LangGraph Documentation](https://langchain-ai.github.io/langgraph)
- [Tavily Search API](https://www.tavily.com)
