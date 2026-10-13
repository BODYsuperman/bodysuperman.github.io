---
title: 回溯算法
lang: zh-CN
date: 2026-04-12 12:48:28
updated: 2026-04-22 00:00:00
comments: true
categories:

- Data Structure and Algorithm

tags:

- Backtracking
- DFS
- Recursion
- LeetCode
- Problem Solving
- Mental Model
- Developer Journey

---

- [1. 理解回溯](#1-understanding-backtracking)
  - [1.1 什么是回溯？](#11-what-is-backtracking)
  - [1.2 现实世界类比](#12-real-world-analogy)
  - [1.3 何时使用回溯](#13-when-to-use-backtracking)
- [2. 核心模式](#2-the-core-pattern)
  - [2.1 三步循环](#21-the-three-step-cycle)
  - [2.2 为什么"撤销"至关重要](#22-why-undo-is-critical)
  - [2.3 标准模板](#23-the-standard-template)
- [3. 决策树心智模型](#3-decision-tree-mental-model)
  - [3.1 树的层级与分支](#31-tree-levels-vs-branches)
  - [3.2 理解 startIndex](#32-understanding-startindex)
  - [3.3 `i + 1` 的真正含义](#33-what-i-1-really-means)
- [4. 剪枝：必要性，而非优化](#4-pruning-necessity-not-optimization)
  - [4.1 提前终止逻辑](#41-early-termination-logic)
  - [4.2 剪枝实践](#42-pruning-in-practice)
- [5. 去重策略](#5-deduplication-strategy)
  - [5.1 为什么去重很重要](#51-why-deduplication-matters)
  - [5.2 `i > startIndex` 模式](#52-the-i--startindex-pattern)
  <!--more-->
- [6. 从易到难：题目递进](#6-from-easy-to-hard-problem-progression)
  - [6.1 组合](#61-combinations)
  - [6.2 子集](#62-subsets)
  - [6.3 排列](#63-permutations)
  - [6.4 N 皇后](#64-n-queens)
- [7. "低效"的错觉](#7-the-inefficiency-illusion)
  - [7.1 为什么感觉什么都没做](#71-why-it-feels-like-doing-nothing)
  - [7.2 拥抱过程](#72-embracing-the-process)
- [8. 现实世界应用](#8-real-world-applications)
  - [8.1 任务调度](#81-task-scheduling)
  - [8.2 配置生成](#82-configuration-generation)
  - [8.3 约束求解](#83-constraint-solving)
- [9. 可复用的心智模型](#9-a-reusable-mental-model)
  - [9.1 六个关键问题](#91-the-6-critical-questions)
  - [9.2 决策树检查清单](#92-decision-tree-checklist)
- [10. 常见 LeetCode 题目](#10-common-leetcode-problems)
- [11. 最终要点](#11-final-takeaways)

---

<a name="1-understanding-backtracking"></a>

## 理解回溯

<a name="11-what-is-backtracking"></a>

### 什么是回溯？

回溯是一类用于寻找计算问题解的算法，特别适用于约束满足和枚举问题。它的工作方式是：

1. **逐步构建候选解**
2. **一旦确定某个候选解不可能完成为有效解，就放弃它**（"回溯"）

> "回溯就像探索迷宫——你尝试一条路，如果走不通，就返回上一个决策点，尝试另一条。"

![pic](pic01.png)

<a name="12-real-world-analogy"></a>

### 现实世界类比

| 场景         | 回溯等价操作                                                       |
| ------------ | ------------------------------------------------------------------ |
| 解迷宫       | 尝试路径 → 遇到死胡同 → 返回岔路口 → 尝试下一条路径               |
| 数独求解器   | 放置数字 → 检查冲突 → 回溯 → 尝试下一个数字                       |
| 自动纠错     | 生成单词 → 查字典 → 回溯 → 尝试不同字母                           |

<a name="13-when-to-use-backtracking"></a>

### 何时使用回溯

**适合的问题：**

- 生成所有有效的组合/子集/排列
- 约束满足问题（N 皇后、数独）
- 具有明确"有效/无效"判定的决策树
- 需要枚举所有解的问题

**不适合：**

- 寻找单一最优路径（使用 Dijkstra/BFS）
- 无序线性搜索
- 没有"部分候选解"概念的问题

<a name="2-the-core-pattern"></a>

## 核心模式

<a name="21-the-three-step-cycle"></a>

### 三步循环

```
Choose → Explore → Undo
```

| 步骤 | 代码模式                       | 目的       |
| ---- | ------------------------------ | ---------- |
| 选择 | `path.add(candidate)`          | 做出决策   |
| 探索 | `dfs(next_level)`              | 深入       |
| 撤销 | `path.remove(path.size() - 1)` | 恢复状态   |

<a name="22-why-undo-is-critical"></a>

### 为什么"撤销"至关重要

没有撤销步骤：

| 有撤销                                | 没有撤销                            |
| ------------------------------------- | ----------------------------------- |
| ✅ 每个分支结束后状态恢复             | ❌ 后续分支继承了错误的状态         |
| ✅ 每个分支独立探索                   | ❌ 分支之间产生"污染"               |
| ✅ 正确遍历解空间                     | ❌ 遗漏有效解                       |

<a name="23-the-standard-template"></a>

### 标准模板

```java
void backtrack(int startIndex, List<Integer> path, List<List<Integer>> res) {
    // 1. Base case: when to stop?
    if (终止条件) {
        res.add(new ArrayList<>(path));
        return;
    }

    // 2. Loop through choices
    for (int i = startIndex; i < n; i++) {
        // 3. Choose
        path.add(nums[i]);

        // 4. Explore
        backtrack(i + 1, path, res);

        // 5. Undo (backtrack)
        path.remove(path.size() - 1);
    }
}
```

<a name="3-decision-tree-mental-model"></a>

## 决策树心智模型

<a name="31-tree-levels-vs-branches"></a>

### 树的层级与分支

```
                    Level 0 (root)
                   /        |        \
                  /         |         \
                 /          |          \
           Level 1:1    Level 1:2    Level 1:3  ← Different branches at same level
             /  \         /   \
            /    \       /     \
    Level 2:2  Level 2:3  Level 2:3  ← Deeper level
```

- **层级（Level）**：树中的深度（已做出多少个选择）
- **分支（Branch）**：同一层级的不同选项（替代方案）

<a name="32-understanding-startindex"></a>

### 理解 startIndex

`startIndex` 控制**当前层级从哪里开始搜索**。

| 场景     | startIndex 行为                       |
| -------- | ------------------------------------- |
| 组合     | `i + 1` - 从下一个元素开始            |
| 排列     | 始终为 `0` - 可以使用任何未使用的元素 |
| 子集     | `i + 1` - 扩展搜索范围                |

<a name="33-what-i-1-really-means"></a>

### `i + 1` 的真正含义

```
If we pick element at index i:
  - Current level: uses nums[i]
  - Next level: starts from index i + 1
  - Result: avoids reusing nums[i] or earlier elements
```

**为什么这能防止重复：**

- Branch 1 (start=0): picks nums[0]=1 → then search range [1,2,3...]
- Branch 2 (start=1): picks nums[1]=2 → then search range [2,3...]
- Branch 3 (start=2): picks nums[2]=3 → then search range [3...]
- Result: [1,2] and [2,1] never both appear

<a name="4-pruning-necessity-not-optimization"></a>

## 剪枝：必要性，而非优化

<a name="41-early-termination-logic"></a>

### 提前终止逻辑

剪枝消除**不可能成功**的路径：

```
Example: Choose k elements from n
Remaining elements needed: k - path.size()
Remaining elements available: n - i + 1

If (n - i + 1 < k - path.size()) → impossible to succeed → skip
```

约束条件：`i <= n - (k - path.size()) + 1`

| 变量          | 含义                                 |
| ------------- | ------------------------------------ |
| `n`           | 可用元素总数                         |
| `k`           | 目标元素数量                         |
| `path.size()` | 已选择的元素数量                     |
| `n - i + 1`   | 剩余元素数量（包含当前元素）         |

<a name="42-pruning-in-practice"></a>

### 剪枝实践

```java
// Without pruning - explores unnecessary branches
for (int i = startIndex; i <= n; i++) {
    path.add(nums[i]);
    backtrack(i + 1, path, res);
    path.remove(path.size() - 1);
}

// With pruning - skips impossible branches
for (int i = startIndex; i <= n - (k - path.size()) + 1; i++) {
    path.add(nums[i]);
    backtrack(i + 1, path, res);
    path.remove(path.size() - 1);
}
```

<a name="5-deduplication-strategy"></a>

## 去重策略

<a name="51-why-deduplication-matters"></a>

### 为什么去重很重要

没有去重时，包含重复值的问题会产生重复的结果：

| 输入    | 不去重                                   | 去重后            |
| ------- | ---------------------------------------- | ----------------- |
| [1,1,2] | [[1,1,2],[1,2,1],[1,1,2],[1,2,1],...]    | [[1,1,2],[1,2,1]] |

<a name="52-the-i--startindex-pattern"></a>

### `i > startIndex` 模式

```java
if (i > startIndex && nums[i] == nums[i - 1]) continue;
```

**正确理解：**

- `i > startIndex`：我们在同一树层（同一决策深度）
- `nums[i] == nums[i-1]`：与前一个分支相同的值
- **含义**：避免在同一层级内两次选择相同的值

**它不意味着：**

- ❌ "输入中不允许有重复值"
- ❌ "结果中不允许有重复值"

<a name="6-from-easy-to-hard-problem-progression"></a>

## 从易到难：题目递进

<a name="61-combinations"></a>

### 组合

**问题**：从 n 个元素中选择 k 个，顺序无关

**关键约束**：` startIndex` + `i + 1`

**模板**：

```java
void combine(int n, int k) {
    backtrack(1, n, k, new ArrayList<>(), result);
}

for (int i = startIndex; i <= n - (k - path.size()) + 1; i++) {
    path.add(i);
    backtrack(i + 1, n, k, path, res);
    path.remove(path.size() - 1);
}
```

<a name="62-subsets"></a>

### 子集

**问题**：生成所有可能的子集（幂集）

**关键区别**：在**每一步**都收集结果，而不仅在叶节点

```java
void subsets(int[] nums) {
    backtrack(0, nums, new ArrayList<>(), res);
    res.add(new ArrayList<>()); // empty set
}

// Collect at beginning of each call
res.add(new ArrayList<>(path));
for (int i = startIndex; i < nums.length; i++) {
    // ... choose, explore, undo
}
```

<a name="63-permutations"></a>

### 排列

**问题**：将所有元素按所有可能的顺序排列

**关键区别**：`startIndex` 始终为 `0`，但需要跟踪已使用的元素

```java
void permute(int[] nums) {
    boolean[] used = new boolean[nums.length];
    backtrack(nums, used, new ArrayList<>(), res);
}

for (int i = 0; i < nums.length; i++) {
    if (used[i]) continue;  // Skip already used
    used[i] = true;
    path.add(nums[i]);
    backtrack(nums, used, path, res);  // startIndex remains 0
    path.remove(path.size() - 1);
    used[i] = false;
}
```

<a name="64-n-queens"></a>

### N 皇后

**问题**：在 N×N 棋盘上放置 N 个皇后，使得任意两个皇后不互相攻击

**约束**：

- 每行一个皇后
- 每列一个皇后
- 同一对角线上不能有两个皇后

**状态跟踪**：

```java
// Columns occupied
boolean[] cols = new boolean[n];

// Diagonal \ (row - col is constant)
boolean[] diag1 = new boolean[2 * n - 1];

// Diagonal / (row + col is constant)
boolean[] diag2 = new boolean[2 * n - 1];

// Check before placing queen at (row, col)
if (!cols[col] && !diag1[row - col + n - 1] && !diag2[row + col]) {
    // Place queen and recurse
}
```

<a name="7-the-inefficiency-illusion"></a>

## "低效"的错觉

<a name="71-why-it-feels-like-doing-nothing"></a>

### 为什么感觉什么都没做

```
Most paths are invalid
↓
Constant loop of: Try → Fail → Backtrack → Try again
↓
No immediate visible progress
↓
Feeling of "wasting time"
```

**现实**：回溯是在**排除错误答案**，而非直接构建正确答案。

<a name="72-embracing-the-process"></a>

### 拥抱过程

| 心态                                        | 影响             |
| ------------------------------------------- | ---------------- |
| "这没用"                                    | 容易放弃         |
| "我在缩小搜索空间"                          | 持久、系统化     |
| "每次失败都告诉我什么行不通"                | 学习方法         |

<a name="8-real-world-applications"></a>

## 现实世界应用

<a name="81-task-scheduling"></a>

### 任务调度

```
Constraints:
- Task A must finish before B
- Task C requires 2GB RAM
- Only 3 tasks can run in parallel

Backtracking finds all valid schedules
```

<a name="82-configuration-generation"></a>

### 配置生成

```
Generate all valid configurations:
- Option 1: [A, B, C]
- Option 2: [A, B, D]
- Option 3: [A, C, D]  ← skips invalid [A, B, E] due to constraints
```

<a name="83-constraint-solving"></a>

### 约束求解

| 领域       | 回溯应用                         |
| ---------- | -------------------------------- |
| AI 规划    | 实现目标的动作序列               |
| 电路设计   | 带约束的元件放置                 |
| 资源分配   | 在限制条件下分配资源             |
| 游戏 AI    | 搜索所有可能的走法和应对走法     |

<a name="9-a-reusable-mental-model"></a>

## 可复用的心智模型

<a name="91-the-6-critical-questions"></a>

### 六个关键问题

在编写回溯代码之前，先问：

1. **结果是什么？**（`res` - List<List<>> 或类似结构）
2. **当前路径是什么？**（`path` - 我们正在构建的）
3. **每一步有哪些选择？**（`for` 循环的候选项）
4. **何时应该停止？**（基本情况 / 终止条件）
5. **需要去重吗？**（输入中有重复值）
6. **能剪枝吗？**（提前终止条件）

<a name="92-decision-tree-checklist"></a>

### 决策树检查清单

```
[ ] Define the tree structure
    - What represents a level?
    - What represents branches at each level?

[ ] Identify the state to track
    - Current path
    - Used elements / visited nodes
    - Constraints satisfaction

[ ] Write the base case first
    - When is a complete solution found?
    - When should we abandon early?

[ ] Implement the loop
    - What is the search range?
    - How do we avoid duplicates?

[ ] Verify undo works correctly
    - Does state restore after each iteration?
```

<a name="10-common-leetcode-problems"></a>

## 常见 LeetCode 题目

| 题目                          | 难度 | 核心概念           | 结果数量        |
| ----------------------------- | ---- | ------------------ | --------------- |
| [78] 子集                     | 中等 | 每一步都收集       | 2^n             |
| [77] 组合                     | 中等 | startIndex + 剪枝  | C(n,k)          |
| [46] 全排列                   | 中等 | 跟踪已使用元素     | n!              |
| [784] 字母大小写全排列        | 中等 | 条件分支           | 2^L (L=字母数)  |
| [22] 括号生成                 | 中等 | 有效性检查         | Catalan(n)      |
| [39] 组合总和                 | 中等 | 允许重复使用       | 不定            |
| [40] 组合总和 II              | 中等 | 去重               | 不定            |
| [51] N 皇后                   | 困难 | 二维约束跟踪       | 不定            |
| [131] 分割回文串              | 中等 | 有效性检查         | 不定            |
| [93] 复原 IP 地址             | 中等 | 多重约束           | 不定            |

### 1. [78] 子集 - 中等

**问题**：给定一个不含重复元素的整数数组 `nums`，返回所有可能的子集。

```java
class Solution {
    public List<List<Integer>> subsets(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(nums, 0, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(int[] nums, int startIndex,
                           List<Integer> path, List<List<Integer>> res) {
        res.add(new ArrayList<>(path));
        for (int i = startIndex; i < nums.length; i++) {
            path.add(nums[i]);
            backtrack(nums, i + 1, path, res);
            path.remove(path.size() - 1);
        }
    }
}
```

**树的遍历**，`nums = [1,2,3]`（8 个结果 = 2^3）：

```
[]
├── 1
│   ├── 2
│   │   └── 3 → [1,2,3]
│   └── 3 → [1,3]
└── 2
    └── 3 → [2,3]
→ [] [1] [1,2] [1,2,3] [1,3] [2] [2,3] [3]
Total: 8 subsets
```

### 2. [77] 组合 - 中等

**问题**：返回从 [1, n] 中选择 k 个数的所有可能组合。

```java
class Solution {
    public List<List<Integer>> combine(int n, int k) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(1, n, k, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(int startIndex, int n, int k,
                           List<Integer> path, List<List<Integer>> res) {
        if (path.size() == k) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = startIndex; i <= n - (k - path.size()) + 1; i++) {
            path.add(i);
            backtrack(i + 1, n, k, path, res);
            path.remove(path.size() - 1);
        }
    }
}
```

**树的遍历**，`n=4, k=2`（6 个结果 = C(4,2)）：

```
[]
├── 1
│   ├── 2 → [1,2]
│   ├── 3 → [1,3]
│   └── 4 → [1,4]
├── 2
│   ├── 3 → [2,3]
│   └── 4 → [2,4]
├── 3
│   └── 4 → [3,4]
└── 4 (pruned - not enough remaining)
Total: 6 combinations
```

### 3. [46] 全排列 - 中等

**问题**：返回所有可能的不同整数的排列。

```java
class Solution {
    public List<List<Integer>> permute(int[] nums) {
        List<List<Integer>> res = new ArrayList<>();
        boolean[] used = new boolean[nums.length];
        backtrack(nums, used, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(int[] nums, boolean[] used,
                           List<Integer> path, List<List<Integer>> res) {
        if (path.size() == nums.length) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = 0; i < nums.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            path.add(nums[i]);
            backtrack(nums, used, path, res);
            path.remove(path.size() - 1);
            used[i] = false;
        }
    }
}
```

**树的遍历**，`nums = [1,2,3]`（6 个结果 = 3!）：

```
[]
├── 1
│   ├── 2
│   │   └── 3 → [1,2,3]
│   └── 3
│       └── 2 → [1,3,2]
├── 2
│   ├── 1
│   │   └── 3 → [2,1,3]
│   └── 3
│       └── 1 → [2,3,1]
├── 3
│   ├── 1
│   │   └── 2 → [3,1,2]
│   └── 2
│       └── 1 → [3,2,1]
Total: 6 permutations
```

### 4. [784] 字母大小写全排列 - 中等

**问题**：给定一个字符串，返回所有可能的大小写组合的字符串。

```java
class Solution {
    public List<String> letterCasePermutation(String s) {
        List<String> res = new ArrayList<>();
        backtrack(s.toCharArray(), 0, new StringBuilder(), res);
        return res;
    }

    private void backtrack(char[] arr, int index, StringBuilder sb,
                           List<String> res) {
        if (index == arr.length) {
            res.add(sb.toString());
            return;
        }
        char c = arr[index];
        if (Character.isLetter(c)) {
            sb.append(Character.toLowerCase(c));
            backtrack(arr, index + 1, sb, res);
            sb.deleteCharAt(sb.length() - 1);
            sb.append(Character.toUpperCase(c));
            backtrack(arr, index + 1, sb, res);
            sb.deleteCharAt(sb.length() - 1);
        } else {
            sb.append(c);
            backtrack(arr, index + 1, sb, res);
            sb.deleteCharAt(sb.length() - 1);
        }
    }
}
```

**树的遍历**，`s = "a1b"`（4 个结果 = 2^2）：

```
""
├── a
│   └── 1
│       └── b → "a1b"
│       └── B → "a1B"
└── A
    └── 1
        └── b → "A1b"
        └── B → "A1B"
Total: 4 permutations
```

### 5. [22] 括号生成 - 中等

**问题**：生成所有有效括号组合。

```java
class Solution {
    public List<String> generateParenthesis(int n) {
        List<String> res = new ArrayList<>();
        backtrack(n, n, new StringBuilder(), res);
        return res;
    }

    private void backtrack(int left, int right, StringBuilder sb, List<String> res) {
        if (left == 0 && right == 0) {
            res.add(sb.toString());
            return;
        }
        if (left > 0) {
            sb.append('(');
            backtrack(left - 1, right, sb, res);
            sb.deleteCharAt(sb.length() - 1);
        }
        if (right > left) {
            sb.append(')');
            backtrack(left, right - 1, sb, res);
            sb.deleteCharAt(sb.length() - 1);
        }
    }
}
```

**树的遍历**，`n=3`（5 个结果 = Catalan(3)）：

```
""
├── (
│   ├── (
│   │   ├── (
│   │   │   └── ) → "((()))"
│   │   └── )
│   │       └── ) → "(()())"
│   └── )
│       ├── (
│       │   └── ) → "(())()"
│       └── (
│           └── ) → "()()()"
└── ) (invalid - skipped)
Total: 5 valid combinations
```

### 6. [39] 组合总和 - 中等

**问题**：找出所有唯一组合，使得选中的数字之和等于目标值（允许重复使用）。

```java
class Solution {
    public List<List<Integer>> combinationSum(int[] candidates, int target) {
        List<List<Integer>> res = new ArrayList<>();
        backtrack(candidates, 0, target, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(int[] candidates, int startIndex, int target,
                           List<Integer> path, List<List<Integer>> res) {
        if (target == 0) {
            res.add(new ArrayList<>(path));
            return;
        }
        if (target < 0) return;
        for (int i = startIndex; i < candidates.length; i++) {
            path.add(candidates[i]);
            backtrack(candidates, i, target - candidates[i], path, res);
            path.remove(path.size() - 1);
        }
    }
}
```

**树的遍历**，`candidates = [2,3,6,7], target = 7`：

```
[]
├── 2
│   ├── 2
│   │   ├── 2
│   │   │   └── 2 → sum=8 (exceeds, backtrack)
│   │   └── 3 → sum=7 → [2,2,3]
│   └── 3
│       └── 3 → sum=8 (exceeds)
└── 3
    └── 3
        └── 3 → sum=9 (exceeds)
└── 7 → sum=7 → [7]
Total: 2 results: [2,2,3], [7]
```

### 7. [40] 组合总和 II - 中等

**问题**：每个数字只能使用一次；处理重复值。

```java
class Solution {
    public List<List<Integer>> combinationSum2(int[] candidates, int target) {
        Arrays.sort(candidates);
        List<List<Integer>> res = new ArrayList<>();
        backtrack(candidates, 0, target, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(int[] candidates, int startIndex, int target,
                           List<Integer> path, List<List<Integer>> res) {
        if (target == 0) {
            res.add(new ArrayList<>(path));
            return;
        }
        if (target < 0) return;
        for (int i = startIndex; i < candidates.length; i++) {
            if (i > startIndex && candidates[i] == candidates[i - 1]) continue;
            path.add(candidates[i]);
            backtrack(candidates, i + 1, target - candidates[i], path, res);
            path.remove(path.size() - 1);
        }
    }
}
```

**树的遍历**，`candidates = [1,1,2,5,6,7,10], target = 8`：

```
[]
├── 1 (first)
│   ├── 1 (second)
│   │   └── 2
│   │       └── 5 → sum=9 (exceeds)
│   │   └── 5 → sum=8 → [1,1,2,5]
│   ├── 2
│   │   └── 5 → sum=8 → [1,2,5]
│   └── 5
│       └── 6 → sum=12 (exceeds)
├── 1 (second - SKIP, same as first at this level)
├── 2
│   └── 6 → sum=8 → [2,6]
└── 6
    └── 7 → sum=15 (exceeds)
└── 7
    └── 1 → [7,1]
Total: 4 results: [1,1,6], [1,2,5], [2,6], [7,1]
```

### 8. [51] N 皇后 - 困难

**问题**：在 n×n 棋盘上放置 n 个皇后，使得任意两个皇后不互相攻击。

```java
class Solution {
    public List<List<String>> solveNQueens(int n) {
        List<List<String>> res = new ArrayList<>();
        char[][] board = new char[n][n];
        for (char[] row : board) Arrays.fill('.');
        boolean[] cols = new boolean[n];
        boolean[] diag1 = new boolean[2 * n - 1];
        boolean[] diag2 = new boolean[2 * n - 1];
        backtrack(0, n, board, cols, diag1, diag2, res);
        return res;
    }

    private void backtrack(int row, int n, char[][] board,
                           boolean[] cols, boolean[] diag1, boolean[] diag2,
                           List<List<String>> res) {
        if (row == n) {
            List<String> solution = new ArrayList<>();
            for (char[] r : board) solution.add(new String(r));
            res.add(solution);
            return;
        }
        for (int col = 0; col < n; col++) {
            if (cols[col] || diag1[row - col + n - 1] || diag2[row + col]) continue;
            board[row][col] = 'Q';
            cols[col] = true;
            diag1[row - col + n - 1] = true;
            diag2[row + col] = true;
            backtrack(row + 1, n, board, cols, diag1, diag2, res);
            board[row][col] = '.';
            cols[col] = false;
            diag1[row - col + n - 1] = false;
            diag2[row + col] = false;
        }
    }
}
```

**树的遍历**，`n=4`（2 个结果）：

```
Row 0
├── Col 0 (Q at 0,0)
│   ├── Col 2 (Q at 1,2) - diagonal conflict, skip
│   └── Col 3 (Q at 1,3) - diagonal conflict, skip
│   → No solution from this branch
├── Col 1 (Q at 0,1)
│   ├── Col 3 (Q at 1,3)
│   │   ├── Col 0 (Q at 2,0)
│   │   │   └── Col 2 (Q at 3,2) → Valid! [".Q..","...Q","Q...","..Q."]
│   └── Col 0 (Q at 1,0)
│       └── ... (symmetric to above)
├── Col 2 (Q at 0,2) - symmetric to Col 1
└── Col 3 (Q at 0,3) - symmetric to Col 0
Total: 2 solutions
```

**解的数量**按 n 值：
| n | 解数 |
|---|------|
| 1 | 1    |
| 2 | 0    |
| 3 | 0    |
| 4 | 2    |
| 5 | 10   |
| 6 | 4    |
| 7 | 40   |
| 8 | 92   |

### 9. [131] 分割回文串 - 中等

**问题**：将字符串分割，使得每个子串都是回文串。

```java
class Solution {
    public List<List<String>> partition(String s) {
        List<List<String>> res = new ArrayList<>();
        backtrack(s, 0, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(String s, int startIndex,
                           List<String> path, List<List<String>> res) {
        if (startIndex == s.length()) {
            res.add(new ArrayList<>(path));
            return;
        }
        for (int i = startIndex; i < s.length(); i++) {
            if (isPalindrome(s, startIndex, i)) {
                path.add(s.substring(startIndex, i + 1));
                backtrack(s, i + 1, path, res);
                path.remove(path.size() - 1);
            }
        }
    }

    private boolean isPalindrome(String s, int left, int right) {
        while (left < right) {
            if (s.charAt(left++) != s.charAt(right--)) return false;
        }
        return true;
    }
}
```

**树的遍历**，`s = "aab"`（2 个结果）：

```
"aab"
├── "a"
│   ├── "a"
│   │   └── "b" → ["a","a","b"]
│   └── "ab" (not palindrome, skip)
├── "aa"
│   └── "b" → ["aa","b"]
└── "aab" (not palindrome, skip)
Total: 2 valid partitions
```

### 10. [93] 复原 IP 地址 - 中等

**问题**：从字符串中返回所有可能的有效 IP 地址。

```java
class Solution {
    public List<String> restoreIpAddresses(String s) {
        List<String> res = new ArrayList<>();
        backtrack(s, 0, new ArrayList<>(), res);
        return res;
    }

    private void backtrack(String s, int startIndex,
                           List<String> segments, List<String> res) {
        if (segments.size() == 4) {
            if (startIndex == s.length()) {
                res.add(String.join(".", segments));
            }
            return;
        }
        for (int len = 1; len <= 3 && startIndex + len <= s.length(); len++) {
            String segment = s.substring(startIndex, startIndex + len);
            if (segment.length() > 1 && segment.charAt(0) == '0') continue;
            if (Integer.parseInt(segment) > 255) continue;
            segments.add(segment);
            backtrack(s, startIndex + len, segments, res);
            segments.remove(segments.size() - 1);
        }
    }
}
```

**树的遍历**，`s = "25525511135"`（2 个结果）：

```
"25525511135"
├── "255"
│   ├── "255"
│   │   ├── "11" → "255.255.11."
│   │   │   └── "135" (3 digits OK, 135 ≤ 255) → "255.255.11.135" ✓
│   │   └── "111" → "255.255.111."
│   │       └── "35" → "255.255.111.35" ✓
│   └── "1" → "255.1."
│       ├── "1" → "255.1.1."
│       │   └── "135" (invalid, 135 > 255)
│       └── "11" → "255.1.11."
│           └── "135" (invalid)
└── "25" and others fail early
Total: 2 results
```

<a name="11-final-takeaways"></a>

## 最终要点

1. **回溯 = 决策树遍历**
   - 不是直接构造答案
   - 而是探索可能性并过滤

2. **三步循环是神圣的**
   - 选择 → 探索 → 撤销
   - 缺少任何一步都会破坏算法

3. **剪枝是必须的，不是可选的**
   - 没有剪枝，回溯只是暴力搜索
   - 提前终止节省指数级工作量

4. **去重是微妙的**
   - `i > startIndex` 意味着"同一树层"
   - 不是关于输入值，而是关于分支行为

5. **"低效"是一个特性**
   - 系统地探索搜索空间
   - 每条"失败"的路径都提供了信息

**额外洞察**：两件事让回溯变得清晰：

- 理解"撤销"就是状态恢复
- 正确可视化树的层级与分支

## 参考资料

- [algorithm-learning-java](https://github.com/BODYsuperman/algorithm-learning-java) - 我的常见算法 Java 实现，包含详细注释和树形可视化。
