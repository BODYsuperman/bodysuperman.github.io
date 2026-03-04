---
title: TLias Spring Boot Practice Guide
date: 2026-02-18 13:53:06
updated: 2026-02-18 19:04:19
comments: true
categories:
  - Java
  - Spring Boot
tags:
  - MyBatis
  - Pagination
  - JWT
  - AOP
  - RESTful API
---

- [1. Project Overview: What is Tlias?](#1-project-overview-what-is-tlias)
  - [1.1 Core Technology Stack](#core-technology-stack)
  - [1.2 Project Architecture](#project-architecture)
  - [1.3 Project Structure Overview](#project-structure-overview)
  - [1.4 Database Design](#database-design)
- [2. Environment Setup: The Hardest Part](#2-environment-setup-the-hardest-part)
  - [2.1 Key Insight](#key-insight)
  - [2.2 Unified Response Class](#unified-response-class)
- [3. Department Management](#3-department-management-first-crud-experience)
- [4. Employee Management: Pagination & Dynamic SQL](#4-employee-management-pagination--dynamic-sql)
  - [4.1 Pagination Query (Basic Version)](#pagination-query-basic-version)
  - [4.2 Using PageHelper Plugin (Recommended) – Deep Dive](#using-pagehelper-plugin-recommended--deep-dive)
  - [4.3 Conditional Pagination Query (Dynamic SQL) – Advanced Details](#conditional-pagination-query-dynamic-sql--advanced-details)
  - [4.4 Batch Delete Employees – ForEach in XML](#batch-delete-employees--foreach-in-xml)
  - [4.5 Add Employee](#add-employee)
<!--more-->
- [5. File Upload: From Local to Cloud](#5-file-upload-from-local-to-cloud)
- [6. Login Authentication: JWT Tokens & Interceptors](#6-login-authentication-jwt-tokens--interceptors)
- [7. Unified Exception Handling: Graceful Error Management](#7-unified-exception-handling-graceful-error-management)
- [8. Transaction Management: Ensuring Data Consistency](#8-transaction-management-ensuring-data-consistency)
- [9. AOP in Action: Operation Logging](#9-aop-in-action-operation-logging)
- [10. Pitfall Diary: Bugs I Encountered](#10-pitfall-diary-bugs-i-encountered)
- [11. Advanced: Statistics & Complex Queries](#11-advanced-statistics--complex-queries)
  - [11.1 Understanding List<Map<String, Object>> in MyBatis](#understanding-listmapstring-object-in-mybatis)
  - [11.2 Using CASE WHEN in SQL for Conditional Aggregation](#using-case-when-in-sql-for-conditional-aggregation)
  - [11.3 Handling Date Formats in Query Results](#handling-date-formats-in-query-results)
  - [11.4 MyBatis Alias Strictness](#mybatis-alias-strictness)
  - [11.5 Using foreach for Dynamic IN Clauses in Statistics](#using-foreach-for-dynamic-in-clauses-in-statistics)
  - [11.6 LocalDate Comparison in Java (if needed)](#localdate-comparison-in-java-if-needed)
  - [11.7 Complete Example: Employee Trend by Month](#complete-example-employee-trend-by-month)
- [12. Some Thoughts](#thoughts)
- [13. Git Repo link:Tlias-Web-Management](#git)

## Project Overview: What is Tlias? <a name="1-project-overview-what-is-tlias"></a>

TLias is a **Teaching Management System** that manages:

- Departments
- Employees
- Authentication
- File Upload
- Statistics & Reports

### Core Technology Stack <a name="core-technology-stack"></a>

| Technology  | Purpose                | Why It Matters                                    |
| ----------- | ---------------------- | ------------------------------------------------- |
| Spring Boot | Web framework          | Rapid development & convention over configuration |
| MyBatis     | ORM framework          | Precise SQL control                               |
| MySQL       | Database               | Industry-standard relational DB                   |
| JWT         | Authentication         | Stateless login                                   |
| PageHelper  | Pagination             | Clean & efficient paging                          |
| Lombok      | Boilerplate reduction  | Cleaner code                                      |
| AOP         | Cross-cutting concerns | Logging & monitoring                              |

### Project Architecture <a name="project-architecture"></a>

```
Frontend (Vue + Element Plus)
↓
Nginx Proxy
↓
Spring Boot Backend
↓
MySQL
```

### Project Structure Overview <a name="project-structure-overview"></a>

```
tlias/
├── src/main/java/com/alex/
│ ├── controller/ # Controller layer, handles requests
│ ├── service/ # Service layer, business logic
│ │ ├── impl/ # Service implementations
│ ├── mapper/ # Data access layer
│ ├── pojo/ # Entity classes
│ ├── utils/ # Utility classes
│ ├── filter/ # Filters
│ ├── interceptor/ # Interceptors
│ ├── aop/ # Aspect classes
│ └── exception/ # Exception handling
└── src/main/resources/
├── application.yml # Configuration file
└── mapper/ # MyBatis XML files
```

### Database Design <a name="database-design"></a>

Two core tables: `dept` (department table) and `emp` (employee table)

```sql
-- Department table
CREATE TABLE dept (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Department ID',
    name VARCHAR(50) NOT NULL COMMENT 'Department name',
    create_time DATETIME COMMENT 'Creation time',
    update_time DATETIME COMMENT 'Update time'
);

-- Employee table
CREATE TABLE emp (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Employee ID',
    username VARCHAR(50) NOT NULL COMMENT 'Username',
    password VARCHAR(100) COMMENT 'Password',
    name VARCHAR(50) COMMENT 'Full name',
    gender TINYINT COMMENT 'Gender: 1 Male, 2 Female',
    image VARCHAR(300) COMMENT 'Avatar URL',
    job TINYINT COMMENT 'Job: 1 Head Teacher, 2 Instructor, 3 Student Supervisor, 4 Teaching Research Supervisor',
    entrydate DATE COMMENT 'Entry date',
    dept_id INT COMMENT 'Department ID',
    create_time DATETIME COMMENT 'Creation time',
    update_time DATETIME COMMENT 'Update time'
);
```

Tip: Always include create_time and update_time fields when designing tables. They're invaluable for troubleshooting issues later.

## Environment Setup: The Hardest Part <a name="2-environment-setup-the-hardest-part"></a>

Creating a Spring Boot Project
Using IntelliJ IDEA, select the following dependencies when creating the project:

```
- Spring Web
- MyBatis Framework
- MySQL Driver
- Lombok
```

Configuration File (application.yml)

```yaml
spring:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/tlias
    username: yourname
    password: yourpassword

mybatis:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl  # Print SQL logs
    map-underscore-to-camel-case: true  # Enable camel case mapping

# File upload configuration
spring:
  servlet:
    multipart:
      max-file-size: 10MB  # Maximum file size
      max-request-size: 100MB  # Maximum request size
```

### Key Insight <a name="key-insight"></a>

```java
map-underscore-to-camel-case: true
```

Automatically maps:

```
create_time → createTime
```

This small configuration saves massive boilerplate mapping code.

### Unified Response Class <a name="unified-response-class"></a>

For standardized frontend-backend communication, define a unified return format:

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result {
    private Integer code;  // 1:success 0:failure
    private String msg;
    private Object data;

    public static Result success() {
        return new Result(1, "success", null);
    }

    public static Result success(Object data) {
        return new Result(1, "success", data);
    }

    public static Result error(String msg) {
        return new Result(0, msg, null);
    }
}
```

## Department Management <a name="3-department-management-first-crud-experience"></a>

This module helps you fully understand:

```
Controller → Service → Mapper → Database
```

| Layer      | Responsibility |
| ---------- | -------------- |
| Controller | Handle HTTP    |
| Service    | Business logic |
| Mapper     | SQL execution  |

Never put SQL inside Controller.
Never put HTTP logic inside Service.

That’s professional separation.

Key REST Design Principles

- GET → Query

- POST → Create

- PUT → Update

- DELETE → Remove

Query All Departments
Requirement: Query all department information, sorted by update time in descending order.

Controller Layer:

```java
@RestController
@RequestMapping("/depts")
@Slf4j
public class DeptController {
    @Autowired
    private DeptService deptService;

    @GetMapping
    public Result list() {
        log.info("Querying all departments");
        List<Dept> deptList = deptService.list();
        return Result.success(deptList);
    }
}
```

Service Layer:

```java
public interface DeptService {
    List<Dept> list();
}

@Service
public class DeptServiceImpl implements DeptService {

    @Autowired
    private DeptMapper deptMapper;

    @Override
    public List<Dept> list() {
        return deptMapper.list();
    }
}
```

Mapper Layer:

```java
@Mapper
public interface DeptMapper {
    @Select("select id, name, create_time, update_time from dept order by update_time desc")
    List<Dept> list();
}
```

Key Points:

@RestController = @Controller + @ResponseBody, returns JSON data

@RequestMapping("/depts") extracts the common path to avoid repetition

@Slf4j is Lombok's logging annotation, more standard than System.out.println()

Delete Department
Requirement: Delete a department by ID.

Controller Layer:

```java
@DeleteMapping("/{id}")
public Result delete(@PathVariable Integer id) {
    log.info("Deleting department with ID: {}", id);
    deptService.delete(id);
    return Result.success();
}
```

Service Layer:

```java
@Override
public void delete(Integer id) {
    deptMapper.deleteById(id);
}
```

Mapper Layer:

```java
@Delete("delete from dept where id = #{id}")
void deleteById(Integer id);
```

Important: The @PathVariable annotation retrieves parameters from the URL path. Make sure the variable name matches the path variable name, or specify it explicitly like @PathVariable("id") Integer deptId. (See Path Variable Binding)

Add Department
Requirement: Add a new department, setting creation and update times.

Controller Layer:

```java
@PostMapping
public Result add(@RequestBody Dept dept) {
    log.info("Adding department: {}", dept);
    deptService.add(dept);
    return Result.success();
}
```

Service Layer:

```java
@Override
public void add(Dept dept) {
    // Fill in basic attributes
    dept.setCreateTime(LocalDateTime.now());
    dept.setUpdateTime(LocalDateTime.now());
    deptMapper.insert(dept);
}
```

Mapper Layer:

```java
@Insert("insert into dept(name, create_time, update_time) " +
        "values(#{name}, #{createTime}, #{updateTime})")
void insert(Dept dept);
```

Key Points:

@RequestBody receives JSON data from the frontend

The frontend only sends the name; we set createTime and updateTime in Service

Update Department
Query for Display:

```java
@GetMapping("/{id}")
public Result getInfo(@PathVariable Integer id) {
    log.info("Querying department by ID: {}", id);
    Dept dept = deptService.getById(id);
    return Result.success(dept);
}
```

// Service

```java
@Override
public Dept getById(Integer id) {
    return deptMapper.getById(id);
}
```

// Mapper

```java
@Select("select id, name, create_time, update_time from dept where id = #{id}")
Dept getById(Integer id);

```

Update Data:

```java
@PutMapping
public Result update(@RequestBody Dept dept) {
    log.info("Updating department: {}", dept);
    deptService.update(dept);
    return Result.success();
}


// Service
@Override
public void update(Dept dept) {
    dept.setUpdateTime(LocalDateTime.now());
    deptMapper.update(dept);
}

// Mapper
@Update("update dept set name = #{name}, update_time = #{updateTime} where id = #{id}")
void update(Dept dept);
```

Note: Only update name and update_time; create_time remains unchanged.

## Employee Management: Pagination & Dynamic SQL <a name="4-employee-management-pagination--dynamic-sql"></a>

Employee management is more complex due to larger data volumes requiring pagination and conditional filtering.

### Pagination Query (Basic Version) <a name="pagination-query-basic-version"></a>

Define a PageBean class:

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageBean {
    private Long total;      // Total record count
    private List<Emp> rows;  // Current page data
}
```

Controller Layer:

```java
@GetMapping
public Result page(@RequestParam(defaultValue = "1") Integer page,
                   @RequestParam(defaultValue = "10") Integer pageSize) {
    log.info("Pagination query: page={}, pageSize={}", page, pageSize);
    PageBean pageBean = empService.page(page, pageSize);
    return Result.success(pageBean);
}
```

Service Layer (Manual Pagination):

```java
@Override
public PageBean page(Integer page, Integer pageSize) {
    Integer start = (page - 1) * pageSize;
    Long total = empMapper.count();
    List<Emp> rows = empMapper.page(start, pageSize);
    return new PageBean(total, rows);
}
```

Mapper Layer:

```java
@Select("select count(*) from emp")
Long count();

@Select("select * from emp order by update_time desc limit #{start}, #{pageSize}")
List<Emp> page(Integer start, Integer pageSize);
```

### Using PageHelper Plugin (Recommended) – Deep Dive <a name="using-pagehelper-plugin-recommended--deep-dive"></a>

Add Dependency in pom.xml:

```xml
<dependency>
    <groupId>com.github.pagehelper</groupId>
    <artifactId>pagehelper-spring-boot-starter</artifactId>
    <version>1.4.7</version>
</dependency>
```

Service Layer (Plugin Version):

```java
@Override
public PageBean page(Integer page, Integer pageSize) {
    PageHelper.startPage(page, pageSize);
    List<Emp> empList = empMapper.list();
    Page<Emp> p = (Page<Emp>) empList;
    return new PageBean(p.getTotal(), p.getResult());
}
```

Mapper Layer:

```java
@Select("select * from emp order by update_time desc")
List<Emp> list();
```

Key Points (PageHelper Understanding):

PageHelper.startPage(page, pageSize) uses a ThreadLocal to store pagination parameters. The next MyBatis query (the first one after this call) will automatically have LIMIT clauses appended.

It only affects the first SQL statement after the call. If you execute multiple queries, only the first one gets paginated.

The returned List is actually a Page object (a subclass of ArrayList) that contains pagination info like total count, page number, etc. You can cast it or directly use it as a list.

Important: Ensure that PageHelper.startPage() is called just before the mapper method that performs the actual data query. Do not put any other database operations in between.

For conditional queries, you still call PageHelper.startPage() first, then the dynamic SQL method; the plugin will automatically add LIMIT to that query.

### Conditional Pagination Query (Dynamic SQL) – Advanced Details <a name="conditional-pagination-query-dynamic-sql--advanced-details"></a>

Controller Layer:

```java
@GetMapping
public Result page(@RequestParam(defaultValue = "1") Integer page,
                   @RequestParam(defaultValue = "10") Integer pageSize,
                   String name, Short gender,
                   @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate begin,
                   @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate end) {
    log.info("Conditional pagination query...");
    PageBean pageBean = empService.page(page, pageSize, name, gender, begin, end);
    return Result.success(pageBean);
}
```

Service Layer:

```java
@Override
public PageBean page(Integer page, Integer pageSize, String name,
                     Short gender, LocalDate begin, LocalDate end) {
    PageHelper.startPage(page, pageSize);
    List<Emp> empList = empMapper.list(name, gender, begin, end);
    Page<Emp> p = (Page<Emp>) empList;
    return new PageBean(p.getTotal(), p.getResult());
}
```

Mapper XML (EmpMapper.xml):

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.*.mapper.EmpMapper">


       <select id="list" resultType="com.alex.pojo.Emp">
        select e.*, d.name deptName from emp as e left join dept as d on e.dept_id = d.id
        <where>
            <if test="name != null and name != ''">
                e.name like concat('%',#{name},'%') -- use concat for safe string concatenation, prevent sql injecting!!!
            </if>
            <if test="gender != null">
                and e.gender = #{gender}
            </if>
            <if test="begin != null and end != null">
                and e.entry_date between #{begin} and #{end}
            </if>
        </where>
        order by update_time desc
    </select>

</mapper>
```

Important – Dynamic SQL Details:

<where> tag: Automatically handles the removal of the first AND or OR if the condition is true. It ensures the SQL syntax is correct.

<if> tag: The test attribute is an OGNL expression. Pay attention to:

String comparison: name != null and name != ''

Numeric comparison: gender != null

Date comparison: both begin and end must be non-null for range query.

#{} vs ${}: Always use #{} for parameter placeholders. It generates a prepared statement and prevents SQL injection. ${} is for literal substitution (e.g., table names) and should be avoided for user input.

Fuzzy matching: Use concat('%', #{name}, '%') instead of '%${name}%' to avoid SQL injection. This is the safest way.

LocalDate comparison: In the SQL, between #{begin} and #{end} works because MyBatis automatically converts LocalDate to java.sql.Date when binding parameters. No special handling needed.

Handling empty strings: If name is an empty string, the condition name != '' will be false, so it won't be included. This is usually desired.

### Batch Delete Employees – ForEach in XML <a name="batch-delete-employees--foreach-in-xml"></a>

Controller:

```java
@DeleteMapping("/{ids}")
public Result delete(@PathVariable List<Integer> ids) {
    log.info("Batch deleting employees: {}", ids);
    empService.delete(ids);
    return Result.success();
}
```

Mapper XML:

```xml
<delete id="delete">
    delete from emp where id in
    <foreach collection="ids" item="id" open="(" separator="," close=")">
        #{id}
    </foreach>
</delete>
```

ForEach Details:

collection: name of the list/array parameter. Can be list, array, or a custom name if annotated with @Param.
item: alias for each element during iteration.
open, close: strings added before and after the whole collection.
separator: string between each iteration.
You can also use <foreach> for batch inserts:

```xml
<insert id="batchInsert">
    insert into emp (name, gender) values
    <foreach collection="list" item="emp" separator=",">
        (#{emp.name}, #{emp.gender})
    </foreach>
</insert>
```

### Add Employee <a name="add-employee"></a>

```java
@Override
public void save(Emp emp) {
    emp.setCreateTime(LocalDateTime.now());
    emp.setUpdateTime(LocalDateTime.now());
    if (emp.getPassword() == null) {
        emp.setPassword("123456");
    }
    empMapper.insert(emp);
}
```

## File Upload: From Local to Cloud <a name="5-file-upload-from-local-to-cloud"></a>

Local Storage Solution
Controller:

```java
@PostMapping("/upload")
public Result upload(String username, Integer age,
                     @RequestParam("image") MultipartFile image) throws IOException {
    log.info("File upload: {}, {}, {}", username, age, image.getOriginalFilename());

    String originalFilename = image.getOriginalFilename();
    String ext = originalFilename.substring(originalFilename.lastIndexOf("."));
    String newFileName = UUID.randomUUID().toString() + ext;

    image.transferTo(new File("D:/upload/" + newFileName));

    return Result.success("http://localhost:8080/uploads/" + newFileName);
}
```

Configuration:

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 100MB
```

Note: Local storage not recommended for production, use cloud solution like:

- AWS S3
- GCP Cloud Storage
- Alibaba OSS

Why?

- Scalability
- Redundancy
- Disaster recovery

Alibaba Cloud OSS (Recommended)
Dependency:

```xml
<dependency>
    <groupId>com.aliyun.oss</groupId>
    <artifactId>aliyun-sdk-oss</artifactId>
    <version>3.15.1</version>
</dependency>
```

Configuration (application.yml):

```yaml
aliyun:
  oss:
    endpoint: https://oss-cn-beijing.aliyuncs.com
    access-key-id: your-access-key-id
    access-key-secret: your-access-key-secret
    bucket-name: your-bucket-name
```

Utility Class:

```java
@Component
@ConfigurationProperties(prefix = "aliyun.oss")
@Data
public class AliOSSUtils {
    private String endpoint;
    private String accessKeyId;
    private String accessKeySecret;
    private String bucketName;

    public String upload(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String fileName = UUID.randomUUID().toString() +
            originalFilename.substring(originalFilename.lastIndexOf("."));

        OSS ossClient = new OSSClientBuilder().build(
            endpoint, accessKeyId, accessKeySecret);

        ossClient.putObject(bucketName, fileName, file.getInputStream());
        ossClient.shutdown();

        return "https://" + bucketName + "." + endpoint + "/" + fileName;
    }
}
```

Controller:

```java
@Autowired
private AliOSSUtils aliOSSUtils;

@PostMapping("/upload")
public Result upload(MultipartFile image) throws IOException {
    String url = aliOSSUtils.upload(image);
    return Result.success(url);
}
```

## Login Authentication: JWT Tokens & Interceptors <a name="6-login-authentication-jwt-tokens--interceptors"></a>

JWT Flow

- 1.User logs in
- 2.Server generates JWT
- 3.Client stores token
- 4.Every request carries token
- 5.Backend verifies token

Why Interceptor > Filter?

| Filter           | Interceptor  |
| ---------------- | ------------ |
| Servlet level    | Spring level |
| Less flexible    | More control |
| Harder to manage | Recommended  |

Interceptor integrates better with Spring MVC!

JWT Utility Class

```java
public class JwtUtils {

    private static final String SIGN_KEY = "itheima";
    private static final Long EXPIRE_TIME = 12 * 60 * 60 * 1000L;

    public static String generateJwt(Map<String, Object> claims) {
        return Jwts.builder()
                .setClaims(claims)
                .signWith(SignatureAlgorithm.HS256, SIGN_KEY)
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRE_TIME))
                .compact();
    }

    public static Claims parseJWT(String jwt) {
        return Jwts.parser()
                .setSigningKey(SIGN_KEY)
                .parseClaimsJws(jwt)
                .getBody();
    }
}
```

Login Functionality
Controller:

```java
@PostMapping("/login")
public Result login(@RequestBody Emp emp) {
    log.info("Employee login: {}", emp.getUsername());

    Emp loginEmp = empService.login(emp);

    if (loginEmp != null) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", loginEmp.getId());
        claims.put("username", loginEmp.getUsername());
        claims.put("name", loginEmp.getName());

        String jwt = JwtUtils.generateJwt(claims);
        return Result.success(jwt);
    }

    return Result.error("Invalid username or password");
}
```

Service & Mapper:

```java
// Service
@Override
public Emp login(Emp emp) {
    return empMapper.getByUsernameAndPassword(emp.getUsername(), emp.getPassword());
}

// Mapper
@Select("select id, username, name, password from emp " +
        "where username = #{username} and password = #{password}")
Emp getByUsernameAndPassword(String username, String password);
```

Login Validation - Filter Approach
```java
@Slf4j
@WebFilter(urlPatterns = "/\*")
public class LoginCheckFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response,
                         FilterChain chain) throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        String url = req.getRequestURL().toString();
        if (url.contains("login")) {
            chain.doFilter(request, response);
            return;
        }

        String jwt = req.getHeader("token");
        if (!StringUtils.hasLength(jwt)) {
            Result error = Result.error("NOT_LOGIN");
            resp.getWriter().write(JSONObject.toJSONString(error));
            return;
        }

        try {
            JwtUtils.parseJWT(jwt);
            chain.doFilter(request, response);
        } catch (Exception e) {
            Result error = Result.error("NOT_LOGIN");
            resp.getWriter().write(JSONObject.toJSONString(error));
        }
    }

}
```

Enable filter scanning on main class:

```java
@ServletComponentScan
@SpringBootApplication
public class TliasApplication { ... }
```

Login Validation - Interceptor Approach
Interceptor:
```java
@Slf4j
@Component
public class LoginCheckInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        String url = request.getRequestURL().toString();
        if (url.contains("login")) {
            return true;
        }

        String jwt = request.getHeader("token");
        if (!StringUtils.hasLength(jwt)) {
            Result error = Result.error("NOT_LOGIN");
            response.getWriter().write(JSONObject.toJSONString(error));
            return false;
        }

        try {
            JwtUtils.parseJWT(jwt);
            return true;
        } catch (Exception e) {
            Result error = Result.error("NOT_LOGIN");
            response.getWriter().write(JSONObject.toJSONString(error));
            return false;
        }
    }

}
```
Register Interceptor:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private LoginCheckInterceptor loginCheckInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(loginCheckInterceptor)
                .addPathPatterns("/**")
                .excludePathPatterns("/login");
    }
}
```

## Unified Exception Handling: Graceful Error Management <a name="7-unified-exception-handling-graceful-error-management"></a>

Without global handling:

- Controllers full of try/catch
- Inconsistent error responses

With:

```
@RestControllerAdvice
```

You centralize error control.
Cleaner. Safer. Professional.

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public Result handleException(Exception e) {
        log.error("System exception: {}", e.getMessage(), e);
        return Result.error("Operation failed. Please contact administrator.");
    }

    @ExceptionHandler(SQLException.class)
    public Result handleSQLException(SQLException e) {
        log.error("Database exception: {}", e.getMessage(), e);
        return Result.error("Database operation failed");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result handleValidationException(MethodArgumentNotValidException e) {
        BindingResult bindingResult = e.getBindingResult();
        String message = bindingResult.getAllErrors().stream()
                .map(ObjectError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return Result.error(message);
    }
}
```

Global & Local Exception Linkage:

In your service layer, you can throw RuntimeException (or custom exceptions) to trigger the global handler.

Example:

```java
if (deptMapper.findByName(name) != null) {
    throw new RuntimeException("Department name already exists");
}
```

The global handler will catch this exception and return a friendly error message to the client.

You can also define custom exceptions (e.g., BusinessException) and handle them specifically.

Important: If you throw an exception in a transactional method, the transaction will roll back automatically (if configured with rollbackFor).

## Transaction Management: Ensuring Data Consistency <a name="8-transaction-management-ensuring-data-consistency"></a>

Scenario:

Deleting department must also delete employees(involved in multiple sql operations).
If second SQL fails?
Database becomes inconsistent.
Solution:

```
@Transactional(rollbackFor = Exception.class)
```

```java
@Service
public class DeptServiceImpl implements DeptService {

    @Autowired
    private DeptMapper deptMapper;
    @Autowired
    private EmpMapper empMapper;

    @Override
    @Transactional
    public void delete(Integer id) {
        deptMapper.deleteById(id);
        empMapper.deleteByDeptId(id);
    }
}
```

Transaction Attributes

```java
@Transactional(
    rollbackFor = Exception.class,
    timeout = 30,
    propagation = Propagation.REQUIRED
)
```

Propagation Behaviors:

- REQUIRED (default): join existing or create new

- REQUIRES_NEW: always create new transaction

- SUPPORTS: join if exists, else non-transactional

Note: By default, only RuntimeException and Error trigger rollback. Use rollbackFor = Exception.class for all exceptions.

## AOP in Action: Operation Logging <a name="9-aop-in-action-operation-logging"></a>

AOP handles cross-cutting concerns:

- Logging
- Performance monitoring
- Security checks

Log method execution time:

```java
@Slf4j
@Component
@Aspect
public class TimeAspect {

    @Pointcut("execution(* com.itheima.service.impl.*.*(..))")
    private void pt() {}

    @Around("pt()")
    public Object recordTime(ProceedingJoinPoint joinPoint) throws Throwable {
        long begin = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long end = System.currentTimeMillis();
        log.info("Method {} execution time: {}ms",
                 joinPoint.getSignature().getName(), (end - begin));
        return result;
    }
}
```

Custom Annotation for Operation Logging
Annotation:

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Log {
    String value() default "";
}
```

Log Entity:

```java
@Data
public class OperateLog {
    private Integer id;
    private Integer operateUser;
    private LocalDateTime operateTime;
    private String className;
    private String methodName;
    private String methodParams;
    private String returnValue;
    private Long costTime;
}
```

Aspect:

```java
@Slf4j
@Component
@Aspect
public class LogAspect {

    @Autowired
    private OperateLogMapper operateLogMapper;

    @Pointcut("@annotation(com.itheima.anno.Log)")
    private void pt() {}

    @Around("pt()")
    public Object recordLog(ProceedingJoinPoint joinPoint) throws Throwable {
        Integer operateUser = CurrentHolder.getCurrentId();

        long begin = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long end = System.currentTimeMillis();

        OperateLog operateLog = new OperateLog();
        operateLog.setOperateUser(operateUser);
        operateLog.setOperateTime(LocalDateTime.now());
        operateLog.setClassName(joinPoint.getTarget().getClass().getName());
        operateLog.setMethodName(joinPoint.getSignature().getName());
        operateLog.setMethodParams(Arrays.toString(joinPoint.getArgs()));
        operateLog.setReturnValue(result.toString());
        operateLog.setCostTime(end - begin);

        operateLogMapper.insert(operateLog);

        return result;
    }
}
```

Usage:

```java
@DeleteMapping("/{id}")
@Log("Delete department operation")
public Result delete(@PathVariable Integer id) { ... }
```

## Pitfall Diary: Bugs I Encountered <a name="10-pitfall-diary-bugs-i-encountered"></a>

Pitfall 1: @RequestBody Misuse
Problem: Using @RequestBody with GET requests.
Reason: GET has no body.
Solution: Remove @RequestBody; use @RequestParam or path variables.

Pitfall 2: SQL Injection Vulnerability
Problem (unsafe):

```java
@Select("select * from emp where name like '%" + name + "%'")
```

Solution (safe) prevent sql injection:

```java
@Select("select * from emp where name like concat('%', #{name}, '%')")
```

Pitfall 3: Transaction Not Rolling Back
Problem: Checked exceptions don't trigger rollback.
Solution: Add @Transactional(rollbackFor = Exception.class).

Pitfall 4: File Upload Path Issues
Problem: Using relative paths leads to "File not found".
Solution: Use absolute paths or configure in application properties.

```yaml
file:
  upload-path: /Users/username/uploads/
```

Then in code:

```java
@Value("${file.upload-path}")
private String uploadPath;
```

Pitfall 5: Forgetting @RequestParam Default Values
Problem: When page or pageSize are not provided, you get null and cause errors.
Solution: Use @RequestParam(defaultValue = "1") to set defaults.

Pitfall 6: Mismatch Between XML Alias and Interface Return Type
Problem: In MyBatis XML, if you use AS aliases but the result type doesn't match the property names, you'll get null values.
Solution: Ensure aliases match the Java property names exactly, or use resultMap for explicit mapping. (See Advanced MyBatis Mapping)

## Advanced: Statistics & Complex Queries <a name="11-advanced-statistics--complex-queries"></a>

In real projects, you often need to generate statistical reports. This section covers how to design and implement statistics modules using `MyBatis`, including handling dynamic columns, using CASE WHEN, and returning `List<Map<String, Object>>`.

### Understanding `List<Map<String, Object>>` in MyBatis <a name="understanding-listmapstring-object-in-mybatis"></a>

When the structure of the result is not fixed (e.g., dynamic columns), you cannot use a predefined POJO. MyBatis allows you to return a `List<Map<String, Object>>`, where each map represents a row with column names as keys and column values as objects.

Mapper method:

```java
List<Map<String, Object>> getEmployeeStatistics(@Param("deptId") Integer deptId);
```

XML:

```xml
<select id="getEmployeeStatistics" resultType="java.util.Map">
    select
        dept.name as departmentName,
        count(*) as employeeCount,
        avg(age) as averageAge
    from emp
    join dept on emp.dept_id = dept.id
    <where>
        <if test="deptId != null">
            dept.id = #{deptId}
        </if>
    </where>
    group by dept.id
</select>
```

Important:

Use resultType="java.util.Map" (or the fully qualified name).

MyBatis will automatically create a Map for each row, with column names (or aliases) as keys.

This is extremely flexible for reports and charts where the number and names of columns vary.

### Using CASE WHEN in SQL for Conditional Aggregation <a name="using-case-when-in-sql-for-conditional-aggregation"></a>

You can use CASE WHEN inside SQL to create conditional counts or sums.

Example: Count employees by gender per department.

```xml
<select id="countByGenderPerDept" resultType="java.util.Map">
    select
        dept.name as deptName,
        sum(case when emp.gender = 1 then 1 else 0 end) as maleCount,
        sum(case when emp.gender = 2 then 1 else 0 end) as femaleCount
    from emp
    join dept on emp.dept_id = dept.id
    group by dept.id
</select>
```

### Handling Date Formats in Query Results <a name="handling-date-formats-in-query-results"></a>

When returning dates, ensure they are formatted properly for the frontend. You can either:

Format in SQL using DATE_FORMAT(create_time, '%Y-%m-%d') as createDate

Or let MyBatis map to LocalDate and then format in the service/controller.

Strict Date Format Matching: If your frontend expects a specific format (e.g., "yyyy-MM-dd"), make sure to either format in SQL or use Jackson annotations (@JsonFormat) on your POJO.

### MyBatis Alias Strictness <a name="mybatis-alias-strictness"></a>

In XML, when you use AS aliases, they must exactly match the property names of the target Java type (if using resultType) or the column names defined in resultMap. For Map results, aliases become the map keys, so they should be consistent with what the frontend expects.

Example:

```xml
<select id="getSummary" resultType="map">
    select
        count(*) as totalEmployees,
        avg(age) as avgAge
    from emp
</select>
```

The resulting map will have keys "totalEmployees" and "avgAge".

### Using <foreach> for Dynamic IN Clauses in Statistics <a name="using-foreach-for-dynamic-in-clauses-in-statistics"></a>

You might need to filter by multiple department IDs:

```xml
<select id="getStatsForDepts" resultType="map">
    select dept_id, count(*) as cnt
    from emp
    where dept_id in
    <foreach collection="deptIds" item="id" open="(" separator="," close=")">
        #{id}
    </foreach>
    group by dept_id
</select>
```

### LocalDate Comparison in Java (if needed) <a name="localdate-comparison-in-java-if-needed"></a>

Although we usually let SQL handle date comparisons, sometimes you need to compare LocalDate in Java:

```java
if (entryDate.isAfter(LocalDate.now())) {
    // future date logic
}
```

Or compare two LocalDate objects:

```java
if (date1.isEqual(date2)) { ... }
if (date1.isBefore(date2)) { ... }
```

### Complete Example: Employee Trend by Month <a name="complete-example-employee-trend-by-month"></a>

Mapper:

```java
List<Map<String, Object>> getEmployeeTrend(@Param("year") Integer year);
```

XML:

```xml
<select id="getEmployeeTrend" resultType="map">
    select
        month(entrydate) as month,
        count(*) as newHires
    from emp
    where year(entrydate) = #{year}
    group by month(entrydate)
    order by month
</select>
```

Service:

```java
public List<Map<String, Object>> getEmployeeTrend(Integer year) {
    return statsMapper.getEmployeeTrend(year);
}
```

Controller:

```java
@GetMapping("/stats/trend")
public Result trend(@RequestParam(required = false) Integer year) {
    if (year == null) year = LocalDate.now().getYear();
    return Result.success(statsService.getEmployeeTrend(year));
}
```

This returns data that can be directly used by chart libraries.

## Some Thoughts<a name="thoughts"></a>

- Layered architecture
- Clean REST design
- Safe SQL practices
- Authentication patterns
- Transaction control
- AOP logging
- Enterprise-level thinking

## Git Repo link<a name="git"></a>

[Tlias-Web-Management](https://github.com/BODYsuperman/Tlias-Web-Management)
