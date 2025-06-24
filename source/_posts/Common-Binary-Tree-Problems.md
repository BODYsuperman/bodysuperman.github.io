---
title: Common Binary Tree Problems
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
1. [Introduction](#introduction)  
2. [Case Study](#cs)  
   - [Invert Binary Tree](#case1)  
   - [Symmetric Tree](#case2)  
   - [Maximum Depth of Binary Tree](#case3)  
   - [Minimum Depth of Binary Tree](#case4)  
   - [Count Complete Tree Nodes](#case5)  
   - [Balanced Binary Tree](#case6)  
   - [Binary Tree Paths](#case7)  
   - [Sum of Left Leaves](#case8)  
   - [Find Bottom Left Tree Value](#case9)  

<!--more-->

## Introduction<a name="introduction"></a>
Hello everyone, this is Alex. As we know, a tree is a frequently-used data structure to simulate a hierarchical tree structure.One reason to use trees might be because you want to store information that naturally forms a hierarchy.

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
Also there are some other applications using trees:
- 1. Manipulate hierarchical data.
- 2. Make information easy to search (see tree traversal).
- 3. Manipulate sorted lists of data.
- 4. As a workflow for compositing digital images for visual effects.
- 5. Router algorithms
- 6. Form of a multi-stage decision-making (see business chess).

A Binary Tree is one of the most typical tree structure. I have posted {% post_link BinaryTree [Binary Tree] %} which include some significant information definitions and manipulation of  {% post_link BinaryTree [Binary Tree] %}. Please check it before viewing this article. Here are some common Binary Tree Leetcode problems I have sorted them out.

By completing these problems, you will be able to:
- 1. Deeply understand the concept of a binary tree;
- 2. Be familiar with different traversal methods;
- 3. Use recursion to solve binary-tree-related problems;


Introduction to Recursion
The process in which a function calls itself directly or indirectly is called recursion and the corresponding function is called a recursive function.

- A recursive algorithm takes one step toward solution and then recursively call itself to further move. The algorithm stops once we reach the solution.
- Since called function may further call itself, this process might continue forever. So it is essential to provide a base case to terminate this recursion process.

**Steps to Implement Recursion**:

**Step 1**:Determine the parameters and return values of recursive functions
Parameters are pointers to the nodes that need to be passed in, and no other parameters are needed. Usually, the main parameters are set at this time. If other parameters are found to be needed in writing recursive logic, they can be added at any time.
In fact, there is no need to return a value, but the pointer given in the question to return the root node can be directly used with the function defined in the question, so the return type of the function is TreeNode.
```java
public TreeNode invertTree(TreeNode root)
```
**Step 2**:Determine termination conditions
When the current node is empty then return. 
```java
if (root == NULL) return root;
```
Each recursive call allocates a new Stack Frame in the `Call Stack` to store the local variables, parameters, and return address of the current function. If there is no termination condition, recursion will continue indefinitely, stack frames will pile up infinitely, and eventually exceed the JVM's stack space limit ---> leading to  **[Stack overflow](https://en.wikipedia.org/wiki/Stack_overflow)** Error.

**Step 3**:Determine the logic of single-layer recursion
It's very important to detremine what the logic of single-layer recursion: {% post_link BinaryTree 4. Tree Traversal Techniques %}(Tree Traversal Techniques) like **PreOder**, **PostOrder** and **InOrder** to solve the problem respectively. 


## Case Study <a name="cs"></a>
### Inevert Binary Tree<a name="case1"></a>
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
### Symmetric Tree<a name="case2"></a>
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
### Maximum Depth of Binary Tree <a name="case3"></a>
![pic](case3.png)

### Minimum Depth of Binary Tree <a name="case4"></a>
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
### Count Complete Tree Nodes <a name="case5"></a>
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
### Balanced Binary Tree <a name="case6"></a>
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

### Binary Tree Paths <a name="case7"></a>
![pic](case7.png)

Analysis:This question requires a path from the root node to the leaf, so it needs to be traversed in **PreOrder** to make it easier for the parent node to point to the child node and find the corresponding path.

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

### Sum of Left Leaves <a name="case8"></a>
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
### Find Bottom Left Tree Value <a name="case9"></a>
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