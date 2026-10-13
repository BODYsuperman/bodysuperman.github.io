---
title: KMP 算法
date: 2025-03-8 13:04:19
updated: 2025-03-8 13:04:19
comments: true
tags: Data Structure and Alogrithm
categories: Data Structure and Alogrithm
lang: zh-CN
---
# KMP 算法
1. [KMP 算法简介](#introduction)
2. [朴素模式搜索算法](#naive)
3. [KMP 算法的核心思想](#core)
   - [如何生成 next 数组（LPS 数组）](#generate)
   - [KMP 匹配过程](#match)
4. [Java 代码实现](#java)
5. [复杂度分析](#analyse)
<!--more-->
## 1. KMP 算法 <a name="introduction"></a>
在计算机科学中，**Knuth–Morris–Pratt** 算法（**KMP 算法**）是一种[字符串搜索算法](https://en.wikipedia.org/wiki/String-searching_algorithm)，它利用如下观察：当发生不匹配时，模式串本身包含足够的信息来确定下一次匹配可能开始的位置，从而避免重新检查已匹配的字符，在主文本串 S 中搜索词 W 的出现。它是一种高效的字符串匹配技术，通过利用预计算的模式数据来避免不必要的字符比较。与朴素方法不同，KMP 实现了 **O(n+m)** 的时间复杂度，其中 `n=文本`长度，`m=模式串`长度。

例如：
- 文本串 S = "ABABDABACDABABCABAB"
- 模式串 P = "ABABC"
我们需要找到 `P` 在 `S` 中首次出现的位置。
## 2. 朴素（暴力）模式搜索算法 <a name="naive"></a>
- 我们从文本中的每个索引开始，将其与模式串的第一个字符进行比较，如果匹配则同时移动文本和模式串的下一个字符。
- 如果发生不匹配，我们对文本的下一个索引重新开始同样的过程。
```
S: A B A B D A B A C D A B A B C A B A B
P: A B A B C
```
当发生不匹配时，文本指针回溯到 i=2，模式串指针回溯到 j=0。
**缺点**：时间复杂度为 **O(n×m)**（其中 n 是文本长度，m 是模式串长度），效率不高。

## 3. KMP 算法的核心思想<a name="core"></a>
**核心**：利用已匹配的信息来避免无效的回溯。
**关键点**：
- 预处理模式串 `P`，生成 `LPS` 数组（这里我用 next 数组），记录每个位置的最长公共前后缀的长度。
- 在匹配过程中，使用 `LPS` 数组快速找到模式串的回溯位置。
- **LPS** 是**最长真前缀同时也是后缀（Longest Proper Prefix which is also Suffix）**。真前缀是不包含整个字符串的前缀。
### 如何生成 next 数组（LPS 数组）<a name="generate"></a>
`next[j]` 表示模式串 `P` 前 `j` 个字符的最长公共前后缀的长度。
**规则**：
- `前缀（Prefix）`：从第一个字符开始的连续子串（不包含最后一个字符）。
- `后缀（Suffix）`：以最后一个字符结尾的连续子串（不包含第一个字符）。
- `最长公共前后缀`：最长的相同前缀和后缀。

示例：Pattern="ABABC"
| **j**   | 0 | 1 | 2| 3| 4 |
| :----:      |:----:|:----:|:----:|:----:|:----:|
| char        |  A | B| A |B| C|
| next[j]        | 0 |0 |1|2|0|
### KMP 匹配过程<a name="match"></a>
- 初始化指针：设文本指针 i = 0，模式串指针 j = 0。
- 逐个比较字符：
   - 如果 S[i] == P[j]，同时右移 i 和 j。
   - 如果发生不匹配：
      - 如果 j > 0，设 j = next[j - 1]（使用 next 数组回溯）。
      - 如果 j == 0，右移 i。
- 匹配成功：当 j == m 时，返回 i - m

完整的匹配过程：
1. 初始时，i = 0, j = 0 → S[0]=A == P[0] → i = 1, j = 1。
2. S[1]=B == P[1] → i = 2, j = 2。
3. S[2]=A == P[2] → i = 3, j = 3。
4. S[3]=B == P[3] → i = 4, j = 4。
5. S[4]=D ≠ P[4]=C → j = next[3]=2。
6. S[4]=D ≠ P[2]=A → j = next[1]=0。
7. S[4]=D ≠ P[0]=A → i = 5, j = 0。
8. 继续匹配直到找到 `P` 的位置。
## 4. Java 代码实现 <a name="java"></a>
```
public class KMPAlgorithm {
    public static int kmpSearch(String s, String p) {
        int n = s.length();
        int m = p.length();
        int[] next = computeNext(p);
        int i = 0;
        int j = 0;
        while (i < n) {
            if (s.charAt(i) == p.charAt(j)) {
                i++;
                j++;
                if (j == m) {
                    return i - m;
                }
            } else {
                if (j > 0) {
                    j = next[j - 1];
                } else {
                    i++;
                }
            }
        }
        return -1;
}
public static int[] computeNext(String p) {
    int m = p.length();
    int[] next = new int[m];
    int j = 0;
    for (int i = 1; i < m; i++) {
            while (j > 0 && p.charAt(i) != p.charAt(j)) {
                j = next[j - 1];
            }
            if (p.charAt(i) == p.charAt(j)) {
                j++;
            }
            next[i] = j;
        }
    return next;
}
public static void main(String[] args) {
        String s = "ABABDABACDABABCABAB";
        String p = "ABABCABAB";
        int index = kmpSearch(s, p);
        if (index != -1) {
            System.out.println("The pattern string first appears at position: " + index);
        } else {
            System.out.println("The pattern string was not found.");
        }
    }
}
```
## 5. 复杂度分析 <a name="analyse"></a>
**时间复杂度**：预处理 next 数组需要 `O(m)` 的时间，匹配过程需要 `O(n)` 的时间。所以总时间复杂度为 **O(n+m)**。
**空间复杂度**：存储 next 数组需要 **O(m)** 的空间。
