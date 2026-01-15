---
title: RabbitMQ:One broker to queue them all
date: 2025-03-29 16:48:27
updated: 2025-03-29 18:04:19
comments: true
categories: C#/.NET
tags:
    - RabbitMQ
    - MessageQueue
    - MiddleWare
---

1. [What is RabbitMQ](#introduction) 
    - [Core Concepts](#core)
2. [Environment Setup](#setup)
    - [Docker (Recommended)](#docker)
3. [Managing Users and Permissions](#user)
4. [Scenario: Producer sends messages, Consumer receives messages](#simple)
    - [Producer Code](#producer)
    - [Consumer Code](#consumer)
    - [Run the test](#test)
5. [Advanced Features: Ensure Reliable Message Delivery](#ensure)
    - [Message Persistence](#persistence)
    - [Publisher Confirms](#pub)
    - [Manual Consumer Acknowledgment](#ack)
6. [Best Practices](#best)
    - [Message Format](#msg)
    - [Monitoring](#m)
<!--more-->
## What is RabbitMQ?<a name="introduction"></a>
**RabbitMQ** is an open source message middleware that implements the [AMQP](https://en.wikipedia.org/wiki/Advanced_Message_Queuing_Protocol) protocol(Advanced Message Queuing Protocol),designed for asynchronous communication in distributed systems.It facilitates asynchronous communication between applications, enabling decoupling and scalable architectures.It supports multiple programming languages and provides features like message persistence, flow control, and cluster deployment, widely used in microservices architecture, asynchronous task processing, and system decoupling.
### Core Concepts<a name="core"></a>
| **Concept**       | **Description**                                                                 |  
|-------------------|---------------------------------------------------------------------------------|  
| **Producer**      | An application that sends messages to an exchange.                              |  
| **Consumer**      | An application that receives messages from a queue and processes them.           |  
| **Exchange**      | A component that determines message routing rules and distributes messages to queues based on bindings. |  
| **Queue**         | A container for storing messages, from which consumers pull messages.            |  
| **Binding**       | Establishes a relationship between an exchange and a queue, defining routing conditions (e.g., routing keys). |  
| **AMQP**          | An application-layer protocol that defines communication standards for reliable message passing. |  

![pic](rabbit07.png)

## Environment Setup<a name="setup"></a>

### Docker (Recommended): <a name="docker"></a>
Pulling the RabbitMQ Docker Imag
```
docker pull rabbitmq:management
```
Start a RabbitMQ instance and mount a custom configuration file from your host to the container.
```
docker run -id --name=rabbitmq -v rabbitmq-home:/var/lib/rabbitmq 
-p 15672:15672 
-p 5672:5672 
-e RABBITMQ_DEFAULT_USER=***
-e RABBITMQ_DEFAULT_PASS=***
rabbitmq:management
```
- -d runs the container in detached mode.
- --name assigns a name to the container.
- -p maps the ports from the container to your host machine. Port 5672 is for RabbitMQ server, and 15672 is for the management UI.
Access the RabbitMQ Management Console:
- Open a web browser and navigate to http://localhost:15672/.
![pic](rabbit06.png)
- Log in with the default username you set  and password you set in the above command.


## Managing Users and Permissions<a name="user"></a>
To add a user, use rabbitmqctl add_user.
![pic](rabbit04.png)

To grant permissions to a user in a virtual host, use rabbitmqctl set_permissions:
![pic](rabbit05.png)
To list users in a cluster, use rabbitmqctl list_users:
```
rabbitmqctl list_users
```
To delete a user, use rabbitmqctl delete_user:
```
rabbitmqctl delete_user 'username'
```
To revoke permissions from a user in a virtual host, use rabbitmqctl clear_permissions:
```
rabbitmqctl clear_permissions -p "custom-vhost" "username"
```


## Scenario: Producer sends messages, Consumer receives messages<a name="simple"></a>
### Producer Code<a name="producer"></a>
```
class Producer
{
    private const string QueueName = "simple_queue";

    public static void SendMessage(string message)
    {
        var factory = new ConnectionFactory() { 
            HostName = "***",
            VirtualHost = "visual_knitting",
            UserName = "admin",
            Password = "123456",
            Port = 5672
         };
        using (var connection = factory.CreateConnection())
        using (var channel = connection.CreateModel())
        {
            channel.QueueDeclare(
                queue: QueueName,
                durable: false,  // Store in memory (non-persistent)
                exclusive: false, // Non-exclusive queue
                autoDelete: false, // Do not auto-delete when empty
                arguments: null
            );

            var body = Encoding.UTF8.GetBytes(message);
            channel.BasicPublish(
                exchange: "",       // Use default exchange (direct to queue)
                routingKey: QueueName, // Routing key matches queue name
                basicProperties: null,
                body: body
            );
            Console.WriteLine($"[Producer] Sent: {message}");
        }
    }
}
```
### Consumer Code<a name="consumer"></a>
```
class Consumer
{
    private const string QueueName = "simple_queue";

    public static void StartListening()
    {
        var factory = new ConnectionFactory() { 

            var factory = new ConnectionFactory() { 
            HostName = "***",
            VirtualHost = "visual_knitting",
            UserName = "admin",
            Password = "123456",
            Port = 5672
         };
         };
        using (var connection = factory.CreateConnection())
        using (var channel = connection.CreateModel())
        {
            channel.QueueDeclare(QueueName, false, false, false, null);

            var consumer = new EventingBasicConsumer(channel);
            consumer.Received += (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                Console.WriteLine($"[Consumer] Received: {message}");
            };

            channel.BasicConsume(
                queue: QueueName,
                autoAck: true,  // Auto-acknowledge messages upon receipt
                consumer: consumer
            );

            Console.WriteLine("Consumer is waiting for messages. Press any key to exit.");
            Console.ReadKey();
        }
    }
}
```

### Run the test:<a name="test"></a>
Send a message from the Producer:
 ![pic](rabbit08.png)
Consumer output:
 ![pic](rabbit09.png)

## Advanced Features: Ensure Reliable Message Delivery<a name="ensure"></a>
### Message Persistence<a name="persistence"></a>
**Scenario: Prevent message loss on RabbitMQ restart**
- Queue Persistence: Set durable: true when declaring the queue.
- Message Persistence: Set BasicProperties.Persistent = true.
```
// Producer code for persistence
channel.QueueDeclare(QueueName, durable: true, ...);

var properties = channel.CreateBasicProperties();
properties.Persistent = true; // Make messages persistent
channel.BasicPublish(..., basicProperties: properties, ...);
```
### Publisher Confirms<a name="pub"></a>
**Scenario: Ensure messages reach RabbitMQ server successfully**
```
// Enable publisher confirms
channel.ConfirmSelect();

channel.BasicPublish(...);
if (channel.WaitForConfirms(TimeSpan.FromSeconds(5)))
{
    Console.WriteLine("Message confirmed by server.");
}
else
{
    Console.WriteLine("Message confirmation timed out.");
}
```
### Manual Consumer Acknowledgment<a name="ack"></a>
**Scenario: Avoid losing unprocessed messages (e.g., on consumer crash)**
```
// Consumer code with manual acknowledgment (autoAck: false)
channel.BasicConsume(
    queue: QueueName,
    autoAck: false,  // Disable auto-acknowledgment
    consumer: consumer
);

consumer.Received += (model, ea) =>
{
    var deliveryTag = ea.DeliveryTag;
    try
    {
        // Process the message...
        channel.BasicAck(deliveryTag, multiple: false); // Acknowledge single message
    }
    catch (Exception)
    {
        channel.BasicNack(deliveryTag, multiple: false, requeue: true); // Requeue the message
    }
};
```
## Best Practices<a name="best"></a>
### Message Format
Use JSON for structured data, e.g:
```
{
    "MessageId": "12**",
    "Content": "Order created",
    "Timestamp": "2025-03-22T12:00:00"
}
```
### Monitoring
- Use the RabbitMQ management dashboard to check queue status, connections, and resource usage.
- Monitor performance with dotnet trace or tools like Prometheus + Grafana.
