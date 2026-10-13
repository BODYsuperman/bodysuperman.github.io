---
title: 动态规划
date: 2025-03-22 10:38:23
updated: 2025-03-22 13:04:19
comments: true
tags: Data Structure and Alogrithm
categories: Data Structure and Alogrithm
lang: zh-CN
---


1. [核心概念](#core-concepts)
2. [动态规划解题步骤](#step-solve)
    - [定义状态](#define)
    - [推导状态转移方程](#formulate)
    - [初始化边界条件](#boundary-conditions)
    - [选择计算顺序](#choose-order)
    - [返回最终结果](#final-result)
3. [经典示例](#classic-examples)
    - [斐波那契数列](#fibonacci-sequence)
    - [0/1 背包问题](#01-knapsack-problem)
4. [总结](#conclusion)
<!--more-->


## 核心概念

**动态规划（Dynamic Programming）**<a name="core-concepts"></a>既是一种数学优化方法，也是一种算法范式。该方法由 Richard Bellman 在 20 世纪 50 年代提出，已在众多领域得到应用，从航空航天工程到经济学。它是一种强大的技术，通过将复杂问题分解为更简单的子问题来求解。它在计算机科学中被广泛用于优化问题，一旦掌握了其核心思想，它将成为你编程工具箱中不可或缺的工具。

动态规划解决方案依赖于两个性质：
- **重叠子问题（Overlapping Subproblems）**：意味着问题可以被分解为更小的子问题，且这些子问题的解是重叠的。子问题重叠意味着一个子问题的解是另一个子问题解的一部分。我将在接下来的部分以[斐波那契数列](https://en.wikipedia.org/wiki/Fibonacci_sequence)为例进行说明。
- **最优子结构（Optimal Substructure）**：意味着问题的完整解可以从其更小子问题的解中构建。因此，问题不仅要有重叠子问题，子结构还必须是"最优"的，这样才能找到一种方式将子问题的解拼接成完整解。我将以经典的 [0/1 背包问题](https://en.wikipedia.org/wiki/Knapsack_problem)为例，当背包容量为 `W` 时的最优解可以通过考虑是否包含某个物品并将其与背包容量为 `W - weight[i]` 时的最优解组合来得到。


## 动态规划解题步骤：<a name="step-solve"></a>

### **定义状态**：<a name="define"></a>
识别能唯一描述子问题的参数（例如索引、容量）。例如，在 0/1 背包问题中，状态可以定义为 `dp[i][j]`，表示考虑前 i 个物品且背包容量为 j 时能获得的最大价值。
### **推导状态转移方程**：<a name="formulate"></a>
推导出一个递推关系式，用更小的状态来表达当前状态。
### **初始化边界条件**：<a name="boundary-conditions"></a>
初始化边界条件：确定状态的初始值，通常是问题的基本情况。例如，在 0/1 背包问题中，`dp[0][j]=0`（没有物品时，无论背包容量多大，价值都为 0），`dp[i][0]=0`（背包容量为 0 时，无论有多少物品，价值都为 0）。
### **选择计算顺序**：<a name="choose-order"></a>
决定是自顶向下（递归 + 记忆化）还是自底向上（迭代 + 表格）求解状态。如果使用表格法（后者），则根据状态转移方程和初始条件逐步填充状态表。这一步通常通过嵌套循环实现。
### **返回最终结果**：<a name="final-result"></a>
根据问题的要求，从状态表中获取最终解。例如，在 0/1 背包问题中，最终结果是 dp[n][W]，即考虑所有 n 个物品且背包容量为 `W` 时的最大价值。

## 经典示例
### 求第 n 个斐波那契数<a name="fibonacci-sequence"></a>
假设我们想要一个能找出第 n 个斐波那契数的算法。我们尚不知道如何求第 n 个斐波那契数，但我们要使用动态规划来设计该算法。
>斐波那契数列是以 0 和 1 开始的数列，后续每个数由前两个数相加得到。
前 8 个斐波那契数为：**0, 1, 1, 2, 3, 5, 8, 13**
从 0 开始计数，第 4 个斐波那契数 `F(4)` 是 **3**。
通常，斐波那契数由前两个数相加得到：
                    `F(n) = F(n-1) + F(n-2)`

#### 朴素递归方法
```
public int Fib2(int n)
{
    if (n < 2) return n;
    return Fib(n - 1) + Fib(n - 2);
}
```
- 时间复杂度：**O(2<sup>n</sup>)**
- 空间复杂度：**O(n)**
这种方法可行但效率不高。当 `n=40` 时，由于它反复重新计算相同的斐波那契数，需要明显的时间开销。
#### 自底向上 DP（表格法）
我们可以使用记忆化来优化，将结果存储在数组中：

```
public int Fib(int n)
{
    if (n < 2) return n;
    int[] dp = new int[n + 1];
    dp[0] = 0;
    dp[1] = 1;
    for(int i = 2; i <= n; i++)
    {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    return dp[n];
}
```
- 时间复杂度：**O(n)**
- 空间复杂度：**O(n)**

在这个版本中，我们从基本情况开始向上填充 `dp` 数组直到 `n`。时间复杂度仍然是 **O(n)**，但避免了递归开销，因此在实践中稍微快一些。
更高效的做法是，我们只需要维护两个值，因为不需要记录整个序列。
```
public int Fib(int n)
{
    if (n < 2) return n;
    int[] dp = new int[2] {0,1};
    for(int i = 2; i <= n; i++)
    {
        int temp = dp[0] + dp[1];
        dp[0] = dp[1];
        dp[1] = temp;
    }
    return dp[1];
}
```
- 时间复杂度：**O(n)**
- 空间复杂度：**O(1)**
### 0/1 背包问题<a name="01-knapsack-problem"></a>
给定物品的重量数组 weights 和价值数组 values，以及一个容量为 capacity 的背包，求能携带的最大价值。
解决 0/1 背包问题可以帮助企业在预算内决定资助哪些项目，在不超支的情况下最大化利润。它也用于物流领域，优化货物装载到卡车和飞机的过程，确保在不超出重量限制的情况下装入最有价值或优先级最高的物品。

<u>规则</u>：
    - 每个物品都有重量和价值。
    - 你的背包有重量限制。
    - 选择你想放入背包的物品。
你只能选择拿或不拿某个物品，例如不能拿半个物品。
<u>目标</u>：
    - 最大化背包中物品的总价值。
```
public int Knapsack01(int[] w, int[] v, int cap)
{
    int n = w.Length;
    int[,] dp = new int[n + 1,cap + 1];
    for (int j = 0; j <= cap; j++)
    {
        dp[0, j] = 0;
    }

    for (int i = 0; i <= n; i++)
    {
        dp[i, 0] = 0;
    }

    for(int i= 1; i <= n; i++)
    {
        for(int j =1;j<= cap; j++)
        {
            if (j < w[i-1])
            {
                dp[i, j] = dp[i - 1, j];
            }
            else
            {
                dp[i, j] = Math.Max(dp[i - 1, j], v[i - 1] + dp[i - 1, j - w[i - 1]]);
            }
        }
    }
    return dp[n, cap];
}
```

下面是优化版本，我们使用一维数组 dp。通过逆序更新 dp 数组，确保每个物品只被考虑一次，从而避免冗余计算和覆盖问题。
- 将空间复杂度从 O(n×capacity) 降低到 O(capacity)
- 逆序迭代防止值被覆盖
- 更高效的内存使用

```
public int Knapsack01(int[] w, int[] v, int cap)
{
    int n = w.Length;
    int[] dp = new int[cap + 1];


    for (int i = 0; i < n; i++)
    {
        //In order to select the item only once, we need to traverse from back to front
        for (int j = cap; j >= w[i]; j--)
        {
            dp[j] = Math.Max(dp[j], v[i] + dp[j - w[i]]);
        }
    }
    return dp[cap];
}
```

## 总结 <a name="conclusion"></a>
动态规划通过利用存储将低效的递归解转化为高效的解。无论你选择记忆化还是表格法，关键在于避免冗余工作。数组或字典非常适合存储中间结果，使动态规划既实用又优雅。通过合理定义状态、推导状态转移方程和初始化边界条件，我们可以使用动态规划高效地解决复杂问题。在实际应用中，注意空间优化等技巧，以提高算法的效率和性能。
