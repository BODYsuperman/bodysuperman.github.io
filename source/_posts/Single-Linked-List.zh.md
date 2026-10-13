---
title: 单链表
date: 2025-02-18 12:39:33
updated: 2025-02-19 12:39:33
comments: true
tags: Data Structure and Alogrithm
categories: Data Structure and Alogrithm
lang: zh-CN
---

## 单链表：概念与操作
1. [单链表概述](#1-overview-of-singly-linked-list)
2. [链表的优点](#2-advantages-of-linked-list)
3. [链表的类型](#3-types-of-linked-list)
4. [如何创建链表](#4-how-to-create-a-linked-list)
5. [链表的各种操作](#5-various-operations-on-linked-list)
<!-- more -->
### 单链表概述 <a name="1-overview-of-singly-linked-list"></a>
**什么是链表？**
在 C# 中，链表是一种线性数据结构，以非连续的内存位置存储元素。
每个节点由两部分组成：
1. **数据（Data）**：链表的每个节点可以存储一个数据。
2. **地址（Address）**：链表的每个节点包含下一个节点的地址，称为"Next"。

![pic](images/1.png)
链表的第一个节点由一个称为**"头指针（Head）"**的指针引用。

### 链表的优点 <a name="2-advantages-of-linked-list"></a>
1. 链表本质上是动态的，按需分配内存。
2. 插入和删除操作易于实现。
3. 栈和队列等其他数据结构也可以使用链表轻松实现。
4. 链表具有快速的访问时间，可以在常数时间内扩展且无内存开销。
5. 由于无需定义链表的初始大小，内存利用率高。
6. 在双向链表中支持回溯操作。

**节点类**
```
public class Node<T>
{
    public T Data { get; set; }
    public Node<T> Next { get; set; }
    public Node(T data)
    {
        Data = data;
        Next = null;
    }
}
```
### 链表的类型 <a name="3-types-of-linked-list"></a>
- **单链表（Singly linked lists）**
- **双向链表（Doubly linked lists）**
- **循环链表（Circular linked lists）**
- **循环双向链表（Circular doubly linked lists）**

### 如何创建链表 <a name="4-how-to-create-a-linked-list"></a>
结合上述节点类，你可以通过实例化节点并设置其 Next 指针来逐步构建链表。例如：

```
Node<int> node1 = new Node<int>(1);
Node<int> node2 = new Node<int>(2);
node1.Next = node2;
```
// 这里，node1 作为头节点来构建一个简单的链表

### 链表的各种操作 <a name="5-various-operations-on-linked-list"></a>
链表类定义
```
public class LinkedList<T>
{
    // The head node of the linked list
    private Node<T> head;
    // The length of the linked list
    private int length;

    public LinkedList()
    {
        head = null;
        length = 0;
    }

    public int Length => length;
    public bool IsEmpty() => (length == 0);

    // Add a new node at the beginning of the linked list
    public void AddFirst(T data)
    {
        Node<T> newNode = new Node<T>(data);
        newNode.Next = head;
        // Update the new node as the head of the linked list
        head = newNode;
        length++;
    }
    // Add a new node at the end of the linked list
    public void AddTail(T data)
    {
        Node<T> newNode = new Node<T>(data);
        if (head == null)
        {
            head = newNode;
            return;
        }
        Node<T> current = head;
        while (current.Next != null)
        {
            current = current.Next;
        }
        current.Next = newNode;
        length++;
    }

    public void DeleteElemets(T Data)
    {
        Node<T> dummyHead = new Node<T>(default(T));
        dummyHead.Next = head;
        Node<T> temp = dummyHead;
        while (temp.Next != null)
        {
            if (temp.Next.Data.Equals(Data))
            {
                temp.Next = temp.Next.Next;
                length--;
            }
            else
            {
                temp = temp.Next;
            }
        }
        // return dummyHead.Next;
    }
    public void Delete(T Data)
    {
        if (head == null) return;
        if (head.Data.Equals(Data))
        {
            head = head.Next;
            length--;
            return;
        }
        Node<T> current = head;
        while (current != null && current.Next != null)
        {
            if (current.Next.Data.Equals(Data))
            {
                current.Next = current.Next.Next;
                length--;
                return;
            }
            current = current.Next;
        }
    }
    public void DeleteAtHead()
    {
        if (head == null) return;
        head = head.Next;
        length--;
    }
    public void Find(T Data)
    {
        if (head == null)
        {
            Console.WriteLine("The Linked List is null, can't find the data");
            return;
        }
        Node<T> current = head;
        while (current != null)
        {
            if (current.Data.Equals(Data))
            {
                Console.WriteLine("Found the data: " + Data);
                return;
            }
            current = current.Next;
        }
        Console.WriteLine("Not Found the data: " + Data);
    }

    public void InsertAt(int index, T data)
    {
        if (index < 0)
        {
            throw new ArgumentOutOfRangeException("Index", index, "Index must be non - negative");
        }
        Node<T> newNode = new Node<T>(data);
        if (index == 0)
        {
            AddFirst(data);
            return;
        }
        Node<T> current = head;
        for (int i = 0; i < index - 1; i++)
        {
            if (current == null || current.Next == null)
            {
                throw new ArgumentOutOfRangeException("Index", index, "Index is out of range");
            }
            current = current.Next;
        }
        newNode.Next = current.Next;
        current.Next = newNode;
        length++;
    }

    public void Print()
    {
        Node<T> current = head;
        if (current == null)
        {
            Console.WriteLine("null");
            return;
        }
        while (current != null)
        {
            Console.Write(current.Data + "->");
            current = current.Next;
        }
        Console.Write("null");
        Console.WriteLine();
    }
}
```
### 补充练习：

#### 如何反转链表？
时间复杂度为 O(n)，空间复杂度为 O(1)。

```
public void ReverseList()
{
    if (head.Next == null || head.Next.Next == null)
    {
        return;
    }
    Node<T> pre = null;
    Node<T> current = head;
    Node<T> temp = null;
    while (current != null)
    {
        // Store the key node to prevent data loss
        temp = current.Next;
        current.Next = pre;
        pre = current;
        current = temp;
    }
    head = pre;
}
```
#### 如何找到链表的倒数第 k 个节点
```
public Node<T> FindKthToLast(int k)
{
    if (head == null || k <= 0)
    {
        return null;
    }
    Node<T> fast = head;
    Node<T> slow = head;
    // Let the fast pointer move k steps first, and the remaining is N - K steps, which is the K - th step from the end
    for (int i = 0; i < k; i++)
    {
        if (fast == null)
        {
            return null;
        }
        fast = fast.Next;
    }
    // Move the fast and slow pointers together, and the slow pointer moves N - K steps
    while (fast != null)
    {
        fast = fast.Next;
        slow = slow.Next;
    }
    return slow;
}
```
