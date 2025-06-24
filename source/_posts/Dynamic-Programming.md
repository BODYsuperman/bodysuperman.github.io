---
title: Dynamic Programming
date: 2025-03-22 10:38:23
updated: 2025-03-22 13:04:19
comments: true
tags: Data Structure and Alogrithm
categories: Data Structure and Alogrithm
---


1. [Core Concepts](#core-concepts)
2. [Steps to Solve Problems with Dynamic Programming](#step-solve)
    - [Define the State](#define)
    - [Formulate the Transition](#formulate)
    - [Initialize the Boundary Conditions](#boundary-conditions)
    - [Choose an Order](#choose-order)
    - [Return the Final Result](#final-result)
3. [Classic Examples](#classic-examples)
    - [Fibonacci Sequence](#fibonacci-sequence)
    - [0/1 Knapsack Problem](#01-knapsack-problem)
4. [Conclusion](#conclusion)
<!--more-->


## Core concepts

**Dynamic programming**<a name="core-concepts"></a> is both a mathematical optimization method and an algorithmic paradigm. The method was developed by Richard Bellman in the 1950s and has found applications in numerous fields, from aerospace engineering to economics. It is a powerful technique used to solve complex problems by breaking them down into simpler subproblems. It’s widely used in computer science for optimization problems, and once you grasp its core idea, it becomes an invaluable tool in your programming toolkit.

A DP solution hinges on two properties:
- **Overlapping Subproblems**: Means that the problem can be broken down into smaller subproblems, where the solutions to the subproblems are overlapping. Having subproblems that are overlapping means that the solution to one subproblem is part of the solution to another subproblem. I will take [Fibonacci sequence](https://en.wikipedia.org/wiki/Fibonacci_sequence) as an example in the coming section.
- **Optimal Substructure**: Means that the complete solution to a problem can be constructed from the solutions of its smaller subproblems. So not only must the problem have overlapping subproblems, the substructure must also be optimal so that there is a way to piece the solutions to the subproblems together to form the complete solution. I will take the classical [The 0/1 Knapsack Problem](https://en.wikipedia.org/wiki/Knapsack_problem) as an example, the optimal solution when the knapsack capacity is `W` can be derived by considering whether to include an item and combining it with the optimal solution when the knapsack capacity is `W - weight[i]`.


## Steps to Solve Problems with Dynamic Programming:<a name="step-solve"></a>

### **Define the State**:<a name="define"></a>
Identify parameters that uniquely describe a subproblem (e.g., indices, capacities). For example, in the 0/1 knapsack problem, the state can be defined as `dp[i][j]`, which represents the maximum value that can be obtained when considering the first i items and a knapsack capacity of j.
### **Formulate the Transition**:<a name="formulate"></a> 
Derive a recurrence relation that expresses the state in terms of smaller states.
### **Initialize the Boundary Conditions**:<a name="boundary-conditions"></a>
Initialize the Boundary Conditions: Determine the initial values of the states, which are usually the base cases of the problem. For example, in the 0/1 knapsack problem, `dp[0][j]=0` (when there are no items, the value is 0 regardless of the knapsack capacity), and `dp[i][0]=0` (when the knapsack capacity is 0, the value is 0 regardless of the number of items).
### **Choose an Order**:<a name="choose-order"></a>
Decide whether to solve states top‑down (recursion + memo) or bottom‑up (iteration + table). If using the tabular method(the latter one), fill the state table step-by-step according to the state - transition equation and the initial conditions. This step is usually achieved through nested loops.
### **Return the Final Result**:<a name="final-result"></a>
According to the requirements of the problem, obtain the final solution from the state table. For example, in the 0/1 knapsack problem, the final result is dp[n][W], that is, the maximum value when considering all n items and a knapsack capacity of `W`. 

## Classic Examples
### Find The nth Fibonacci Number<a name="fibonacci-sequence"></a>
Let us say we want an algorithm that finds the nth Fibonacci number. We don't know how to find the nth Fibonacci number yet, except that we want to use Dynamic Programming to design the algorithm.
>The Fibonacci numbers is a sequence of numbers starting with 0 and 1 and the next numbers are created by adding the two previous numbers.
The 8 first Fibonacci numbers are: **0, 1, 1, 2, 3, 5, 8, 13**
And counting from 0, the 4th Fibonacci number `F(4)` is **3**.
In general, this is how a Fibonacci number is created based on the two previous:
                    `F(n) = F(n-1) + F(n-2)`

#### Naive Recursive Approach
```
public int Fib2(int n)
{
    if (n < 2) return n;
    return Fib(n - 1) + Fib(n - 2);
}
```
- Time  Complexity: **O(2<sup>n</sup>)**
- Space Complexity: **O(n)**
This works, but it is inefficient. For `n=40`, it takes noticeable time because it recalculates the same Fibonacci numbers repeatedly.
#### Bottom-Up DP (Tabulation)
We can optimize it using memoization, where we store results in an array:

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
- Time  Complexity: **O(n)**
- Space Complexity: **O(n)**

In this version, we fill the `dp` array from the base cases up to `n`. It’s still **O(n)** time complexity, but it avoids recursion overhead, making it slightly faster in practice.
More efficiently, We only need to maintain two values as we don't need to record the whole sequence.
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
- Time  Complexity: **O(n)**
- Space Complexity: **O(1)**
### The 0/1 Knapsack Problem<a name="01-knapsack-problem"></a>
Given items with weight array weights and value array values, and a knapsack with capacity capacity, find the maximum value that can be carried.
Solving the 0/1 Knapsack Problem helps businesses decide which projects to fund within a budget, maximizing profit without overspending. It is also used in logistics to optimize the loading of goods into trucks and planes, ensuring the most valuable, or highest prioritized, items are included without exceeding weight limits.

<u>Rules</u>:
    - Every item has a weight and value.
    - Your knapsack has a weight limit.
    - Choose which items you want to bring with you in the knapsack.
You can either take an item or not, you cannot take half of an item for example.
<u>Goal</u>:
    - Maximize the total value of the items in the knapsack.
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

Below is the optimized version, we use a one-dimensional array dp. By updating the dp array in reverse order, we ensure that each item is considered only once, thus avoiding redundant calculations and overwriting problems.
- Reduces space complexity from O(n×capacity) to O(capacity)
- Reverse iteration prevents value overwrite issues
- More efficient memory usage

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

## Conclusion <a name="conclusion"></a>
Dynamic programming transforms inefficient recursive solutions into efficient ones by leveraging memory. Whether you choose memoization or tabulation, the key is to avoid redundant work. Arrays or dictionaries are perfect for storing intermediate results, making DP both practical and elegant.By reasonably defining the state, deriving the state-transition equation, and initializing the boundary conditions, we can efficiently solve complex problems using dynamic programming. In practical applications, pay attention to techniques such as space optimization to improve the efficiency and performance of the algorithm.
