---
title: 哈希表
lang: zh-CN
date: 2025-04-05 16:15:59
updated: 2025-04-05 18:04:19
comments: true
tags: Data Structure and Alogrithm
categories: Data Structure and Alogrithm
---
1. [什么是哈希表](#introduction) 
    - [核心概念](#core)
    - [哈希表的常见操作](#common)
2. [哈希冲突](#hc)
    - [链地址法](#sc)
    - [开放寻址法](#oa)
3. [哈希算法](#ha)
    - [哈希算法的目标](#goal)
    - [常见哈希算法](#cha)
4. [实践示例](#pa)
    - [四数相加](#fs)
<!--more-->
## 什么是哈希表？<a name="introduction"></a>
**[哈希表（Hash Table）](https://en.wikipedia.org/wiki/Hash_table)** 是一种高效的数据结构，用于存储键值对（key-value pairs）。它使用哈希函数（Hash Function）将键映射到存储位置，从而实现平均 **O(1)** 时间复杂度的**快速插入、查找和删除**。索引充当匹配值的存储位置。简单来说，它将键与值进行映射。广泛用于缓存系统、数据库索引和编译器符号表。
![pic](hs01.png)
  
 ### 核心概念<a name="core"></a>
- **键（Key）**：数据的唯一标识符。
- **值（Value）**：与键关联的数据（本示例中简化为仅存储键）。
- **桶（Bucket）**：哈希表中的存储单元（通常是数组）。
- **哈希函数（Hash Functions）：**
  哈希函数将键转换为底层数组的索引：
    - 确定性：相同的键始终产生相同的索引。
    - 高效性：计算速度快，避免性能瓶颈。
    - 均匀性：均匀分布键，最小化冲突。
- **处理哈希冲突：**
  当两个不同的键产生相同的索引时，就会发生冲突。常见的解决方案包括：
    - **链地址法（Separate Chaining）**：将冲突元素存储在同一索引位置的链表中。
    - **开放寻址法（Open Addressing）**：在数组中寻找下一个可用的空位。

除了哈希表，数组和链表也可以用来实现查询功能，但时间复杂度不同。
|             | **数组**        | **链表**         | **哈希表**       |
| :----:      |    :----:       |    :----:        |  :----:          |  
| 查找        |     O(n)        | O(n)             |  O(1)            |
| 插入        |     O(1)        | O(1)             |  O(1)            |
| 删除        |     O(n)        | O(n)             |  O(1)            |

通过上述对比可以看出，**哈希表中操作（插入、删除、查找和修改）的时间复杂度为 O(1)**，非常高效。
### 哈希表的常见操作<a name="common"></a>
哈希表的常见操作包括：初始化、查询、添加键值对和删除键值对。以下是示例代码：

```
/* Initialize hash table */
Dictionary<int, string> map = new() {
    /* Add operation */
    // Add key-value pair (key, value) to hash table
    { 13835, "Tom" },
    { 16937, "Jerry" },
    { 16852, "Steve" },
    { 13200, "James" },
    { 14583, "Lisa" }
};

/* Query operation */
// Input key into hash table, get value
string name = map[16937];

/* Delete operation */
// Delete key-value pair (key, value) from hash table
map.Remove(14583);
```
遍历哈希表有三种常见方式：遍历键值对、遍历键和遍历值。以下是示例代码：
```
/* Traverse hash table */
// Traverse key-value pairs Key->Value
foreach (var kv in map) {
    Console.WriteLine(kv.Key + " -> " + kv.Value);
}
// Traverse keys only
foreach (int key in map.Keys) {
    Console.WriteLine(key);
}
// Traverse values only
foreach (string val in map.Values) {
    Console.WriteLine(val);
}
```
## 哈希冲突<a name="hc"></a>
哈希过程会为较大的键生成一个较小的数值，因此两个不同的键可能会产生相同的值。当新插入的键映射到一个已被占用的位置时，就产生了冲突，必须使用某种冲突处理技术来解决。
![pic](hs02.png)

处理冲突主要有两种方法：
- 链地址法（Separate Chaining）
- 开放寻址法（Open Addressing）
### 链地址法 <a name="sc"></a>
链地址法将单个元素转换为链表，把键值对作为链表节点，将所有冲突的键值对存储在同一链表中。
使用链地址法实现的哈希表，其操作变化如下：
- 查找元素：输入键，通过哈希函数获取桶索引，然后访问链表头节点。遍历链表并比较键以找到目标键值对。
- 插入元素：通过哈希函数访问链表头节点，然后将节点（键值对）追加到链表末尾。
- 删除元素：根据哈希函数的结果访问链表头节点，然后遍历链表找到目标节点并删除。
![pic](hs03.png)

以下代码提供了链地址法哈希表的简单实现，有两点需要注意：
- 使用 List（动态数组）代替链表以简化实现。在此设置中，哈希表（数组）包含多个桶，每个桶都是一个 List。
- 本实现包含哈希表扩容方法。当负载因子（Load Factor）超过 **0.7** 时，我们将哈希表扩展为原始大小的两倍。
```csharp
class Hash
{
      int BUCKET;
      List<int>[] table;
      int elementCount;
      const double LOAD_FACTOR_THRESHOLD = 0.7;
      public Hash(int V)
      {
          this.BUCKET = V;
          table = new List<int>[BUCKET];
          elementCount = 0;
          for (int i = 0; i < BUCKET; i++)
              table[i] = new List<int>();
      }
      // Hash function to map values to key
      private int hashFunction(int x)
      {
          int hash = x.GetHashCode();
          return (hash % BUCKET + BUCKET) % BUCKET;
      }
      double GetLoadFactor()
      {
          return (double)elementCount / BUCKET;
      }
      void Rehash()
      {
          int oldBucket = BUCKET; // old bucket
          int newBucket = oldBucket * 2; // new bucket
          List<int>[] newTable = new List<int>[newBucket];
          for(int i = 0; i < newBucket; i++)
          {
              newTable[i] = new List<int>();
          }

          for(int i = 0;i< oldBucket; i++)
          {
              foreach(int key in table[i])
              {
                  int newIndex = key%newBucket;

                  if (!newTable[newIndex].Contains(key))
                  {
                      newTable[newIndex].Add(key);
                  }
                  
              }
          }
          table = newTable;
          BUCKET = newBucket;
          Console.WriteLine($"Rehashed to {newBucket} buckets");
      }
      public bool Contains(int key)
      {
          int index = hashFunction(key);
          return table[index].Contains(key);
      }
      public void insertItem(int key)
      {
          if (Contains(key))
          {
              Console.WriteLine($"Key {key} already exists");
              return;
          }
          int index = hashFunction(key);
          table[index].Add(key);

          elementCount++;
          if(GetLoadFactor()> LOAD_FACTOR_THRESHOLD)
          {
              Rehash();
          }
      }
      // Deletes a key from the hash table
      public void deleteItem(int key)
      {
          int index = hashFunction(key);
          table[index].Remove(key);
          elementCount--;
      }
      public void displayHash()
      {
          for (int i = 0; i < BUCKET; i++)
          {
              Console.Write(i + " --> ");
              foreach (int x in table[i])
                  Console.Write(x + " ");
              Console.WriteLine();
          }
      }
}
```
![pic](hs04.png)

值得注意的是，当链表很长时，查询效率较差。在这种情况下，可以将链表转换为 **"AVL 树"** 或 **"红黑树"**，将查询操作的时间复杂度优化为 **O(log n)**。

### 开放寻址法 <a name="oa"></a>
在开放寻址法中，所有元素都存储在哈希表本身中。每个表项要么包含一条记录，要么为 NIL。查找元素时，我们逐个检查表槽，直到找到目标元素或确定该元素不在表中。

探测策略：
- **线性探测（Linear Probing）：**
在线性探测中，从哈希的原始位置开始顺序搜索哈希表。如果获取的位置已被占用，则检查下一个位置。
- **二次探测（Quadratic Probing）**：以步长 i^2 进行搜索。
- **双重哈希（Double Hashing）**：使用第二个哈希函数来计算步长。

```csharp
class OpenAddressingHash {
    private int BUCKET;             // Number of buckets
    private int?[] table;           // Storage for keys, null indicates empty

    public OpenAddressingHash(int V) {
        this.BUCKET = V;
        table = new int?[BUCKET]; // Initialize as empty
    }

    // Hash function: Modulo operation
    private int hashFunction(int x) {
        return (x % BUCKET);
    }

    // Insert item
    public bool insertItem(int key) {
        if (isFull()) return false; // Hash table is full

        int index = hashFunction(key);

        // Linear probing
        int i = 0;
        while (table[(index + i) % BUCKET] != null) {
            i++;
        }

        table[(index + i) % BUCKET] = key;
        return true;
    }

    // Search item
    public bool searchItem(int key) {
        int index = hashFunction(key);

        int i = 0;
        while (table[(index + i) % BUCKET] != null) {
            if (table[(index + i) % BUCKET] == key)
                return true;
            i++;
        }

        return false;
    }

    // Delete item
    public bool deleteItem(int key) {
        int index = hashFunction(key);

        int i = 0;
        while (table[(index + i) % BUCKET] != null) {
            if (table[(index + i) % BUCKET] == key) {
                table[(index + i) % BUCKET] = null; // Mark as empty
                return true;
            }
            i++;
        }

        return false;
    }

    // Check if hash table is full
    private bool isFull() {
        foreach (var item in table) {
            if (item == null)
                return false;
        }
        return true;
    }

    // Display hash table
    public void displayHash() {
        for (int i = 0; i < BUCKET; i++) {
            Console.WriteLine($"{i} --> {table[i]}");
        }
    }
}
```
## 哈希算法<a name="ha"></a>
### 哈希算法的目标<a name="goal"></a>
要实现快速且稳定的哈希表数据结构，哈希算法应具备以下特征：
- **确定性**：对于相同的输入，哈希算法应始终产生相同的输出。只有这样，哈希表才是可靠的。
- **高效性**：计算哈希值的过程应足够快。计算开销越小，哈希表越实用。
- **均匀分布**：哈希算法应确保键值对在哈希表中均匀分布。分布越均匀，哈希冲突的概率越低。

你的公司可能会在以下场景中使用哈希算法：
- **密码存储**。你必须记录所有用户用于访问资源的用户名/密码组合。但如果黑客获得访问权限，窃取未受保护的数据就轻而易举。哈希确保数据以混淆状态存储，从而增加窃取难度。
- **数字签名**。少量数据即可证明一条消息从用户的发件箱发出到抵达你的收件箱期间未被篡改。
- **文档管理**。哈希算法可用于验证数据的真实性。作者在文档完成时使用哈希来保护文档。哈希的作用类似于认可印章。
接收方可以生成一个哈希值并与原始哈希值进行比较。如果两者相等，则数据被认为是真实的。如果不匹配，则说明文档已被更改。

### 常见哈希算法<a name="cha"></a>
在过去的一个世纪中，哈希算法一直在不断升级和优化。一些研究人员致力于提高哈希算法的性能，而另一些人（包括黑客）则致力于发现哈希算法的安全问题。
- **MD5** 和 **SHA-1** 已被多次成功攻击，因此在各种安全应用中已被弃用。
- **SHA-2** 系列，尤其是 SHA-256，是迄今为止最安全的哈希算法之一，目前尚无成功攻击的报告，因此常用于各种安全应用和协议中。
- **SHA-3** 相比 SHA-2 具有更低的实现成本和更高的计算效率，但其目前的使用覆盖范围不如 SHA-2 系列广泛。

|               | **MD5**         | **SHA-1**        | **SHA-2**      |**SHA-3** |
| :----:        |    :----:       |    :----:        |  :----:        |  :----:  |
| 发布年份      |     1992        | 1995             |  2002          |  2008    |
| 输出长度      |     O(1)        | O(1)             |  O(1)          |224/256/384/512 bit|
| 哈希冲突      |    频繁         | 频繁             | 罕见           |罕见      |
| 安全级别      | 低，已被成功攻击 | 低，已被成功攻击 | 高             |高        |
| 应用场景      | 已弃用，仍用于数据完整性校验 | 已弃用 | 加密货币交易验证、数字签名等 | 可用于替代 SHA-2 |

### 四数相加 <a name="fs"></a>
给定一个包含 n 个整数的数组 nums，返回所有满足以下条件的不重复四元组 [nums[a], nums[b], nums[c], nums[d]]：
- 0 <= i, j, k, l < n
- nums1[i] + nums2[j] + nums3[k] + nums4[l] == 0
```csharp
public int FourSumCount(int[] nums1, int[] nums2, int[] nums3, int[] nums4) {
       Dictionary<int, int> dic = new Dictionary<int, int>();
        foreach(var i in nums1){
            foreach(var j in nums2){
                int sum = i + j;
                if(dic.ContainsKey(sum)){
                    dic[sum]++;
                }else{
                    dic.Add(sum, 1);
                }
                
            }
        }
        int res = 0;
         foreach(var a in nums3){
            foreach(var b in nums4){
                int sum = a+b;
                if(dic.TryGetValue(-sum, out var result)){
                    res += result;
                }
            }
        }
        return res;
}
 ```
