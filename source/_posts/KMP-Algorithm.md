---
title: KMP Algorithm
date: 2025-03-8 13:04:19
updated: 2025-03-8 13:04:19
comments: true
tags: Data Structure and Alogrithm
categories: Data Structure and Alogrithm
---
# The KMP Algorithm
1. [Introduction to KMP Algorithm](#introduction) 
2. [Naive Pattern Searching Algorithm](#naive)
3. [Core Idea of the KMP Algorithm](#core)
   - [How to generate the next array(LSP array)](#generate)
   - [KMP Matching Process](#match)
4. [Code Implementation using Java](#java)
5. [Complexity Analysis](#analyse)
<!--more-->
## 1.KMP Algorithm <a name="introduction"></a>
In computer science,the**Knuth–Morris–Pratt** algorithm(**KMP algorithm**) is a [string-searching algorithm](https://en.wikipedia.org/wiki/String-searching_algorithm) that searches for occurrences of a word W within a main text string S by employing the observation that when a mismatch occurs, the word itself embodies sufficient information to determine where the next match could begin, thus bypassing re-examination of previously matched characters.It is an efficient string-matching technique that avoids unnecessary character comparisons by leveraging precomputed pattern data.Unlike the naive approach, KMP achieves **O(n+m)** time complexity, where `n=text` length and `m=pattern` length.

For example:
- Text string S = "ABABDABACDABABCABAB"
- Pattern string P = "ABABC"
We need to find the position where `P` first appears in `S`.
## 2. Naive(brute force) Pattern Searching Algorithm <a name="naive"></a>
- We start at every index in the text and compare it with the first character of the pattern, if they match we move to the next character in both text and pattern.
- If there is a mismatch, we start the same process for the next index of the text.
```
S: A B A B D A B A C D A B A B C A B A B
P: A B A B C
```
When a mismatch occurs, the text pointer backtracks to i=2, and the pattern pointer backtracks to j=0.
**Disadvantage**: The time complexity is**O(n×m)**(where n is the length of the text and m is the length of the pattern), which is inefficient.

## 3. Core Idea of the KMP Algorithm<a name="core"></a>
**Core**: Make use of the matched information to avoid invalid backtracking.
**Key points**:
- Preprocess the pattern string `P` to generate the `LPS ` array(here I use next array), which records the length of the longest common prefix and suffix for each position.
- During matching, use the `LPS` array to quickly find the backtracking position of the pattern string.
- **LPS** is the **Longest Proper Prefix** which is also a **Suffix**. A proper prefix is a prefix that does not include whole string.
### How to generate the next array(LSP array)<a name="generate"></a>
The `next[j]` represents the length of the longest common prefix and suffix of the first `j` characters of the pattern string `P`.
**Rules**:
- `Prefix`: A continuous substring starting from the first character (excluding the last character).
- `Suffix`: A continuous substring ending with the last character (excluding the first character).
- `Longest common prefix and suffix`: The longest identical prefix and suffix.

Example: Pattern="ABABC"
| **j**   | 0 | 1 | 2| 3| 4 |
| :----:      |:----:|:----:|:----:|:----:|:----:|
| char        |  A | B| A |B| C|
| next[j]        | 0 |0 |1|2|0|
### KMP Matching Process<a name="match"></a>
- Initialize pointers: Set the text pointer i = 0 and the pattern pointer j = 0.
- Compare characters one by one:
   - If S[i] == P[j], move both i and j to the right.
   - If there is a mismatch:
      - If j > 0, set j = next[j - 1] (backtrack using the next array).
      - If j == 0, move i to the right.
- Matching success: When j == m, return i - m

The whole Matching process:
1. Initially, i = 0, j = 0 → S[0]=A == P[0] → i = 1, j = 1.
2. S[1]=B == P[1] → i = 2, j = 2.
3. S[2]=A == P[2] → i = 3, j = 3.
4. S[3]=B == P[3] → i = 4, j = 4.
5. S[4]=D ≠ P[4]=C → j = next[3]=2.
6. S[4]=D ≠ P[2]=A → j = next[1]=0.
7. S[4]=D ≠ P[0]=A → i = 5, j = 0.
8. Continue matching until the position of `P` is found.
## 4. Code Implementation using Java <a name="java"></a>
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
## 5. Complexity Analysis <a name="analyse"></a>
**Time complexity**: Pre - processing the next array takes `O(m)` time, and the matching process takes `O(n)` time. So the total time complexity is **O(n+m)**.
**Space complexity**: Storing the next array requires **O(m)** space.