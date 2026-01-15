---
title: Binary Tree
date: 2025-03-15 13:04:19
updated: 2025-03-15 13:04:19
comments: true
tags: Data Structure and Alogrithm
categories: Data Structure and Alogrithm
---

# Binary Tree
1. [What is a Binary Tree?](#what-is-a-binary-tree)
2. [Key Components and Terms](#key-components)
3. [Types of Binary Tree On the basis of the completion of levels](#types-of-binarytree)
4. [ Tree Traversal Techniques](#traversal-techniques)
   - [Depth-First Search (DFS)](#dfs)
   - [Breadth First Search (BFS)](#bfs)
5. [Binary Search Tree (BST)](#bst) 
   - [BST Implementation](#bstim)
   - [How to delete Node in a BST](#deletebst)
6. [Maximum Depth of Binary Tree](#depth)
7. [Real-World Applications](#applications)
<!--more-->
## 1. What is a Binary Tree? <a name="what-is-a-doubly-linked-list"></a>
A **binary tree** is a [tree data structure](https://en.wikipedia.org/wiki/Tree_(data_structure)) in which each node has at most two children, referred to as the **left child** and the **right child**.The topmost node is the **root**, and nodes without children are called **leaves**.It is commonly used in computer science for efficient storage and retrieval of data, with various operations such as insertion, deletion, and traversal.
```      
          A  <- Root
        /   \
       B     C  <- Children
      / \
     D   E  <- Leave
```
Generic TreeNode class:
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
## 2. Key Components and Terms: <a name="key-components"></a>
- **Root**: Top node (A in our example)  
- **Parent/Child**: A is parent of B and C  
- **Leaf**: Nodes without children (D, E, C)  
- **Subtree**: Any node with its descendants  
- **Depth**: Distance from the root to a node (root has default depth 1)
- **Height**: Longest path from a node to a leaf
- **Level**: All nodes at the same depth

## 3. Types of Binary Tree On the basis of the completion of levels <a name="types-of-binarytree"></a>

- Complete Binary Tree
- Perfect Binary Tree
- Balanced Binary Tree

### Perfect Binary Tree
A Binary tree is a Perfect Binary Tree in which all the internal nodes have two children and all leaf nodes are at the same level. 
A Perfect Binary Tree of height h (where the height of the binary tree is the number of edges in the longest path from the root node to any leaf node in the tree, height of root node is 0) has **2<sup>h+1</sup>-1** node. 
![pic](images/b1.png)
### Complete Binary Tree
A Binary Tree is a Complete Binary Tree if all the levels are completely filled except possibly the last level and the last level has all keys as left as possible.
A complete binary tree is just like a full binary tree, but with two major differences:
- Every level except the last level must be completely filled.
- All the leaf elements must lean towards the left.(I think they must be continuous from left to right)
- The last leaf element might not have a right sibling i.e. a complete binary tree doesn’t have to be a full binary tree.
![pic](images/b2.png)
### Full Binary Tree
A full binary tree is a binary tree with either zero or two child nodes for each node. 
![pic](images/b3.png)
### Balanced Binary Tree
A binary tree is balanced if the height of the tree is O(Log n) where n is the number of nodes. For Example, the AVL tree maintains O(Log n) height by making sure that the difference between the heights of the left and right subtrees is at most **1**(key attribute!). Red-Black trees maintain O(Log n) height by making sure that the number of Black nodes on every root to leaf paths is the same and that there are no adjacent red nodes. Balanced Binary Search trees are performance-wise good as they provide O(log n) time for search, insert and delete. 
![pic](images/b4.png)

## 4. Tree Traversal Techniques <a name="traversal-techniques"></a>
Tree Traversal refers to the process of visiting or accessing each node of the tree exactly once in a certain order. Tree traversal algorithms help us visit and process all the nodes of the tree. Since a tree is not a linear data structure, there can be multiple choices for the next node to be visited. Hence we have many ways to traverse a tree.

- Depth First Search or DFS
   - Inorder Traversal
   - Preorder Traversal
   - Postorder Traversal
- Level Order Traversal or Breadth First Search or BFS

### Depth-First Search (DFS) <a name="dfs"></a>

- Inorder Traversal (Left-Root-Right)
```
void Inorder(TreeNode node) {
    if (node == null) return;
    Inorder(node.Left);
    Console.Write(node.Value + " ");
    Inorder(node.Right);
}
```
**Output**:` D B E A C`

- Preorder Traversal (Root-Left-Right)
```
void Preorder(TreeNode node) {
    if (node == null) return;
    Console.Write(node.Value + " ");
    Preorder(node.Left);
    Preorder(node.Right);
}
```
**Output**:`A B D E C`

- Postorder Traversal (Left-Right-Root)
```
void Postorder(TreeNode node) {
    if (node == null) return;
    Postorder(node.Left);
    Postorder(node.Right);
    Console.Write(node.Value + " ");
}
```
**Output**: `D E B C A`

### Level Order Traversal or Breadth First Search or BFS <a name="bfs"></a>

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
**Output**: `A B C D E`


## 5. Binary Search Tree (BST) <a name="bst"></a>

Accdoring to the [wikipedia](https://en.wikipedia.org/wiki/Binary_search_tree):
>In computer science, a **binary search tree** (**BST**), also called an **ordered** or **sorted binary tree**, is a rooted binary tree data structure with the key of each internal node being greater than all the keys in the respective node's left subtree and less than the ones in its right subtree. The time complexity of operations on the binary search tree is linear with respect to the height of the tree.

**[Time complexity](https://en.wikipedia.org/wiki/Time_complexity) in [big O notation](https://en.wikipedia.org/wiki/Big_O_notation)**
| Operation   | Average         | Worst case |
| :----:      |    :----:       |    :----:        |
| Search      | O(log n)        | O(n)             |
| Insert      | O(log n)        | O(n)             |
| Delete      | O(log n)        | O(n)             |   

### BST Implementation <a name="bstim"></a>
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
### How to delete Node in a BST? <a name="deletebst"></a>
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

## 6. Maximum Depth of Binary Tree <a name="depth"></a>
Given a binary tree, the task is to find the maximum depth of the tree. The maximum depth or height of the tree is the number of edges in the tree from the root to the deepest node.

- Approach 1: Using Recursion – O(n) Time and O(h) Space
```
public int MaxDepth(TreeNode root) {
    if(root == null) return 0;

    int leftDepth = MaxDepth(root.left);
    int rightDepth = MaxDepth(root.right);

    return 1 + Math.Max(leftDepth, rightDepth);
}
```

- Approach 2: Level Order Traversal without using Null Delimiter – O(n) Time and O(n) Space
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
## 7. Real-World Applications <a name="applications"></a>
1. LINQ Query Optimization
   - Expression trees power LINQ queries
2. Game Development
   - Unity uses spatial partitioning trees (Octrees/BVH)
3. Database Systems
   - SQL Server uses B-trees for index storage