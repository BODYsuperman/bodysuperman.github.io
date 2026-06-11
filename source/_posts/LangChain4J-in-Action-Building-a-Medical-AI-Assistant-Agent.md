---
title: "LangChain4J in Action: Building a Medical AI Assistant Agent"
date: 2026-04-27 12:48:28
updated: 2026-06-06 00:00:00
comments: true
categories:
  - Java
  - AI
  - Spring Boot
tags:
  - LangChain4J
  - OpenAI
  - RAG
  - Function Calling
  - LLM
  - Spring Boot
---

- [1. What is LangChain4J?](#1-what-is-langchain4j)
  - [1.1 The Problem LangChain4J Solves](#11-the-problem-langchain4j-solves)
  - [1.2 Core Concepts](#12-core-concepts)
- [2. Project Setup](#2-project-setup)
  - [2.1 Dependencies](#21-dependencies)
  - [2.2 Configuration](#22-configuration)
- [3. Your First LLM Integration](#3-your-first-llm-integration)
  - [3.1 Direct API Call](#31-direct-api-call)
  - [3.2 Spring Boot Auto-Configuration](#32-spring-boot-auto-configuration)
- [4. Building the AI Service](#4-building-the-ai-service)
  - [4.1 The Assistant Interface](#41-the-assistant-interface)
  - [4.2 System Messages](#42-system-messages)
- [5. Adding Chat Memory](#5-adding-chat-memory)
  - [5.1 Why Memory Matters](#51-why-memory-matters)
  - [5.2 Implementing Memory](#52-implementing-memory)
  - [5.3 Memory Isolation](#53-memory-isolation)
  - [5.4 Persistent Storage with MongoDB](#54-persistent-storage-with-mongodb)
  <!--more-->
- [6. Function Calling](#6-function-calling)
  - [6.1 What is Function Calling?](#61-what-is-function-calling)
  - [6.2 Creating Tools](#62-creating-tools)
  - [6.3 Appointment Booking Tool](#63-appointment-booking-tool)
- [7. RAG - Retrieval-Augmented Generation](#7-rag---retrieval-augmented-generation)
  - [7.1 Why RAG?](#71-why-rag)
  - [7.2 Vector Search Explained](#72-vector-search-explained)
  - [7.3 Document Processing Pipeline](#73-document-processing-pipeline)
  - [7.4 Implementing RAG](#74-implementing-rag)
- [8. Putting It All Together](#8-putting-it-all-together)
  - [8.1 Complete Agent Configuration](#81-complete-agent-configuration)
  - [8.2 Controller Layer](#82-controller-layer)
- [9. Best Practices](#9-best-practices)
- [10. FAQ](#10-faq)
- [11. Summary](#11-summary)

---

## 1. What is LangChain4J? <a name="1-what-is-langchain4j"></a>

### 1.1 The Problem LangChain4J Solves <a name="11-the-problem-langchain4j-solves"></a>

Building AI applications involves more than just calling an LLM API. You need to:

- Manage conversation context (chat memory)
- Connect to external data sources (RAG)
- Execute business logic (function calling)
- Handle different LLM providers

**LangChain4J** is a Java library that simplifies integrating Large Language Models (LLMs) into Java applications. It provides:

| Feature                 | Purpose                                                     |
| ----------------------- | ----------------------------------------------------------- |
| Unified API             | Switch between OpenAI, DeepSeek, Qwen without changing code |
| Chat Memory             | Maintain conversation context across multiple turns         |
| Function Calling        | Let LLM call your Java methods                              |
| RAG                     | Connect LLM to your knowledge base                          |
| Spring Boot Integration | Auto-configuration and dependency injection                 |

### 1.2 Core Concepts <a name="12-core-concepts"></a>

```
User Input → AIService → LLM → Response
                ↓
         [Chat Memory]
         [Tools/Functions]
         [Knowledge Base]
```

**Key Components:**

- **ChatModel**: Interface to LLM providers (OpenAI, DeepSeek, etc.)
- **AIService**: High-level abstraction that orchestrates components
- **ChatMemory**: Stores conversation history
- **Tools**: Java methods the LLM can invoke
- **ContentRetriever**: Fetches relevant documents for RAG

---

## 2. Project Setup <a name="2-project-setup"></a>

### 2.1 Dependencies <a name="21-dependencies"></a>

Create a Spring Boot project with these dependencies:

```xml
<properties>
    <java.version>17</java.version>
    <spring-boot.version>3.2.6</spring-boot.version>
    <langchain4j.version>1.0.0-beta3</langchain4j.version>
</properties>

<dependencies>
    <!-- Spring Boot Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- LangChain4J OpenAI (supports OpenAI, DeepSeek, etc.) -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-open-ai-spring-boot-starter</artifactId>
    </dependency>

    <!-- LangChain4J Core -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-spring-boot-starter</artifactId>
    </dependency>

    <!-- For RAG -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-easy-rag</artifactId>
    </dependency>
</dependencies>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>dev.langchain4j</groupId>
            <artifactId>langchain4j-bom</artifactId>
            <version>${langchain4j.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

### 2.2 Configuration <a name="22-configuration"></a>

**application.properties:**

```properties
# Server
server.port=8080

# OpenAI / DeepSeek Configuration
langchain4j.open-ai.chat-model.base-url=https://api.deepseek.com
langchain4j.open-ai.chat-model.api-key=${DEEP_SEEK_API_KEY}
langchain4j.open-ai.chat-model.model-name=deepseek-chat

# Logging
langchain4j.open-ai.chat-model.log-requests=true
langchain4j.open-ai.chat-model.log-responses=true
```

**Note:** Store API keys in environment variables, never in code.

---

## 3. Your First LLM Integration <a name="3-your-first-llm-integration"></a>

### 3.1 Direct API Call <a name="31-direct-api-call"></a>

Test the connection directly:

```java
@SpringBootTest
public class LLMTest {

    @Test
    public void testDirectCall() {
        // Build model manually
        OpenAiChatModel model = OpenAiChatModel.builder()
                .apiKey("demo") // Use demo key for testing
                .modelName("gpt-4o-mini")
                .build();

        String answer = model.chat("Hello, what is LangChain4J?");
        System.out.println(answer);
    }
}
```

### 3.2 Spring Boot Auto-Configuration <a name="32-spring-boot-auto-configuration"></a>

With Spring Boot starter, the model is auto-configured:

```java
@SpringBootTest
public class LLMTest {

    @Autowired
    private OpenAiChatModel chatModel;

    @Test
    public void testAutoConfig() {
        String answer = chatModel.chat("Explain RAG in simple terms");
        System.out.println(answer);
    }
}
```

---

## 4. Building the AI Service <a name="4-building-the-ai-service"></a>

### 4.1 The Assistant Interface <a name="41-the-assistant-interface"></a>

LangChain4J uses interfaces and dynamic proxies. Define what your AI can do:

```java
package com.example.assistant;

import dev.langchain4j.service.spring.AiService;
import static dev.langchain4j.service.spring.AiServiceWiringMode.EXPLICIT;

@AiService(
    wiringMode = EXPLICIT,
    chatModel = "openAiChatModel"
)
public interface MedicalAssistant {

    String chat(String userMessage);
}
```

**How it works:**

1. Define an interface with methods
2. Annotate with `@AiService`
3. LangChain4J creates a proxy implementation
4. The proxy handles input/output conversion

### 4.2 System Messages <a name="42-system-messages"></a>

Define the AI's role using `@SystemMessage`:

```java
public interface MedicalAssistant {

    @SystemMessage("""
        You are "MediBot", an AI medical assistant for Peking Union Medical College Hospital.

        Your responsibilities:
        1. Provide general medical information and guidance
        2. Help patients understand symptoms and treatment options
        3. Assist with appointment scheduling when asked
        4. Answer questions about hospital departments and doctors

        Rules:
        - Always be polite and professional
        - Include appropriate medical disclaimers
        - Never provide definitive diagnoses
        - Recommend seeing a doctor for serious concerns
        """)
    String chat(String userMessage);
}
```

**System Message** is sent once at the start to set the AI's behavior context.

---

## 5. Adding Chat Memory <a name="5-adding-chat-memory"></a>

### 5.1 Why Memory Matters <a name="51-why-memory-matters"></a>

Without memory, each message is independent:

```
User: My name is John
AI: Nice to meet you, John!

User: What's my name?
AI: I don't know your name.  ← Problem!
```

### 5.2 Implementing Memory <a name="52-implementing-memory"></a>

```java
@AiService(
    wiringMode = EXPLICIT,
    chatModel = "openAiChatModel",
    chatMemory = "chatMemory"  // Reference to ChatMemory bean
)
public interface MedicalAssistant {

    @SystemMessage("You are a helpful medical assistant.")
    String chat(String userMessage);
}
```

Configuration:

```java
@Configuration
public class AssistantConfig {

    @Bean
    ChatMemory chatMemory() {
        // Keep last 10 messages
        return MessageWindowChatMemory.withMaxMessages(10);
    }
}
```

### 5.3 Memory Isolation <a name="53-memory-isolation"></a>

For multi-user scenarios, isolate conversations by `memoryId`:

```java
@AiService(
    wiringMode = EXPLICIT,
    chatModel = "openAiChatModel",
    chatMemoryProvider = "chatMemoryProvider"
)
public interface MedicalAssistant {

    @SystemMessage("You are a helpful medical assistant.")
    String chat(
        @MemoryId Long conversationId,  // Unique per conversation
        @UserMessage String message
    );
}
```

Configuration:

```java
@Bean
ChatMemoryProvider chatMemoryProvider() {
    return memoryId -> MessageWindowChatMemory.builder()
            .id(memoryId)
            .maxMessages(10)
            .build();
}
```

### 5.4 Persistent Storage with MongoDB <a name="54-persistent-storage-with-mongodb"></a>

Store conversations in MongoDB:

```java
@Component
public class MongoChatMemoryStore implements ChatMemoryStore {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public List<ChatMessage> getMessages(Object memoryId) {
        ChatMessages stored = mongoTemplate.findOne(
            Query.query(Criteria.where("memoryId").is(memoryId)),
            ChatMessages.class
        );
        return stored == null
            ? new ArrayList<>()
            : ChatMessageDeserializer.messagesFromJson(stored.getContent());
    }

    @Override
    public void updateMessages(Object memoryId, List<ChatMessage> messages) {
        Query query = Query.query(Criteria.where("memoryId").is(memoryId));
        Update update = new Update().set("content",
            ChatMessageSerializer.messagesToJson(messages));
        mongoTemplate.upsert(query, update, ChatMessages.class);
    }
}
```

Update configuration:

```java
@Bean
ChatMemoryProvider chatMemoryProvider(MongoChatMemoryStore store) {
    return memoryId -> MessageWindowChatMemory.builder()
            .id(memoryId)
            .maxMessages(20)
            .chatMemoryStore(store)  // Persistent storage
            .build();
}
```

---

## 6. Function Calling <a name="6-function-calling"></a>

### 6.1 What is Function Calling? <a name="61-what-is-function-calling"></a>

Function calling allows the LLM to invoke your Java methods. The LLM:

1. Analyzes the user's request
2. Decides if a tool is needed
3. Extracts parameters
4. Calls your method
5. Uses the result in its response

```
User: Book an appointment with Dr. Wang tomorrow at 2pm

LLM → Detects "book appointment" intent
    → Calls bookAppointment(doctor="Dr. Wang", date="2025-06-12", time="14:00")
    ← Returns "Appointment confirmed"
    → Responds: "Your appointment with Dr. Wang is confirmed for tomorrow at 2pm."
```

### 6.2 Creating Tools <a name="62-creating-tools"></a>

Annotate methods with `@Tool`:

```java
@Component
public class CalculatorTools {

    @Tool(name = "sum", value = "Add two numbers")
    public double sum(
            @P(value = "First number") double a,
            @P(value = "Second number") double b) {
        return a + b;
    }

    @Tool(name = "squareRoot", value = "Calculate square root")
    public double squareRoot(@P(value = "Number") double x) {
        return Math.sqrt(x);
    }
}
```

Register tools in AIService:

```java
@AiService(
    wiringMode = EXPLICIT,
    chatModel = "openAiChatModel",
    chatMemoryProvider = "chatMemoryProvider",
    tools = "calculatorTools"  // Tool bean name
)
public interface MedicalAssistant {
    String chat(@MemoryId Long id, @UserMessage String message);
}
```

### 6.3 Appointment Booking Tool <a name="63-appointment-booking-tool"></a>

Real-world example for medical appointments:

```java
@Component
public class AppointmentTools {

    @Autowired
    private AppointmentService appointmentService;

    @Tool(name = "checkAvailability",
          value = "Check if a doctor has available slots")
    public boolean checkAvailability(
            @P(value = "Department name") String department,
            @P(value = "Date in YYYY-MM-DD format") String date,
            @P(value = "Time slot: morning or afternoon") String time,
            @P(value = "Doctor name (optional)", required = false) String doctorName) {

        return appointmentService.hasAvailability(department, date, time, doctorName);
    }

    @Tool(name = "bookAppointment",
          value = "Book a medical appointment. Confirm details with user first.")
    public String bookAppointment(
            @P(value = "Patient name") String patientName,
            @P(value = "Patient ID card number") String idCard,
            @P(value = "Department") String department,
            @P(value = "Date in YYYY-MM-DD") String date,
            @P(value = "Time: morning or afternoon") String time,
            @P(value = "Doctor name (optional)", required = false) String doctorName) {

        Appointment appointment = new Appointment();
        appointment.setPatientName(patientName);
        appointment.setIdCard(idCard);
        appointment.setDepartment(department);
        appointment.setDate(date);
        appointment.setTime(time);
        appointment.setDoctorName(doctorName);

        boolean success = appointmentService.save(appointment);
        return success ? "Appointment booked successfully" : "Failed to book appointment";
    }

    @Tool(name = "cancelAppointment",
          value = "Cancel an existing appointment")
    public String cancelAppointment(
            @P(value = "Patient name") String patientName,
            @P(value = "ID card number") String idCard,
            @P(value = "Department") String department,
            @P(value = "Date in YYYY-MM-DD") String date) {

        boolean success = appointmentService.cancel(patientName, idCard, department, date);
        return success ? "Appointment cancelled successfully" : "No matching appointment found";
    }
}
```

---

## 7. RAG - Retrieval-Augmented Generation <a name="7-rag---retrieval-augmented-generation"></a>

### 7.1 Why RAG? <a name="71-why-rag"></a>

![pic](rag-1.png)
LLMs have knowledge cutoff dates. They don't know:

- Your hospital's specific departments
- Doctor schedules and specialties
- Latest hospital policies
- Internal procedures

**RAG** retrieves relevant documents and provides them as context:

| Approach    | Pros                                        | Cons                                          |
| ----------- | ------------------------------------------- | --------------------------------------------- |
| Fine-tuning | Fast inference, high accuracy               | Expensive, slow to update, requires expertise |
| RAG         | Easy to update, cost-effective, no training | Requires two queries (retrieval + generation) |

### 7.2 Vector Search Explained <a name="72-vector-search-explained"></a>

**Vectors** are numerical representations of text. Similar texts have similar vectors.

```
"Cardiology department"  → [0.1, 0.3, -0.2, ...] (1024 dimensions)
"Heart specialist"       → [0.12, 0.28, -0.19, ...] (similar vector)
"Dentistry"              → [-0.5, 0.1, 0.8, ...]   (different vector)
```

**Similarity Calculation:**

- **Cosine Similarity**: Measures angle between vectors
- **Euclidean Distance**: Measures straight-line distance

Higher similarity = more relevant content.

### 7.3 Document Processing Pipeline <a name="73-document-processing-pipeline"></a>

```
Document → Parse → Split → Embed → Store
(PDF/MD)       (Chunks) (Vectors) (Vector DB)
```

**Why split documents?**

- LLM context windows are limited
- Smaller chunks = more precise retrieval
- Reduces noise from irrelevant content

### 7.4 Implementing RAG <a name="74-implementing-rag"></a>

**Step 1: Load and Process Documents**

```java
// Load hospital information documents
Document hospitalDoc = FileSystemDocumentLoader.loadDocument(
    "knowledge/hospital-info.md");
Document deptDoc = FileSystemDocumentLoader.loadDocument(
    "knowledge/departments.md");
```

**Step 2: Create Vector Store**

```java
@Bean
ContentRetriever contentRetriever(EmbeddingModel embeddingModel) {
    // Load documents
    List<Document> documents = Arrays.asList(
        FileSystemDocumentLoader.loadDocument("knowledge/hospital-info.md"),
        FileSystemDocumentLoader.loadDocument("knowledge/departments.md"),
        FileSystemDocumentLoader.loadDocument("knowledge/doctors.md")
    );

    // In-memory store (use Pinecone/Milvus for production)
    InMemoryEmbeddingStore<TextSegment> store = new InMemoryEmbeddingStore<>();

    // Process and store
    EmbeddingStoreIngestor.ingest(documents, store);

    // Create retriever
    return EmbeddingStoreContentRetriever.from(store);
}
```

**Step 3: Configure AIService with RAG**

```java
@AiService(
    wiringMode = EXPLICIT,
    chatModel = "openAiChatModel",
    chatMemoryProvider = "chatMemoryProvider",
    tools = "appointmentTools",
    contentRetriever = "contentRetriever"  // RAG component
)
public interface MedicalAssistant {

    @SystemMessage(fromResource = "medical-assistant-prompt.txt")
    String chat(@MemoryId Long id, @UserMessage String message);
}
```

**Production Vector Database - Pinecone:**

```java
@Bean
EmbeddingStore<TextSegment> embeddingStore(EmbeddingModel model) {
    return PineconeEmbeddingStore.builder()
            .apiKey(System.getenv("PINECONE_API_KEY"))
            .index("medical-kb")
            .nameSpace("hospital-info")
            .createIndex(PineconeServerlessIndexConfig.builder()
                    .cloud("AWS")
                    .region("us-east-1")
                    .dimension(model.dimension())  // 1024 for text-embedding-v3
                    .build())
            .build();
}
```

---

## 8. Putting It All Together <a name="8-putting-it-all-together"></a>

### 8.1 Complete Agent Configuration <a name="81-complete-agent-configuration"></a>

**MedicalAssistant.java:**

```java
package com.example.assistant;

import dev.langchain4j.service.*;
import dev.langchain4j.service.spring.AiService;
import static dev.langchain4j.service.spring.AiServiceWiringMode.EXPLICIT;

@AiService(
    wiringMode = EXPLICIT,
    chatModel = "openAiChatModel",
    chatMemoryProvider = "chatMemoryProvider",
    tools = "appointmentTools",
    contentRetriever = "contentRetriever"
)
public interface MedicalAssistant {

    @SystemMessage(fromResource = "medical-assistant-prompt.txt")
    String chat(
        @MemoryId Long conversationId,
        @UserMessage String userMessage
    );
}
```

**medical-assistant-prompt.txt:**

```
You are "MediBot", an AI assistant for Peking Union Medical College Hospital.

Your capabilities:
1. Medical consultation - provide general health information
2. Department guidance - help patients find the right department
3. Doctor information - answer questions about our doctors
4. Appointment management - book and cancel appointments

Rules:
- Always verify patient identity (name + ID card) before appointments
- Confirm appointment details before booking
- Use the knowledge base for hospital-specific information
- Be professional yet friendly
- Add appropriate emoji to make responses warm

Today is {{current_date}}.
```

### 8.2 Controller Layer <a name="82-controller-layer"></a>

```java
@RestController
@RequestMapping("/api/medical")
@Tag(name = "Medical AI Assistant")
public class MedicalController {

    @Autowired
    private MedicalAssistant assistant;

    @PostMapping("/chat")
    @Operation(summary = "Chat with medical assistant")
    public String chat(@RequestBody ChatRequest request) {
        return assistant.chat(request.getConversationId(), request.getMessage());
    }
}

@Data
public class ChatRequest {
    private Long conversationId;  // Unique per user session
    private String message;
}
```

---

## 9. Best Practices <a name="9-best-practices"></a>

### System Design

| Practice                       | Why It Matters                               |
| ------------------------------ | -------------------------------------------- |
| Use `@MemoryId` for multi-user | Prevents conversation bleeding between users |
| Persistent chat memory         | Don't lose context on server restart         |
| Tool descriptions              | Clear descriptions help LLM choose correctly |
| Document chunking              | Smaller chunks improve retrieval precision   |
| Min score threshold            | Filters low-relevance results                |

### Security

```properties
# Never commit API keys
langchain4j.open-ai.chat-model.api-key=${OPENAI_API_KEY}
```

### Performance

```java
// Limit chat memory to control token usage
MessageWindowChatMemory.withMaxMessages(10)

// Set minScore to filter irrelevant documents
EmbeddingStoreContentRetriever.builder()
    .minScore(0.8)
    .maxResults(3)
    .build()
```

### Common Pitfalls

| Pitfall                | Solution                                     |
| ---------------------- | -------------------------------------------- |
| LLM doesn't use tools  | Improve tool descriptions                    |
| Wrong tool parameters  | Use `@P` annotations with clear descriptions |
| Out-of-scope responses | Refine system message                        |
| Slow responses         | Use streaming output for real-time feedback  |

---

## 10. FAQ <a name="10-faq"></a>

**Q: Can I switch from OpenAI to DeepSeek without code changes?**

A: Yes. Just change the configuration:

```properties
# From OpenAI
langchain4j.open-ai.chat-model.base-url=https://api.openai.com/v1
langchain4j.open-ai.chat-model.api-key=${OPENAI_KEY}

# To DeepSeek
langchain4j.open-ai.chat-model.base-url=https://api.deepseek.com
langchain4j.open-ai.chat-model.api-key=${DEEPSEEK_KEY}
```

**Q: How do I handle sensitive medical data?**

A:

- Use local LLMs via Ollama for sensitive data
- Implement data anonymization before sending to external APIs
- Store chat history encrypted
- Follow HIPAA/GDPR compliance requirements

**Q: What's the difference between ChatMemory and ChatMemoryProvider?**

A:

- `ChatMemory`: Single shared memory instance
- `ChatMemoryProvider`: Factory that creates isolated memory per `memoryId`

**Q: How do I update the knowledge base?**

A: Simply add new documents and re-ingest:

```java
// New document
Document newDoc = FileSystemDocumentLoader.loadDocument("new-policy.md");

// Add to existing store
EmbeddingStoreIngestor.ingest(newDoc, embeddingStore);
```

**Q: Can the LLM call multiple tools in one conversation?**

A: Yes. The LLM can chain tool calls:

```
User: "Book Dr. Wang and check if Dr. Li is available next week"

LLM → Calls bookAppointment(...)
    → Calls checkAvailability(...)
    → Responds with both results
```

---

## 11. Summary <a name="11-summary"></a>

We built a medical AI assistant using LangChain4J with:

1. **Spring Boot Integration** - Auto-configuration and dependency injection
2. **LLM Integration** - Unified API for OpenAI, DeepSeek, and others
3. **Chat Memory** - Persistent conversation context
4. **Function Calling** - Java methods callable by the LLM
5. **RAG** - Knowledge retrieval from documents

**Key Takeaways:**

- LangChain4J abstracts LLM complexity behind simple interfaces
- AIService pattern keeps code clean and testable
- Chat memory enables natural multi-turn conversations
- Function calling bridges LLM reasoning with business logic
- RAG grounds the LLM in your specific domain knowledge

**Next Steps:**

- Add streaming responses for better UX
- Implement multi-modal support (images)
- Add evaluation framework for response quality
- Deploy with Docker and Kubernetes

**Project Link:**

[SmartMed-LangChain4j-RAG](https://github.com/BODYsuperman/SmartMed-LangChain4j-RAG)
Please give stat ✨✨✨ it :)

**Demo:**

![pic](res-2.png)

## References

- [LangChain4J Official Documentation](https://docs.langchain4j.dev)
- [LangChain4J GitHub](https://github.com/langchain4j/langchain4j)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [DeepSeek API Documentation](https://api-docs.deepseek.com)
