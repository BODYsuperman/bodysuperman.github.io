---
title: 栈与队列
lang: zh-CN
date: 2025-04-12 18:40:32
updated: 2025-04-12 18:04:19
comments: true
tags: Data Structure and Alogrithm
categories: Data Structure and Alogrithm
---
1. [引言](#introduction)  
2. [栈概述](#stack-overview)  
   - [核心特性](#key-features-of-stack)  
   - [应用场景](#applications-of-stack)  
3. [队列概述](#queue-overview)  
   - [核心特性](#key-features-of-queue)  
   - [应用场景](#applications-of-queue)  
   - [队列类型](#type)
4. [实现栈](#implementing-stack)  
   - [基于数组](#stack-implementation-using-array)  
   - [基于链表](#stack-implementation-using-linked-list)  
5. [实现队列](#implementing-queue)  
   - [基于数组](#queue-implementation-using-array)  
   - [基于链表](#queue-implementation-using-linked-list)  
6. [用两个栈实现队列](#implementing-queue-with-two-stacks)  
7. [用一个队列实现栈](#implementing-stack-with-one-queue)  
8. [总结](#summary)  
<!--more-->

## 引言<a name="introduction"></a>
栈（Stack）是一种线性数据结构，遵循**后进先出（LIFO, Last In, First Out）**原则，最后插入的元素最先被弹出。这意味着插入和删除操作都只在一端进行。而队列（Queue）遵循**先进先出（FIFO, First In, First Out）**原则，最先加入队列的元素最先被移除。
- **栈**：遵循**后进先出（LIFO）**。  
- **队列**：遵循**先进先出（FIFO）**。  
## 栈概述<a name="stack-overview"></a>  
### 栈的核心特性<a name="key-features-of-stack"></a>  
- **栈顶（Top）**：唯一可进行插入/删除操作的一端。  
- **操作**：  
    - push() 将元素压入栈中
    - pop() 从栈中移除元素
    - top() 返回栈顶元素。
    - isEmpty() 栈为空时返回 true，否则返回 false。
    - isFull() 栈已满时返回 true，否则返回 false。
### 栈的应用场景<a name="applications-of-stack"></a>  
- 函数调用管理（调用栈）。  
- 撤销/重做功能。  
- 语法解析（如括号匹配）。  
## 队列概述<a name="queue-overview"></a>  
### 队列的核心特性<a name="key-features-of-queue"></a>  
- **队头/队尾（Front/Back）**：元素从队尾进入，从队头离开。  
- **操作**：  
    - Enqueue（入队）：将元素添加到队列的末尾（队尾）。如果队列已满，则发生溢出错误。
    - Dequeue（出队）：从队列的队头移除元素。如果队列为空，则发生下溢错误。
    - Peek/Front（查看队头）：返回队头元素但不移除它。
    - Size（大小）：返回队列中的元素个数。
    - isEmpty（判空）：队列为空时返回 true，否则返回 false。
    - isFull（判满）：队列已满时返回 true，否则返回 false。

### 队列的应用场景<a name="applications-of-queue"></a>  
- 任务调度（如打印机管理打印任务）。  
- 图算法中的广度优先搜索（BFS）。  
- 数据流缓冲。  

### 队列类型<a name="type"></a>
1. 普通队列（Simple Queue）：普通队列遵循 FIFO 结构。我们只能在队尾插入元素，在队头移除元素。普通队列可以使用链表或循环数组高效实现。
2. 双端队列（Deque）：在双端队列中，插入和删除操作都可以在两端进行。它分为两种类型：
输入受限队列：这是一种简单队列。在这种类型中，输入只能从一端进行，但删除可以从任意一端进行。
输出受限队列：这也是一种简单队列。在这种类型中，输入可以从两端进行，但删除只能从一端进行。
3. 优先队列（Priority Queue）：优先队列是一种特殊队列，元素按照分配的优先级进行访问。它分为两种类型：
- 升序优先队列：在升序优先队列中，元素按优先级值从小到大排列。优先级值最小的元素最先被弹出。
- 降序优先队列：在降序优先队列中，元素按优先级值从大到小排列。优先级值最大的元素最先被弹出。
![pic](sq1.png)

## 实现栈 <a name="implementing-stack"></a> 
### 基于数组实现栈<a name="stack-implementation-using-array"></a>   
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
### 基于链表实现栈<a name="stack-implementation-using-linked-list"></a> 
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
## 实现队列<a name="implementing-queue"></a> 
### 基于数组实现队列<a name="queue-implementation-using-array"></a> 
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
### 基于链表实现队列<a name="queue-implementation-using-linked-list"></a> 
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
## 用两个栈实现队列 <a name="implementing-queue-with-two-stacks"></a> 
使用两个栈（inStack 和 outStack）来模拟 FIFO 行为：
- inStack 处理入队操作（Enqueue）。
- outStack 处理出队操作（Dequeue）。当 outStack 为空时，将 inStack 中的所有元素弹出并压入 outStack，以反转顺序。
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
### 用一个队列实现栈<a name="implementing-stack-with-one-queue"></a> 
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
## 总结<a name="summary"></a> 
|**数据结构** | **逻辑特性** | **典型场景** | **基于数组的优势** | **基于链表的优势** |
| :----:      |    :----:   |    :----:    |  :----:            |  :----:             |
| 栈          | LIFO        | 表达式求值、撤销操作 | 访问速度快 | 无需预分配 |
| 队列        | FIFO        | 任务调度、消息队列   | 内存连续   | 动态扩展灵活 |
### 互相实现的意义
- **用栈实现队列**：理解 LIFO 和 FIFO 之间的转换，利用栈的特性模拟队列行为。
- **用队列实现栈**：深入理解数据结构的底层原理，掌握复杂场景下的算法设计。
