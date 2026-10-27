---
title: "LangGraph 从零开始：环境搭建、状态管理与控制流实战"
lang: zh-CN
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

- [引言](#introduction)
- [环境准备](#environment-setup)
  - [安装 Miniconda 并创建环境](#miniconda-and-conda-env)
  - [安装依赖与配置 API Key](#dependencies-and-api-key)
  - [环境验证与检查清单](#verification-checklist)
- [LangGraph 是什么](#what-is-langgraph)
  - [LangChain 与 LangGraph 的定位](#langchain-vs-langgraph)
- [核心概念：三要素与运行机制](#core-concepts)
  - [State、Node、Edge](#state-node-edge)
  - [Superstep 执行模型](#superstep-execution-model)
  - [Checkpoint 快照序列](#checkpoint-snapshots)
- [Graph API vs Functional API](#graph-api-vs-functional-api)
- [第一个图：定义、编译、调用](#first-graph)
  - [三步构建状态图](#define-compile-invoke)
  - [图结构可视化](#graph-visualization)
- [状态管理](#state-management)
  - [三种 Schema 定义方式](#defining-state-schema)
  - [校验行为对比](#schema-validation-behavior)
  - [State Reducer：状态合并机制](#state-reducers)
  - [默认覆盖与 Overwrite](#default-overwrite-and-overwrite)
  - [Multi Schema：输入、输出与私有状态](#multi-schema)
  - [预定义状态：MessagesState 与 AgentState](#predefined-states)
- [控制流](#control-flow)
  - [顺序结构](#sequential-structure)
  - [分支结构](#branching)
    - [并行节点](#parallel-nodes)
    - [条件分支：add_conditional_edges](#conditional-edges)
    - [延迟节点：defer](#deferred-nodes)
    - [动态扇出：Send](#dynamic-fan-out-send)
    - [动态跳转：Command(goto)](#command-goto)
  - [多分支汇聚：Fan-in](#fan-in)
    - [静态扇入：“与”触发 vs “或”触发](#static-fan-in)
    - [动态扇入：MapReduce 结构](#mapreduce)
  - [循环结构：ReAct](#loops)
    - [静态实现与动态实现](#react-static-vs-dynamic)
    - [递归限制与优雅退出](#recursion-limit)
- [边的系统总结](#edges-summary)
- [节点执行与容错机制](#fault-tolerance)
  - [重试机制：RetryPolicy](#retry-policy)
  - [默认重试规则：default_retry_on](#default-retry-rules)
  - [超时控制与错误处理](#timeout-and-error-handling)
  - [节点缓存：CachePolicy](#node-caching)
- [最佳实践](#best-practices)
- [常见问题](#faq)
- [总结](#summary)

<!--more-->

<a name="introduction"></a>

## 引言

当我们用大模型构建 Agent 应用时，很快会遇到一类问题：流程不再是"一次提问、一次回答"，而是包含分支、循环、并行、人工介入和长时间运行的复杂工作流。用普通的 Python 函数调用来组织这些流程，代码会迅速变得难以维护，而且一旦进程崩溃，中间状态就全部丢失。

LangGraph 就是为解决这类问题而生的编排框架。它把工作流建模为一张**状态图**：节点负责计算，边负责流转，状态负责在节点之间传递数据。更重要的是，它的运行时天然支持持久化、流式输出和容错恢复。

本文是一篇教程型整合文章，覆盖从零开始的完整路径：

1. **环境准备**：Miniconda、依赖安装、API Key 配置；
2. **核心概念**：State / Node / Edge 三要素与 Superstep 执行模型；
3. **状态管理**：Schema 定义、Reducer 合并机制、Multi Schema；
4. **控制流**：顺序、分支、扇入扇出、循环与递归限制；
5. **容错机制**：重试、超时、错误处理与节点缓存。

所有代码基于 `langgraph 1.1.x` + Python 3.13 验证通过，模型示例使用 DeepSeek（可替换为任意 LangChain 支持的模型）。

<a name="environment-setup"></a>

## 环境准备

<a name="miniconda-and-conda-env"></a>

### 安装 Miniconda 并创建环境

Conda 是包管理和环境管理工具，**Miniconda** 是它的精简版，体积小、安装快。从官方页面下载对应系统的安装包：https://docs.anaconda.com/miniconda/

| 操作系统 | 推荐安装包                                                                  |
| -------- | --------------------------------------------------------------------------- |
| Windows  | `Miniconda3 Windows 64-bit`（.exe）                                         |
| macOS    | Apple 芯片选 `macOS Apple M1 64-bit`，Intel 芯片选 `macOS Intel x86 64-bit` |
| Linux    | `Miniconda3 Linux 64-bit`（.sh）                                            |

Windows 安装时**务必勾选** "Add Miniconda3 to my PATH environment variable"；macOS / Linux 在终端执行安装脚本并按提示输入 `yes` 完成 `conda init`。

安装完成后验证并创建课程环境：

```bash
conda --version

# 创建名为 langgraph 的环境，指定 Python 3.13
conda create -n langgraph python=3.13

# 激活环境，终端提示符前会出现 (langgraph)
conda activate langgraph
```

常用的 Conda 命令：

| 命令                           | 作用                 |
| ------------------------------ | -------------------- |
| `conda info --envs`            | 列出所有虚拟环境     |
| `conda activate 环境名`        | 激活（进入）某个环境 |
| `conda deactivate`             | 退出当前环境         |
| `conda remove -n 环境名 --all` | 删除某个环境         |

虚拟环境是一个隔离的 Python 运行空间，不同环境之间互不影响——这是管理多项目依赖最省心的方式。

<a name="dependencies-and-api-key"></a>

### 安装依赖与配置 API Key

中国大陆用户建议先配置 pip 镜像源，大幅提升下载速度：

```bash
pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

安装 LangGraph 及相关依赖（可按需精简）：

```bash
pip install langgraph langchain langchain-core langchain-openai \
    langchain-deepseek langchain-anthropic python-dotenv loguru jupyter
```

核心包说明：

| 包名                                                              | 用途                                    |
| ----------------------------------------------------------------- | --------------------------------------- |
| `langgraph`                                                       | LangGraph 核心库，构建状态图            |
| `langgraph-checkpoint`                                            | 检查点（Checkpoint）机制                |
| `langgraph-prebuilt`                                              | 预置的 Agent 组件                       |
| `langchain-core`                                                  | LangChain 基础抽象（消息、Runnable 等） |
| `langchain-deepseek` / `langchain-openai` / `langchain-anthropic` | 各模型服务商集成                        |
| `python-dotenv`                                                   | 读取 `.env` 环境变量文件                |

接下来配置 API Key。以 DeepSeek 为例（新用户注册即送额度），在 [platform.deepseek.com](https://platform.deepseek.com/) 创建 API Key 后，在项目根目录新建 `.env` 文件：

```properties
# 必填：示例默认使用 DeepSeek 模型
DEEPSEEK_API_KEY=sk-你的API_Key

# 可选：其他模型服务商
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
```

代码中统一用两行加载，SDK 会自动从环境变量读取密钥，**不要在代码中硬编码**：

```python
from dotenv import load_dotenv
load_dotenv(override=True)
```

> `.env` 应加入 `.gitignore`，确保密钥不会被提交到 Git。

<a name="verification-checklist"></a>

### 环境验证与检查清单

用一个脚本验证环境是否就绪：

```python
# test_env.py
import sys
from importlib.metadata import version as pkg_version
from dotenv import load_dotenv
import os

print(f"Python 版本: {sys.version}")
print(f"LangGraph 版本: {pkg_version('langgraph')}")

load_dotenv(override=True)
key = os.getenv("DEEPSEEK_API_KEY")
if key:
    print(f"DeepSeek API Key 已配置: {key[:8]}...{key[-4:]}")
    from langchain_deepseek import ChatDeepSeek
    model = ChatDeepSeek(model="deepseek-chat")
    response = model.invoke("回复'一切正常'四个字，不要其他内容")
    print(f"模型调用测试: {response.content}")
else:
    print("未检测到 DEEPSEEK_API_KEY，请在 .env 中配置")
```

开始学习前，逐项确认：

- [ ] Miniconda 已安装，`conda --version` 正常输出
- [ ] `langgraph` 环境已创建（Python 3.13）并激活
- [ ] 核心依赖已安装，`pip show langgraph` 有输出
- [ ] `.env` 已创建且 API Key 有可用额度
- [ ] 验证脚本全部通过

<a name="what-is-langgraph"></a>

## LangGraph 是什么

<a name="langchain-vs-langgraph"></a>

### LangChain 与 LangGraph 的定位

**LangChain 1.x** 的定位发生了明显变化：旧式 Chain、Retriever、Memory 等组件被迁移至 `langchain-classic`；LangChain 现在聚焦于 Agent 开发，核心入口是 `create_agent`，围绕 Agent 提供模型、工具、消息、结构化输出、Middleware 和记忆管理等高层抽象。

**LangGraph** 则是更底层的**编排框架与 Agent Runtime**，负责复杂工作流和有状态 Agent 的执行，提供持久化、流式输出、Durable Execution、Human-in-the-loop 等运行时能力。`create_agent` 底层正是基于 LangGraph 实现的。

| 对比维度 | LangChain             | LangGraph                                    |
| -------- | --------------------- | -------------------------------------------- |
| 定位     | Agent 高层开发框架    | 底层编排框架 & Agent Runtime                 |
| 核心入口 | `create_agent`        | `StateGraph` / `@entrypoint`                 |
| 适用场景 | 结构直接的 Agent 应用 | 复杂工作流、持久化状态、长时间运行、人工介入 |
| 流程控制 | Agent 循环自动管理    | 精细控制节点、边、条件分支                   |
| 学习成本 | 较低                  | 较高                                         |

一句话总结：**LangChain 提供易用的 Agent 高层抽象，LangGraph 提供可靠、可持久化且可精细控制的底层执行能力。** 大多数 Agent 项目从 `create_agent` 开始即可；当需要复杂工作流编排、确定性步骤与 Agent 步骤混合、或底层状态控制时，再引入 LangGraph。

LangGraph 运行时底层基于自研的 Pregel 运行时，核心思想借鉴了 Google Pregel 计算模型，用于组织和执行复杂的图计算流程。

<a name="core-concepts"></a>

## 核心概念：三要素与运行机制

<a name="state-node-edge"></a>

### State、Node、Edge

LangGraph 运行时由三个基本要素构成：

- **State（状态）**：图运行过程中的共享数据结构，表示应用在某一时刻的状态快照。它承载上下文信息、中间结果和后续节点需要读取的数据，是节点之间传递信息的核心载体。
- **Node（节点）**：具体执行单元，通常实现为一个函数。节点读取当前 State，执行业务逻辑，返回对 State 的**局部更新**。节点本身不直接修改全局状态，状态的合并与提交由运行时统一完成。
- **Edge（边）**：定义节点之间的流转关系，决定一个节点执行完成后下一步进入哪个节点。边可以是固定流转，也可以根据当前 State 做条件判断，从而实现分支、循环等复杂控制流。

一个最简单的运行图只有两个节点：

```
START --> node_1 --> node_2 --> END
```

<a name="superstep-execution-model"></a>

### Superstep 执行模型

LangGraph 的图运行过程基于 **Superstep（超步）** 来组织和推进。Superstep 可以理解为图运行过程中的一次"单步循环"，一次完整的图运行就是由一系列连续的 Superstep 串联而成。

每个 Superstep 分为三个阶段：

```
┌─────────────────────── Superstep N ───────────────────────┐
│                                                           │
│  ① 路由阶段 (Plan / Routing)                               │
│     根据当前 State 和 Edge 逻辑，                            │
│     确定本轮应该执行哪些节点                                  │
│                     │                                     │
│                     ▼                                     │
│  ② 执行阶段 (Execution)                                    │
│     运行被选中的节点（多个节点可并行）。                         │
│     每个节点基于本轮开始时的状态快照计算，                      │
│     输出各自对状态的局部更新——                                │
│     此阶段一个节点产生的更新不会被其他节点立即读到                │
│                     │                                     │
│                     ▼                                     │
│  ③ 提交阶段 (Update / Commit)                              │
│     所有节点执行完成后，运行时将它们的输出                       │
│     统一合并到 State，生成新的状态快照，                        │
│     作为下一轮 Superstep 的输入                              │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

理解这个模型有两个关键点：

1. **并行节点在同一个 Superstep 中执行**，各自读取的是同一份状态快照，互不干扰；
2. **状态更新在 Superstep 结束时统一提交**，这就是为什么并行写同一个字段时需要 Reducer（下文详述）。

<a name="checkpoint-snapshots"></a>

### Checkpoint 快照序列

在每个 Superstep 边界，LangGraph 可以生成一个 **Checkpoint（检查点）快照**，记录当前的 `metadata.step`、`next`（下一步待执行的任务）与 State。以 `START → node_1 → node_2 → END` 为例，一次运行会产生如下快照序列：

| 快照             | step | next        | 说明                                              |
| ---------------- | ---- | ----------- | ------------------------------------------------- |
| Input Checkpoint | -1   | `__start__` | 由 `graph.invoke` 的入参创建，尚未进入用户节点    |
| Checkpoint 0     | 0    | `node_1`    | 输入已写入 State                                  |
| Checkpoint 1     | 1    | `node_2`    | `node_1` 的结果已提交（记录在 `tasks.result` 中） |
| Checkpoint 2     | 2    | `()`        | `node_2` 完成，无后续任务，运行结束               |

注意 `END` 是终止边界，**不会产生额外的节点执行快照**。Checkpoint 是持久化、时间旅行调试和 Human-in-the-loop 的基础，本文先建立概念，后续文章再展开。

<a name="graph-api-vs-functional-api"></a>

## Graph API vs Functional API

LangGraph 提供两种 API 来构建运行图，二者共享相同的底层运行时，可以在同一应用中协同使用。

**Graph API** 采用声明式方式：显式定义 State、Node 和 Edge，将业务流程组织成可视化的图结构。适合复杂分支、多节点共享状态、并行执行与结果汇聚，以及需要图结构辅助调试和团队协作的场景。

**Functional API** 采用命令式方式：用 `@entrypoint` 定义工作流入口，用 `@task` 定义可被检查点记录的任务，然后在函数内部用普通的 `if/else`、循环和函数调用组织流程。适合已有过程式代码最小改造、线性流程、简单分支和快速原型验证。

| 对比项     | Graph API                      | Functional API                   |
| ---------- | ------------------------------ | -------------------------------- |
| 编程风格   | 声明式图结构                   | 命令式函数流程                   |
| 核心抽象   | State、Node、Edge              | entrypoint、task                 |
| 状态管理   | 显式定义全局 State             | 更多依赖函数参数和返回值         |
| 流程表达   | 通过节点和边表达               | 通过普通 Python 控制流表达       |
| 可视化能力 | 强，天然适合画图和调试         | 弱，更像普通代码流程             |
| 适合场景   | 复杂工作流、多分支、多节点协作 | 简单流程、快速原型、已有代码改造 |
| 学习成本   | 相对更高                       | 相对更低                         |

**选型建议**：从零构建或流程结构复杂，用 Graph API；现有代码改造、快速原型或流程逻辑简单，用 Functional API。学习 LangGraph 建议优先掌握 Graph API，因为它更能体现 LangGraph 的核心思想——通过 State、Node、Edge 显式描述一个可执行的计算图。本文后续内容均基于 Graph API。

<a name="first-graph"></a>

## 第一个图：定义、编译、调用

<a name="define-compile-invoke"></a>

### 三步构建状态图

图的构建与运行分为三个阶段：**定义状态图 → 编译状态图 → 调用状态图**。

第一步，定义全局状态、节点函数，并把它们组装进 `StateGraph`：

```python
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from operator import add

# 1. 定义全局状态
class OverAllState(TypedDict):
    logs: Annotated[list[str], add]   # 带 Reducer 的字段：追加合并
    cur_id: str                        # 无 Reducer 的字段：覆盖更新

# 2. 定义节点：读取 State，返回局部更新
def node_1(state: OverAllState) -> OverAllState:
    pre_id = state["cur_id"]
    return {
        "logs": ["node_1 运行完毕"],
        "cur_id": pre_id + ", node_1"
    }

def node_2(state: OverAllState) -> OverAllState:
    pre_id = state["cur_id"]
    return {
        "logs": ["node_2 运行完毕"],
        "cur_id": pre_id + ", node_2"
    }

# 3. 组装图结构
builder = StateGraph(state_schema=OverAllState)
builder.add_node("node_1", node_1)
builder.add_node("node_2", node_2)
builder.add_edge(START, "node_1")
builder.add_edge("node_1", "node_2")
builder.add_edge("node_2", END)

# 4. 编译为可执行的运行图
graph = builder.compile()

# 5. 调用
print(graph.invoke({"cur_id": "start"}))
```

运行结果：

```
{'logs': ['node_1 运行完毕', 'node_2 运行完毕'], 'cur_id': 'start, node_1, node_2'}
```

注意 `logs` 字段：两个节点各自返回了一个单元素列表，但最终结果把它们**拼接**了起来——这就是 `Annotated[list[str], add]` 中 Reducer 的作用。而 `cur_id` 没有 Reducer，节点在返回值中手动读取旧值再拼接新值。

<a name="graph-visualization"></a>

### 图结构可视化

LangGraph 支持用 mermaid（一种文本标记语言，可直接渲染为流程图）表达图结构：

```python
raw_mermaid = graph.get_graph().draw_mermaid()
print(raw_mermaid)
```

输出中从 `graph TD;` 开始的部分就是 mermaid 源码：

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

也可以直接渲染为 PNG 图片字节流：

```python
png_bytes = graph.get_graph().draw_mermaid_png()

# Jupyter 中直接展示
from IPython.display import display, Image
display(Image(png_bytes))

# 或保存为文件
with open("first_demo_graph.png", "wb") as f:
    f.write(png_bytes)
```

> `draw_mermaid_png()` 底层会调用在线渲染服务（默认 https://mermaid.ink），网络不稳定时可能失败，通常重试即可；也可以通过 `base_url` 参数替换为可用的渲染服务。

在 Jupyter 环境下还有更快捷的方式：

```python
from IPython.display import display
display(graph)   # 直接展示编译后的图结构
```

<a name="state-management"></a>

## 状态管理

<a name="defining-state-schema"></a>

### 三种 Schema 定义方式

状态定义实际上是在声明状态的 **Schema**（状态字段的完整描述）。官方推荐三种方式：TypedDict、dataclass、Pydantic。三者构建的图行为完全一致，差别只在字段访问方式和校验行为。

**TypedDict**——字段用 `state["字段名"]` 访问：

```python
from typing import TypedDict, Annotated
from operator import add

class OverAllState(TypedDict):
    logs: Annotated[list[str], add]
    cur_id: str
```

**dataclass**——字段用 `state.字段名` 访问：

```python
from dataclasses import dataclass

@dataclass
class OverAllState:
    logs: Annotated[list[str], add]
    cur_id: str
```

**Pydantic**——字段访问方式与 dataclass 相同：

```python
from pydantic import BaseModel

class OverAllState(BaseModel):
    logs: Annotated[list[str], add]
    cur_id: str
```

<a name="schema-validation-behavior"></a>

### 校验行为对比

三种方式都要求字段名称完全一致，只是处理方式不同：

| 场景               | TypedDict       | dataclass        | Pydantic               |
| ------------------ | --------------- | ---------------- | ---------------------- |
| 输入字段不匹配     | 抛出 `KeyError` | 抛出 `TypeError` | 抛出 `ValidationError` |
| 节点返回字段不匹配 | 更新被忽略      | 更新被忽略       | 更新被忽略             |

**推荐优先使用 TypedDict**，大多数官方案例也采用这种方式。理由：

- 相比普通 `dict`，提供更明确的字段约束和类型提示；
- 相比 `dataclass`，更贴近 LangGraph 的状态更新方式——节点返回的是"部分状态更新"字典，而不是完整对象；
- 相比 `Pydantic BaseModel`，更轻量，没有额外的数据校验开销。

<a name="state-reducers"></a>

### State Reducer：状态合并机制

Reducer 是 LangGraph 中用于合并状态更新的核心机制。它定义了当多个节点对同一状态键写入更新时，如何将这些更新合并为一个最终结果。

Reducer 的核心特征：

- **函数签名**：`(Value, Value) -> Value`，接收当前值和更新值，返回合并后的新值；
- **注解定义**：通过 `Annotated[Type, reducer_function]` 为状态键指定 Reducer；
- **默认行为**：未指定 Reducer 的状态键使用覆盖策略（Last-Write-Wins）。

自定义一个 Reducer 就是写一个二元合并函数：

```python
def my_reducer(left: list[str], right: list[str]) -> list[str]:
    return left + right
```

其中 `left` 是当前已累计的状态值，`right` 是本次待合并的新值。再通过 `Annotated` 与状态字段关联：

```python
class OverAllState(TypedDict):
    logs: Annotated[list[str], my_reducer]  # 多次更新时追加合并
    cur_id: str                              # 未指定 Reducer，默认覆盖
```

`Annotated[]` 是 Python 的类型注解扩展机制：第一个参数是原始类型，后续参数是附加元数据。`Annotated` 本身不规定元数据的含义，由框架自行解析——LangGraph 用它把"字段类型"和"合并规则"同时声明在字段定义中。

两个最常用的内置 Reducer：

**1. `operator.add`**：Python 内置加法函数，等价于 `a + b`，可用于数字累加、列表拼接：

```python
from operator import add

add(1, 2)                  # 3
add([1, 2], [3, 4])        # [1, 2, 3, 4]
```

**2. `add_messages`**：专用于合并对话消息列表的 Reducer，维护 `BaseMessage` 对象序列（`HumanMessage`、`AIMessage`、`SystemMessage`、`ToolMessage` 等）。它不是简单的列表拼接，而是**基于消息 `id` 的合并**：

- 若新消息的 `id` 在已有列表中不存在，则追加到末尾；
- 若 `id` 相同，则用新消息**替换**旧消息。

```python
from langgraph.graph.message import add_messages
from langchain.messages import HumanMessage, AIMessage, SystemMessage

left = [
    SystemMessage(content="你是个善解人意的助手", id='1'),
    HumanMessage(content="你好", id='2'),
    AIMessage(content="你好~", id='3'),
]

right = [
    HumanMessage(content="我是老王，你是小王", id='2'),  # id='2' 已存在 -> 替换
    AIMessage(content="好的，我记住啦", id='3'),          # id='3' 已存在 -> 替换
    HumanMessage(content="你是谁？", id='4'),             # 新 id -> 追加
    AIMessage(content="我是小王", id='5'),                # 新 id -> 追加
]

merged = add_messages(left, right)
```

合并结果保留了 `id='1'` 的系统消息，`id='2'`、`id='3'` 被替换为新内容，`id='4'`、`id='5'` 被追加。这个"追加 + 按 id 覆盖"的语义，正是构建多轮对话和 Agent 消息流的基础。

<a name="default-overwrite-and-overwrite"></a>

### 默认覆盖与 Overwrite

**默认行为**：没有定义 Reducer 的字段，后一次更新直接覆盖旧值：

```python
class OverAllState(TypedDict):
    logs: list[str]   # 注意：没有 Reducer
    id: str

def node_a(state: OverAllState):
    return {"logs": ["node_a"], "id": "node_a"}

def node_b(state: OverAllState):
    return {"logs": ["node_b"], "id": "node_b"}

# START -> node_a -> node_b -> END
result = graph.invoke({"logs": ["START"], "id": "start"})
# {'logs': ['node_b'], 'id': 'node_b'}   ← 旧值全部被覆盖
```

**节点更新 State 的核心规则**可以概括为：

> 节点只返回需要更新的字段；未返回的字段保持不变；返回的字段根据是否配置 Reducer 决定是合并还是覆盖。

**Overwrite 绕过 Reducer**：如果字段定义了 Reducer，但某一次更新希望直接覆盖旧值，可以用 `Overwrite` 包裹：

```python
from langgraph.types import Overwrite

def node_b(state: OverAllState):
    return {
        "logs": Overwrite(["node_b"]),   # 本次更新不走 add Reducer，直接覆盖
        "id": "node_b"
    }
```

以 `START -> node_a -> node_b -> node_c` 为例（`logs` 绑定了 `add`）：

- 没有 `Overwrite` 时，结果为 `['START', 'node_a', 'node_b', 'node_c']`；
- `node_b` 使用 `Overwrite` 后，结果为 `['node_b', 'node_c']`。

`Overwrite` 只影响当前这一次更新，不会修改字段本身的 Reducer 定义——`node_c` 的正常返回仍然走追加合并。

<a name="multi-schema"></a>

### Multi Schema：输入、输出与私有状态

LangGraph 支持在一个图中使用多个状态 Schema，区分图的边界和内部数据流：

| 状态类型            | 声明位置                       | 作用                                       |
| ------------------- | ------------------------------ | ------------------------------------------ |
| 全局状态 / 内部状态 | `StateGraph(state_schema=...)` | 图内部主要使用的状态                       |
| 输入状态            | `input_schema=...`             | 约束调用图时允许传入哪些字段               |
| 输出状态            | `output_schema=...`            | 约束图运行结束后只返回哪些字段             |
| 私有状态            | 节点函数的入参类型注解         | 节点之间传递的临时状态，不作为图的输入输出 |

输入/输出状态面向**图的边界**，全局/私有状态面向**图内部的数据传递**。

完整案例——三个节点分别演示全局状态、私有状态和输出状态：

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
    # 向全局状态写入数据
    return {"nickname": "Dear " + state["username"]}

def node_2(state: OverAllState) -> PrivateState:
    # 从全局状态读取，写入私有状态
    return {"greeting": state["nickname"] + ", 早上好~"}

def node_3(state: PrivateState) -> OutputState:
    # 从私有状态读取，写入输出状态
    return {"graph_output": state["greeting"] + " 很高兴认识你！"}

builder = StateGraph(OverAllState, input_schema=InputState, output_schema=OutputState)
builder.add_node("node_1", node_1)
builder.add_node("node_2", node_2)
builder.add_node("node_3", node_3)
builder.add_edge(START, "node_1")
builder.add_edge("node_1", "node_2")
builder.add_edge("node_2", "node_3")
builder.add_edge("node_3", END)

graph = builder.compile()
print(graph.invoke({"username": "小黄"}))
```

输出：

```json
{ "graph_output": "Dear 小黄, 早上好~ 很高兴认识你！" }
```

虽然图内部同时存在 `username`、`nickname`、`greeting` 等字段，但最终结果只返回 `graph_output`——因为输出会按照 `output_schema` 裁剪。

背后的机制：LangGraph 的状态底层被拆分为多个 **Channel**（每个状态字段对应一个）。创建 `StateGraph` 时，`state_schema`、`input_schema`、`output_schema` 中的字段被记录；`add_node()` 时，节点入参类型注解中的新字段（如私有状态）也会被记录。运行时：

- 调用图时，输入按 `input_schema` 裁剪；
- 节点接收到的状态按其入参类型裁剪；
- 节点返回的是部分更新，按字段名写入对应 Channel；
- 最终输出按 `output_schema` 裁剪。

**设计规范**（工程最佳实践）：

1. 输入/输出状态通常应是全局状态的子集；
2. 私有状态与全局状态应避免字段重名；
3. 节点函数应明确声明入参和返回的状态类型；
4. 节点中不要访问入参类型中不存在的字段（会抛 `KeyError`）；
5. 节点返回的字典尽量与返回类型注解保持一致。

<a name="predefined-states"></a>

### 预定义状态：MessagesState 与 AgentState

**MessagesState** 是官方为 LLM 场景预定义的状态类型，源码只有一行：

```python
class MessagesState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
```

它预定义好了 `messages` 字段及其 `add_messages` 合并规则。构建聊天机器人、Agent、工具调用流程时，直接继承并扩展自定义字段即可：

```python
from langgraph.graph.message import MessagesState

class OverAllState(MessagesState):
    username: str
    output: str

def node_a(state: OverAllState) -> OverAllState:
    return {"messages": [HumanMessage("你好，我是 " + state["username"])]}

def llm_node(state: OverAllState) -> OverAllState:
    res = model.invoke(state["messages"])
    return {"messages": [res], "output": res.content}
```

执行时，`node_a` 返回的 `HumanMessage` 和 `llm_node` 返回的 `AIMessage` 都会经由 `add_messages` 合并进 `messages`，最终状态中包含完整的消息列表。

**AgentState**（`langchain.agents.middleware.types.AgentState`）是 LangChain Agent 内部使用的状态类型，包含三个字段：

- `messages`：消息列表，同样使用 `add_messages`；
- `jump_to`：Agent 中间件体系内部的控制字段，表示流程跳转意图。**注意它不是通用跳转机制**——自定义 `StateGraph` 中即使定义了该字段也不会自动跳转，普通运行图控制流向应使用 `Command(goto=...)`；
- `structured_response`：Agent 结构化输出的存放字段，`OmitFromInput` 标记表示它不作为外部输入暴露。

`AgentState` 专为 LangChain Agent 运行时设计，普通自定义 LangGraph 项目**不建议**直接基于它扩展。

<a name="control-flow"></a>

## 控制流

<a name="sequential-structure"></a>

### 顺序结构

**`add_edge`** 在两个节点之间添加一条有向边，是最基础的控制流构建方式：

```python
builder.add_edge(START, "node_a")   # 图从 node_a 开始执行
builder.add_edge("node_a", "node_b") # node_a 完成后执行 node_b
builder.add_edge("node_b", END)      # node_b 完成后结束
```

如果要构建一组按顺序执行的节点，也可以用 **`add_sequence`** 简化：

```python
builder.add_sequence([node_a, node_b])
# 大致等价于：
# builder.add_node("node_a", node_a)
# builder.add_node("node_b", node_b)
# builder.add_edge("node_a", "node_b")
```

默认函数名被用作节点名，相邻节点之间自动加边，适合简单的线性流程。

**指向 END 的边可以省略吗？** 可以，但不建议。从运行机制看，LangGraph 在每个 Superstep 开始时根据发生更新的 Channel 计算本轮任务列表，如果没有新节点被激活，图运行自然结束——`END` 并不是运行时真正执行的节点，它只表达"终止语义"。但显式的 `END` 边让图结构更完整、可视化渲染更清晰，在分支和循环场景中尤其利于阅读维护。

与 `END` 不同，**`START` 通常不能省略**：它告诉 LangGraph 图从哪些节点开始执行，没有从 `START` 出发的边，运行时就无法确定初始执行节点。

<a name="branching"></a>

### 分支结构

分支分为两类，核心判断标准：

> **编译期就知道下游候选集合 → 静态分支；运行时才决定目标或任务数量 → 动态分支。**

<a name="parallel-nodes"></a>

#### 并行节点

并行节点是最简单的静态分支：多个节点从同一个上游触发，在**同一个超步**中被激活：

```python
builder.add_edge(START, "node_a")
builder.add_edge(START, "node_b")   # node_a 和 node_b 并行执行
```

需要注意的是：

- 这里的"并行"主要指**调度语义上的并行**，两个节点之间没有先后依赖；
- 它们的输出在当前超步执行完成后**统一合并**到状态中；
- 如果两个节点写入**同一个状态字段**，该字段通常需要配置 Reducer，否则会抛出 `InvalidUpdateError`。

<a name="conditional-edges"></a>

#### 条件分支：add_conditional_edges

`add_conditional_edges` 从一个上游节点出发，根据运行时状态选择下游节点，核心参数有三个：

- **`source`**：条件分支的起始节点；
- **`path`**：路由规则（通常是函数），返回值表示跳转目标——可以是单个节点名 / `END`，也可以是多个目标组成的序列；
- **`path_map`**：路由返回值到真实节点名的映射，可省略。

**不使用 path_map** 时，路由函数必须直接返回合法的节点名：

```python
def router(state: OverAllState) -> Literal["node_a", "node_b"]:
    if "诗" in state["content_type"]:
        return "node_a"
    return "node_b"

builder.add_conditional_edges(START, router)
```

**使用 path_map** 时，路由函数可以返回业务语义更强的标签，再映射到节点：

```python
def router(state: OverAllState) -> Literal["a", "b"]:
    return "a" if "诗" in state["content_type"] else "b"

builder.add_conditional_edges(
    START,
    router,
    path_map={"a": "node_a", "b": "node_b"}
)
```

好处：路由函数返回业务含义清晰的标签，节点名保持工程化命名，且渲染图时**边上会显示路由标签**，图更容易理解。在可视化结果中，条件边渲染为**虚线**（固定边是实线）。

**路由到多个节点**：路由函数返回序列即可同时触发多个下游：

```python
def router(state) -> Sequence[Literal["node_a", "node_b", "node_c"]]:
    if "诗" in state["content_type"]:
        return ["node_a", "node_c"]   # 同时触发两个节点
    return ["node_b", "node_c"]
```

此时建议显式传入 `path_map=["node_a", "node_b", "node_c"]`（列表形式等价于恒等映射字典）。否则渲染器无法从返回值推断映射关系，画出的图中节点会"游离"在结构之外。

<a name="deferred-nodes"></a>

#### 延迟节点：defer

如果希望某些节点（日志、审计、结果汇总、收尾清理）在**所有常规任务执行完毕后**再运行，可以在添加节点时设置 `defer=True`：

```python
builder.add_node("audit_node", audit_node, defer=True)
builder.add_edge(START, "audit_node")
```

`audit_node` 虽然也由 `START` 触发，但不会立即执行，而是等常规流程结束后，在**额外的超步**中执行——因此它能读取到所有任务节点已提交的状态：

```python
def audit_node(state: OverAllState) -> OverAllState:
    logger.info(f"任务节点全部执行完毕，诗 {'已生成' if state['poem'] else '未生成'}")
```

底层机制（了解即可）：编译时 LangGraph 为 `defer=True` 节点的入边创建特殊 Channel 类型 `LastValueAfterFinish`（普通节点是 `EphemeralValue`）。常规运行阶段该通道被写入但不触发下游；当没有新的普通节点需要执行时，运行时调用所有 Channel 的 `finish()` 方法，特殊通道随即变为可用，延迟节点在额外超步中被触发。

<a name="dynamic-fan-out-send"></a>

#### 动态扇出：Send

**扇出（Fan-out）**指一个上游节点像扇子一样向外分发多个下游任务。与静态并行不同，`Send` 允许**运行时决定任务数量和每个任务的输入**——比如根据一个列表，为每个元素动态启动一个处理任务。

路由函数返回一个 `Send` 实例序列，每个实例描述一次独立的任务分发：

```python
from langgraph.types import Send

# Send(node, arg)
#   node: 目标节点名（必须已注册）
#   arg:  传给该任务的私有状态，仅对该节点实例可见，各任务之间互不相干
```

完整示例——根据主题动态生成诗、词、笑话三个任务，全部派发给同一个 `worker_node`：

```python
CONTENT_TYPES = ["poem", "ci_poem", "joke"]

class WorkerState(TypedDict):
    """私有状态，只对 worker 任务可见"""
    content_type: Literal["poem", "ci_poem", "joke"]
    prompt: str

def worker_node(state: WorkerState) -> OutputState:
    content = model.invoke([HumanMessage(state["prompt"])]).content
    return {state["content_type"]: content}

def router(state: InputState) -> Sequence[Send]:
    prompts = {"poem": "一首诗", "ci_poem": "一首词", "joke": "一个笑话"}
    return [
        Send("worker_node", {
            "content_type": ct,
            "prompt": f"请生成关于 {state['topic']} 的 {prompts[ct]}"
        })
        for ct in CONTENT_TYPES
    ]

builder.add_conditional_edges(START, router, path_map=["worker_node"])
```

运行时动态创建三个指向 `worker_node` 的任务，它们执行同一个节点函数，但接收到的私有状态不同，因此分别生成诗、词和笑话，三个任务在同一个超步中并行执行。

两个要点：

- `path_map=["worker_node"]` 必须显式声明——`Send` 的目标和数量是运行时才确定的，渲染器无法提前推断，声明后图结构才能正确展示条件边；
- 如果多个并行任务写入**同一个**状态字段，必须为该字段定义 Reducer 来合并输出。本例三个任务分别写 `poem`、`ci_poem`、`joke` 三个不同字段，所以不存在并发合并问题。

<a name="command-goto"></a>

#### 动态跳转：Command(goto)

**`Command`** 是 LangGraph 中控制图执行的多功能原语，构造器接受四个参数：

| 参数     | 作用                                             |
| -------- | ------------------------------------------------ |
| `update` | 更新图状态，等同于节点直接返回状态更新字典       |
| `goto`   | 指定节点执行完成后的跳转目标，实现运行时条件分支 |
| `graph`  | 存在子图时，指定跳转发生在哪一层图中             |
| `resume` | 恢复被中断的图执行（human-in-the-loop 场景）     |

当一个节点**既要更新状态、又要决定下一跳**时，`Command` 比条件边更合适：

```python
from langgraph.types import Command

def router(state: OverAllState) -> Command[Literal["poem_node", "joke_node", END]]:
    content_type = state["content_type"]
    if content_type == "poem":
        return Command(goto="poem_node")
    elif content_type == "joke":
        return Command(goto="joke_node")
    return Command(goto=END)   # 非法值兜底：直接结束
```

三个注意点：

1. 返回值类型注解 `Command[Literal[...]]` **不参与运行时校验**，它的作用是让 LangGraph 和类型检查工具知道该节点可能跳转到哪些目标——对图结构渲染非常重要，不声明的话渲染出的图无法表达潜在跳转关系；
2. 使用 `Command(goto=...)` 的节点，**不要再添加普通下游边**，否则普通边和 `Command` 跳转可能同时生效，触发多个下游节点；
3. `Send` 与 `Command` 的目标节点都必须提前注册，"动态"指的是运行时决定**任务数量、任务输入或跳转路径**，而不是运行时创建新节点。

**Send 与 Command 的分工**：

| 场景     | 典型 API                           | 一句话                     |
| -------- | ---------------------------------- | -------------------------- |
| 动态扇出 | `Send` + `add_conditional_edges()` | 运行时要启动多少个任务实例 |
| 动态跳转 | `Command(goto=...)`                | 当前节点执行完后要去哪里   |

<a name="fan-in"></a>

### 多分支汇聚：Fan-in

与扇出相对，**扇入（Fan-in）**指多个上游分支汇聚到同一个下游节点。根据触发条件分为两种：

- **“与”触发**：所有上游分支全部到达才触发下游节点；
- **“或”触发**：任意一个分支到达即触发下游节点。

（"与/或"只是帮助理解的类比，不是官方术语。）

<a name="static-fan-in"></a>

#### 静态扇入："与"触发 vs "或"触发

这两种语义的写法**看起来相似，行为完全不同**：

```python
# “与”触发：node_e 等待 node_c 和 node_d 全部完成后，触发一次
builder.add_edge(["node_c", "node_d"], "node_e")

# “或”触发（独立触发）：node_c、node_d 各自完成后分别触发 node_e
builder.add_edge("node_c", "node_e")
builder.add_edge("node_d", "node_e")
```

用一个五节点的图验证（`START → node_a → {node_b, node_c}`，`node_b → node_d`）。节点通过 `config` 参数读取当前超步编号：

```python
from langchain_core.runnables import RunnableConfig

def node_a(state: EmptyState, config: RunnableConfig) -> EmptyState:
    cur_step = config["metadata"]["langgraph_step"]
    logger.info("cur_step: {}, node_a 被触发", cur_step)
    return {}
```

**"与"触发**（`add_edge(["node_c", "node_d"], "node_e")`）的运行日志：

```
cur_step: 1, node_a 被触发
cur_step: 2, node_b 被触发
cur_step: 2, node_c 被触发
cur_step: 3, node_d 被触发
cur_step: 4, node_e 被触发      ← 只触发一次，且在所有上游完成后
```

`node_c` 在第 2 步就完成了，但 `node_e` 等到第 4 步（`node_d` 完成后）才执行。

**"或"触发**（两条独立边）的运行日志：

```
cur_step: 1, node_a 被触发
cur_step: 2, node_b 被触发
cur_step: 2, node_c 被触发
cur_step: 3, node_d 被触发
cur_step: 3, node_e 被触发      ← node_c 完成后立即触发
cur_step: 4, node_e 被触发      ← node_d 完成后再次触发
```

`node_e` 被触发了**两次**。这是并行汇聚场景中最容易踩的坑之一，务必根据业务语义选择正确的写法。

<a name="mapreduce"></a>

#### 动态扇入：MapReduce 结构

用 `Send` 动态扇出多个子任务，子任务的中间结果通过 **Reducer** 合并（扇入），再由一个归约节点汇总——这就构成了经典的 **MapReduce** 结构：

```
输入数据                          Map: 映射为中间键值对
  |                                 |
  | "hello world"                   | (hello,1),(world,1)
  | "hello Atguigu"      ──►        | (hello,1),(Atguigu,1)
  | "hello LLM"                     | (hello,1),(LLM,1)
  v                                 v
Shuffle/Group: 按 Key 分组      Reduce: 归约聚合
  |                                 |
  | hello -> [1,1,1]                | hello -> 3
  | world -> [1]         ──►        | world -> 1
  | ...                             | ...
```

实现一个词频统计任务：

```python
class OverAllState(TypedDict):
    input_values: list[str]
    entries: Annotated[list[tuple[str, int]], add]   # Reducer 合并各 mapper 的输出
    word_counts: dict[str, int]

def router_map(state: OverAllState) -> Sequence[Send]:
    # 为每条输入动态创建一个 mapper 任务
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
builder.add_edge("mapper_node", "reducer_node")   # “与”触发：等所有 mapper 完成
builder.add_edge("reducer_node", END)

graph = builder.compile()
print(graph.invoke({"input_values": ["hello world", "hello Atguigu", "hello LLM"]}))
```

输出：

```json
{
  "word_counts": { "hello": 3, "world": 1, "Atguigu": 1, "LLM": 1 }
}
```

关键机制：三个 `mapper_node` 任务实例并行执行，各自返回 `entries`；由于该字段绑定了 `add` Reducer，三份中间结果被合并到同一个状态字段；`mapper_node → reducer_node` 的边是"与"触发，`reducer_node` 等所有 mapper 完成后执行一次，完成分组和求和。

> `display(graph)` 展示的是**节点级**计算图（只有一个 `mapper_node`），而实际运行时 `Send` 会按输入数据动态创建多个**任务实例**。

<a name="loops"></a>

### 循环结构：ReAct

LangChain Agent 底层的运行图架构正是 **ReAct**（Reason + Action，"推理 + 行动"）循环：

1. **Reason**：大模型根据当前消息状态推理，判断是否需要调用工具；
2. **Action**：需要则生成工具调用请求；
3. **Observation**：工具执行结果以 `ToolMessage` 形式返回给大模型；
4. **Loop**：大模型基于新观察继续推理，决定是否继续调用工具；
5. **Final Answer**：不再发起工具调用时，生成最终回答，流程结束。

本质是一个 "LLM → Tool → LLM → Tool → ... → LLM" 的循环：

```
START
  ↓
input_node
  ↓
llm_node ◄────────────┐
  ├── 有 tool_calls → tool_node
  └── 无 tool_calls → output_node → END
```

<a name="react-static-vs-dynamic"></a>

#### 静态实现与动态实现

同一个 ReAct 循环可以用两种方式实现，**本质区别不在能否循环，而在路由逻辑写在哪里**。

**静态实现**——路由逻辑在独立的 `router()` 函数中，通过 `add_conditional_edges()` 显式声明条件边。"静态"指下游候选集合在编译期已确定，运行时只是从中选择：

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
builder.add_edge("tool_node", "llm_node")   # 循环：工具结果回到 LLM
builder.add_edge("output_node", END)
```

**动态实现**——路由逻辑内聚在节点返回值中，`llm_node` 用 `Command` 同时完成"状态更新 + 下一跳控制"，不再需要独立的 `router()` 和条件边：

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

|            | 静态实现                     | 动态实现                   |
| ---------- | ---------------------------- | -------------------------- |
| 路由位置   | 独立的 `router()` 函数       | 节点返回值中               |
| 图结构表达 | 显式条件边，更直观           | 控制逻辑内聚，代码更紧凑   |
| 适合场景   | 路由规则独立、图结构清晰优先 | 节点执行结果直接决定下一跳 |

工具调用失败的重试行为值得注意：示例中靠系统提示词 `"如果工具调用失败，必须重新调用直至成功"` 驱动模型重试——**是否重试由大模型决定，而不是程序逻辑强制保证**。如果模型在多次失败后选择放弃并生成回答，运行图不会阻止它。需要硬性保证时，应在 `tool_node` 或路由逻辑中用代码实现重试。

<a name="recursion-limit"></a>

#### 递归限制与优雅退出

循环结构如果没有合理的停止条件，图可能无限执行。LangGraph 提供**递归限制**机制：`recursion_limit` 限制单次运行允许的最大 Superstep 数量，耗尽时抛出 `GraphRecursionError`：

```python
graph.invoke(input, config={"recursion_limit": 10})
```

> **默认值不可靠**：它随版本和运行环境变化——`langchain_core.runnables.config` 中默认 25（LangChain Agent 生效）、`langgraph._internal._config` 中默认 10000（自定义图生效）、LangGraph API 服务侧默认 10011。**最佳实践是显式传入 `recursion_limit`**。

处理递归限制有两种方法：

**主动方法（Proactive）**——借助 `RemainingSteps` 托管值在图内部提前判断剩余步数，优雅退出：

```python
from langgraph.managed import RemainingSteps

class OverAllState(TypedDict):
    remaining_steps: RemainingSteps   # 运行时自动填充剩余可用步数

def router(state: OverAllState) -> Literal["loop_node", END]:
    if state["remaining_steps"] < 3:
        logger.info("剩余步数不足，终止运行图")
        return END
    return "loop_node"
```

当前超步序号与剩余步数之和等于 `recursion_limit`。剩余步数不足时路由到 `END`，图**正常结束**，不抛异常，还能把中间状态保存到检查点、返回部分结果。

**被动方法（Reactive）**——在图外部捕获异常：

```python
from langgraph.errors import GraphRecursionError

try:
    graph.invoke({}, config={"recursion_limit": 10})
except GraphRecursionError as e:
    logger.info("超步数量达到最大限制: {}", e)
```

图已被异常中断，但进程不会崩溃，可以集中处理错误。

| 方法                               | 超限检测     | 处理方式            | 控制流               |
| ---------------------------------- | ------------ | ------------------- | -------------------- |
| 主动（`RemainingSteps`）           | 达到限制之前 | 图内部条件路由      | 图继续运行，正常结束 |
| 被动（捕获 `GraphRecursionError`） | 超出限制之后 | 图外部 `try/except` | 图运行被异常中断     |

**选择建议**：循环本身是业务逻辑的一部分（ReAct 循环、多轮反思、自我修正、工具重试）时，优先用主动方法在图内优雅降级；被动方法作为最后一道防线保留在最外层。

<a name="edges-summary"></a>

## 边的系统总结

把前文的边用法做一次系统梳理：

| 边类型     | 写法                                             | 语义                                    |
| ---------- | ------------------------------------------------ | --------------------------------------- |
| 普通边     | `add_edge("a", "b")`                             | a 完成后直接执行 b                      |
| 条件边     | `add_conditional_edges("a", router)`             | a 完成后由路由函数决定进入哪个/哪些节点 |
| 入口点     | `add_edge(START, "a")` 或 `set_entry_point("a")` | 图开始运行时首先执行 a（二者等价）      |
| 条件入口点 | `add_conditional_edges(START, router)`           | 以 START 为起点的条件边                 |
| 终止点     | `add_edge("a", END)` 或 `set_finish_point("a")`  | a 完成后流程结束（二者等价）            |
| 条件终止点 | 路由函数返回 `END`                               | 根据状态决定继续执行还是终止            |

三点注意：

1. 一个节点可以有多个出边，目标节点会在下一个超步中**并行**执行；
2. 条件边也可以通过节点返回 `Command(goto=...)` 实现，方式不同但性质和作用完全一致；
3. **同一个节点尽量只用一种路由机制**——不要混用普通边和条件边/`Command`，否则多条路径可能同时生效，导致运行逻辑混乱。

另外，`END` 不是普通业务节点，而是特殊终止标记：编译后的运行图中，终止边和 `END` 没有对应的 Channel 和节点。终止边可以省略（运行时在无活跃节点时自然终止），但为了可读性和可视化渲染正常，最好显式声明。

<a name="fault-tolerance"></a>

## 节点执行与容错机制

节点执行失败时若不做处理，可能导致整个图运行失败。LangGraph 针对四类问题提供对应机制：

| 问题/场景                          | 对应机制                 | 类型     | 版本要求      |
| ---------------------------------- | ------------------------ | -------- | ------------- |
| 临时故障（网络抖动、接口偶发失败） | 重试 `RetryPolicy`       | 容错     | 当前版本可用  |
| 节点执行时间过长                   | 超时 `TimeoutPolicy`     | 容错     | langgraph≥1.2 |
| 重试耗尽后需要兜底                 | 错误处理 `error_handler` | 容错     | langgraph≥1.2 |
| 相同输入重复触发耗时节点           | 缓存 `CachePolicy`       | 性能优化 | 当前版本可用  |

失败处理的整体顺序：

```
节点执行失败
    ↓
RetryPolicy 判断是否需要重试
    ↓ 满足且未达最大次数        ↓ 重试耗尽
重新执行节点                进入 error_handler
                                ↓ 未配置
                            异常向外抛出，图运行失败
```

<a name="retry-policy"></a>

### 重试机制：RetryPolicy

重试是最常用、最基础的容错能力，在 `add_node` 时通过 `retry_policy=` 配置：

```python
from langgraph.types import RetryPolicy
from requests.exceptions import HTTPError

def node_a(state: EmptyState) -> EmptyState:
    logger.info("node a 运行")
    raise HTTPError("网络连接超时...")

builder.add_node(
    "node_a",
    node_a,
    retry_policy=RetryPolicy(max_attempts=3, jitter=False)
)
```

运行日志显示节点被调用了 3 次（间隔约 0.5s、1s，指数退避），全部失败后异常向外抛出，可在外层 `try/except` 捕获。

`RetryPolicy` 主要参数：

| 参数               | 默认值             | 描述                             |
| ------------------ | ------------------ | -------------------------------- |
| `max_attempts`     | `3`                | 最大尝试次数（**包括首次执行**） |
| `initial_interval` | `0.5`              | 第一次重试前的等待秒数           |
| `backoff_factor`   | `2.0`              | 每次重试后等待时间的放大倍数     |
| `max_interval`     | `128.0`            | 相邻两次重试的最大等待秒数       |
| `jitter`           | `True`             | 是否为重试间隔添加随机抖动       |
| `retry_on`         | `default_retry_on` | 哪些异常触发重试                 |

理解要点：

- `max_attempts=3` 表示总共执行 3 次（首次 + 2 次重试），不是失败后再重试 3 次；
- 指数退避：`initial_interval=0.5, backoff_factor=2.0` 时等待时间约为 `0.5s → 1s → 2s → 4s...`，且不超过 `max_interval`；
- **jitter（抖动）**：并发场景下大量任务同时失败后若按固定间隔同时重试，可能把服务再次打爆；加入随机抖动可打散重试时间、削平瞬时流量峰值。生产环境建议保留默认 `jitter=True`；
- `retry_on` 支持三种写法：单个异常类型 `retry_on=HTTPError`、多个异常类型 `retry_on=(HTTPError, ConnectionError)`、自定义判断函数 `retry_on=lambda exc: isinstance(exc, HTTPError)`。

<a name="default-retry-rules"></a>

### 默认重试规则：default_retry_on

不指定 `retry_on` 时使用默认的 `default_retry_on`，其核心逻辑：

```python
def default_retry_on(exc: Exception) -> bool:
    if isinstance(exc, ConnectionError):
        return True                       # 连接错误：重试
    if isinstance(exc, httpx.HTTPStatusError):
        return 500 <= exc.response.status_code < 600   # 只对 5xx 重试
    if isinstance(exc, requests.HTTPError):
        return 500 <= exc.response.status_code < 600 if exc.response else True
    if isinstance(exc, (ValueError, TypeError, ArithmeticError, ImportError,
                        LookupError, NameError, SyntaxError, RuntimeError,
                        ReferenceError, StopIteration, StopAsyncIteration,
                        OSError)):
        return False                      # 代码/类型/语法/运行时错误：不重试
    return True                           # 其余异常：默认重试
```

设计逻辑：

- **4xx 不重试**：客户端请求错误（参数错误、鉴权失败、资源不存在），重试没有意义；
- **5xx 重试**：服务端临时异常（服务不可用、网关错误），适合通过重试恢复；
- `ValueError`、`TypeError`、`SyntaxError` 等通常是代码逻辑错误，单纯重试无用。

<a name="timeout-and-error-handling"></a>

### 超时控制与错误处理

以下两个特性要求 `langgraph>=1.2`，这里只做概念说明。

**超时控制（TimeoutPolicy）**：限制单次节点执行的最大耗时，避免节点因外部服务无响应而长时间阻塞：

```python
from langgraph.types import TimeoutPolicy

builder.add_node("call_model", call_model, timeout=TimeoutPolicy(run_timeout=60))
```

超过 60 秒抛出 `NodeTimeoutError`，交给 `RetryPolicy` 判断是否重试，重试耗尽才进入错误处理。常见参数：`run_timeout`（单次运行最长时间）、`idle_timeout`（无可观察进展时的最长空闲时间）、`refresh_on`（空闲时间的刷新方式）。

> **注意**：节点级超时**仅适用于异步节点**（`async def`）。同步节点一旦执行就会阻塞线程，Python 缺少安全的外部强杀机制。同步节点应在内部使用具体库自带的 `timeout` 参数（HTTP 客户端、数据库驱动等）。

**错误处理（error_handler）**：节点最终失败后执行兜底逻辑：

```python
builder.add_node(
    "call_api",
    call_api,
    retry_policy=RetryPolicy(max_attempts=3),
    error_handler=handle_api_error
)
```

`handle_api_error` 可以返回状态更新，也可以通过 `Command` 路由到其他节点。适用场景：API 失败后返回兜底结果、切换到备用服务、执行补偿逻辑、避免单个节点失败导致整图终止。

<a name="node-caching"></a>

### 节点缓存：CachePolicy

节点缓存指：将节点的历史运行结果保存下来，后续收到**相同输入**时不再重复执行，直接返回缓存结果——用于减少重复计算、降低延迟和成本。

适用场景需同时满足：

1. **节点函数具有确定性**：相同输入产生相同输出；
2. **执行成本较高**：大模型调用、API 请求、复杂计算等；
3. **相同输入会重复出现**：多次调试、重复流程、多分支复用中间结果；
4. **输入能被缓存键函数稳定处理**：默认用 `pickle` 序列化生成缓存 Key，建议输入是简单可序列化结构（`str`/`int`/`dict`/`list` 等）；包含文件句柄、数据库连接、模型实例等复杂对象时应自定义 `key_func`。

配置需要**两步**，缺一不可：

```python
from langgraph.cache.memory import InMemoryCache
from langgraph.types import CachePolicy

# 第一步：为节点声明缓存策略
builder.add_node("node_a", node_a, cache_policy=CachePolicy(ttl=10))

# 第二步：编译时指定缓存后端
graph = builder.compile(cache=InMemoryCache())
```

只配 `cache_policy` 不传 `cache=`，缓存不会生效。`CachePolicy` 只有两个参数：

| 参数       | 描述                                                                       |
| ---------- | -------------------------------------------------------------------------- |
| `key_func` | 根据节点输入生成缓存 Key 的函数，默认 `default_cache_key`（pickle 序列化） |
| `ttl`      | 缓存存活秒数；`None` 表示永不过期                                          |

用一个模拟 3 秒耗时操作的节点验证缓存行为：

```python
def node_a(state: EmptyState) -> EmptyState:
    logger.info("node_a 被调用, user: {}", state["user"])
    time.sleep(3)   # 模拟耗时操作
    return {"invoke_counts": 1}
```

| 调用       | 输入                | 是否命中缓存 | 现象                         |
| ---------- | ------------------- | ------------ | ---------------------------- |
| 第 1 次    | `user=小明`         | 未命中       | 执行节点（3s），结果写入缓存 |
| 第 2 次    | `user=小明`（相同） | **命中**     | 不执行节点，直接返回缓存结果 |
| 第 3 次    | `user=小花`（不同） | 未命中       | 执行节点，写入新缓存         |
| ttl 过期后 | `user=小明`         | 未命中       | 重新执行，并重新写入缓存     |

> **ttl 设置提醒**：如果节点依赖外部状态（当前时间、远程 API 数据、数据库查询、提示词/模型版本等），不要设置永久缓存——应根据业务设置合适的 `ttl`，或把这些变量纳入缓存 Key 的计算逻辑。

此外，`langgraph>=1.2` 还提供**全图默认配置** `set_node_defaults`，可一次性为所有节点设置默认的 `retry_policy`、`timeout`、`error_handler`、`cache_policy`，避免在每个 `add_node` 中重复相同配置。

<a name="best-practices"></a>

## 最佳实践

**环境与配置**

- API Key 一律放 `.env` 并加入 `.gitignore`，代码用 `load_dotenv()` 加载，绝不硬编码；
- 用独立的 conda 虚拟环境隔离项目依赖。

**状态设计**

- 优先用 `TypedDict` 定义 State Schema；
- 会被多个节点（尤其并行节点）写入的字段，必须配置 Reducer，否则 `InvalidUpdateError`；
- 用 `input_schema` / `output_schema` 约束图的边界，私有状态字段避免与全局状态重名；
- 节点只返回需要更新的字段，返回字典与返回类型注解保持一致。

**图结构**

- 显式声明指向 `END` 的边，图结构更完整、可视化更清晰；
- 同一个节点只用一种路由机制，不要混用普通边与条件边/`Command`；
- 使用 `Command(goto=...)` 或 `Send` 时，用类型注解 / `path_map` 显式声明可能的目标节点，保证图渲染正确；
- 路由逻辑独立、图结构清晰优先 → 条件边；节点结果直接决定下一跳、代码内聚优先 → `Command`。

**循环与容错**

- **显式传入 `recursion_limit`**，不要依赖随版本变化的默认值；
- 业务性循环（ReAct、反思、重试）用 `RemainingSteps` 主动优雅退出，外层再捕获 `GraphRecursionError` 兜底；
- 生产环境重试保留 `jitter=True`，用 `retry_on` 限定可重试的异常类型；
- 确定性 + 高成本 + 输入重复的节点才启用缓存，并设置合理的 `ttl`。

<a name="faq"></a>

## 常见问题

**Q1：`conda` 命令找不到？**

Windows：确认安装时勾选了 "Add Miniconda3 to my PATH"，或直接从开始菜单打开 Anaconda Prompt。macOS / Linux：执行 `~/miniconda3/bin/conda init` 后重启终端。

**Q2：`import langgraph` 报 `ModuleNotFoundError`？**

包没有安装到当前环境。`conda activate langgraph` 后用 `pip show langgraph` 确认，未安装则重新 `pip install`。

**Q3：模型调用报 `AuthenticationError`？**

依次检查：`.env` 中 Key 是否正确、`.env` 是否在项目根目录、代码开头是否执行了 `load_dotenv(override=True)`。

**Q4：并行节点写同一个字段报 `InvalidUpdateError`？**

同一超步内多个更新写同一字段且没有 Reducer 时会冲突。为字段配置合适的 Reducer（如 `operator.add`、`add_messages`），或让各节点写不同字段。

**Q5：`add_edge(["a", "b"], "c")` 和分别写两条边到 `c` 有什么区别？**

前者是"与"触发：`c` 等 `a`、`b` 全部完成后执行一次；后者是"或"触发：`a`、`b` 各自完成后分别触发 `c`（可能执行两次）。二者不等价，按业务语义选择。

**Q6：条件边渲染出的图中，节点"游离"在结构之外？**

路由函数返回序列或 `Send` 时，渲染器无法推断映射关系。显式传入 `path_map` 声明候选下游节点即可。

**Q7：图一直循环最后报 `GraphRecursionError`？**

循环没有可达的停止条件，或 `recursion_limit` 太小。检查路由逻辑，显式设置 `recursion_limit`，并考虑用 `RemainingSteps` 实现优雅退出。

**Q8：配置了 `CachePolicy` 但缓存不生效？**

缓存需要两步：节点上配 `cache_policy=` **且** 编译时传 `cache=InMemoryCache()`，缺一不可。另外确认两次输入完全相同、缓存未超过 `ttl`。

**Q9：`draw_mermaid_png()` 渲染失败？**

底层调用在线服务（默认 mermaid.ink），网络问题可能失败，通常重试即可；也可通过 `base_url` 参数替换为可用的渲染服务。

**Q10：`jump_to` 字段能用来控制自定义图的跳转吗？**

不能。它是 LangChain Agent 中间件体系的内部字段，普通 `StateGraph` 不会因它自动跳转。自定义图控制流向请使用 `Command(goto=...)`。

<a name="summary"></a>

## 总结

本文从零开始整合了 LangGraph 入门所需的核心内容：

- **环境**：Miniconda + Python 3.13 + `.env` 管理 API Key，验证脚本确保环境就绪；
- **定位**：LangChain 提供 Agent 高层抽象，LangGraph 提供底层编排与运行时能力，`create_agent` 底层即基于 LangGraph；
- **核心模型**：State / Node / Edge 三要素，Superstep 三阶段（路由 → 执行 → 提交）驱动图运行，Checkpoint 在超步边界记录快照；
- **状态管理**：TypedDict 是首选 Schema；Reducer 决定合并还是覆盖；Multi Schema 划分图的边界与内部数据流；`MessagesState` 为 LLM 场景开箱即用；
- **控制流**：顺序、并行、条件分支、`defer` 收尾、`Send` 动态扇出、`Command` 动态跳转、Fan-in 汇聚、MapReduce、ReAct 循环，以及 `recursion_limit` 下的主动/被动退出策略；
- **容错**：`RetryPolicy`（指数退避 + jitter + 异常过滤）和节点缓存（两步配置）当前版本可用，超时与错误处理需 `langgraph>=1.2`。

掌握了这些，你已经能用 LangGraph 构建结构清晰、可持久化、可容错的工作流。后续可以继续深入持久化与记忆管理、中断与 Human-in-the-loop、以及 LangGraph 部署等主题。

## 参考链接

- LangGraph 官方文档：https://docs.langchain.com/oss/python/langgraph
- Functional API：https://docs.langchain.com/oss/python/langgraph/functional-api
- 容错机制：https://docs.langchain.com/oss/python/langgraph/fault-tolerance
- Miniconda 下载：https://docs.anaconda.com/miniconda/
