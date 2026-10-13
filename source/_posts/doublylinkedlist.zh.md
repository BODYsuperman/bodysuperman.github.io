---
title: 双向链表
date: 2025-02-19 16:56:25
updated: 2025-02-19 16:56:25
comments: true
tags: Data Structure and Alogrithm
categories: Data Structure and Alogrithm
lang: zh-CN
---

# C# 双向链表：趣味实用指南
1. [什么是双向链表？](#what-is-a-doubly-linked-list)
2. [创建双向链表类](#creating-a-doubly-linked-list-class)
3. [插入操作](#insertion-operations)
    - [在头部插入](#insert-at-the-beginning)
    - [在尾部插入](#insert-at-the-end)
    - [在指定节点后插入](#insert-after-a-spefific-node)
4. [删除操作](#deletion-operations)
<!--more-->
5. [遍历](#traversal)
    - [正向遍历](#forward-traversal)
    - [反向遍历](#backward-traversal)
6. [搜索节点](#search)
7. [复杂度分析](#complexity)
8. [应用场景](#use)
9. [总结](#conclusion)


## 1. 什么是双向链表？<a name="what-is-a-doubly-linked-list"></a>
在双向链表中，每个节点包含两个链接——第一个链接指向前一个节点，下一个链接指向序列中的后一个节点。第一个节点的 prev 指针和最后一个节点的 next 指针指向 null。
![pic](uploads/2.png)

让我们先用 C# 定义 `Node` 类：
```
 public class Node<T>
 {
     public T Data { get; set; }
     public Node<T> Next { get; set; }
     public Node<T> Prev { get; set; }

     public Node (T data)
     {
         Data = data;
         Next = null;
         Prev = null;
     }
 }
```
## 2. 创建双向链表类 <a name="creating-a-doubly-linked-list-class"></a>
```
 public class DoublyLinkedList<T>
 {
     private Node<T> head;
     private Node<T> tail;

     private int size;
     public DoublyLinkedList()
     {
         head = null;
         tail = null;
         size = 0;
     }

     public int Size() => size;
 }
```

## 3. 插入操作 <a name="insertion-operations"></a>
### 在头部插入 <a name="insert-at-the-beginning"></a>

```
public void AddFirst(T data)
{
     Node<T> newNode = new Node<T>(data);
     if (head == null)
     {
         head = tail = newNode;
     }
     else
     {
         newNode.Next = head;
         head.Prev = newNode;
         head = newNode;
     }

     size++;
}
```

### 在尾部插入 <a name="insert-at-the-end"></a>
```
public void AddTail(T data)
 {
     Node<T> newNode = new Node<T>(data);
     if (head == null)
     {
         head = tail = newNode;
     }
     else
     {
         tail.Next = newNode;
         newNode.Prev = tail;
         tail = newNode;
     }
     size++;
}
```

### 在指定节点后插入 <a name="insert-after-a-spefific-node"></a>
```
public void InsertAt(T data, int index)
{
     if (index < 0 || index> size)
     {
         throw new ArgumentOutOfRangeException("Index", index, "Index must be non - negative");
     }
     if(index == 0)
     {
         AddFirst(data);
         return;
     }
     else if (index == size)
     {
         AddTail(data);
         return;
     }
     else
     {
         Node<T> current = head;
         for (int i = 0; i < index - 1; i++)
         {
             current = current.Next;
         }
         Node<T> newNode = new Node<T>(data);
         newNode.Next = current.Next;
         newNode.Prev = current;
         current.Next.Prev = newNode;
         current.Next = newNode;
         size++;
     }
}
```

## 4. 删除操作 <a name="deletion-operations"></a>
```
public void Delete(T Data)
 {
     Node<T> current = head;

     while (current != null)
     {
         if (current.Data.Equals(Data))
         {
             //if the node is not the head
             if (current.Prev != null)
             {
                 current.Prev.Next = current.Next;
             }
             else
             {
                 head = current.Next;
             }

             if (current.Next != null)
             {
                 current.Next.Prev = current.Prev;
             }
             else
             {
                 tail = current.Prev;
             }
             size--;
             return;
         }

         current = current.Next;
     }
     Console.WriteLine("Node with data {0} not found", Data);
}
```
## 5. 遍历 <a name="traversal"></a>
### 正向遍历 <a name="forward-traversal"></a>
```
      public void PrintForward()
      {
          Node<T> current = head;
          while (current != null)
          {
              Console.Write(current.Data + " ");
              current = current.Next;
          }
          Console.WriteLine();
      }
```

### 反向遍历 <a name="backward-traversal"></a>
```
public void PrintBackward()
{
    Node<T> current = tail;
    while (current != null)
    {
        Console.Write(current.Data + " ");
        current = current.Prev;
    }
    Console.WriteLine();
}
```
## 6. 搜索节点 <a name="search"></a>
```
public void Find(T Data)
{
     Node<T> current = head;
     while (current != null)
     {
         if (current.Data.Equals(Data))
         {
             Console.WriteLine("Found: " + Data);
             return;
         }
         current = current.Next;
     }
     Console.WriteLine("Not Found: " + Data);
}
```
## 7. 复杂度分析 <a name="Complexity"></a>

| 操作   | 时间复杂度 | 空间复杂度 |
| :----:      |    :----:       |    :----:        |
| 插入（Insertion）   | O(1)/O(n)       | O(1)             |
| 删除（Deletion）    | O(1)            | O(1)             |
| 搜索（Search）      | O(n)            | O(1)             |
| 遍历（Traverse）    | O(n)            | O(1)             |

## 8. 应用场景 <a name="use"></a>
- 浏览器历史记录管理
- 音乐/视频播放列表
- 撤销/重做功能
- 导航系统

## 9. 总结  <a name="conclusion"></a>
**双向链表**相比单链表提供了更强的灵活性，但代价是额外的内存开销。它们在需要双向遍历和频繁修改的场景中特别有用。在实现双向链表时，谨慎管理指针至关重要，以避免断裂的链接和内存泄漏。
