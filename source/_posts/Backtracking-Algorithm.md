---
title: Backtracking Algorithm
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
  - Mental Model
  - Developer Journey
---

- [1. Understanding Backtracking](#1-understanding-backtracking)
  - [1.1 What is Backtracking?](#11-what-is-backtracking)
  - [1.2 Real-World Analogy](#12-real-world-analogy)
  - [1.3 When to Use Backtracking](#13-when-to-use-backtracking)
- [2. The Core Pattern](#2-the-core-pattern)
  - [2.1 The Three-Step Cycle](#21-the-three-step-cycle)
  - [2.2 Why "Undo" is Critical](#22-why-undo-is-critical)
  - [2.3 The Standard Template](#23-the-standard-template)
- [3. Decision Tree Mental Model](#3-decision-tree-mental-model)
  - [3.1 Tree Levels vs Branches](#31-tree-levels-vs-branches)
  - [3.2 Understanding startIndex](#32-understanding-startindex)
  - [3.3 What i + 1 Really Means](#33-what-i-1-really-means)
- [4. Pruning: Necessity, Not Optimization](#4-pruning-necessity-not-optimization)
  - [4.1 Early Termination Logic](#41-early-termination-logic)
  - [4.2 Pruning in practice](#42-pruning-in-practice)
- [5. Deduplication Strategy](#5-deduplication-strategy)
  - [5.1 Why Deduplication Matters](#51-why-deduplication-matters)
  - [5.2 The i > startIndex Pattern](#52-the-i--startindex-pattern)
  <!--more-->
- [6. From Easy to Hard: Problem Progression](#6-from-easy-to-hard-problem-progression)
  - [6.1 Combinations](#61-combinations)
  - [6.2 Subsets](#62-subsets)
  - [6.3 Permutations](#63-permutations)
  - [6.4 N-Queens](#64-n-queens)
- [7. The "Inefficiency" Illusion](#7-the-inefficiency-illusion)
  - [7.1 Why It Feels Like Doing Nothing](#71-why-it-feels-like-doing-nothing)
  - [7.2 Embracing the Process](#72-embracing-the-process)
- [8. Real-World Applications](#8-real-world-applications)
  - [8.1 Task Scheduling](#81-task-scheduling)
  - [8.2 Configuration Generation](#82-configuration-generation)
  - [8.3 Constraint Solving](#83-constraint-solving)
- [9. A Reusable Mental Model](#9-a-reusable-mental-model)
  - [9.1 The 6 Critical Questions](#91-the-6-critical-questions)
  - [9.2 Decision Tree Checklist](#92-decision-tree-checklist)
- [10. Common LeetCode Problems](#10-common-leetcode-problems)
- [11. Final Takeaways](#11-final-takeaways)

---

<a name="1-understanding-backtracking"></a>

## Understanding Backtracking

<a name="11-what-is-backtracking"></a>

### What is Backtracking?

Backtracking is a class of algorithms for finding solutions to computational problems, particularly constraint satisfaction and enumeration problems. It works by:

1. **Incrementally building candidates** to the solution
2. **Abandoning candidates** ("backtracking") as soon as it determines they cannot possibly be completed to a valid solution

> "Backtracking is like exploring a maze - you try a path, and if it leads nowhere, you return to the last decision point and try another."

![pic](pic01.png)

<a name="12-real-world-analogy"></a>

### Real-World Analogy

| Scenario       | Backtracking Equivalent                                              |
| -------------- | -------------------------------------------------------------------- |
| Solving a maze | Try path → Hit dead end → Return to fork → Try next path             |
| Sudoku solver  | Place number → Check conflicts → Backtrack → Try next number         |
| Auto-correct   | Generate word → Check dictionary → Backtrack → Try different letters |

<a name="13-when-to-use-backtracking"></a>

### When to Use Backtracking

**Suitable problems:**

- Generate all valid combinations/subsets/permutations
- Constraint satisfaction problems (N-Queens, Sudoku)
- Decision trees with clear "valid/invalid" tests
- Problems requiring enumeration of all solutions

**Not suitable:**

- Finding a single optimal path (use Dijkstra/BFS)
- Unordered linear searches
- Problems without "partial candidate" concept

---

<a name="2-the-core-pattern"></a>

## The Core Pattern

<a name="21-the-three-step-cycle"></a>

### The Three-Step Cycle

```
Choose → Explore → Undo
```

| Step    | Code Pattern                   | Purpose         |
| ------- | ------------------------------ | --------------- |
| Choose  | `path.add(candidate)`          | Make a decision |
| Explore | `dfs(next_level)`              | Go deeper       |
| Undo    | `path.remove(path.size() - 1)` | Restore state   |

<a name="22-why-undo-is-critical"></a>

### Why "Undo" is Critical

Without the undo step:

| With Undo                             | Without Undo                          |
| ------------------------------------- | ------------------------------------- |
| ✅ State restores after each branch   | ❌ Later branches inherit wrong state |
| ✅ Each branch explores independently | ❌ "Contamination" between branches   |
| ✅ Correct solution space traversal   | ❌ Misses valid solutions             |

<a name="23-the-standard-template"></a>

### The Standard Template

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

---

<a name="3-decision-tree-mental-model"></a>

## Decision Tree Mental Model

<a name="31-tree-levels-vs-branches"></a>

### Tree Levels vs Branches

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

- **Level**: Depth in the tree (how many choices made)
- **Branch**: Different options at the same level (alternatives)

<a name="32-understanding-startindex"></a>

### Understanding startIndex

`startIndex` controls **where the current level begins searching**.

| Scenario     | startIndex Behavior                     |
| ------------ | --------------------------------------- |
| Combinations | `i + 1` - start from next element       |
| Permutations | Always `0` - can use any unused element |
| Subsets      | `i + 1` - expand search range           |

<a name="33-what-i-1-really-means"></a>

### What `i + 1` Really Means

```
If we pick element at index i:
  - Current level: uses nums[i]
  - Next level: starts from index i + 1
  - Result: avoids reusing nums[i] or earlier elements
```

**Why this prevents duplicates:**

- Branch 1 (start=0): picks nums[0]=1 → then search range [1,2,3...]
- Branch 2 (start=1): picks nums[1]=2 → then search range [2,3...]
- Branch 3 (start=2): picks nums[2]=3 → then search range [3...]
- Result: [1,2] and [2,1] never both appear

---

<a name="4-pruning-necessity-not-optimization"></a>

## Pruning: Necessity, Not Optimization

<a name="41-early-termination-logic"></a>

### Early Termination Logic

Pruning eliminates paths that **cannot possibly succeed**:

```
Example: Choose k elements from n
Remaining elements needed: k - path.size()
Remaining elements available: n - i + 1

If (n - i + 1 < k - path.size()) → impossible to succeed → skip
```

The constraint: `i <= n - (k - path.size()) + 1`

| Variable      | Meaning                                |
| ------------- | -------------------------------------- |
| `n`           | Total elements available               |
| `k`           | Target number of elements              |
| `path.size()` | Elements already chosen                |
| `n - i + 1`   | Elements remaining (including current) |

<a name="42-pruning-in-practice"></a>

### Pruning in practice

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

---

<a name="5-deduplication-strategy"></a>

## Deduplication Strategy

<a name="51-why-deduplication-matters"></a>

### Why Deduplication Matters

Without deduplication, problems with duplicate values produce duplicate results:

| Input   | Without Dedup                         | With Dedup        |
| ------- | ------------------------------------- | ----------------- |
| [1,1,2] | [[1,1,2],[1,2,1],[1,1,2],[1,2,1],...] | [[1,1,2],[1,2,1]] |

<a name="52-the-i--startindex-pattern"></a>

### The `i > startIndex` Pattern

```java
if (i > startIndex && nums[i] == nums[i - 1]) continue;
```

**Correct interpretation:**

- `i > startIndex`: We're at the same tree level (same decision depth)
- `nums[i] == nums[i-1]`: Same value as previous branch
- **Meaning**: Avoid picking the same value twice within the same level

**What it does NOT mean:**

- ❌ "No duplicates allowed in the input"
- ❌ "No duplicates allowed in the result"

---

<a name="6-from-easy-to-hard-problem-progression"></a>

## From Easy to Hard: Problem Progression

<a name="61-combinations"></a>

### Combinations

**Problem**: Choose k elements from n, order doesn't matter

**Key constraint**: ` startIndex` + `i + 1`

**Template**:

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

### Subsets

**Problem**: Generate all possible subsets (the power set)

**Key difference**: Collect result at **every** step, not just leaf nodes

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

### Permutations

**Problem**: Arrange all elements in all possible orders

**Key difference**: `startIndex` is always `0`, but track used elements

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

### N-Queens

**Problem**: Place N queens on N×N board so no two attack each other

**Constraints**:

- One queen per row
- One queen per column
- No two on same diagonal

**State tracking**:

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

---

<a name="7-the-inefficiency-illusion"></a>

## The "Inefficiency" Illusion

<a name="71-why-it-feels-like-doing-nothing"></a>

### Why It Feels Like Doing Nothing

```
Most paths are invalid
↓
Constant loop of: Try → Fail → Backtrack → Try again
↓
No immediate visible progress
↓
Feeling of "wasting time"
```

**Reality**: Backtracking is **eliminating wrong answers**, not directly building the right one.

<a name="72-embracing-the-process"></a>

### Embracing the Process

| Mindset                                     | Impact                 |
| ------------------------------------------- | ---------------------- |
| "This is useless"                           | Likely to give up      |
| "I'm narrowing the search space"            | Persistent, systematic |
| "Each failure teaches me what doesn't work" | Learning approach      |

---

<a name="8-real-world-applications"></a>

## Real-World Applications

<a name="81-task-scheduling"></a>

### Task Scheduling

```
Constraints:
- Task A must finish before B
- Task C requires 2GB RAM
- Only 3 tasks can run in parallel

Backtracking finds all valid schedules
```

<a name="82-configuration-generation"></a>

### Configuration Generation

```
Generate all valid configurations:
- Option 1: [A, B, C]
- Option 2: [A, B, D]
- Option 3: [A, C, D]  ← skips invalid [A, B, E] due to constraints
```

<a name="83-constraint-solving"></a>

### Constraint Solving

| Domain              | Backtracking Application                    |
| ------------------- | ------------------------------------------- |
| AI Planning         | Sequence of actions to achieve goal         |
| Circuit design      | Component placement with constraints        |
| Resource allocation | Assign resources subject to limits          |
| Game AI             | Search all possible moves and counter-moves |

---

<a name="9-a-reusable-mental-model"></a>

## A Reusable Mental Model

<a name="91-the-6-critical-questions"></a>

### The 6 Critical Questions

Before writing backtracking code, ask:

1. **What is the result?** (`res` - List<List<>> or similar)
2. **What is the current path?** (`path` - what we're building)
3. **What are the choices at each step?** (the `for` loop candidates)
4. **When should we stop?** (base case / termination condition)
5. **Do we need deduplication?** (duplicate values in input)
6. **Can we prune?** (early termination conditions)

<a name="92-decision-tree-checklist"></a>

### Decision Tree Checklist

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

---

<a name="10-common-leetcode-problems"></a>

## Common LeetCode Problems

| Problem                       | Difficulty | Key Concept            | Result Count    |
| ----------------------------- | ---------- | ---------------------- | --------------- |
| [78] Subsets                  | Medium     | Collect at every step  | 2^n             |
| [77] Combinations             | Medium     | startIndex + pruning   | C(n,k)          |
| [46] Permutations             | Medium     | Track used elements    | n!              |
| [784] Letter Case Permutation | Medium     | Branch on conditions   | 2^L (L=letters) |
| [22] Generate Parentheses     | Medium     | Validity checking      | Catalan(n)      |
| [39] Combination Sum          | Medium     | Reuse allowed          | Variable        |
| [40] Combination Sum II       | Medium     | Deduplication          | Variable        |
| [51] N-Queens                 | Hard       | 2D constraint tracking | Variable        |
| [131] Palindrome Partitioning | Medium     | Validity check         | Variable        |
| [93] Restore IP Addresses     | Medium     | Multiple constraints   | Variable        |

---

### 1. [78] Subsets - Medium

**Problem**: Given an integer array `nums` of unique elements, return all possible subsets.

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

**Tree Traversal** for `nums = [1,2,3]` (8 results = 2^3):

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

---

### 2. [77] Combinations - Medium

**Problem**: Return all possible combinations of k numbers from [1, n].

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

**Tree Traversal** for `n=4, k=2` (6 results = C(4,2)):

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

---

### 3. [46] Permutations - Medium

**Problem**: Return all possible permutations of distinct integers.

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

**Tree Traversal** for `nums = [1,2,3]` (6 results = 3!):

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

---

### 4. [784] Letter Case Permutation - Medium

**Problem**: Given a string, return all possible strings with lowercase/uppercase letters.

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

**Tree Traversal** for `s = "a1b"` (4 results = 2^2):

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

---

### 5. [22] Generate Parentheses - Medium

**Problem**: Generate all combinations of well-formed parentheses.

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

**Tree Traversal** for `n=3` (5 results = Catalan(3)):

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

---

### 6. [39] Combination Sum - Medium

**Problem**: Find all unique combinations where chosen numbers sum to target (reuse allowed).

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

**Tree Traversal** for `candidates = [2,3,6,7], target = 7`:

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

---

### 7. [40] Combination Sum II - Medium

**Problem**: Each number may only be used once; handle duplicates.

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

**Tree Traversal** for `candidates = [1,1,2,5,6,7,10], target = 8`:

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

---

### 8. [51] N-Queens - Hard

**Problem**: Place n queens on n×n board so no two attack each other.

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

**Tree Traversal** for `n=4` (2 results):

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

**Result Count** by n:
| n | Solutions |
|---|-----------|
| 1 | 1 |
| 2 | 0 |
| 3 | 0 |
| 4 | 2 |
| 5 | 10 |
| 6 | 4 |
| 7 | 40 |
| 8 | 92 |

---

### 9. [131] Palindrome Partitioning - Medium

**Problem**: Partition a string such that every substring is a palindrome.

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

**Tree Traversal** for `s = "aab"` (2 results):

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

---

### 10. [93] Restore IP Addresses - Medium

**Problem**: Return all possible valid IP addresses from a string.

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

**Tree Traversal** for `s = "25525511135"` (2 results):

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

## Final Takeaways

1. **Backtracking = Decision Tree Traversal**
   - Not about constructing the answer directly
   - About exploring possibilities and filtering

2. **The Three-Step Cycle is Sacred**
   - Choose → Explore → Undo
   - Missing any step breaks the algorithm

3. **Pruning is mandatory, not optional**
   - Without pruning, backtracking is just brute force
   - Early termination saves exponential work

4. **Deduplication is subtle**
   - `i > startIndex` means "same tree level"
   - Not about input values, but about branching behavior

5. **The "inefficiency" is a feature**
   - Systematically exploring the search space
   - Each "failed" path provides information

**Bonus Insight**: Two things make backtracking click:

- Understanding that "undo" is state restoration
- Visualizing tree levels vs branches correctly

---

## References

- [algorithm-learning-java](https://github.com/BODYsuperman/algorithm-learning-java) - My Java implementation of common algorithms with detailed comments and tree visualization.
