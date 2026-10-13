---
title: Docker 入门
lang: zh-CN
date: 2026-04-19 12:48:28
updated: 2026-06-05 00:00:00
comments: true
categories:
  - Docker
  - Backend Development
  - DevOps
tags:
  - Docker Network
  - Docker Compose
  - Containerization
  - MySQL
  - Nacos
  - Hands-on Tutorial
  - Microservices Architecture
---

- [了解 Docker 技术](#understanding-docker-technology)
  - [Docker 的应用场景](#application-scenarios-of-docker)
  - [核心优势](#core-advantages)
  - [核心概念](#core-concepts)
- [Docker 与虚拟机对比](#docker-vs-virtual-machines)
- [基础命令](#basic-commands)
- [Docker 数据卷](#docker-data-volumes)
  - [什么是数据卷](#what-is-a-data-volume)
  - [数据卷命令](#volume-commands)
  - [挂载本地目录](#mounting-local-directories)
- [Docker 网络](#docker-networking)
  - [默认网络](#default-networks)
  - [自定义网络](#custom-networks)
- [构建自定义镜像](#building-custom-images)
  - [镜像结构](#image-structure)
  - [Dockerfile 语法](#dockerfile-syntax)
  - [构建镜像](#building-images)
- [Docker Compose](#docker-compose)
  - [基本语法](#basic-syntax)
  - [常用命令](#common-commands)
- [实战示例](#practical-examples)
  - [部署 MySQL](#deploying-mysql)
  - [部署 Java 应用](#deploying-a-java-application)
- [最佳实践](#best-practices)
- [常见问题](#faq)
- [总结](#summary)
- [参考资料](#references)

<!--more-->

## Understanding Docker Technology

Docker 是一个旨在帮助开发者构建、共享和运行容器化应用的平台。它处理了繁琐的环境配置工作，让你可以专注于代码。Docker 是一个开源的应用容器引擎，基于 [Go](https://go.dev/) 编程语言构建，并在 Apache 2.0 许可证下发布。Docker 允许开发者将应用及其依赖包打包到一个轻量级、可移植的容器中，然后可以部署到任何主流的 Linux 机器上，同时也实现了虚拟化。

容器完全使用沙箱机制，彼此之间没有任何接口（类似于 iPhone 上的应用程序）。更重要的是，容器的性能开销极低。

### Application Scenarios of Docker

| 场景             | 描述                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| **微服务架构**   | 每个服务独立容器化，便于管理和扩展                                     |
| **CI/CD 流水线** | 与 Jenkins/GitLab CI 集成，实现自动化构建和测试                        |
| **开发环境统一** | 新成员可以一键启动全套依赖服务（如数据库、消息队列）                   |
| **云原生基础**   | Kubernetes 等编排工具基于 Docker 管理容器集群                          |

### Core Advantages

| 优势               | 描述                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------ |
| **跨平台一致性**   | 解决"在我机器上能跑"的问题，确保开发、测试、生产环境的一致性                               |
| **资源高效**       | 容器直接共享宿主机内核，无需虚拟化整个操作系统，从而节省内存和 CPU 资源                     |
| **快速部署**       | 秒级启动容器，支持自动化弹性伸缩                                                           |
| **隔离性**         | 每个容器拥有独立的文件系统、网络和进程空间                                                   |

### Core Concepts

| 概念                    | 描述                                                                                                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **容器（Container）**   | 轻量级的运行实例，包含应用代码、运行时环境和依赖库。基于镜像创建，与其他容器隔离，共享宿主机操作系统内核（比虚拟机更高效）                                                                                                 |
| **镜像（Image）**       | 只读模板，定义了容器的运行时环境（如操作系统、软件配置等）。通过分层存储优化空间和构建速度                                                                                                                                 |
| **Dockerfile**          | 文本文件，描述如何自动构建镜像（如指定基础镜像、安装软件、复制文件等）                                                                                                                                                     |
| **仓库（Registry）**    | 存储和分发镜像的平台，如 Docker Hub（官方公共仓库）或私有仓库（如 Harbor）                                                                                                                                                 |

## Docker vs Virtual Machines

| 特性         | 虚拟机                       | Docker 容器                   |
| ------------ | ---------------------------- | ----------------------------- |
| 隔离级别     | 硬件级虚拟化                 | 操作系统级虚拟化              |
| 操作系统     | 每个虚拟机需要完整的操作系统 | 共享宿主机操作系统内核        |
| 资源消耗     | 重量级，消耗更多资源         | 轻量级，消耗较少资源          |
| 启动时间     | 分钟级                       | 秒级                          |
| 性能开销     | 较高                         | 接近原生性能                  |
| 镜像大小     | GB 级别                      | MB 级别                       |

**架构对比：**

```
Traditional VMs:                    Docker Containers:
┌─────────────────┐                ┌─────────────────┐
│   App A         │                │   App A         │
│   Bin/Libs      │                │   App B         │
│   Guest OS      │                │   App C         │
├─────────────────┤                ├─────────────────┤
│   Hypervisor    │                │   Docker Engine │
├─────────────────┤                ├─────────────────┤
│   Host OS       │                │   Host OS       │
├─────────────────┤                ├─────────────────┤
│   Infrastructure│                │   Infrastructure│
└─────────────────┘                └─────────────────┘
```

## Basic Commands

### 镜像命令

```bash
# Pull an image (such as the official Nginx image)
docker pull nginx

# Pull a specific version
docker pull nginx:1.24

# View local images
docker images

# Remove an image
docker rmi nginx

# Build image from Dockerfile
docker build -t my-app:1.0 .
```

### 容器命令

```bash
# Run a container (-d for detached, -p for port mapping)
docker run -d -p 80:80 --name my-nginx nginx

# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Start/Stop/Restart containers
docker start my-nginx
docker stop my-nginx
docker restart my-nginx

# Remove a container
docker rm my-nginx

# Force remove a running container
docker rm -f my-nginx

# Enter a running container
docker exec -it my-nginx /bin/bash

# View container logs
docker logs my-nginx

# View container details
docker inspect my-nginx
```

### 系统命令

```bash
# View Docker system usage
docker system df

# Clean up unused resources
docker system prune

# View Docker info
docker info
```

## Docker Data Volumes

### What is a Data Volume

**数据卷（Data Volume）** 是一个虚拟目录，充当容器目录与宿主机目录之间的桥梁。它解决了以下问题：

| 问题           | 解决方案                     |
| -------------- | ---------------------------- |
| 数据持久化     | 容器删除后数据仍然保留       |
| 配置管理       | 方便修改配置文件             |
| 静态资源       | 提供外部静态文件服务         |

### Volume Commands

```bash
# Create a volume
docker volume create my-volume

# List volumes
docker volume ls

# Inspect a volume
docker volume inspect my-volume

# Remove a volume
docker volume rm my-volume

# Mount volume when running container
docker run -d --name nginx -p 80:80 -v html:/usr/share/nginx/html nginx
```

### Mounting Local Directories

```bash
# Mount local directory (use absolute path or ./)
docker run -d \
  --name mysql \
  -p 3306:3306 \
  -e TZ=Asia/Shanghai \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -v ./mysql/data:/var/lib/mysql \
  -v ./mysql/conf:/etc/mysql/conf.d \
  mysql:8.0
```

**重要提示：** 本地目录必须以 `/` 或 `./` 开头。没有这些前缀的名称会被视为数据卷名称。

## Docker Networking

### Default Networks

| 网络       | 描述                                 |
| ---------- | ------------------------------------ |
| `bridge`   | 容器的默认网络；提供隔离             |
| `host`     | 共享宿主机网络栈；无隔离             |
| `none`     | 无网络连接                           |

### Custom Networks

```bash
# Create a custom network
docker network create my-network

# List networks
docker network ls

# Connect container to network
docker network connect my-network my-container

# Run container with network
docker run -d --name app --network my-network my-image

# Inspect network
docker network inspect my-network
```

**关键优势：** 在自定义网络中，容器可以使用容器名作为主机名进行通信：

```bash
# In 'my-network', 'mysql' container can be accessed via 'mysql' hostname
docker run -d --name web --network my-network -e DB_HOST=mysql my-app
```

## Building Custom Images

### Image Structure

Docker 镜像分层构建：

```
Layer 4: Application Layer    (your jar/code)
Layer 3: Dependencies Layer   (libraries)
Layer 2: Runtime Layer        (JDK/Python/etc)
Layer 1: Base Layer           (OS environment)
```

### Dockerfile Syntax

常用 Dockerfile 指令：

| 指令         | 描述               | 示例                                      |
| ------------ | ------------------ | ----------------------------------------- |
| `FROM`       | 基础镜像           | `FROM openjdk:11-jre`                     |
| `ENV`        | 环境变量           | `ENV TZ=Asia/Shanghai`                    |
| `COPY`       | 从宿主机复制文件   | `COPY app.jar /app.jar`                   |
| `ADD`        | 复制并解压归档文件 | `ADD config.tar.gz /config`               |
| `RUN`        | 执行命令           | `RUN apt-get update`                      |
| `EXPOSE`     | 暴露端口           | `EXPOSE 8080`                             |
| `ENTRYPOINT` | 容器启动命令       | `ENTRYPOINT ["java", "-jar", "/app.jar"]` |
| `CMD`        | 默认命令参数       | `CMD ["--server.port=8080"]`              |

### Building Images

```bash
# Build from Dockerfile in current directory
docker build -t my-app:1.0 .

# Build with specific Dockerfile
docker build -f Dockerfile.prod -t my-app:prod .

# Build without cache
docker build --no-cache -t my-app:1.0 .
```

## Docker Compose

Docker Compose 允许你使用 YAML 文件来定义和运行多容器应用。

### Basic Syntax

```yaml
version: "3.8"

services:
  mysql:
    image: mysql:8.0
    container_name: mysql
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: 123456
      TZ: Asia/Shanghai
    volumes:
      - ./mysql/data:/var/lib/mysql
    networks:
      - my-network

  app:
    build: .
    container_name: my-app
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    networks:
      - my-network

networks:
  my-network:
    driver: bridge

volumes:
  mysql_data:
```

### Common Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Scale specific service
docker compose up -d --scale web=3

# Build images
docker compose build

# Pull latest images
docker compose pull
```

## Practical Examples

### Deploying MySQL

```bash
docker run -d \
  --name mysql \
  -p 3306:3306 \
  -e TZ=Asia/Shanghai \
  -e MYSQL_ROOT_PASSWORD=YourStrongPassword \
  -v ./mysql/data:/var/lib/mysql \
  -v ./mysql/conf:/etc/mysql/conf.d \
  --restart unless-stopped \
  mysql:8.0
```

### Deploying a Java Application

**Dockerfile：**

```dockerfile
FROM openjdk:11-jre-slim

ENV TZ=Asia/Shanghai
WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

**构建和运行：**

```bash
# Build image
docker build -t my-java-app:1.0 .

# Run container
docker run -d \
  --name my-app \
  -p 8080:8080 \
  --network my-network \
  --restart unless-stopped \
  my-java-app:1.0
```

## Best Practices

### 安全

1. **使用特定版本的镜像**：生产环境中避免使用 `latest` 标签；使用明确的版本号
2. **以非 root 用户运行**：在 Dockerfile 中添加 `USER` 指令
   ```dockerfile
   RUN adduser -D appuser
   USER appuser
   ```
3. **扫描镜像漏洞**：使用 `docker scan` 或集成到 CI/CD 流程中
4. **不要嵌入密钥**：使用环境变量、Docker secrets 或外部密钥管理服务

### 性能

1. **利用构建缓存**：按从最少变化到最频繁变化的顺序排列 Dockerfile 指令
2. **减少镜像层数**：在合理的情况下合并多个 `RUN` 命令
3. **使用多阶段构建**：

   ```dockerfile
   # Build stage
   FROM maven:3.8-openjdk-11 AS build
   COPY . .
   RUN mvn clean package

   # Runtime stage
   FROM openjdk:11-jre-slim
   COPY --from=build /app/target/*.jar app.jar
   ENTRYPOINT ["java", "-jar", "app.jar"]
   ```

### 维护

1. **为镜像添加标签**：
   ```dockerfile
   LABEL maintainer="your-email@example.com"
   LABEL version="1.0"
   LABEL description="My Application"
   ```
2. **使用 `.dockerignore`**：排除构建上下文中不必要的文件
3. **设置资源限制**：防止容器消耗所有资源
4. **实施健康检查**：
   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
     CMD curl -f http://localhost:8080/health || exit 1
   ```

### 生产就绪

| 实践           | 命令/配置                             |
| -------------- | ------------------------------------- |
| 重启策略       | `docker run --restart unless-stopped` |
| 资源限制       | `docker run --memory=512m --cpus=1.0` |
| 日志轮转       | 配置 Docker daemon 日志选项           |
| 网络隔离       | 使用自定义网络，而非默认 bridge       |

## FAQ

### 问：Dockerfile 中 `COPY` 和 `ADD` 有什么区别？

**答：** `COPY` 只是将文件从宿主机复制到容器中。`ADD` 有额外的功能：

- 可以自动解压本地的 tar 归档文件
- 可以从 URL 下载文件

**建议：** 大多数情况下使用 `COPY`；仅在需要特殊功能时才使用 `ADD`。

### 问：如何从同一网络的另一台机器访问容器？

**答：** 使用宿主机的 IP 地址和映射的端口。例如，宿主机 IP 为 `192.168.1.100` 且映射了 8080 端口：

```
http://192.168.1.100:8080
```

### 问：为什么我的容器启动后立即退出？

**答：** 常见原因：

1. 前台进程退出（主进程停止时容器也会停止）
2. 命令或入口点配置错误
3. 应用启动时出错

**调试方法：** 使用 `docker logs <container>` 查看日志，或不带 `-d` 参数以交互方式运行。

### 问：容器删除后如何持久化数据？

**答：** 使用命名数据卷（named volumes）或绑定挂载（bind mounts）：

```bash
# Named volume
docker run -v mydata:/data my-image

# Bind mount
docker run -v /host/path:/container/path my-image
```

### 问：`docker-compose` 和 `docker compose` 有什么区别？

**答：** `docker-compose`（V1）是基于 Python 的旧版工具。`docker compose`（V2）是基于 Go 的插件，集成在 Docker CLI 中。现在推荐使用 V2。

### 问：如何减小 Docker 镜像大小？

**答：** 策略：

1. 使用更小的基础镜像（Alpine、Distroless）
2. 使用多阶段构建
3. 删除不必要的依赖和缓存文件
4. 在合理范围内减少镜像层数

### 问：能在 Docker 中运行 GUI 应用吗？

**答：** 可以，但比较复杂。你需要：

- 与宿主机共享 X11 socket
- 设置适当的 DISPLAY 环境变量
- 处理权限问题

通常不建议在生产环境中使用，但开发环境中可行。

### 问：如何排查容器之间的网络连通性问题？

**答：** 步骤：

1. 确保容器在同一网络中
2. 验证使用容器名进行 DNS 解析
3. 使用 `docker network inspect` 检查配置
4. 使用 `docker exec` 从容器内部执行 ping 测试

## Summary

Docker 通过容器化技术革新了应用部署方式。关键要点：

| 概念             | 要点                                               |
| ---------------- | -------------------------------------------------- |
| 容器 vs 虚拟机   | 容器共享宿主机内核；虚拟机虚拟化硬件               |
| 镜像 vs 容器     | 镜像是蓝图；容器是运行中的实例                     |
| 数据持久化       | 使用数据卷保存需要在容器重启后保留的数据           |
| 网络             | 自定义网络支持通过容器名进行服务发现               |
| Docker Compose   | 适合多容器应用编排                                 |

Docker 让开发者能够一次构建、到处运行，解决了"在我机器上能跑"的问题，简化了从开发到生产的路径。

## References

1. [Docker 官方文档](https://docs.docker.com/get-started/)
2. [Docker CLI 参考](https://docs.docker.com/engine/reference/commandline/cli/)
3. [Dockerfile 参考](https://docs.docker.com/engine/reference/builder/)
4. [Docker Compose 规范](https://docs.docker.com/compose/compose-file/)
5. [Docker Hub](https://hub.docker.com/)
6. [Docker 教程 - 菜鸟教程](https://www.runoob.com/docker/docker-tutorial.html)
