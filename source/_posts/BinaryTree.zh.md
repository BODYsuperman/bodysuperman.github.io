---
title: 二叉树
date: 2025-03-15 13:04:19
updated: 2025-03-15 13:04:19
comments: true
tags: Data Structure and Alogrithm
categories: Data Structure and Alogrithm
lang: zh-CN
---

# 二叉树
1. [什么是二叉树？](#what-is-a-binary-tree)
2. [关键组成部分与术语](#key-components)
3. [基于层次完整性的二叉树类型](#types-of-binarytree)
4. [树的遍历技术](#traversal-techniques)
   - [深度优先搜索（DFS）](#dfs)
   - [广度优先搜索（BFS）](#bfs)
5. [二叉搜索树（BST）](#bst)
   - [BST 实现](#bstim)
   - [如何在 BST 中删除节点](#deletebst)
6. [二叉树的最大深度](#depth)
7. [实际应用](#applications)
<!--more-->
## 1. 什么是二叉树？ <a name="what-is-a-doubly-linked-list"></a>
**二叉树（binary tree）**是一种[树形数据结构](https://en.wikipedia.org/wiki/Tree_(data_structure))，其中每个节点最多有两个子节点，分别称为**左子节点**和**右子节点**。最顶层的节点称为**根节点**，没有子节点的节点称为**叶子节点**。它在计算机科学中被广泛用于高效的数据存储和检索，支持插入、删除和遍历等各种操作。
```
          A  <- Root
        /   \
       B     C  <- Children
      / \
     D   E  <- Leave
```
通用 TreeNode 类：
```
public class TreeNode<T> where T : IComparable<T>
{
    public T Data { get; set; }
    public TreeNode<T>? Left { get; set; }
    public TreeNode<T>? Right { get; set; }

    public TreeNode(T data)
    {
        Data = data;
        Left = null;
        Right = null;
    }
}
```
## 2. 关键组成部分与术语： <a name="key-components"></a>
- **根节点（Root）**：顶层节点（示例中的 A）
- **父节点/子节点（Parent/Child）**：A 是 B 和 C 的父节点
- **叶子节点（Leaf）**：没有子节点的节点（D、E、C）
- **子树（Subtree）**：任意节点及其所有后代构成的树
- **深度（Depth）**：从根节点到某节点的距离（根节点的默认深度为 1）
- **高度（Height）**：从某节点到其最远叶子节点的最长路径
- **层（Level）**：处于相同深度的所有节点

## 3. 基于层次完整性的二叉树类型 <a name="types-of-binarytree"></a>

- 完全二叉树（Complete Binary Tree）
- 完美二叉树（Perfect Binary Tree）
- 平衡二叉树（Balanced Binary Tree）

### 完美二叉树
完美二叉树是指所有内部节点都有两个子节点，且所有叶子节点都在同一层的二叉树。
高度为 h 的完美二叉树（二叉树的高度是从根节点到树中任意叶子节点的最长路径上的边数，根节点的高度为 0）共有 **2<sup>h+1</sup>-1** 个节点。
![pic](images/b1.png)
### 完全二叉树
完全二叉树是指除最后一层外，所有层都被完全填充，且最后一层的所有键尽可能靠左的二叉树。
完全二叉树类似于满二叉树，但有两个主要区别：
- 除最后一层外，每一层必须被完全填充。
- 所有叶子元素必须向左倾斜。（我认为它们必须从左到右连续排列）
- 最后一个叶子元素可能没有右兄弟节点，即完全二叉树不一定是满二叉树。
![pic](images/b2.png)
### 满二叉树
满二叉树是每个节点要么有零个子节点，要么有两个子节点的二叉树。
![pic](images/b3.png)
### 平衡二叉树
如果二叉树的高度为 O(Log n)（其中 n 是节点数），则该树是平衡的。例如，AVL 树通过确保左右子树的高度差最多为 **1**（关键属性！）来维持 O(Log n) 的高度。红黑树通过确保从根到叶子的每条路径上的黑色节点数量相同，且没有相邻的红色节点来维持 O(Log n) 的高度。平衡二叉搜索树在性能上表现良好，它们为搜索、插入和删除操作提供 O(log n) 的时间复杂度。
![pic](images/b4.png)

## 4. 树的遍历技术 <a name="traversal-techniques"></a>
树的遍历是指按某种顺序恰好访问或访问树中每个节点一次的过程。树的遍历算法帮助我们访问和处理树的所有节点。由于树不是线性数据结构，下一个要访问的节点可能有多种选择，因此我们有多种遍历树的方式。

- 深度优先搜索（DFS）
   - 中序遍历（Inorder Traversal）
   - 前序遍历（Preorder Traversal）
   - 后序遍历（Postorder Traversal）
- 层序遍历（Level Order Traversal），即广度优先搜索（BFS）

### 深度优先搜索（DFS） <a name="dfs"></a>

- 中序遍历（左-根-右）
```
void Inorder(TreeNode node) {
    if (node == null) return;
    Inorder(node.Left);
    Console.Write(node.Value + " ");
    Inorder(node.Right);
}
```
**输出**：` D B E A C`

- 前序遍历（根-左-右）
```
void Preorder(TreeNode node) {
    if (node == null) return;
    Console.Write(node.Value + " ");
    Preorder(node.Left);
    Preorder(node.Right);
}
```
**输出**：`A B D E C`

- 后序遍历（左-右-根）
```
void Postorder(TreeNode node) {
    if (node == null) return;
    Postorder(node.Left);
    Postorder(node.Right);
    Console.Write(node.Value + " ");
}
```
**输出**：`D E B C A`

### 层序遍历，即广度优先搜索（BFS） <a name="bfs"></a>

```
public IList<IList<int>> LevelOrder(TreeNode root)
{
    var res = new List<IList<int>>();
    var que = new Queue<TreeNode>();
    if (root == null) return res;
    que.Enqueue(root);
    while (que.Count != 0)
    {
        var size = que.Count;
        var vec = new List<int>();
        for (int i = 0; i < size; i++)
        {
            var cur = que.Dequeue();
            vec.Add(cur.val);
            if (cur.left != null) que.Enqueue(cur.left);
            if (cur.right != null) que.Enqueue(cur.right);
        }
        res.Add(vec);
    }
    return res;
}
```
**输出**：`A B C D E`


## 5. 二叉搜索树（BST） <a name="bst"></a>

根据[维基百科](https://en.wikipedia.org/wiki/Binary_search_tree)：
>在计算机科学中，**二叉搜索树**（**BST**），也称为**有序二叉树**或**排序二叉树**，是一种以键为根的二叉树数据结构，其中每个内部节点的键大于其左子树中所有节点的键，小于其右子树中所有节点的键。二叉搜索树上的操作时间复杂度与树的高度成线性关系。

**[时间复杂度](https://en.wikipedia.org/wiki/Time_complexity)（[大 O 表示法](https://en.wikipedia.org/wiki/Big_O_notation)）**
| 操作   | 平均         | 最坏情况 |
| :----:      |    :----:       |    :----:        |
| 搜索（Search）      | O(log n)        | O(n)             |
| 插入（Insert）      | O(log n)        | O(n)             |
| 删除（Delete）      | O(log n)        | O(n)             |

### BST 实现 <a name="bstim"></a>
```
public class BinarySearchTree<T> where T : IComparable<T>
{
    private TreeNode<T>? _root;

    public void Insert(T data)
    {
        _root = InsertRec(_root, data);
    }

    private TreeNode<T> InsertRec(TreeNode<T>? node, T data)
    {
        if (node == null) return new TreeNode<T>(data);

        int comparison = data.CompareTo(node.Data);
        if (comparison < 0)
            node.Left = InsertRec(node.Left, data);
        else if (comparison > 0)
            node.Right = InsertRec(node.Right, data);

        return node;
    }

    public bool Search(T data)
    {
        return SearchRec(_root, data);
    }

    private bool SearchRec(TreeNode<T>? node, T data)
    {
        if (node == null) return false;

        int comparison = data.CompareTo(node.Data);
        return comparison == 0 ||
               SearchRec(comparison < 0 ? node.Left : node.Right, data);
    }
}
```
### 如何在 BST 中删除节点？ <a name="deletebst"></a>
```
  public TreeNode DeleteNode(TreeNode root, int key)
  {
      /*
       * 1.Not found the target key
       *
       * 2. Found
       * 2.1 the left and right node is null which mean its a leaf node
       * 2.2 the left is null and  the right is not null
       * 2.3 the left is not null and  the right is null
       * 2.4 Both left and right node is not null
       *
       */
      //not found
      if (root == null) return null;
      //Found
      if(root.val == key)
      {
          if (root.left == null && root.right == null) return null;
          if (root.left == null && root.right != null) return root.right;
          if (root.left != null && root.right == null) return root.left;
          if (root.left != null && root.right != null)
          {
              TreeNode leftode = root.right;
              while(leftode.left != null)
              {
                  leftode = leftode.left;
              }
              leftode.left = root.left;
              return root.right;
          }
      }
      if (root.val > key) root.left = DeleteNode(root.left, key);
      if (root.val < key) root.right = DeleteNode(root.right, key);

      return root;
  }
```

## 6. 二叉树的最大深度 <a name="depth"></a>
给定一棵二叉树，任务是找到该树的最大深度。最大深度或树的高度是从根节点到最深节点的边数。

- 方法一：使用递归——时间复杂度 O(n)，空间复杂度 O(h)
```
public int MaxDepth(TreeNode root) {
    if(root == null) return 0;

    int leftDepth = MaxDepth(root.left);
    int rightDepth = MaxDepth(root.right);

    return 1 + Math.Max(leftDepth, rightDepth);
}
```

- 方法二：不使用空分隔符的层序遍历——时间复杂度 O(n)，空间复杂度 O(n)
```
public int MaxDepth(TreeNode root)
{
    int depth = 0;
    Queue<TreeNode> que = new();
    if (root == null) return depth;
    que.Enqueue(root);
    while (que.Count != 0)
    {
        int size = que.Count;
        depth++;
        for (int i = 0; i < size; i++)
        {
            var node = que.Dequeue();
            if (node.left != null) que.Enqueue(node.left);
            if (node.right != null) que.Enqueue(node.right);
        }
    }
    return depth;
}
```
## 7. 实际应用 <a name="applications"></a>
1. LINQ 查询优化
   - 表达式树驱动 LINQ 查询
2. 游戏开发
   - Unity 使用空间分割树（Octrees/BVH）
3. 数据库系统
   - SQL Server 使用 B 树存储索引
