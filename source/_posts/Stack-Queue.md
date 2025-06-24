---
title: Stack & Queue
date: 2025-04-12 18:40:32
updated: 2025-04-12 18:04:19
comments: true
tags: Data Structure and Alogrithm
categories: Data Structure and Alogrithm
---
1. [Introduction](#introduction)  
2. [Stack Overview](#stack-overview)  
   - [Key Features](#key-features-of-stack)  
   - [Applications](#applications-of-stack)  
3. [Queue Overview](#queue-overview)  
   - [Key Features](#key-features-of-queue)  
   - [Applications](#applications-of-queue)  
   - [Types of Queues](#type)
4. [Implementing Stack](#implementing-stack)  
   - [With Array](#stack-implementation-using-array)  
   - [With Linked List](#stack-implementation-using-linked-list)  
5. [Implementing Queue](#implementing-queue)  
   - [With Array](#queue-implementation-using-array)  
   - [With Linked List](#queue-implementation-using-linked-list)  
6. [Implementing Queue with Two Stacks](#implementing-queue-with-two-stacks)  
7. [Implement Stack using just one Queue](#implementing-stack-with-one-queue)  
8. [Summary](#summary)  
<!--more-->

## Introduction<a name="introduction"></a>
Stack is a linear data structure that follows **Last In, First Out(LIFO)** Principle, the last element inserted is the first to be popped out. It means both insertion and deletion operations happen at one end only.While Queue follows the principle of **First In, First out (FIFO)**, where the first element added to the queue is the first one to be removed. 
- **Stack**: Follows **Last-In-First-Out (LIFO)**.  
- **Queue**: Follows **First-In-First-Out (FIFO)**.  
## Stack Overview<a name="stack-overview"></a>  
### Key Features of Stack<a name="key-features-of-stack"></a>  
- **Top**: The only accessible end for insertions/deletions.  
- **Operations**:  
    - push() to insert an element into the stack
    - pop() to remove an element from the stack
    - top() Returns the top element of the stack.
    - isEmpty() returns true if stack is empty else false.
    - isFull() returns true if the stack is full else false.
### Applications of Stack<a name="applications-of-stack"></a>  
- Function call management (call stack).  
- Undo/Redo functionality.  
- Syntax parsing (e.g., matching parentheses).  
## Queue Overview<a name="queue-overview"></a>  
### Key Features of Queue<a name="key-features-of-queue"></a>  
- **Front/Back**: Elements enter at the back and exit from the front.  
- **Operations**:  
    - Enqueue: Adds an element to the end (rear) of the queue. If the queue is full, an overflow error occurs.
    - Dequeue: Removes the element from the front of the queue. If the queue is empty, an underflow error occurs.
    - Peek/Front: Returns the element at the front without removing it.
    - Size: Returns the number of elements in the queue.
    - isEmpty: Returns true if the queue is empty, otherwise false.
    - isFull: Returns true if the queue is full, otherwise false.

### Applications of Queue<a name="applications-of-queue"></a>  
- Task scheduling (e.g., printers managing print jobs).  
- Breadth-First Search (BFS) in graph algorithms.  
- Buffering data streams.  

### Types of Queues<a name="type"></a>
1. Simple Queue: Simple Queue simply follows FIFO Structure. We can only insert the element at the back and remove the element from the front of the queue. A simple queue is efficiently implemented either using a linked list or a circular array.
2. Double-Ended Queue (Deque): In a double-ended queue the insertion and deletion operations, both can be performed from both ends. They are of two types:
Input Restricted Queue: This is a simple queue. In this type of queue, the input can be taken from only one end but deletion can be done from any of the ends.
Output Restricted Queue: This is also a simple queue. In this type of queue, the input can be taken from both ends but deletion can be done from only one end.
3. Priority Queue: A priority queue is a special queue where the elements are accessed based on the priority assigned to them. They are of two types:
- Ascending Priority Queue: In Ascending Priority Queue, the elements are arranged in increasing order of their priority values. Element with smallest priority value is popped first.
- Descending Priority Queue: In Descending Priority Queue, the elements are arranged in decreasing order of their priority values. Element with largest priority is popped first.
![pic](sq1.png)

## Implementing Stack <a name="implementing-stack"></a> 
### Stack Implementation Using Array<a name="stack-implementation-using-array"></a>   
```csharp
public class ArrayStack<T>
{
    private T[] _array;
    private int _topIndex;

    public ArrayStack(int capacity = 4)
    {
        _array = new T[capacity];
        _topIndex = -1;
    }

    public void Push(T item)
    {
        if (_topIndex == _array.Length - 1)
            Array.Resize(ref _array, _array.Length * 2);
        _array[++_topIndex] = item;
    }

    public T Pop()
    {
        if (IsEmpty()) throw new InvalidOperationException("Stack is empty.");
        return _array[_topIndex--];
    }

    public T Peek() => IsEmpty() ? throw new InvalidOperationException("Stack is empty.") : _array[_topIndex];

    public bool IsEmpty() => _topIndex == -1;
}
```
### Stack Implementation Using Linked List<a name="stack-implementation-using-linked-list"></a> 
```csharp
public class Node<T>
{
    public T Value;
    public Node<T> Next;
    public Node(T value) => Value = value;
}

public class LinkedListStack<T>
{
    private Node<T> _top;

    public void Push(T item)
    {
        var newNode = new Node<T>(item) { Next = _top };
        _top = newNode;
    }

    public T Pop()
    {
        if (_top == null) throw new InvalidOperationException("Stack is empty.");
        var value = _top.Value;
        _top = _top.Next;
        return value;
    }

    public T Peek() => _top == null ? throw new InvalidOperationException("Stack is empty.") : _top.Value;

    public bool IsEmpty() => _top == null;
}
```
## Implementing Queue<a name="implementing-queue"></a> 
### Queue Implementation Using Array<a name="queue-implementation-using-array"></a> 
```csharp
public class ArrayQueue<T>
{
    private T[] _array;
    private int _front;
    private int _back;
    private int _count;

    public ArrayQueue(int capacity = 4)
    {
        _array = new T[capacity];
        _front = 0;
        _back = 0;
        _count = 0;
    }

    public void Enqueue(T item)
    {
        if (_count == _array.Length)
            Array.Resize(ref _array, _array.Length * 2);
        _array[_back % _array.Length] = item;
        _back++;
        _count++;
    }

    public T Dequeue()
    {
        if (IsEmpty()) throw new InvalidOperationException("Queue is empty.");
        var value = _array[_front % _array.Length];
        _front++;
        _count--;
        return value;
    }

    public T Peek() => IsEmpty() ? throw new InvalidOperationException("Queue is empty.") : _array[_front % _array.Length];

    public bool IsEmpty() => _count == 0;
}
```
### Queue Implementation Using Linked List<a name="queue-implementation-using-linked-list"></a> 
```csharp
public class LinkedListQueue<T>
{
    private Node<T> _front;
    private Node<T> _back;

    public void Enqueue(T item)
    {
        var newNode = new Node<T>(item);
        if (_back != null) _back.Next = newNode;
        _back = newNode;
        if (_front == null) _front = _back;
    }

    public T Dequeue()
    {
        if (_front == null) throw new InvalidOperationException("Queue is empty.");
        var value = _front.Value;
        _front = _front.Next;
        if (_front == null) _back = null;
        return value;
    }

    public T Peek() => _front == null ? throw new InvalidOperationException("Queue is empty.") : _front.Value;

    public bool IsEmpty() => _front == null;
}
```
## Implementing Queue using Stacks <a name="implementing-queue-with-two-stacks"></a> 
Use two stacks (inStack and outStack) to simulate FIFO behavior:
- inStack handles enqueue operations (Enqueue).
- outStack handles dequeue operations (Dequeue). When outStack is empty, pop all elements from inStack and push them into outStack to reverse the order.
```csharp
public class StackToQueue<T> {
    private Stack<T> _inStack;
    private Stack<T> _outStack;

    public StackToQueue() {
        _inStack = new Stack<T>();
        _outStack = new Stack<T>();
    }

    public void Enqueue(T item) {
        _inStack.Push(item);
    }

    public T Dequeue() {
        if (IsEmpty()) {
            throw new InvalidOperationException("Queue is empty");
        }
        MoveInToOut(); // Ensure outStack has elements
        return _outStack.Pop();
    }

    public T Peek() {
        if (IsEmpty()) {
            throw new InvalidOperationException("Queue is empty");
        }
        MoveInToOut();
        return _outStack.Peek();
    }

    private void MoveInToOut() {
        if (_outStack.Count == 0) {
            while (_inStack.Count > 0) {
                _outStack.Push(_inStack.Pop());
            }
        }
    }

    public bool IsEmpty() => _inStack.Count + _outStack.Count == 0;
    public int Count => _inStack.Count + _outStack.Count;
}
```
### Implement Stack using just one Queue<a name="implementing-stack-with-one-queue"></a> 
```csharp
public class MyStack {
    Queue<int> myQueue;
    public MyStack() {
        myQueue = new Queue<int>();
    }
    
    public void Push(int x) {
        myQueue.Enqueue(x);
    }
    
    public int Pop() {
        for (var i = 0; i < myQueue.Count-1; i++)
        {
            myQueue.Enqueue(myQueue.Dequeue());
        }
        return myQueue.Dequeue();
    }

    //reuse Pop()
    public int Top() {
        int res = Pop();
        myQueue.Enqueue(res);
        return res;
    }
    
    public bool Empty() {
        return (myQueue.Count == 0);
    }
}
```
## Summary<a name="summary"></a> 
|**Data Structure**| **Logical Characteristic** | **Typical Scenarios**| **Advantages of Array-base** |**Advantages of Linked List-based** |
| :----:        |    :----:       |    :----:        |  :----:        |  :----:  |
| Stack| LIFO |Expression evaluation, Undo operations|Fast access|  No need for pre-allocation |
| Queue| FIFO | Task scheduling, Message queues      |  Continuous memory  |Flexible dynamic resizing|
### Significance of Mutual Implementation
- **Queue using Stacks**: Understand the conversion between LIFO and FIFO, leveraging stack properties to simulate queue behavior.
- **Stack using Queues**: Deeply understand the underlying principles of data structures and master algorithm design in complex scenarios.
