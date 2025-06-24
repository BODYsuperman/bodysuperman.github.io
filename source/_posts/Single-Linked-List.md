---
title: Singly Linked List
date: 2025-02-18 12:39:33
updated: 2025-02-19 12:39:33
comments: true
tags: Data Structure and Alogrithm
categories: Data Structure and Alogrithm
---

## Singly Linked List: Concepts and Operations
1. [Overview of Singly Linked List](#1-overview-of-singly-linked-list)
2. [Advantages of Linked List](#2-advantages-of-linked-list)
3. [Types of Linked List](#3-types-of-linked-list)
4. [How to Create a Linked List](#4-how-to-create-a-linked-list)
5. [Various Operations on Linked List](#5-various-operations-on-linked-list)
<!-- more -->
### Overview of Singly Linked List <a name="1-overview-of-singly-linked-list"></a>
**What is a Linked List?**
In C#, a linked list is a linear data structure that stores elements in non - contiguous memory locations.
Each node consists of two parts:
1. **Data**: Each node of a linked list can store a piece of data.
2. **Address**: Each node of a linked list contains the address of the next node, referred to as "Next".

![pic](images/1.png)
The first node of a linked list is referenced by a pointer called **"Head"**.

### Advantages of Linked List <a name="2-advantages-of-linked-list"></a>
1. They are dynamic in nature and allocate memory as needed.
2. Insertion and deletion operations are easy to implement.
3. Other data structures such as stacks and queues can also be easily implemented using linked lists.
4. They have fast access times and can be expanded in constant time without memory overhead.
5. Since there is no need to define an initial size for a linked list, memory utilization is efficient.
6. Backtracking is possible in doubly - linked lists.

**Node Class**
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
### Types of Linked List <a name="3-types-of-linked-list"></a>
- **Singly linked lists**
- **Doubly linked lists**
- **Circular linked lists**
- **Circular doubly linked lists**

### How to Create a Linked List <a name="4-how-to-create-a-linked-list"></a>
Combined with the above node class, you can gradually build a linked list by instantiating nodes and setting their Next pointers. For example:

```
Node<int> node1 = new Node<int>(1);
Node<int> node2 = new Node<int>(2);
node1.Next = node2;
```
// Here, node1 serves as the head node to build a simple linked list

### Various Operations on Linked List <a name="5-various-operations-on-linked-list"></a>
Linked List Class Definition
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
### Additional Exercises:

#### How to Reverse a Linked List?
The time complexity is , and the space complexity is .

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
#### How to Find the k - th Node from the End of the Linked List
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
