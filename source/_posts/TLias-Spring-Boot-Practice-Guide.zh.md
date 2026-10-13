---
title: TLias Spring Boot 实战指南
lang: zh-CN
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

- [1. 项目概述：什么是 Tlias？](#1-project-overview-what-is-tlias)
  - [1.1 核心技术栈](#core-technology-stack)
  - [1.2 项目架构](#project-architecture)
  - [1.3 项目结构概览](#project-structure-overview)
  - [1.4 数据库设计](#database-design)
- [2. 环境搭建：最难的部分](#2-environment-setup-the-hardest-part)
  - [2.1 关键要点](#key-insight)
  - [2.2 统一响应类](#unified-response-class)
- [3. 部门管理](#3-department-management-first-crud-experience)
- [4. 员工管理：分页与动态 SQL](#4-employee-management-pagination--dynamic-sql)
  - [4.1 分页查询（基础版）](#pagination-query-basic-version)
  - [4.2 使用 PageHelper 插件（推荐）—— 深入解析](#using-pagehelper-plugin-recommended--deep-dive)
  - [4.3 条件分页查询（动态 SQL）—— 进阶细节](#conditional-pagination-query-dynamic-sql--advanced-details)
  - [4.4 批量删除员工 —— XML 中的 ForEach](#batch-delete-employees--foreach-in-xml)
  - [4.5 新增员工](#add-employee)
<!--more-->
- [5. 文件上传：从本地到云端](#5-file-upload-from-local-to-cloud)
- [6. 登录认证：JWT 令牌与拦截器](#6-login-authentication-jwt-tokens--interceptors)
- [7. 统一异常处理：优雅的错误管理](#7-unified-exception-handling-graceful-error-management)
- [8. 事务管理：确保数据一致性](#8-transaction-management-ensuring-data-consistency)
- [9. AOP 实战：操作日志记录](#9-aop-in-action-operation-logging)
- [10. 踩坑日记：我遇到的 Bug](#10-pitfall-diary-bugs-i-encountered)
- [11. 进阶：统计报表与复杂查询](#11-advanced-statistics--complex-queries)
  - [11.1 理解 MyBatis 中的 `List<Map<String, Object>>`](#understanding-listmapstring-object-in-mybatis)
  - [11.2 在 SQL 中使用 CASE WHEN 进行条件聚合](#using-case-when-in-sql-for-conditional-aggregation)
  - [11.3 处理查询结果中的日期格式](#handling-date-formats-in-query-results)
  - [11.4 MyBatis 别名的严格性](#mybatis-alias-strictness)
  - [11.5 在统计中使用 foreach 实现动态 IN 子句](#using-foreach-for-dynamic-in-clauses-in-statistics)
  - [11.6 Java 中的 LocalDate 比较（如需要）](#localdate-comparison-in-java-if-needed)
  - [11.7 完整示例：按月统计员工趋势](#complete-example-employee-trend-by-month)
- [12. 一些思考](#thoughts)
- [13. Git 仓库链接：Tlias-Web-Management](#git)

## 项目概述：什么是 Tlias？ <a name="1-project-overview-what-is-tlias"></a>

TLias 是一个**教学管理系统**，主要管理以下功能：

- 部门管理
- 员工管理
- 身份认证
- 文件上传
- 统计报表

### 核心技术栈 <a name="core-technology-stack"></a>

| 技术         | 用途         | 重要性                             |
| ------------ | ------------ | ---------------------------------- |
| Spring Boot  | Web 框架     | 快速开发，约定优于配置             |
| MyBatis      | ORM 框架     | 精确控制 SQL                       |
| MySQL        | 数据库       | 业界标准的关系型数据库             |
| JWT          | 身份认证     | 无状态登录                         |
| PageHelper   | 分页         | 简洁高效的分页                     |
| Lombok       | 减少样板代码 | 更简洁的代码                       |
| AOP          | 横切关注点   | 日志与监控                         |

### 项目架构 <a name="project-architecture"></a>

```
Frontend (Vue + Element Plus)
↓
Nginx Proxy
↓
Spring Boot Backend
↓
MySQL
```

### 项目结构概览 <a name="project-structure-overview"></a>

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

### 数据库设计 <a name="database-design"></a>

两张核心表：`dept`（部门表）和 `emp`（员工表）

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

提示：设计表时一定要包含 create_time 和 update_time 字段。它们在后续排查问题时非常有价值。

## 环境搭建：最难的部分 <a name="2-environment-setup-the-hardest-part"></a>

创建 Spring Boot 项目
使用 IntelliJ IDEA 创建项目时，选择以下依赖：

```
- Spring Web
- MyBatis Framework
- MySQL Driver
- Lombok
```

配置文件（application.yml）

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

### 关键要点 <a name="key-insight"></a>

```java
map-underscore-to-camel-case: true
```

自动映射：

```
create_time → createTime
```

这个小小的配置省去了大量样板映射代码。

### 统一响应类 <a name="unified-response-class"></a>

为了规范前后端通信，定义统一的返回格式：

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

## 部门管理 <a name="3-department-management-first-crud-experience"></a>

这个模块帮助你全面理解：

```
Controller → Service → Mapper → Database
```

| 层级       | 职责         |
| ---------- | ------------ |
| Controller | 处理 HTTP    |
| Service    | 业务逻辑     |
| Mapper     | SQL 执行     |

永远不要在 Controller 中写 SQL。
永远不要在 Service 中写 HTTP 逻辑。

这就是专业的分层设计。

REST 设计核心原则

- GET → 查询

- POST → 创建

- PUT → 更新

- DELETE → 删除

查询所有部门
需求：查询所有部门信息，按更新时间降序排列。

Controller 层：

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

Service 层：

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

Mapper 层：

```java
@Mapper
public interface DeptMapper {
    @Select("select id, name, create_time, update_time from dept order by update_time desc")
    List<Dept> list();
}
```

要点：

@RestController = @Controller + @ResponseBody，返回 JSON 数据

@RequestMapping("/depts") 提取公共路径，避免重复

@Slf4j 是 Lombok 的日志注解，比 System.out.println() 更规范

删除部门
需求：根据 ID 删除部门。

Controller 层：

```java
@DeleteMapping("/{id}")
public Result delete(@PathVariable Integer id) {
    log.info("Deleting department with ID: {}", id);
    deptService.delete(id);
    return Result.success();
}
```

Service 层：

```java
@Override
public void delete(Integer id) {
    deptMapper.deleteById(id);
}
```

Mapper 层：

```java
@Delete("delete from dept where id = #{id}")
void deleteById(Integer id);
```

重要：@PathVariable 注解从 URL 路径中提取参数。确保变量名与路径变量名一致，或者显式指定，如 @PathVariable("id") Integer deptId。（参见路径变量绑定）

新增部门
需求：新增一个部门，设置创建时间和更新时间。

Controller 层：

```java
@PostMapping
public Result add(@RequestBody Dept dept) {
    log.info("Adding department: {}", dept);
    deptService.add(dept);
    return Result.success();
}
```

Service 层：

```java
@Override
public void add(Dept dept) {
    // Fill in basic attributes
    dept.setCreateTime(LocalDateTime.now());
    dept.setUpdateTime(LocalDateTime.now());
    deptMapper.insert(dept);
}
```

Mapper 层：

```java
@Insert("insert into dept(name, create_time, update_time) " +
        "values(#{name}, #{createTime}, #{updateTime})")
void insert(Dept dept);
```

要点：

@RequestBody 接收前端传来的 JSON 数据

前端只传 name；我们在 Service 层设置 createTime 和 updateTime

修改部门
查询回显：

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

更新数据：

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

注意：只更新 name 和 update_time；create_time 保持不变。

## 员工管理：分页与动态 SQL <a name="4-employee-management-pagination--dynamic-sql"></a>

员工管理相对复杂，因为数据量较大，需要分页和条件筛选。

### 分页查询（基础版） <a name="pagination-query-basic-version"></a>

定义 PageBean 类：

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageBean {
    private Long total;      // Total record count
    private List<Emp> rows;  // Current page data
}
```

Controller 层：

```java
@GetMapping
public Result page(@RequestParam(defaultValue = "1") Integer page,
                   @RequestParam(defaultValue = "10") Integer pageSize) {
    log.info("Pagination query: page={}, pageSize={}", page, pageSize);
    PageBean pageBean = empService.page(page, pageSize);
    return Result.success(pageBean);
}
```

Service 层（手动分页）：

```java
@Override
public PageBean page(Integer page, Integer pageSize) {
    Integer start = (page - 1) * pageSize;
    Long total = empMapper.count();
    List<Emp> rows = empMapper.page(start, pageSize);
    return new PageBean(total, rows);
}
```

Mapper 层：

```java
@Select("select count(*) from emp")
Long count();

@Select("select * from emp order by update_time desc limit #{start}, #{pageSize}")
List<Emp> page(Integer start, Integer pageSize);
```

### 使用 PageHelper 插件（推荐）—— 深入解析 <a name="using-pagehelper-plugin-recommended--deep-dive"></a>

在 pom.xml 中添加依赖：

```xml
<dependency>
    <groupId>com.github.pagehelper</groupId>
    <artifactId>pagehelper-spring-boot-starter</artifactId>
    <version>1.4.7</version>
</dependency>
```

Service 层（插件版）：

```java
@Override
public PageBean page(Integer page, Integer pageSize) {
    PageHelper.startPage(page, pageSize);
    List<Emp> empList = empMapper.list();
    Page<Emp> p = (Page<Emp>) empList;
    return new PageBean(p.getTotal(), p.getResult());
}
```

Mapper 层：

```java
@Select("select * from emp order by update_time desc")
List<Emp> list();
```

要点（PageHelper 理解）：

PageHelper.startPage(page, pageSize) 使用 ThreadLocal 存储分页参数。下一次 MyBatis 查询（即调用此方法后的第一次查询）会自动追加 LIMIT 子句。

它只影响调用后的第一条 SQL 语句。如果执行多条查询，只有第一条会被分页。

返回的 List 实际上是一个 Page 对象（ArrayList 的子类），其中包含总记录数、页码等分页信息。你可以进行类型转换，也可以直接当作列表使用。

重要：确保 PageHelper.startPage() 在紧挨着执行实际数据查询的 mapper 方法之前调用。中间不要插入其他数据库操作。

对于条件查询，同样先调用 PageHelper.startPage()，再调用动态 SQL 方法；插件会自动为该查询添加 LIMIT。

### 条件分页查询（动态 SQL）—— 进阶细节 <a name="conditional-pagination-query-dynamic-sql--advanced-details"></a>

Controller 层：

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

Service 层：

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

Mapper XML（EmpMapper.xml）：

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

重要 —— 动态 SQL 细节：

<where> 标签：当条件成立时，自动去除第一个 AND 或 OR。确保 SQL 语法正确。

<if> 标签：test 属性是 OGNL 表达式。需要注意：

字符串比较：name != null and name != ''

数值比较：gender != null

日期比较：begin 和 end 都必须非空才能进行范围查询。

#{} vs ${}：始终使用 #{} 作为参数占位符。它会生成预编译语句（PreparedStatement），防止 SQL 注入。${} 是字面量替换（例如用于表名），对于用户输入应避免使用。

模糊匹配：使用 concat('%', #{name}, '%') 而非 '%${name}%' 来避免 SQL 注入。这是最安全的方式。

LocalDate 比较：在 SQL 中，between #{begin} and #{end} 可以直接使用，因为 MyBatis 在绑定参数时会自动将 LocalDate 转换为 java.sql.Date。无需特殊处理。

空字符串处理：如果 name 是空字符串，条件 name != '' 为 false，该条件不会被拼入。这通常是期望的行为。

### 批量删除员工 —— XML 中的 ForEach <a name="batch-delete-employees--foreach-in-xml"></a>

Controller：

```java
@DeleteMapping("/{ids}")
public Result delete(@PathVariable List<Integer> ids) {
    log.info("Batch deleting employees: {}", ids);
    empService.delete(ids);
    return Result.success();
}
```

Mapper XML：

```xml
<delete id="delete">
    delete from emp where id in
    <foreach collection="ids" item="id" open="(" separator="," close=")">
        #{id}
    </foreach>
</delete>
```

ForEach 详解：

collection：列表/数组参数的名称。可以是 list、array，或者使用 @Param 注解指定的自定义名称。
item：迭代过程中每个元素的别名。
open、close：在整个集合前后添加的字符串。
separator：每次迭代之间的分隔符。
你也可以使用 <foreach> 进行批量插入：

```xml
<insert id="batchInsert">
    insert into emp (name, gender) values
    <foreach collection="list" item="emp" separator=",">
        (#{emp.name}, #{emp.gender})
    </foreach>
</insert>
```

### 新增员工 <a name="add-employee"></a>

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

## 文件上传：从本地到云端 <a name="5-file-upload-from-local-to-cloud"></a>

本地存储方案
Controller：

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

配置：

```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 100MB
```

注意：本地存储不建议用于生产环境，推荐使用云存储方案，例如：

- AWS S3
- GCP Cloud Storage
- 阿里云 OSS

为什么？

- 可扩展性
- 冗余备份
- 容灾恢复

阿里云 OSS（推荐）
依赖：

```xml
<dependency>
    <groupId>com.aliyun.oss</groupId>
    <artifactId>aliyun-sdk-oss</artifactId>
    <version>3.15.1</version>
</dependency>
```

配置（application.yml）：

```yaml
aliyun:
  oss:
    endpoint: https://oss-cn-beijing.aliyuncs.com
    access-key-id: your-access-key-id
    access-key-secret: your-access-key-secret
    bucket-name: your-bucket-name
```

工具类：

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

Controller：

```java
@Autowired
private AliOSSUtils aliOSSUtils;

@PostMapping("/upload")
public Result upload(MultipartFile image) throws IOException {
    String url = aliOSSUtils.upload(image);
    return Result.success(url);
}
```

## 登录认证：JWT 令牌与拦截器 <a name="6-login-authentication-jwt-tokens--interceptors"></a>

JWT 流程

- 1.用户登录
- 2.服务端生成 JWT
- 3.客户端存储 token
- 4.每次请求携带 token
- 5.后端验证 token

为什么拦截器优于过滤器？

| 过滤器（Filter） | 拦截器（Interceptor） |
| ---------------- | --------------------- |
| Servlet 级别     | Spring 级别           |
| 灵活性较低       | 更强的控制力          |
| 管理较复杂       | 推荐使用              |

拦截器与 Spring MVC 的集成更好！

JWT 工具类

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

登录功能
Controller：

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

Service 和 Mapper：

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

登录校验 - 过滤器方式
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

在主类上启用过滤器扫描：

```java
@ServletComponentScan
@SpringBootApplication
public class TliasApplication { ... }
```

登录校验 - 拦截器方式
拦截器：
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
注册拦截器：

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

## 统一异常处理：优雅的错误管理 <a name="7-unified-exception-handling-graceful-error-management"></a>

没有全局处理时：

- Controller 中到处是 try/catch
- 错误响应格式不统一

使用：

```
@RestControllerAdvice
```

你可以集中管理错误控制。
更简洁。更安全。更专业。

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

全局异常与局部异常的联动：

在 Service 层中，你可以抛出 RuntimeException（或自定义异常）来触发全局处理器。

示例：

```java
if (deptMapper.findByName(name) != null) {
    throw new RuntimeException("Department name already exists");
}
```

全局处理器会捕获该异常并向客户端返回友好的错误信息。

你也可以定义自定义异常（例如 BusinessException）并进行针对性处理。

重要：如果在事务方法中抛出异常，事务会自动回滚（前提是配置了 rollbackFor）。

## 事务管理：确保数据一致性 <a name="8-transaction-management-ensuring-data-consistency"></a>

场景：

删除部门时必须同时删除员工（涉及多条 SQL 操作）。
如果第二条 SQL 失败了怎么办？
数据库就会数据不一致。
解决方案：

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

事务属性

```java
@Transactional(
    rollbackFor = Exception.class,
    timeout = 30,
    propagation = Propagation.REQUIRED
)
```

传播行为：

- REQUIRED（默认）：加入已有事务，若无则创建新事务

- REQUIRES_NEW：始终创建新事务

- SUPPORTS：有事务则加入，否则以非事务方式运行

注意：默认情况下，只有 RuntimeException 和 Error 会触发回滚。使用 rollbackFor = Exception.class 可以确保所有异常都触发回滚。

## AOP 实战：操作日志记录 <a name="9-aop-in-action-operation-logging"></a>

AOP 处理横切关注点：

- 日志记录
- 性能监控
- 安全检查

记录方法执行时间：

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

自定义注解实现操作日志
注解：

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Log {
    String value() default "";
}
```

日志实体：

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

切面：

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

使用方式：

```java
@DeleteMapping("/{id}")
@Log("Delete department operation")
public Result delete(@PathVariable Integer id) { ... }
```

## 踩坑日记：我遇到的 Bug <a name="10-pitfall-diary-bugs-i-encountered"></a>

踩坑 1：@RequestBody 误用
问题：在 GET 请求中使用 @RequestBody。
原因：GET 请求没有请求体。
解决方案：移除 @RequestBody；使用 @RequestParam 或路径变量。

踩坑 2：SQL 注入漏洞
问题（不安全）：

```java
@Select("select * from emp where name like '%" + name + "%'")
```

解决方案（安全）防止 SQL 注入：

```java
@Select("select * from emp where name like concat('%', #{name}, '%')")
```

踩坑 3：事务不回滚
问题：受检异常（Checked Exception）不会触发回滚。
解决方案：添加 @Transactional(rollbackFor = Exception.class)。

踩坑 4：文件上传路径问题
问题：使用相对路径导致"文件未找到"。
解决方案：使用绝对路径或在 application 配置文件中配置。

```yaml
file:
  upload-path: /Users/username/uploads/
```

然后在代码中使用：

```java
@Value("${file.upload-path}")
private String uploadPath;
```

踩坑 5：忘记 @RequestParam 默认值
问题：当 page 或 pageSize 未传入时，得到 null 并引发错误。
解决方案：使用 @RequestParam(defaultValue = "1") 设置默认值。

踩坑 6：XML 别名与接口返回类型不匹配
问题：在 MyBatis XML 中，如果使用了 AS 别名但结果类型与属性名不匹配，会得到 null 值。
解决方案：确保别名与 Java 属性名完全一致，或使用 resultMap 进行显式映射。（参见高级 MyBatis 映射）

## 进阶：统计报表与复杂查询 <a name="11-advanced-statistics--complex-queries"></a>

在实际项目中，你经常需要生成统计报表。本节介绍如何使用 `MyBatis` 设计和实现统计模块，包括处理动态列、使用 CASE WHEN 以及返回 `List<Map<String, Object>>`。

### 理解 MyBatis 中的 `List<Map<String, Object>>` <a name="understanding-listmapstring-object-in-mybatis"></a>

当结果结构不固定时（例如动态列），你无法使用预定义的 POJO。MyBatis 允许你返回 `List<Map<String, Object>>`，其中每个 Map 代表一行数据，列名作为键，列值作为值。

Mapper 方法：

```java
List<Map<String, Object>> getEmployeeStatistics(@Param("deptId") Integer deptId);
```

XML：

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

重要：

使用 resultType="java.util.Map"（或完整限定名）。

MyBatis 会自动为每一行创建一个 Map，以列名（或别名）作为键。

这对于列的数量和名称会变化的报表和图表来说非常灵活。

### 在 SQL 中使用 CASE WHEN 进行条件聚合 <a name="using-case-when-in-sql-for-conditional-aggregation"></a>

你可以在 SQL 中使用 CASE WHEN 来实现条件计数或求和。

示例：按部门统计各性别的员工数量。

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

### 处理查询结果中的日期格式 <a name="handling-date-formats-in-query-results"></a>

返回日期时，确保格式适合前端使用。你可以：

在 SQL 中使用 DATE_FORMAT(create_time, '%Y-%m-%d') as createDate 进行格式化

或者让 MyBatis 映射为 LocalDate，然后在 Service/Controller 中格式化。

严格的日期格式匹配：如果前端期望特定格式（例如 "yyyy-MM-dd"），请确保在 SQL 中格式化，或在 POJO 上使用 Jackson 注解（@JsonFormat）。

### MyBatis 别名的严格性 <a name="mybatis-alias-strictness"></a>

在 XML 中，当你使用 AS 别名时，别名必须与目标 Java 类型的属性名（使用 resultType 时）或 resultMap 中定义的列名完全匹配。对于 Map 结果，别名会成为 Map 的键，因此应与前端期望的字段名保持一致。

示例：

```xml
<select id="getSummary" resultType="map">
    select
        count(*) as totalEmployees,
        avg(age) as avgAge
    from emp
</select>
```

结果 Map 的键将是 "totalEmployees" 和 "avgAge"。

### 在统计中使用 <foreach> 实现动态 IN 子句 <a name="using-foreach-for-dynamic-in-clauses-in-statistics"></a>

你可能需要按多个部门 ID 进行筛选：

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

### Java 中的 LocalDate 比较（如需要） <a name="localdate-comparison-in-java-if-needed"></a>

虽然我们通常让 SQL 处理日期比较，但有时你需要在 Java 中比较 LocalDate：

```java
if (entryDate.isAfter(LocalDate.now())) {
    // future date logic
}
```

或比较两个 LocalDate 对象：

```java
if (date1.isEqual(date2)) { ... }
if (date1.isBefore(date2)) { ... }
```

### 完整示例：按月统计员工趋势 <a name="complete-example-employee-trend-by-month"></a>

Mapper：

```java
List<Map<String, Object>> getEmployeeTrend(@Param("year") Integer year);
```

XML：

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

Service：

```java
public List<Map<String, Object>> getEmployeeTrend(Integer year) {
    return statsMapper.getEmployeeTrend(year);
}
```

Controller：

```java
@GetMapping("/stats/trend")
public Result trend(@RequestParam(required = false) Integer year) {
    if (year == null) year = LocalDate.now().getYear();
    return Result.success(statsService.getEmployeeTrend(year));
}
```

返回的数据可以直接供图表库使用。

## 一些思考<a name="thoughts"></a>

- 分层架构
- 规范的 REST 设计
- 安全的 SQL 实践
- 身份认证模式
- 事务控制
- AOP 日志记录
- 企业级思维

## Git 仓库链接<a name="git"></a>

[Tlias-Web-Management](https://github.com/BODYsuperman/Tlias-Web-Management)
