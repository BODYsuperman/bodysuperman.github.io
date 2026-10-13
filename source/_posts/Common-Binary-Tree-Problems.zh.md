---
title: 常见二叉树问题
lang: zh-CN
date: 2025-04-26 16:03:41
updated: 2025-04-26 19:04:19
comments: true
categories: 
  - Data Structure and Alogrithm
  - Binary Tree
tags: 
  - C#
  - Java
---
1. [引言](#introduction)  
2. [案例研究](#cs)  
   - [翻转二叉树](#case1)  
   - [对称二叉树](#case2)  
   - [二叉树的最大深度](#case3)  
   - [二叉树的最小深度](#case4)  
   - [完全二叉树的节点个数](#case5)  
   - [平衡二叉树](#case6)  
   - [二叉树的所有路径](#case7)  
   - [左叶子之和](#case8)  
   - [找树左下角的值](#case9)  

<!--more-->

## 引言<a name="introduction"></a>
大家好，我是 Alex。众所周知，树（Tree）是一种常用的数据结构，用于模拟层次化的树状结构。使用树的一个原因是，你可能需要存储天然具有层次关系的信息。

```
file system
-----------
       /   <-- root
      /      \
...          home
    /          \
   ugrad       course
 /            /    |   \
...        cs101 cs112 cs113  
```
此外，树还有一些其他应用：
- 1. 操作层次化数据。
- 2. 使信息易于搜索（参见树的遍历）。
- 3. 操作已排序的数据列表。
- 4. 作为视觉特效中数字图像合成的工作流。
- 5. 路由算法。
- 6. 多阶段决策模型（参见博弈树）。

二叉树（Binary Tree）是最典型的树结构之一。我之前发布过 {% post_link BinaryTree [二叉树] %}，其中包含了二叉树的一些重要概念、定义和基本操作。在阅读本文之前请先查看那篇文章。以下是我整理的常见二叉树 LeetCode 题目。

完成这些题目后，你将能够：
- 1. 深入理解二叉树的概念；
- 2. 熟悉不同的遍历方式；
- 3. 使用递归解决二叉树相关问题；


递归简介
函数直接或间接调用自身的过程称为递归（Recursion），相应的函数称为递归函数。

- 递归算法每一步都向解靠近一步，然后递归调用自身继续前进。一旦到达解，算法就停止。
- 由于被调用的函数可能进一步调用自身，这个过程可能会无限进行下去。因此，必须提供一个基本情况（base case）来终止递归过程。

**实现递归的步骤**：

**步骤 1**：确定递归函数的参数和返回值
参数是需要传入的节点指针，不需要其他参数。通常在此时设置主要参数。如果在编写递归逻辑时发现需要其他参数，可以随时添加。
实际上不需要返回值，但题目中要求返回根节点的指针，可以直接使用题目中定义的函数，因此函数的返回类型为 TreeNode。
```java
public TreeNode invertTree(TreeNode root)
```
**步骤 2**：确定终止条件
当前节点为空时直接返回。
```java
if (root == NULL) return root;
```
每次递归调用都会在`调用栈（Call Stack）`中分配一个新的栈帧（Stack Frame），用于存储当前函数的局部变量、参数和返回地址。如果没有终止条件，递归将无限进行下去，栈帧会无限堆积，最终超出 JVM 的栈空间限制 ---> 导致 **[栈溢出（Stack overflow）](https://en.wikipedia.org/wiki/Stack_overflow)** 错误。

**步骤 3**：确定单层递归的逻辑
确定单层递归的逻辑非常重要：{% post_link BinaryTree 4. Tree Traversal Techniques %}（树的遍历技巧），如 **前序遍历（PreOrder）**、**后序遍历（PostOrder）** 和 **中序遍历（InOrder）** 分别用来解决问题。


## 案例研究 <a name="cs"></a>
### 翻转二叉树<a name="case1"></a>
![pic](case1.png)

```java
//DFS
class Solution {
   /**
     * Both PreOder and PostOder traversal are correct.
     *Inorder is not possible, because first the left child is exchanged for *another child, then the root child is exchanged (after completion, the right *child has become the original left child), and then the right child is *exchanged for another child (at this point, it is actually exchanging for the *original left child)
     */
    public TreeNode invertTree(TreeNode root) {
        if (root == null) {
            return null;
        }
        invertTree(root.left);
        invertTree(root.right);
        swapChildren(root);
        return root;
    }

    private void swapChildren(TreeNode root) {
        TreeNode tmp = root.left;
        root.left = root.right;
        root.right = tmp;
    }
}

//BFS
class Solution {
    public TreeNode invertTree(TreeNode root) {
        if (root == null) {return null;}
        ArrayDeque<TreeNode> deque = new ArrayDeque<>();
        deque.offer(root);
        while (!deque.isEmpty()) {
            int size = deque.size();
            while (size-- > 0) {
                TreeNode node = deque.poll();
                swap(node);
                if (node.left != null) deque.offer(node.left);
                if (node.right != null) deque.offer(node.right);
            }
        }
        return root;
    }

    public void swap(TreeNode root) {
        TreeNode temp = root.left;
        root.left = root.right;
        root.right = temp;
    }
}
```
### 对称二叉树<a name="case2"></a>
![pic](case2.png)
```java
//DFS
public boolean isSymmetric1(TreeNode root) {
        return compare(root.left, root.right);
    }

private boolean compare(TreeNode left, TreeNode right) {

//To compare two nodes with different values, first clarify the situation where the two nodes are empty! Otherwise, when comparing numerical values later, the null pointer will be manipulated.
        if (left == null && right != null) {
            return false;
        }
        if (left != null && right == null) {
            return false;
        }

        if (left == null && right == null) {
            return true;
        }
        if (left.val != right.val) {
            return false;
        }
        //TheThe logic of single-layer recursion is to handle situations where both left and right nodes are not empty and have the same value.
        // Compare outside
        boolean compareOutside = compare(left.left, right.right);
        // Compare inside
        boolean compareInside = compare(left.right, right.left);
        return compareOutside && compareInside;
}

//BFS
public boolean isSymmetric3(TreeNode root) {
        Queue<TreeNode> deque = new LinkedList<>();
        deque.offer(root.left);
        deque.offer(root.right);
        while (!deque.isEmpty()) {
            TreeNode leftNode = deque.poll();
            TreeNode rightNode = deque.poll();
            if (leftNode == null && rightNode == null) {
                continue;
            }
            if (leftNode == null || rightNode == null || leftNode.val != rightNode.val) {
                return false;
            }
       
            deque.offer(leftNode.left);
            deque.offer(rightNode.right);
            deque.offer(leftNode.right);
            deque.offer(rightNode.left);
        }
        return true;
    }
```
### 二叉树的最大深度 <a name="case3"></a>
![pic](case3.png)

### 二叉树的最小深度 <a name="case4"></a>
![pic](case4.png)

```java
//DFS
class Solution {
    /**
     * The minimum depth is the number of nodes along the shortest path from the * 
     * root node down to the nearest leaf nod
     */
    public int minDepth(TreeNode root) {
        if (root == null) {
            return 0;
        }
        int leftDepth = minDepth(root.left);
        int rightDepth = minDepth(root.right);
        if (root.left == null) {
            return rightDepth + 1;
        }
        if (root.right == null) {
            return leftDepth + 1;
        }
        // Both left and right nodes are not null 
        return Math.min(leftDepth, rightDepth) + 1;
    }
}

//BFS
class Solution {
 
    public int minDepth(TreeNode root) {
        if (root == null) {
            return 0;
        }
        Deque<TreeNode> deque = new LinkedList<>();
        deque.offer(root);
        int depth = 0;
        while (!deque.isEmpty()) {
            int size = deque.size();
            depth++;
            for (int i = 0; i < size; i++) {
                TreeNode poll = deque.poll();
                if (poll.left == null && poll.right == null) {
                    // It is a leaf node that directly returns depth. Because it is traversed from top to bottom, this value is the minimum value
                    return depth;
                }
                if (poll.left != null) {
                    deque.offer(poll.left);
                }
                if (poll.right != null) {
                    deque.offer(poll.right);
                }
            }
        }
        return depth;
    }
}
```
### 完全二叉树的节点个数 <a name="case5"></a>
![pic](case5.png)

```java
class Solution {
    public int countNodes(TreeNode root) {
        if(root == null) {
            return 0;
        }
        // we need use postorder traversal to first calculate left node and then right node and then the 
        return countNodes(root.left) + countNodes(root.right) + 1;
    }
}


class Solution {
    public int countNodes(TreeNode root) {
        if (root == null) return 0;
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        int result = 0;
        while (!queue.isEmpty()) {
            int size = queue.size();
            while (size -- > 0) {
                TreeNode cur = queue.poll();
                result++;
                if (cur.left != null) queue.offer(cur.left);
                if (cur.right != null) queue.offer(cur.right);
            }
        }
        return result;
    }
}
```
### 平衡二叉树 <a name="case6"></a>
![pic](case6.png)
```java
//DFS
class Solution {

    public boolean isBalanced(TreeNode root) {
        return getHeight(root) != -1;
    }

    private int getHeight(TreeNode root) {
        if (root == null) {
            return 0;
        }
        int leftHeight = getHeight(root.left);
        if (leftHeight == -1) {
            return -1;
        }
        int rightHeight = getHeight(root.right);
        if (rightHeight == -1) {
            return -1;
        }
        // If the height difference between the left and right subtrees is greater than 1, return -1 indicates that it is no longer a balanced tree
        if (Math.abs(leftHeight - rightHeight) > 1) {
            return -1;
        }
        return Math.max(leftHeight, rightHeight) + 1;
    }
}

```

### 二叉树的所有路径 <a name="case7"></a>
![pic](case7.png)

分析：本题要求从根节点到叶子节点的路径，因此需要使用**前序遍历（PreOrder）**，这样便于父节点指向子节点，从而找到对应的路径。

```java
class Solution {
    public List<String> binaryTreePaths(TreeNode root) {
        List<String> res = new ArrayList<>();
        if (root == null) {
            return res;
        }
        List<Integer> paths = new ArrayList<>();
        traversal(root, paths, res);
        return res;
    }

    private void traversal(TreeNode root, List<Integer> paths, List<String> res) {
        paths.add(root.val);// PreOder--> mid
        // If we find the leaf node then we need to collect one possible path
        if (root.left == null && root.right == null) {
            // StringBuilder is used to concatenate strings, which is faster
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < paths.size() - 1; i++) {
                sb.append(paths.get(i)).append("->");
            }
            // Add last node since we don't need ->
            sb.append(paths.get(paths.size() - 1));
            res.add(sb.toString());//add one path
            return;
        }
        // Recursive and backtracking occur simultaneously, so they should be placed in the same curly braces
        if (root.left != null) { // left
            traversal(root.left, paths, res);
            paths.remove(paths.size() - 1);// BackTracking
        }
        if (root.right != null) { // right
            traversal(root.right, paths, res);
            paths.remove(paths.size() - 1);// Backtracking
        }
    }
}

//BFS
class Solution {
    public List<String> binaryTreePaths(TreeNode root) {
        List<String> result = new ArrayList<>();
        if (root == null)
            return result;
        Stack<Object> stack = new Stack<>();

        stack.push(root);
        stack.push(root.val + "");
        while (!stack.isEmpty()) {
            String path = (String) stack.pop();
            TreeNode node = (TreeNode) stack.pop();
            // leaf node
            if (node.left == null && node.right == null) {
                result.add(path);
            }
            //the right child node is not null
            if (node.right != null) {
                stack.push(node.right);
                stack.push(path + "->" + node.right.val);
            }
            //the left child node is not null
            if (node.left != null) {
                stack.push(node.left);
                stack.push(path + "->" + node.left.val);
            }
        }
        return result;
    }
}
```

### 左叶子之和 <a name="case8"></a>
![pic](case8.png)

```java
public int sumOfLeftLeaves(TreeNode root) {
    if (root == null) 
        return 0;
    
    int sum = 0;
    
    if (root.left != null && 
        root.left.left == null && 
        root.left.right == null) {
        sum += root.left.val;
    }
    
    sum += sumOfLeftLeaves(root.left);
    sum += sumOfLeftLeaves(root.right);
    
    return sum;
}


class Solution {
    public int sumOfLeftLeaves(TreeNode root) {
        if (root == null) return 0;
        Stack<TreeNode> stack = new Stack<> ();
        stack.add(root);
        int result = 0;
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            if (node.left != null && node.left.left == null && node.left.right == null) {
                result += node.left.val;
            }
            if (node.right != null) stack.add(node.right);
            if (node.left != null) stack.add(node.left);
        }
        return result;
    }
}
```
### 找树左下角的值 <a name="case9"></a>
![pic](case9.png)
```java
//DFS
class Solution {
    private int Deep = -1;
    private int value = 0;
    public int findBottomLeftValue(TreeNode root) {
        value = root.val;
        findLeftValue(root,0);
        return value;
    }

    private void findLeftValue (TreeNode root,int deep) {
        if (root == null) return;
        if (root.left == null && root.right == null) {
            if (deep > Deep) {
                value = root.val;
                Deep = deep;
            }
        }
        if (root.left != null) findLeftValue(root.left,deep + 1);
        if (root.right != null) findLeftValue(root.right,deep + 1);
    }
}

//BFS
class Solution {
    public int findBottomLeftValue(TreeNode root) {
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        int res = 0;
        while (!queue.isEmpty()) {
            int size = queue.size();
            for (int i = 0; i < size; i++) {
                TreeNode poll = queue.poll();
                if (i == 0) {
                    res = poll.val;
                }
                if (poll.left != null) {
                    queue.offer(poll.left);
                }
                if (poll.right != null) {
                    queue.offer(poll.right);
                }
            }
        }
        return res;
    }
}
```
