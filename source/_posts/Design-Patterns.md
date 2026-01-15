---
title: Design Patterns
date: 2025-04-19 16:05:17
updated: 2025-04-19 19:04:19
comments: true
categories: 
  - Design Patterns
  - Software Design
  - 
tags: 
  - C#
  - .NET
  - Java
  - Creational Patterns
  - Structural Patterns
  - Behavioral Patterns
---
1. [Introduction](#introduction)  
   - [Types of Design Patterns](#types-of-dp)  
   - [Key Characteristics of Design Patterns](#key-c-of-dp)  
2. [Creational Patterns](#cp)  
   - [Factory Pattern](#factoryp)  
   - [Abstract Factory Pattern](#afactory)  
   - [Builder Pattern](#builder)  
   - [Singleton Pattern](#singleton-pattern)  
3. [Structural Patterns](#sp)  
   - [Adapter Pattern](#adapter-pattern)  
   - [Bridge Pattern](#bridge-pattern)  
   - [Composite Pattern](#composite-pattern)
   - [Decorator Pattern](#decorator-pattern)  
   - [Facade Pattern](#facade-pattern)  
   - [Flyweight Pattern](#flyweight-pattern)
   - [Proxy Pattern](#proxy-pattern)
4. [Behavioral Patterns](#behavior-pattern)  
   - [Observer Pattern](#observer-pattern)  
   - [Iterator Pattern](#iterator-pattern)  
   - [Command Pattern](#command-pattern)
   - [Strategy Pattern](#strategy-pattern)  
   - [State Pattern](#state-pattern)  
<!--more-->
## Introduction<a name="introduction"></a>
A design pattern is not a rigid structure to be transplanted directly into source code. Rather, it is a description or a template for solving a particular type of problem that can be deployed in many different situations.Design patterns can be viewed as formalized best practices that the programmer may use to solve common problems when designing a software application or system. Expert object-oriented software engineers use these best practices to write more structured, manageable, and scalable code. Design patterns provide a standard terminology and are specific to particular scenarios and problems. 

Object-oriented design patterns typically show relationships and interactions between classes or objects, without specifying the final application classes or objects that are involved.[citation needed] Patterns that imply mutable state may be unsuited for functional programming languages. Some patterns can be rendered unnecessary in languages that have built-in support for solving the problem they are trying to solve, and object-oriented patterns are not necessarily suitable for non-object-oriented languages.

### Types of Design Patterns<a name="types-of-dp"></a>
- Creational Patterns
- Structural Patterns
- Behavioral Patterns

### Key Characteristics of Design Patterns<a name="key-c-of-dp"></a>
- **Reusability**: Patterns can be applied to different projects and problems, saving time and effort in solving similar issues.
- **Standardization**: They provide a shared language and understanding among developers, helping in communication and collaboration.
- **Efficiency**: By using these popular patterns, developers can avoid finding the solution to same recurring problems, which leads to faster development.
- **Flexibility**: Patterns are abstract solutions/templates that can be adapted to fit various scenarios and requirements.
## Creational Patterns
Core Purpose: Encapsulate object creation logic to decouple object creation from usage.
### Factory Pattern<a name="factoryp"></a>
![pic](1-1.png)
Definition: Uses a factory class to encapsulate object creation, hiding implementation details.
Case: Creating different payment methods in an e-commerce platform.
```csharp
// Abstract Product: Payment interface  
public interface IPayment
{
   void Pay(decimal amnout);
}

// Concrete Product: Alipay Payment  
public class AlipayPayment: IPayment
{
   public void Pay(decimal amount)
   {
       Console.WriteLine($"Alipay Payment: {amount:C}");
   }
}

public class PaypalPayment: IPayment
{
   public void Pay(decimal amount)
   {
      Console.WriteLine($"Paypal Payment: {amount:C}");
   }
}

// Factory Class  
public class PaymentFactory
{
   public static IPayment CreatePayment(string type)
   {
      if (type == "Alipay")
      {
         return new AlipayPayment();
      }
      else if (type == "Paypal")
      {
         // Assuming a PaypalPayment class exists and implements IPayment  
         return new PaypalPayment();
      }
      else
      {
         throw new ArgumentException("Unsupported payment type");
      }
   }
}
//usage
var pay = PaymentFactory.CreatePayment("Paypal");
pay.Pay(199.99m);// Output: Paypal Payment: $199.99  
```
### Abstract Factory<a name="afactory"></a>
![pic](1-2.png)
The **Abstract Factory Pattern** is a creational design pattern that provides an interface for creating families of related or dependent objects without specifying their concrete classes. It encapsulates a group of individual factories that have a common theme, ensuring product compatibility and decoupling client code from implementation details.
Core Concepts:
1. **Abstract Factory**: Defines interfaces for creating abstract products.
2. **Concrete Factories**: Implement the abstract factory to produce specific product families.
3. **Abstract Products**: Declare interfaces for a type of product.
4. **Concrete Products**: Implement the abstract product interfaces, created by concrete factories.
5. **Client**: Uses the abstract factory and products without depending on concrete classes.

UML Diagram:
```
┌──────────────────┐       ┌─────────────────┐
│  AbstractFactory │       │     Client      │
├──────────────────┤       ├─────────────────┤
│+ CreateProductA()│◄───►  │+ UseFactory()   │
│+ CreateProductB()│       └─────────────────┘
└──────────────────┘
        ▲
        │
  ┌─────┴─────┐     ┌───────────────────┐
  │           │     │  ConcreteFactory2   │
  │ConcreteFactory1├────►┌─────────────┐  │
  ├─────────────┐ │  │+ CreateProductA()│
  │+ CreateProductA()│  │+ CreateProductB()│
  │+ CreateProductB()│  └─────────────┘  │
  └─────────────┘     └───────────────────┘

┌─────────────┐     ┌─────────────┐
│AbstractProductA│  │AbstractProductB │
├─────────────┤     ├─────────────┤
│+ OperationA()│    │+ OperationB() │
└─────────────┘     └─────────────┘
        ▲                    ▲
        │                    │
  ┌─────┴─────┐        ┌─────┴─────┐
  │           │        │           │
  │ProductA1  │        │ProductB1  │
  └───────────┘        └───────────┘
```
Case: Cross-platform UI components (Windows vs. macOS)
```csharp
// Button Interface
public interface IButton
{
    void Render();
}

// Checkbox Interface
public interface ICheckbox
{
    void Render();
}
// Button Interface
public interface IButton
{
    void Render();
}

// Checkbox Interface
public interface ICheckbox
{
    void Render();
}

// Windows Products
public class WindowsButton : IButton
{
    public void Render() => Console.WriteLine("Windows Button Rendered");
}

public class WindowsCheckbox : ICheckbox
{
    public void Render() => Console.WriteLine("Windows Checkbox Rendered");
}

// macOS Products
public class MacButton : IButton
{
    public void Render() => Console.WriteLine("Mac Button Rendered");
}

public class MacCheckbox : ICheckbox
{
    public void Render() => Console.WriteLine("Mac Checkbox Rendered");
}

// Windows Factory
public class WindowsFactory : IGUIFactory
{
    public IButton CreateButton() => new WindowsButton();
    public ICheckbox CreateCheckbox() => new WindowsCheckbox();
}

// macOS Factory
public class MacFactory : IGUIFactory
{
    public IButton CreateButton() => new MacButton();
    public ICheckbox CreateCheckbox() => new MacCheckbox();
}

public class Application
{
    private readonly IButton _button;
    private readonly ICheckbox _checkbox;

    public Application(IGUIFactory factory)
    {
        _button = factory.CreateButton();
        _checkbox = factory.CreateCheckbox();
    }

    public void RenderUI()
    {
        _button.Render();
        _checkbox.Render();
    }
}

// Usage
class Program
{
    static void Main()
    {
        IGUIFactory factory = new WindowsFactory(); // Or new MacFactory()
        var app = new Application(factory);
        app.RenderUI();
    }
}
```
Use Cases：
- **Cross-platform Applications**: As shown in the example above.
- **Game Development**: Creating different enemy types, weapons, or environments.
- **Database Access**: Switching between SQL Server, MySQL, etc.
- **UI Frameworks**: Generating themed components (light/dark mode).

### Builder Pattern<a name="factoryp"></a>
![pic](1-3.png)
The **Builder Pattern** is a creational design pattern that separates the construction of a complex object from its representation. This allows the same construction process to create different representations, making it ideal for objects with multiple optional parameters or complex assembly steps.
Core Concepts:
1. **Product**: The complex object being constructed (e.g., a car, user profile).
2. **Abstract Builder**: Defines an interface for building parts of the product.
3. **Concrete Builder**: Implements the builder interface to construct specific product variations.
4. **Director**: Controls the construction process, using the builder to assemble the product step-by-step.

UML Diagram:
```
┌───────────┐          ┌─────────────┐  
│  Product  │          │  Director   │  
│+ parts:    │          │+ Construct()│  
│  List<str>│          └─────────────┘  
│+ AddPart()│          ▲             
│+ Show()   │          │             
└───────────┘          │  uses       
                       │             
┌──────────────┐       │  uses        
│ AbstractBuilder│     │             
│+ BuildPartA() │◄─────┘             
│+ BuildPartB() │             
│+ GetResult()  │             
└──────────────┘             
   ▲          ▲             
   │          │             
┌──────────────┐  ┌──────────────┐  
│ ConcreteBuilder1│  │ ConcreteBuilder2│  
│+ BuildPartA() │  │+ BuildPartA() │  
│+ BuildPartB() │  │+ BuildPartB() │  
│+ GetResult()  │  │+ GetResult()  │  
└──────────────┘  └──────────────┘  
```
Case:Building a computer with optional components (CPU, GPU, RAM).
```csharp
//define the product
public class Computer  
{  
    private List<string> _parts = new List<string>();  

    public void AddPart(string part)  
    {  
        _parts.Add(part);  
    }  

    public void ShowSpecs()  
    {  
        Console.WriteLine("Computer Specs:");  
        foreach (var part in _parts)  
        {  
            Console.WriteLine($"- {part}");  
        }  
    }  
}  
//2. Create the Abstract Builder
public abstract class ComputerBuilder  
{  
    protected Computer _computer = new Computer();  

    public abstract void BuildCPU();  
    public abstract void BuildGPU();  
    public abstract void BuildRAM();  

    public Computer GetComputer()  
    {  
        return _computer;  
    }  
}  
//3.Implement Concrete Builders
public class GamingComputerBuilder : ComputerBuilder  
{  
    public override void BuildCPU()  
    {  
        _computer.AddPart("High-end CPU (e.g., Intel i9)");  
    }  

    public override void BuildGPU()  
    {  
        _computer.AddPart("Dedicated Gaming GPU (e.g., NVIDIA RTX 4090)");  
    }  

    public override void BuildRAM()  
    {  
        _computer.AddPart("32GB DDR5 RAM");  
    }  
}  

public class OfficeComputerBuilder : ComputerBuilder  
{  
    public override void BuildCPU()  
    {  
        _computer.AddPart("Mid-range CPU (e.g., Intel i5)");  
    }  

    public override void BuildGPU()  
    {  
        _computer.AddPart("Integrated GPU");  
    }  

    public override void BuildRAM()  
    {  
        _computer.AddPart("16GB DDR4 RAM");  
    }  
}  
//4. Define the Director
public class ComputerDirector  
{  
    public Computer Construct(ComputerBuilder builder)  
    {  
        builder.BuildCPU();  
        builder.BuildGPU();  
        builder.BuildRAM();  
        return builder.GetComputer();  
    }  
}  
//5.Client Code
public class Program  
{  
    public static void Main()  
    {  
        // Build a gaming computer  
        var gamingBuilder = new GamingComputerBuilder();  
        var director = new ComputerDirector();  
        var gamingPC = director.Construct(gamingBuilder);  
        gamingPC.ShowSpecs();  

        // Build an office computer  
        var officeBuilder = new OfficeComputerBuilder();  
        var officePC = director.Construct(officeBuilder);  
        officePC.ShowSpecs();  
    }  
}  
```
Output:
```
Computer Specs:  
- High-end CPU (e.g., Intel i9)  
- Dedicated Gaming GPU (e.g., NVIDIA RTX 4090)  
- 32GB DDR5 RAM  

Computer Specs:  
- Mid-range CPU (e.g., Intel i5)  
- Integrated GPU  
- 16GB DDR4 RAM  
```
Use Cases:
1. **Complex Objects with Many Parameters**: E.g., cars, user profiles, or API requests with optional fields.
2. **Object Assembly with Order Dependency**: When parts must be added in a specific sequence (e.g., initializing components before final assembly).
3. **Fluent Interfaces**: Commonly used to create fluent APIs for readability (e.g., StringBuilder in .NET).
### Singleton Pattern<a name="singleton-pattern"></a>
![pic](1-5.png)
**The Singleton Pattern** is a creational design pattern that ensures a class has only one instance and provides a global point of access to it. This pattern is useful for systems where exactly one instance is needed to coordinate actions across the system, such as a database connection pool, logging service, or configuration manager.
Core Concepts:
1. **Private Constructor**: Prevents direct instantiation of the class from outside.
2. **Static Instance**: Holds the single instance of the class.
3. **Public Static Accessor**: Provides global access to the instance.
UML Diagram:
```
┌───────────────┐  
│   Singleton   │  
├───────────────┤  
│- instance: static Singleton  
│+ GetInstance(): static Singleton  
│+ DoSomething(): void  
└───────────────┘  
```
Implementation Variations:
1. Basic Singleton (Not Thread-Safe)
```csharp
public class Singleton  
{  
    private static Singleton _instance;  

    private Singleton() { }  // Private constructor  

    public static Singleton GetInstance()  
    {  
        if (_instance == null)  
        {  
            _instance = new Singleton();  
        }  
        return _instance;  
    }  

    public void DoSomething()  
    {  
        Console.WriteLine("Singleton is working.");  
    }  
}  
```
**Issue**: Not thread-safe. Multiple threads can create instances simultaneously in a multi-threaded environment.
2. Thread-Safe Singleton (Double-Checked Locking)
```csharp
public class Singleton  
{  
    private static Singleton _instance;  
    private static readonly object _lock = new object();  

    private Singleton() { }  

    public static Singleton GetInstance()  
    {  
        if (_instance == null)  // First check  
        {  
            lock (_lock)        // Lock for thread safety  
            {  
                if (_instance == null)  // Second check  
                {  
                    _instance = new Singleton();  
                }  
            }  
        }  
        return _instance;  
    }  

    public void DoSomething()  
    {  
        Console.WriteLine("Singleton is working.");  
    }  
}  
```
3. Lazy Initialization with Lazy<T>
```csharp
public class Singleton  
{  
    private static readonly Lazy<Singleton> _lazy =  
        new Lazy<Singleton>(() => new Singleton());  

    private Singleton() { }  

    public static Singleton GetInstance()  
    {  
        return _lazy.Value;  
    }  

    public void DoSomething()  
    {  
        Console.WriteLine("Singleton is working.");  
    }  
}  
```
Use Cases:
- **Logging Services**: Centralized logging to avoid file conflicts.
- **Database Connection Pools**: Reuse connections to optimize performance.
- **Configuration Managers**: Load and manage application settings.
- **Graphics Managers**: Control rendering or display resources.
## Structural Patterns<a name="sp"></a>
Structural design patterns explain how to assemble objects and classes into larger structures, while keeping these structures flexible and efficient.
### Adapter Pattern<a name="factoryp"></a>
![pic](2-1.png)
**The Adapter Pattern** is a structural design pattern that allows objects with incompatible interfaces to collaborate. It acts as a bridge between two incompatible interfaces, converting the interface of one class into another interface clients expect. This pattern is useful for integrating legacy code, third-party libraries, or mismatched components without modifying their original structure.
Core Concepts:
1. **Target**: The interface that the client expects to interact with.
2. **Adaptee**: The existing class with an incompatible interface.
3. **Adapter**: Converts the adaptee's interface into the target interface via composition or inheritance.
UML Diagram：
```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐  
│   Target    │       │   Adapter    │       │   Adaptee   │  
├─────────────┤       ├──────────────┤       ├─────────────┤  
│+ Request()  │◄───┐  │+ Request()   │       │+ SpecificRequest()  
└─────────────┘    │  ├──────────────┤       └─────────────┘  
                   │  │- adaptee: Adaptee│       ▲  
                   │  └──────────────┘           │  
                   │      ▲                      │  
                   │      │ Implements           │  
                   └────────────────────────-----┘  
```
1. Object Adapter (Composition)
```csharp

// Target interface  
public interface ITarget  
{  
    string Request();  
}  

// Adaptee (existing class with incompatible interface)  
public class Adaptee  
{  
    public string SpecificRequest()  
    {  
        return "Specific request from adaptee.";  
    }  
}  

// Adapter (wraps the adaptee via composition)  
public class Adapter : ITarget  
{  
    private readonly Adaptee _adaptee;  

    public Adapter(Adaptee adaptee)  
    {  
        _adaptee = adaptee;  
    }  

    public string Request()  
    {  
        // Convert the adaptee's interface to the target interface  
        return $"Adapter: {_adaptee.SpecificRequest()}";  
    }  
}  

// Client code  
public class Client  
{  
    public void UseTarget(ITarget target)  
    {  
        Console.WriteLine(target.Request());  
    }  
}  
```
Usage:
```csharp
var adaptee = new Adaptee();  
var adapter = new Adapter(adaptee);  
var client = new Client();  
client.UseTarget(adapter); // Output: Adapter: Specific request from adaptee.  
```
2. Class Adapter (Inheritance)
```csharp

// Target interface  
public interface ITarget  
{  
    string Request();  
}  

// Adaptee (existing class with incompatible interface)  
public class Adaptee  
{  
    public string SpecificRequest()  
    {  
        return "Specific request from adaptee.";  
    }  
}  

// Adapter (inherits from both target and adaptee)  
public class Adapter : Adaptee, ITarget  
{  
    public string Request()  
    {  
        return $"Adapter: {base.SpecificRequest()}";  
    }  
}  
```
Note: Class Adapter requires multiple inheritance (not supported in C#), so this example uses composition instead.
Use Cases:
1. **Legacy System Integration**: Connect new code with outdated APIs.
2. **Third-Party Libraries**: Adapt external libraries to match your application's interface.
3. **Data Format Conversion**: Transform data between incompatible formats (e.g., XML to JSON).
4. **Cross-Platform Compatibility**: Adapt platform-specific APIs to a common interface.
Real-World Examples:
- **.NET Framework**: StreamReader adapts a Stream to a text reader.
- **Java**: java.util.Arrays.asList() adapts an array to a List.
- **Web APIs**: Converting REST API responses to internal data models.
### Bridge Pattern<a name="bridge-pattern"></a>
![pic](2-2.png)
**The Bridge Pattern** is a structural design pattern that decouples an abstraction from its implementation, allowing both to vary independently. It achieves this by separating the hierarchical abstraction (what the system does) from the implementation (how it does it), connected via a bridge interface. This pattern is particularly useful for avoiding a "class explosion" when dealing with multiple dimensions of variability.
Core Concepts:
1. **Abstraction**: Defines the high-level interface and depends on the implementation interface.
2. **Refined Abstraction**: Extends the abstraction without affecting the implementation.
3. **Implementor**: Defines the interface for the implementation classes.
4. **Concrete Implementor**: Provides the concrete implementation.
UML Diagram:
```
┌────────────────┐                  ┌────────────────┐  
│   Abstraction  │                  │   Implementor  │  
├────────────────┤                  ├────────────────┤  
│- implementor   │                  │+ OperationImpl()│  
│+ Operation()   │                  └────────────────┘  
└────────────────┘                         ▲  
       ▲                                   │  
       │                                   │  
┌────────────────┐            ┌─────────────────────┐  
│RefinedAbstraction│          │  ConcreteImplementorA │  
├────────────────┤            ├─────────────────────┤  
│+ ExtendedOperation()│       │+ OperationImpl()    │  
└────────────────┘            └─────────────────────┘  
                              │  
                              │  
┌─────────────────────┐  
│  ConcreteImplementorB │  
├─────────────────────┤  
│+ OperationImpl()    │  
└─────────────────────┘  
```
Implementation Example
Scenario: Rendering shapes (circle, square) in different formats (vector, raster).

```csharp
//Define the Implementor Interface
// Implementor: Renderer  
public interface IRenderer  
{  
    void RenderCircle(float radius);  
    void RenderSquare(float side);  
}  
//2. Implement Concrete Implementors
// Vector Renderer  
public class VectorRenderer : IRenderer  
{  
    public void RenderCircle(float radius)  
    {  
        Console.WriteLine($"Drawing a circle of radius {radius} in vector format.");  
    }  

    public void RenderSquare(float side)  
    {  
        Console.WriteLine($"Drawing a square with side {side} in vector format.");  
    }  
}  

// Raster Renderer  
public class RasterRenderer : IRenderer  
{  
    public void RenderCircle(float radius)  
    {  
        Console.WriteLine($"Drawing pixels for a circle of radius {radius} in raster format.");  
    }  

    public void RenderSquare(float side)  
    {  
        Console.WriteLine($"Drawing pixels for a square with side {side} in raster format.");  
    }  
}  
//3. Define the Abstraction
// Abstraction: Shape  
public abstract class Shape  
{  
    protected IRenderer renderer;  

    public Shape(IRenderer renderer)  
    {  
        this.renderer = renderer;  
    }  

    public abstract void Draw();  
    public abstract void Resize(float factor);  
}  
//4.Implement Refined Abstractions
// Refined Abstraction: Circle  
public class Circle : Shape  
{  
    private float radius;  

    public Circle(IRenderer renderer, float radius) : base(renderer)  
    {  
        this.radius = radius;  
    }  

    public override void Draw()  
    {  
        renderer.RenderCircle(radius);  
    }  

    public override void Resize(float factor)  
    {  
        radius *= factor;  
    }  
}  

// Refined Abstraction: Square  
public class Square : Shape  
{  
    private float side;  

    public Square(IRenderer renderer, float side) : base(renderer)  
    {  
        this.side = side;  
    }  

    public override void Draw()  
    {  
        renderer.RenderSquare(side);  
    }  

    public override void Resize(float factor)  
    {  
        side *= factor;  
    }  
}  

//5. Client Code
public class Client  
{  
    public void Main()  
    {  
        // Create renderers  
        IRenderer vectorRenderer = new VectorRenderer();  
        IRenderer rasterRenderer = new RasterRenderer();  

        // Create shapes with different renderers  
        Shape circle = new Circle(vectorRenderer, 5);  
        Shape square = new Square(rasterRenderer, 10);  

        // Draw shapes  
        circle.Draw();    // Output: Drawing a circle of radius 5 in vector format.  
        square.Draw();    // Output: Drawing pixels for a square with side 10 in raster format.  

        // Resize and redraw  
        circle.Resize(2);  
        circle.Draw();    // Output: Drawing a circle of radius 10 in vector format.  
    }  
}  
```
Use Cases:
- **Cross-Platform Applications**: Separate platform-specific implementations from business logic.
- **GUI Frameworks**: Render UI components in different styles (e.g., Windows vs. macOS).
- **Database Drivers**: Connect to different databases (SQL Server, MySQL) using a common interface.
- **Game Development**: Render graphics using different APIs (DirectX, OpenGL).
### Composite Pattern<a name="composite-pattern"></a>
![pic](2-3.png)
**The Composite Pattern** is a structural design pattern that lets you compose objects into tree structures to represent part-whole hierarchies. It allows clients to treat individual objects (leaf nodes) and compositions of objects (composite nodes) uniformly, simplifying code by treating all nodes through a common interface.
Core Concepts:
1. **Component**: Defines the common interface for both leaf and composite nodes.
2. **Leaf**: Represents individual objects (no children).
3. **Composite**: Manages child components, implementing the component interface for child-related operations(add, remove and get).
4. **Client**: Interacts with components through the common interface, unaware of whether they are leaves or composites.
UML Diagram:
```
┌──────────────┐  
│   Component  │  
├──────────────┤  
│+ Operation() │  
└──────────────┘  
       ▲  
       │-----------------------|  
┌──────────────┐          ┌──────────────┐  
│    Leaf      │          │   Composite  │  
├──────────────┤          ├──────────────┤  
│+ Operation() │          │+ Add()       │  
│              │          │+ Remove()    │  
│              │          │+ GetChild()  │  
└──────────────┘          └──────────────┘  
```
Use case: A file system with directories (composites) and files (leaves).
```csharp
//1. Define the Component Interface
public abstract class FileSystemComponent  
{  
    public abstract void Display(int depth);  
    public virtual void Add(FileSystemComponent component)  
    {  
        throw new NotSupportedException("Leaf nodes cannot have children.");  
    }  
    public virtual void Remove(FileSystemComponent component)  
    {  
        throw new NotSupportedException("Leaf nodes cannot have children.");  
    }  
}  
//2. Implement Leaf Nodes (Files)
public class File : FileSystemComponent  
{  
    private string _name;  

    public File(string name)  
    {  
        _name = name;  
    }  

    public override void Display(int depth)  
    {  
        Console.WriteLine(new string('-', depth) + _name);  
    }  
}  
//3. Implement Composite Nodes (Directories)
public class Directory : FileSystemComponent  
{  
    private string _name;  
    private List<FileSystemComponent> _children = new List<FileSystemComponent>();  

    public Directory(string name)  
    {  
        _name = name;  
    }  

    public override void Display(int depth)  
    {  
        Console.WriteLine(new string('-', depth) + _name);  
        foreach (var child in _children)  
        {  
            child.Display(depth + 2); // Indent children  
        }  
    }  

    public override void Add(FileSystemComponent component)  
    {  
        _children.Add(component);  
    }  

    public override void Remove(FileSystemComponent component)  
    {  
        _children.Remove(component);  
    }  
}  
//4. Client Code
public class Client  
{  
    public void BuildFileSystem()  
    {  
        // Root directory (composite)  
        Directory root = new Directory("Root");  

        // Subdirectories and files (composites and leaves)  
        Directory docs = new Directory("Documents");  
        docs.Add(new File("Report.txt"));  
        docs.Add(new File("Budget.xlsx"));  

        Directory pics = new Directory("Pictures");  
        pics.Add(new File("Vacation.jpg"));  

        root.Add(docs);  
        root.Add(pics);  
        root.Add(new File("ReadMe.md"));  

        // Display the file system tree  
        root.Display(0);  
    }  
}  
```
Output:
```
Root  
--Documents  
----Report.txt  
----Budget.xlsx  
--Pictures  
----Vacation.jpg  
--ReadMe.md  
```
Use Cases:
- **File Systems**: Directories (composites) and files (leaves).
- **GUI Toolkits**: Containers (e.g., panels) and widgets (e.g., buttons).
- **Organization Charts**: Departments (composites) and employees (leaves).
- **Tree-Based Data Structures**: XML/JSON parsing, syntax trees.
### Decorator Pattern<a name="decorator-pattern"></a>
![pic](2-7.jpg)
The **Decorator Pattern** is a structural design pattern that lets you attach new behaviors to objects dynamically by placing these objects inside special wrapper classes. It provides a flexible alternative to subclassing for extending functionality, allowing behavior to be added or removed at runtime.
Core Concepts:
1. **Component**: Defines the common interface for objects that can have decorations.
2. **Concrete Component**: Implements the base functionality of the component.
3. **Decorator**: Maintains a reference to a component and implements the component interface.
4. **Concrete Decorators**: Add specific behaviors to the component by overriding methods.

Use case: Coffee shop where drinks (components) can be decorated with additives (decorators).
```csharp
//1. Define the Component Interface
public interface ICoffee  
{  
    string GetDescription();  
    double GetCost();  
}  

//2. Implement Concrete Components
public class Espresso : ICoffee  
{  
    public string GetDescription() => "Espresso";  
    public double GetCost() => 1.99;  
}  

public class DarkRoast : ICoffee  
{  
    public string GetDescription() => "Dark Roast Coffee";  
    public double GetCost() => 1.89;  
}  

//3. Define the Decorator Base Class
public abstract class CondimentDecorator : ICoffee  
{  
    protected ICoffee _coffee;  

    public CondimentDecorator(ICoffee coffee)  
    {  
        _coffee = coffee;  
    }  

    public abstract string GetDescription();  
    public abstract double GetCost();  
}  
//4. Implement Concrete Decorators
public class Mocha : CondimentDecorator  
{  
    public Mocha(ICoffee coffee) : base(coffee) { }  

    public override string GetDescription()  
    {  
        return _coffee.GetDescription() + ", Mocha";  
    }  

    public override double GetCost()  
    {  
        return _coffee.GetCost() + 0.20;  
    }  
}  

public class Whip : CondimentDecorator  
{  
    public Whip(ICoffee coffee) : base(coffee) { }  

    public override string GetDescription()  
    {  
        return _coffee.GetDescription() + ", Whip";  
    }  

    public override double GetCost()  
    {  
        return _coffee.GetCost() + 0.10;  
    }  
}  
//5. Client Code
public class Client  
{  
    public void OrderCoffee()  
    {  
        // Base coffee  
        ICoffee coffee = new Espresso();  
        Console.WriteLine($"{coffee.GetDescription()} = ${coffee.GetCost()}");  

        // Decorated coffee  
        ICoffee decoratedCoffee = new Whip(new Mocha(new Mocha(coffee)));  
        Console.WriteLine($"{decoratedCoffee.GetDescription()} = ${decoratedCoffee.GetCost()}");  
    }  
}  
```
Output:
```
Espresso = $1.99  
Espresso, Mocha, Mocha, Whip = $2.39  
```
Use Cases:
**GUI Components**: Adding borders, scroll bars, or tooltips to widgets.
**I/O Streams**: Wrapping streams with buffering, encryption, or compression.
**Logging**: Adding timestamps, metadata, or formatting to log messages.
**Security**: Applying authentication or authorization layers to requests.
### Facade Pattern<a name="facade-pattern"></a>
![pic](2-4.png)
The **Facade Pattern** is a structural design pattern that provides a simplified interface to a complex system of classes, libraries, or APIs. It hides the underlying complexity and exposes only high-level functionality, making the system easier to use and maintain. This pattern is commonly used to decouple clients from intricate subsystems.
Core Concepts:
1. **Facade**: Provides a simplified interface to the subsystem.
2. **Subsystem Classes**: Implement complex functionality but are unaware of the facade.
3. **Client**: Interacts with the facade instead of directly accessing subsystem classes.
UML Diagram
```
┌──────────────┐       ┌──────────────────┐  
│    Client    │──────►│     Facade       │  
└──────────────┘       ├──────────────────┤  
                       │+ SimpleOperation()│  
                       └──────────────────┘  
                               ▲  
                               │ uses  
                               │  
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  
│ SubsystemA   │  │ SubsystemB   │  │ SubsystemC   │  
├──────────────┤  ├──────────────┤  ├──────────────┤  
│+ OperationA()│  │+ OperationB()│  │+ OperationC()│  
└──────────────┘  └──────────────┘  └──────────────┘  
```
Uase case: A home theater system with multiple components (amplifier, DVD player, projector).
```csharp
1. Define Subsystem Classes
// Subsystem: Amplifier  
public class Amplifier  
{  
    public void On() => Console.WriteLine("Amplifier on");  
    public void Off() => Console.WriteLine("Amplifier off");  
    public void SetVolume(int level) => Console.WriteLine($"Amplifier volume set to {level}");  
}  

// Subsystem: DVD Player  
public class DvdPlayer  
{  
    public void On() => Console.WriteLine("DVD Player on");  
    public void Off() => Console.WriteLine("DVD Player off");  
    public void Play(string movie) => Console.WriteLine($"DVD Player playing '{movie}'");  
}  

// Subsystem: Projector  
public class Projector  
{  
    public void On() => Console.WriteLine("Projector on");  
    public void Off() => Console.WriteLine("Projector off");  
    public void SetInput(DvdPlayer dvd) => Console.WriteLine("Projector input set to DVD");  
}  
2. Create the Facade
//public class HomeTheaterFacade  
{  
    private readonly Amplifier _amp;  
    private readonly DvdPlayer _dvd;  
    private readonly Projector _projector;  

    public HomeTheaterFacade(Amplifier amp, DvdPlayer dvd, Projector projector)  
    {  
        _amp = amp;  
        _dvd = dvd;  
        _projector = projector;  
    }  

    public void WatchMovie(string movie)  
    {  
        Console.WriteLine("Get ready to watch a movie...");  
        _amp.On();  
        _projector.On();  
        _projector.SetInput(_dvd);  
        _dvd.On();  
        _dvd.Play(movie);  
        _amp.SetVolume(10);  
    }  

    public void EndMovie()  
    {  
        Console.WriteLine("Shutting movie theater down...");  
        _dvd.Off();  
        _projector.Off();  
        _amp.Off();  
    }  
}  
//3. Client Code
public class Client  
{  
    public void UseHomeTheater()  
    {  
        // Initialize subsystems  
        var amp = new Amplifier();  
        var dvd = new DvdPlayer();  
        var projector = new Projector();  

        // Create facade  
        var homeTheater = new HomeTheaterFacade(amp, dvd, projector);  

        // Simplified interface  
        homeTheater.WatchMovie("Avatar");  
        Console.WriteLine("\n");  
        homeTheater.EndMovie();  
    }  
}  
```
Output:
```
Get ready to watch a movie...  
Amplifier on  
Projector on  
Projector input set to DVD  
DVD Player on  
DVD Player playing 'Avatar'  
Amplifier volume set to 10  

Shutting movie theater down...  
DVD Player off  
Projector off  
Amplifier off  
```
Use Cases:
- **Complex APIs**: Simplify third-party libraries (e.g., cloud storage APIs).
- **Legacy Systems**: Provide a modern interface to outdated code.
- **Cross-Layer Communication**: Bridge different layers in an application (e.g., UI and business logic).
- **Testing**: Create facades to mock complex subsystems during unit testing.
### Flyweight Pattern<a name="flyweight-pattern"></a>
![pic](2-5.png)
The **Flyweight Pattern** is a structural design pattern that minimizes memory usage by sharing as much data as possible between similar objects. It achieves this by separating intrinsic (shared) state from extrinsic (context-specific) state, allowing objects to be reused across different contexts. This pattern is particularly useful for optimizing memory when dealing with large numbers of similar objects.
Core Concepts:
1. **Flyweight**: Defines the interface for shared objects, managing intrinsic state.
2. **Concrete Flyweight**: Implements the flyweight interface and stores intrinsic state.
3. **Flyweight Factory**: Manages a pool of flyweight objects, ensuring they are shared and reused.
4. **Client**: Holds extrinsic state and uses the flyweight factory to obtain flyweight instances.

Complete code of the flyweight design pattern:
```java
import java.util.HashMap;
import java.util.Map;
// Flyweight interface
interface Icon {
    void draw(int x, int y);  // Method to draw the icon at given coordinates
}

// Concrete Flyweight class representing a File Icon
class FileIcon implements Icon {
    private String type;  // Intrinsic state: type of file icon
    private String imageName;  // Intrinsic state: image name specific to the file icon

    public FileIcon(String type, String imageName) {
        this.type = type;
        this.imageName = imageName;
    }

    @Override
    public void draw(int x, int y) {
        // Simulated logic to load and draw image
        System.out.println("Drawing " + type + " icon with image " + imageName + " at position (" + x + ", " + y + ")");
    }
}

// Concrete Flyweight class representing a Folder Icon
class FolderIcon implements Icon {
    private String color;  // Intrinsic state: color of the folder icon
    private String imageName;  // Intrinsic state: image name specific to the folder icon

    public FolderIcon(String color, String imageName) {
        this.color = color;
        this.imageName = imageName;
    }

    @Override
    public void draw(int x, int y) {
        // Simulated logic to load and draw image
        System.out.println("Drawing folder icon with color " + color + " and image " + imageName + " at position (" + x + ", " + y + ")");
    }
}

// Flyweight factory to manage creation and retrieval of flyweight objects
class IconFactory {
    private Map<String, Icon> iconCache = new HashMap<>();

    public Icon getIcon(String key) {
        // Check if the icon already exists in the cache
        if (iconCache.containsKey(key)) {
            return iconCache.get(key);
        } else {
            // Create a new icon based on the key (type of icon)
            Icon icon;
            if (key.equals("file")) {
                icon = new FileIcon("document", "document.png");
            } else if (key.equals("folder")) {
                icon = new FolderIcon("blue", "folder.png");
            } else {
                throw new IllegalArgumentException("Unsupported icon type: " + key);
            }
            // Store the created icon in the cache
            iconCache.put(key, icon);
            return icon;
        }
    }
}

// Client code to use the flyweight objects (icons)
public class Client {
    public static void main(String[] args) {
        IconFactory iconFactory = new IconFactory();

        // Draw file icons at different positions
        Icon fileIcon1 = iconFactory.getIcon("file");
        fileIcon1.draw(100, 100);

        Icon fileIcon2 = iconFactory.getIcon("file");
        fileIcon2.draw(150, 150);

        // Draw folder icons at different positions
        Icon folderIcon1 = iconFactory.getIcon("folder");
        folderIcon1.draw(200, 200);

        Icon folderIcon2 = iconFactory.getIcon("folder");
        folderIcon2.draw(250, 250);
    }
}
```
Use Cases:
- **Graphics Systems**: Reuse shared textures, sprites, or glyphs.
- **Game Development**: Share common assets (e.g., terrain tiles, enemy models).
- **Document Editors**: Reuse characters, fonts, or formatting styles.
- **Database Connections**: Pool and reuse connection objects.
### Proxy Pattern<a name="proxy-pattern"></a>
![pic](2-6.png)
The **Proxy Pattern** is a structural design pattern that provides a surrogate or placeholder for another object to control access to it. Proxies act as intermediaries between clients and real objects, allowing additional functionality (e.g., lazy loading, access control, logging) without changing the real object's interface.
Core Concepts
1. **Subject**: Defines the common interface for the RealSubject and Proxy.
2. **RealSubject**: Implements the subject interface, containing the actual business logic.
3. **Proxy**: Maintains a reference to the RealSubject and controls access to it.
4. **Client**: Interacts with the Proxy as if it were the RealSubject.
UML Diagram:
```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐  
│    Subject   │       │     Proxy    │       │ RealSubject  │  
├──────────────┤       ├──────────────┤       ├──────────────┤  
│+ Request()   │       │- realSubject │       │+ Request()   │  
└──────────────┘       │+ Request()   │       └──────────────┘  
          ▲            └──────────────┘                ▲  
          │                     ▲                      │  
          │                     │                      │  
          └─────────────────────┼───────────────────── ┘  
                                │  
┌───────────────────────────────────────────────────────┐  
│                      Client                           │  
└───────────────────────────────────────────────────────┘  
```
Use case:A high-resolution image loader with lazy initialization.
```csharp
//1. Define the Subject Interface
public interface IImage  
{  
    void Display();  
}  
//2. Implement the RealSubject
public class RealImage : IImage  
{  
    private readonly string _fileName;  

    public RealImage(string fileName)  
    {  
        _fileName = fileName;  
        LoadFromDisk(_fileName);  
    }  

    public void Display()  
    {  
        Console.WriteLine($"Displaying {_fileName}");  
    }  

    private void LoadFromDisk(string fileName)  
    {  
        Console.WriteLine($"Loading {fileName}");  
    }  
}  
//3. Implement the Proxy
public class ProxyImage : IImage  
{  
    private RealImage _realImage;  
    private readonly string _fileName;  

    public ProxyImage(string fileName)  
    {  
        _fileName = fileName;  
    }  

    public void Display()  
    {  
        if (_realImage == null)  
        {  
            _realImage = new RealImage(_fileName);  
        }  
        _realImage.Display();  
    }  
}  
//4. Client Code
public class Client  
{  
    public void UseImage()  
    {  
        IImage image = new ProxyImage("high_res.jpg");  

        // Image is not loaded until Display() is called  
        Console.WriteLine("Calling Display() for the first time:");  
        image.Display();  

        Console.WriteLine("\nCalling Display() again:");  
        image.Display();  
    }  
}  
```
Output:
```
Calling Display() for the first time:  
Loading high_res.jpg  
Displaying high_res.jpg  

Calling Display() again:  
Displaying high_res.jpg  
```
Use Cases:
- **Remote Proxies**: Hide network communication details (e.g., .NET Remoting).
- **Virtual Proxies**: Delay expensive operations (e.g., lazy loading images).
- **Protection Proxies**: Control access based on permissions (e.g., user roles).
- **Smart References**: Add additional behavior when accessing an object (e.g., reference counting).
## Behavioral Patterns<a name="behavior-pattern"></a>
### Observer Pattern<a name="observer-pattern"></a>
The **Observer Pattern** is a behavioral design pattern that establishes a one-to-many dependency between objects. When one object (the subject) changes state, all its dependents (the observers) are notified and updated automatically. This pattern is ideal for implementing event-driven systems, where multiple components need to react to state changes.
Core Concepts:
1. **Subject**: Manages a list of observers and notifies them of state changes.
2. **Observer**: Defines an interface for receiving updates from the subject.
3. **Concrete Subject**: Implements the subject interface and stores state that interests observers.
4. **Concrete Observe**r: Implements the observer interface and maintains a reference to the concrete subject.

```java
import java.util.ArrayList;
import java.util.List;

// Observer Interface
interface Observer {
    void update(String weather);
}

// Subject Interface
interface Subject {
    void addObserver(Observer observer);
    void removeObserver(Observer observer);
    void notifyObservers();
}

// ConcreteSubject Class
class WeatherStation implements Subject {
    private List<Observer> observers = new ArrayList<>();
    private String weather;

    @Override
    public void addObserver(Observer observer) {
        observers.add(observer);
    }

    @Override
    public void removeObserver(Observer observer) {
        observers.remove(observer);
    }

    @Override
    public void notifyObservers() {
        for (Observer observer : observers) {
            observer.update(weather);
        }
    }

    public void setWeather(String newWeather) {
        this.weather = newWeather;
        notifyObservers();
    }
}

// ConcreteObserver Class
class PhoneDisplay implements Observer {
    private String weather;

    @Override
    public void update(String weather) {
        this.weather = weather;
        display();
    }

    private void display() {
        System.out.println("Phone Display: Weather updated - " + weather);
    }
}

// ConcreteObserver Class
class TVDisplay implements Observer {
    private String weather;

    @Override
    public void update(String weather) {
        this.weather = weather;
        display();
    }

    private void display() {
        System.out.println("TV Display: Weather updated - " + weather);
    }
}

// Usage Class
public class WeatherApp {
    public static void main(String[] args) {
        WeatherStation weatherStation = new WeatherStation();

        Observer phoneDisplay = new PhoneDisplay();
        Observer tvDisplay = new TVDisplay();

        weatherStation.addObserver(phoneDisplay);
        weatherStation.addObserver(tvDisplay);

        // Simulating weather change
        weatherStation.setWeather("Sunny");

        // Output:
        // Phone Display: Weather updated - Sunny
        // TV Display: Weather updated - Sunny
    }
}
```
Output:
```
Phone Display: Weather updated - Sunny
TV Display: Weather updated - Sunny
```
Real-World Examples:
- **Java Event Listeners**: ActionListener in Swing components.
- **.NET Events**: System.EventHandler and event subscribers.
- **RxJava/Rx.NET**: Reactive Extensions use the observer pattern for asynchronous streams.
### Iterator Pattern<a name="iterator-pattern"></a>
![pic](3-1.png)
The **Iterator Pattern** is a behavioral design pattern that provides a way to access the elements of an aggregate object (e.g., a collection) sequentially without exposing its underlying representation. It decouples the traversal logic from the collection, allowing different traversal algorithms or multiple traversals simultaneously.
Core Concepts:
1. **Iterator**: Defines an interface for accessing and traversing elements.
2. **Concrete Iterator**: Implements the iterator interface, tracking the current position in the collection.
3. **Aggregate**: Defines an interface for creating an iterator.
4. **Concrete Aggregate**: Implements the aggregate interface to return a concrete iterator.
Use case: A custom collection (name repository) with a forward iterator.
```csharp
//1. Define the Iterator Interface
public interface IIterator<T>  
{  
    bool HasNext();  
    T Next();  
}  
//2. Define the Aggregate Interface
public interface IAggregate<T>  
{  
    IIterator<T> CreateIterator();  
}  
//3. Implement the Concrete Iterator
public class NameIterator : IIterator<string>  
{  
    private readonly string[] _names;  
    private int _position = 0;  

    public NameIterator(string[] names)  
    {  
        _names = names;  
    }  

    public bool HasNext()  
    {  
        return _position < _names.Length && _names[_position] != null;  
    }  

    public string Next()  
    {  
        if (HasNext())  
        {  
            return _names[_position++];  
        }  
        return null;  
    }  
}  
//4. Implement the Concrete Aggregate
public class NameRepository : IAggregate<string>  
{  
    private readonly string[] _names = { "Alice", "Bob", "Charlie", "David" };  

    public IIterator<string> CreateIterator()  
    {  
        return new NameIterator(_names);  
    }  
}  
//5. Client Code
public class Client  
{  
    public void UseIterator()  
    {  
        IAggregate<string> repository = new NameRepository();  
        IIterator<string> iterator = repository.CreateIterator();  

        Console.WriteLine("Names:");  
        while (iterator.HasNext())  
        {  
            Console.WriteLine(iterator.Next());  
        }  
    }  
}  
```
Output:
```
Names:  
Alice  
Bob  
Charlie  
David  
```
Use Cases:
- **Custom Collections**: Traverse non-standard data structures (e.g., trees, graphs).
- **Database Results**: Iterate over query results without exposing underlying data.
- **File System Navigation**: Traverse directories and files.
- **Parallel Processing**: Split traversal tasks across multiple threads.

### Command Pattern<a name="command-pattern"></a>
![pic](3-2.png)
The **Command Pattern** is a behavioral design pattern that turns a request into a stand-alone object, containing all information about the request. This decouples the sender (invoker) from the receiver (executor), allowing requests to be parameterized, queued, logged, or undone.
Core Concepts:
1. **Command**: Defines an interface for executing an operation.
2. **Concrete Command**: Implements the command interface, binding a receiver to an action.
3. **Invoker**: Asks the command to carry out the request.
4. **Receiver**: Knows how to perform the operation associated with the command.
5. **Client**: Creates a concrete command and sets its receiver.
Uase case: A remote control (invoker) that can turn on/off a light (receiver) using commands.
```csharp
//1. Define the Command Interface
public interface ICommand  
{  
    void Execute();  
    void Undo();  // Optional for undo functionality  
}  
//2. Implement Concrete Commands
// Light On Command  
public class LightOnCommand : ICommand  
{  
    private readonly Light _light;  

    public LightOnCommand(Light light)  
    {  
        _light = light;  
    }  

    public void Execute() => _light.TurnOn();  
    public void Undo() => _light.TurnOff();  
}  

// Light Off Command  
public class LightOffCommand : ICommand  
{  
    private readonly Light _light;  

    public LightOffCommand(Light light)  
    {  
        _light = light;  
    }  

    public void Execute() => _light.TurnOff();  
    public void Undo() => _light.TurnOn();  
}  
//3. Define the Receiver
public class Light  
{  
    public void TurnOn() => Console.WriteLine("Light is on");  
    public void TurnOff() => Console.WriteLine("Light is off");  
}  
//4. Implement the Invoker
public class RemoteControl  
{  
    private ICommand _command;  

    public void SetCommand(ICommand command)  
    {  
        _command = command;  
    }  

    public void PressButton()  
    {  
        _command.Execute();  
    }  

    public void PressUndoButton()  
    {  
        _command.Undo();  
    }  
}  
//5. Client Code
public class Client  
{  
    public void UseRemoteControl()  
    {  
        // Create receiver  
        Light light = new Light();  

        // Create commands  
        ICommand lightOn = new LightOnCommand(light);  
        ICommand lightOff = new LightOffCommand(light);  

        // Create invoker  
        RemoteControl remote = new RemoteControl();  

        // Use invoker to execute commands  
        remote.SetCommand(lightOn);  
        remote.PressButton();  // Output: Light is on  

        remote.SetCommand(lightOff);  
        remote.PressButton();  // Output: Light is off  

        // Undo last command  
        remote.PressUndoButton();  // Output: Light is on  
    }  
} 
```
Use Cases:
- **GUI Buttons**: Map button clicks to specific actions (e.g., "Save" command).
- **Undo/Redo Systems**: Track and reverse user actions in applications.
- **Transaction Management**: Group commands into atomic operations.
- **Networking**: Send commands over a network (e.g., remote procedure calls).

Real-World Examples:
- **Java Thread Pool**: Runnable and Callable interfaces act as commands.
- **.NET Delegate**: Encapsulates a method call as an object.
- **GUI Frameworks**: Action classes (e.g., javax.swing.Action in Java).

### Strategy Pattern<a name="strategy-pattern"></a>
![pic](3-3.png)
The **Strategy Pattern** is a behavioral design pattern that defines a family of algorithms, encapsulates each one, and makes them interchangeable. It lets the algorithm vary independently from the clients that use it, promoting flexibility and maintainability.
Core Concepts:
1. **Strategy**: Defines the common interface for all concrete algorithms.
2. **Concrete Strategies**: Implement the strategy interface with specific algorithms.
3. **Context**: Maintains a reference to a strategy and uses it to perform a task.
4. **Client**: Configures the context with a specific strategy.

Use case: A payment processor supporting multiple payment methods (credit card, PayPal).
```csharp
//1. Define the Strategy Interface
public interface IPaymentStrategy  
{  
    void Pay(double amount);  
}  
//2. Implement Concrete Strategies
// Credit Card Payment  
public class CreditCardStrategy : IPaymentStrategy  
{  
    private readonly string _cardNumber;  
    private readonly string _expiryDate;  
    private readonly string _cvv;  

    public CreditCardStrategy(string cardNumber, string expiryDate, string cvv)  
    {  
        _cardNumber = cardNumber;  
        _expiryDate = expiryDate;  
        _cvv = cvv;  
    }  

    public void Pay(double amount)  
    {  
        Console.WriteLine($"Paid ${amount} via Credit Card ({_cardNumber.Substring(_cardNumber.Length - 4)})");  
    }  
}  

// PayPal Payment  
public class PayPalStrategy : IPaymentStrategy  
{  
    private readonly string _email;  

    public PayPalStrategy(string email)  
    {  
        _email = email;  
    }  

    public void Pay(double amount)  
    {  
        Console.WriteLine($"Paid ${amount} via PayPal ({_email})");  
    }  
}  
//3. Implement the Context
public class ShoppingCart  
{  
    private IPaymentStrategy _paymentStrategy;  

    public void SetPaymentStrategy(IPaymentStrategy strategy)  
    {  
        _paymentStrategy = strategy;  
    }  

    public void Checkout(double amount)  
    {  
        _paymentStrategy.Pay(amount);  
    }  
}  
//4. Client Code
public class Client  
{  
    public void ProcessPayment()  
    {  
        var cart = new ShoppingCart();  

        // Pay with credit card  
        cart.SetPaymentStrategy(new CreditCardStrategy("1234-5678-9012-3456", "12/25", "123"));  
        cart.Checkout(100.50);  

        // Switch to PayPal  
        cart.SetPaymentStrategy(new PayPalStrategy("user@example.com"));  
        cart.Checkout(50.25);  
    }  
}  
```
Output:
```
plaintext
Paid $100.5 via Credit Card (3456)  
Paid $50.25 via PayPal (user@example.com)  
```
Use Cases:
- **Sorting Algorithms**: Choose between quicksort, mergesort, or bubblesort dynamically.
- **Encryption/Compression**: Switch between different algorithms (e.g., AES vs. RSA).
- **Payment Processing**: Support multiple payment methods (credit card, PayPal, Apple Pay).
- **Game AI**: Implement different behaviors for characters (aggressive, defensive, passive).

### State Pattern<a name="state-pattern"></a>
![pic](3-7.png)
The **State Pattern** is a behavioral design pattern that allows an object to alter its behavior when its internal state changes. The object will appear to change its class, as the pattern encapsulates state-specific behaviors into separate state classes and delegates to the current state. This simplifies complex state-dependent logic and adheres to the Open/Closed Principle.
Core Concepts:
1. **Context**: Maintains an instance of a concrete state, which represents its current state.
2. **State Interface**: Defines a common interface for all concrete states.
3. **Concrete States**: Implement the state interface, providing behavior specific to a state.
4. **State Transitions**: Managed by the state classes themselves or the context, depending on the implementation.

Use case:User interactions with the vending machine trigger state transitions. For example, when a user inserts money, the vending machine transitions from the "ReadyState" to the "PaymentPendingState."
```java
interface VendingMachineState {
    void handleRequest();
}

class ReadyState implements VendingMachineState {
    @Override
    public void handleRequest() {
        System.out.println("Ready state: Please select a product.");
    }
}

class ProductSelectedState implements VendingMachineState {
    @Override
    public void handleRequest() {
        System.out.println("Product selected state: Processing payment.");
    }
}

class PaymentPendingState implements VendingMachineState {
    @Override
    public void handleRequest() {
        System.out.println("Payment pending state: Dispensing product.");
    }
}

class OutOfStockState implements VendingMachineState {
    @Override
    public void handleRequest() {
        System.out.println("Out of stock state: Product unavailable. Please select another product.");
    }
}

class VendingMachineContext {
    private VendingMachineState state;

    public void setState(VendingMachineState state) {
        this.state = state;
    }

    public void request() {
        state.handleRequest();
    }
}

public class Main {
    public static void main(String[] args) {
        // Create context
        VendingMachineContext vendingMachine = new VendingMachineContext();

        // Set initial state
        vendingMachine.setState(new ReadyState());

        // Request state change
        vendingMachine.request();

        // Change state
        vendingMachine.setState(new ProductSelectedState());

        // Request state change
        vendingMachine.request();

        // Change state
        vendingMachine.setState(new PaymentPendingState());

        // Request state change
        vendingMachine.request();

        // Change state
        vendingMachine.setState(new OutOfStockState());

        // Request state change
        vendingMachine.request();
    }
}
```
Output:
```
Ready state: Please select a product.
Product selected state: Processing payment.
Payment pending state: Dispensing product.
Out of stock state: Product unavailable. Please select another product.
```

When to use the State Design Pattern：
The State design pattern is beneficial when you encounter situations with objects whose behavior changes dynamically based on their internal state. Here are some key indicators:

- **Multiple states with distinct behaviors**: If your object exists in several states (e.g., On/Off, Open/Closed, Started/Stopped), and each state dictates unique behaviors, the State pattern can encapsulate this logic effectively.
- **Complex conditional logic**: When conditional statements (if-else or switch-case) become extensive and complex within your object, the State pattern helps organize and separate state-specific behavior into individual classes, enhancing readability and maintainability.
- **Frequent state changes**: If your object transitions between states frequently, the State pattern provides a clear mechanism for managing these transitions and their associated actions.
- **Adding new states easily**: If you anticipate adding new states in the future, the State pattern facilitates this by allowing you to create new state classes without affecting existing ones.