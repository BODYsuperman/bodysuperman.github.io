---
title: Doubly Linked List
date: 2025-02-19 16:56:25
updated: 2025-02-19 16:56:25
comments: true
tags: Data Structure and Alogrithm
categories: Data Structure and Alogrithm
---

# Doubly Linked List in C#: A Fun and Practical Guide
1. [What is a Doubly Linked List?](#what-is-a-doubly-linked-list)
2. [Creating a Doubly Linked List Class](#creating-a-doubly-linked-list-class)
3. [Insertion Operations](#insertion-operations)
    - [Insert at the Beginning](#insert-at-the-beginning)
    - [Insert at the End](#insert-at-the-end)
    - [Insert after a spefific Node](#insert-after-a-spefific-node)
4. [Deletion Operations](#deletion-operations)
<!--more-->
5. [Traversal](#traversal)
    - [Forward Traversal](#forward-traversal)
    - [Backward Traversal](#backward-traversal)
6. [Search Node](#search)
7. [Complexity Analysis](#complexity)
8. [Use Cases](#use)
9. [Conclusion](#conclusion)


## 1. What is a Doubly Linked List?<a name="what-is-a-doubly-linked-list"></a>
In a Doubly Linked List, each node contains two links - the first link points to the previous node and the next link points to the next node in the sequence.The prev pointer of the first node and next pointer of the last node will point to null.
![pic](uploads/2.png)

Let us start by defining the `Node` class using C#:
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
## 2. Creating a Doubly Linked List Class <a name="creating-a-doubly-linked-list-class"></a>
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

## 3. Insertion Operations <a name="insertion-operations"></a>
### Insert at the Beginning <a name="insert-at-the-beginning"></a> 

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

### Insert at the End <a name="insert-at-the-end"></a>
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

### Insert after a specific Node <a name="insert-after-a-spefific-node"></a>
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

## 4. Deletion Operation <a name="deletion-operations"></a> 
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
## 5. Traversal <a name="traversal"></a> 
### Forward Traversal <a name="forward-traversal"></a>
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

### Backward Traversal <a name="backward-traversal"></a>
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
## 6. Search Node <a name="search"></a>
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
## 7. Complexity Analysis <a name="Complexity"></a>

| Operation   | Time Complexity | Space Complexity |
| :----:      |    :----:       |    :----:        |
| Insertion   | O(1)/O(n)       | O(1)             |
| Deletion    | O(1)            | O(1)             |
| Search      | O(n)            | O(1)             |   
| Traverse    | O(n)            | O(1)             |

## 8. Use Cases <a name="use"></a>
- Browser history management
- Music/Video playlists
- Undo/Redo functionality
- Navigation systems

## 9. Conclusion  <a name="conclusion"></a> 
**Doubly Linked Lists** provide enhanced flexibility compared to single linked lists at the cost of additional memory usage.They are particularly useful in scenarios requiring bidirectional traversal and frequent modifications.When implementing DLLs, careful pointer management is crucial to avoid broken links and memory leaks.
