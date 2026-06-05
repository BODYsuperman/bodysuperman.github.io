---
title: Getting Started with Docker
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

- [Understanding Docker Technology](#understanding-docker-technology)
  - [Application Scenarios of Docker](#application-scenarios-of-docker)
  - [Core Advantages](#core-advantages)
  - [Core Concepts](#core-concepts)
- [Docker vs Virtual Machines](#docker-vs-virtual-machines)
- [Basic Commands](#basic-commands)
- [Docker Data Volumes](#docker-data-volumes)
  - [What is a Data Volume](#what-is-a-data-volume)
  - [Volume Commands](#volume-commands)
  - [Mounting Local Directories](#mounting-local-directories)
- [Docker Networking](#docker-networking)
  - [Default Networks](#default-networks)
  - [Custom Networks](#custom-networks)
- [Building Custom Images](#building-custom-images)
  - [Image Structure](#image-structure)
  - [Dockerfile Syntax](#dockerfile-syntax)
  - [Building Images](#building-images)
- [Docker Compose](#docker-compose)
  - [Basic Syntax](#basic-syntax)
  - [Common Commands](#common-commands)
- [Practical Examples](#practical-examples)
  - [Deploying MySQL](#deploying-mysql)
  - [Deploying a Java Application](#deploying-a-java-application)
- [Best Practices](#best-practices)
- [FAQ](#faq)
- [Summary](#summary)
- [References](#references)

<!--more-->

## Understanding Docker Technology

Docker is a platform designed to help developers build, share, and run container applications. It handles the tedious setup, so you can focus on the code. Docker is an open-source application container engine, built on the [Go](https://go.dev/) programming language and released under the Apache 2.0 license. Docker allows developers to package their applications and dependent packages into a lightweight, portable container, which can then be deployed on any popular Linux machine, and also enables virtualization.

Containers utilize a sandbox mechanism exclusively, with no interfaces between them (similar to apps on an iPhone). More importantly, the performance overhead of containers is extremely low.

### Application Scenarios of Docker

| Scenario                                    | Description                                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Microservices architecture**              | Each service is containerized independently, facilitating management and scalability                         |
| **CI/CD pipeline**                          | Integrate with Jenkins/GitLab CI to achieve automated build and testing                                      |
| **Development environment standardization** | New members can start a full set of dependent services (such as databases and message queues) with one click |
| **Cloud-native foundation**                 | Orchestration tools such as Kubernetes manage container clusters based on Docker                             |

### Core Advantages

| Advantage                      | Description                                                                                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cross-platform consistency** | Address the issue of "it works on my machine" and ensure consistency across development, testing, and production environments                      |
| **Resource efficiency**        | Containers directly share the host kernel, eliminating the need to virtualize the entire operating system, thereby saving memory and CPU resources |
| **Rapid deployment**           | Launch containers in seconds and support automated scaling                                                                                         |
| **Isolation**                  | Each container possesses an independent file system, network, and process space                                                                    |

### Core Concepts

| Concept                 | Description                                                                                                                                                                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Container**           | A lightweight running instance that contains application code, runtime environment, and dependent libraries. It is created based on an image, isolated from other containers, and shares the host operating system kernel (more efficient than virtual machines) |
| **Image**               | A read-only template that defines the runtime environment of a container (such as operating system, software configuration, etc.). It optimizes space and build speed through layered storage                                                                    |
| **Dockerfile**          | A text file that describes how to automatically build an image (such as specifying the base image, installing software, copying files, etc.)                                                                                                                     |
| **Repository/Registry** | A platform for storing and distributing images, such as Docker Hub (the official public registry) or private registries (like Harbor)                                                                                                                            |

## Docker vs Virtual Machines

| Feature              | Virtual Machine                       | Docker Container                      |
| -------------------- | ------------------------------------- | ------------------------------------- |
| Isolation Level      | Hardware-level virtualization         | Operating system-level virtualization |
| Operating System     | Each VM requires a complete OS        | Sharing the host OS kernel            |
| Resource Consumption | Heavyweight, consuming more resources | Lightweight, consuming less resources |
| Startup Time         | Minutes                               | Seconds                               |
| Performance Overhead | Relatively high                       | Close to native performance           |
| Image Size           | GB level                              | MB level                              |

**Architecture Comparison:**

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

### Image Commands

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

### Container Commands

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

### System Commands

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

**Data Volume** is a virtual directory that acts as a bridge between container directories and host directories. It solves several problems:

| Problem                  | Solution                               |
| ------------------------ | -------------------------------------- |
| Data persistence         | Data remains when container is removed |
| Configuration management | Easy to modify configuration files     |
| Static resources         | Serve external static files            |

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

**Important:** Local directories must start with `/` or `./`. Names without these prefixes are treated as volume names.

## Docker Networking

### Default Networks

| Network  | Description                                        |
| -------- | -------------------------------------------------- |
| `bridge` | Default network for containers; provides isolation |
| `host`   | Shares host network stack; no isolation            |
| `none`   | No network connectivity                            |

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

**Key Benefit:** In custom networks, containers can communicate using container names as hostnames:

```bash
# In 'my-network', 'mysql' container can be accessed via 'mysql' hostname
docker run -d --name web --network my-network -e DB_HOST=mysql my-app
```

## Building Custom Images

### Image Structure

Docker images are built in layers:

```
Layer 4: Application Layer    (your jar/code)
Layer 3: Dependencies Layer   (libraries)
Layer 2: Runtime Layer        (JDK/Python/etc)
Layer 1: Base Layer           (OS environment)
```

### Dockerfile Syntax

Common Dockerfile instructions:

| Instruction  | Description               | Example                                   |
| ------------ | ------------------------- | ----------------------------------------- |
| `FROM`       | Base image                | `FROM openjdk:11-jre`                     |
| `ENV`        | Environment variables     | `ENV TZ=Asia/Shanghai`                    |
| `COPY`       | Copy files from host      | `COPY app.jar /app.jar`                   |
| `ADD`        | Copy and extract archives | `ADD config.tar.gz /config`               |
| `RUN`        | Execute commands          | `RUN apt-get update`                      |
| `EXPOSE`     | Expose ports              | `EXPOSE 8080`                             |
| `ENTRYPOINT` | Container startup command | `ENTRYPOINT ["java", "-jar", "/app.jar"]` |
| `CMD`        | Default command arguments | `CMD ["--server.port=8080"]`              |

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

Docker Compose allows you to define and run multi-container applications using a YAML file.

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

**Dockerfile:**

```dockerfile
FROM openjdk:11-jre-slim

ENV TZ=Asia/Shanghai
WORKDIR /app

COPY target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Build and Run:**

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

### Security

1. **Use specific image versions**: Avoid `latest` tag in production; use explicit version numbers
2. **Run as non-root user**: Add `USER` instruction in Dockerfile
   ```dockerfile
   RUN adduser -D appuser
   USER appuser
   ```
3. **Scan images for vulnerabilities**: Use `docker scan` or integrate with CI/CD
4. **Don't embed secrets**: Use environment variables, Docker secrets, or external vaults

### Performance

1. **Leverage build cache**: Order Dockerfile instructions from least to most frequently changing
2. **Minimize layers**: Combine multiple `RUN` commands when logical
3. **Use multi-stage builds**:

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

### Maintenance

1. **Label your images**:
   ```dockerfile
   LABEL maintainer="your-email@example.com"
   LABEL version="1.0"
   LABEL description="My Application"
   ```
2. **Use `.dockerignore`**: Exclude unnecessary files from build context
3. **Set resource limits**: Prevent containers from consuming all resources
4. **Implement health checks**:
   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
     CMD curl -f http://localhost:8080/health || exit 1
   ```

### Production Readiness

| Practice          | Command/Config                          |
| ----------------- | --------------------------------------- |
| Restart policy    | `docker run --restart unless-stopped`   |
| Resource limits   | `docker run --memory=512m --cpus=1.0`   |
| Log rotation      | Configure Docker daemon logging options |
| Network isolation | Use custom networks, not default bridge |

## FAQ

### Q: What is the difference between `COPY` and `ADD` in Dockerfile?

**A:** `COPY` simply copies files from host to container. `ADD` has additional features:

- Can extract local tar archives automatically
- Can download files from URLs

**Recommendation:** Use `COPY` for most cases; use `ADD` only when you need its special features.

### Q: How do I access a container from another machine on the same network?

**A:** Use the host machine's IP address with the mapped port. For example, if the host IP is `192.168.1.100` and you mapped port 8080:

```
http://192.168.1.100:8080
```

### Q: Why is my container exiting immediately?

**A:** Common causes:

1. The foreground process exited (containers stop when the main process stops)
2. Incorrect command or entrypoint
3. Application error on startup

**Debug:** Check logs with `docker logs <container>` or run interactively without `-d` flag.

### Q: How do I persist data when a container is removed?

**A:** Use named volumes or bind mounts:

```bash
# Named volume
docker run -v mydata:/data my-image

# Bind mount
docker run -v /host/path:/container/path my-image
```

### Q: What is the difference between `docker-compose` and `docker compose`?

**A:** `docker-compose` (V1) is the Python-based legacy tool. `docker compose` (V2) is the Go-based plugin integrated into Docker CLI. V2 is now recommended.

### Q: How do I reduce Docker image size?

**A:** Strategies:

1. Use smaller base images (Alpine, Distroless)
2. Use multi-stage builds
3. Remove unnecessary dependencies and cache files
4. Minimize layer count where appropriate

### Q: Can I run GUI applications in Docker?

**A:** Yes, but it's complex. You need to:

- Share X11 socket with the host
- Set appropriate DISPLAY environment variable
- Handle permissions

Generally not recommended for production, but possible for development.

### Q: How do I troubleshoot network connectivity between containers?

**A:** Steps:

1. Ensure containers are on the same network
2. Verify using container names for DNS resolution
3. Use `docker network inspect` to check configuration
4. Use `docker exec` to ping from inside containers

## Summary

Docker revolutionizes application deployment through containerization. Key takeaways:

| Concept              | Key Point                                                    |
| -------------------- | ------------------------------------------------------------ |
| Containers vs VMs    | Containers share host kernel; VMs virtualize hardware        |
| Images vs Containers | Images are blueprints; containers are running instances      |
| Data Persistence     | Use volumes for data that must survive container restarts    |
| Networking           | Custom networks enable service discovery via container names |
| Docker Compose       | Ideal for multi-container application orchestration          |

Docker enables developers to build once and run anywhere, solving the "it works on my machine" problem and streamlining the path from development to production.

## References

1. [Docker Official Documentation](https://docs.docker.com/get-started/)
2. [Docker CLI Reference](https://docs.docker.com/engine/reference/commandline/cli/)
3. [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
4. [Docker Compose Specification](https://docs.docker.com/compose/compose-file/)
5. [Docker Hub](https://hub.docker.com/)
6. [Docker Tutorial - Runoob](https://www.runoob.com/docker/docker-tutorial.html)
