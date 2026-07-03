# Docker 从零到部署课程

这套课程面向已经会使用命令行、但还没有系统学习 Docker 的学习者。课程按“单容器运行 → 自定义镜像 → 数据与网络 → Compose 多服务 → 调试与生产化 → 远程部署流程”递进设计。

## 课程结构

| 课次 | 主题 | 目录 | 学完你会 |
| --- | --- | --- | --- |
| 01 | Docker 基础运行 | [lessons/01-basic-run](lessons/01-basic-run/README.md) | 理解镜像、容器、端口、日志和清理命令 |
| 02 | 镜像与 Dockerfile | [lessons/02-image-dockerfile](lessons/02-image-dockerfile/README.md) | 编写 Dockerfile、构建镜像、使用 `.dockerignore` |
| 03 | 数据卷与网络 | [lessons/03-volumes-networking](lessons/03-volumes-networking/README.md) | 使用 volume 持久化数据、用自定义网络连接容器 |
| 04 | Compose 多服务 | [lessons/04-compose-multi-service](lessons/04-compose-multi-service/README.md) | 用 Compose 管理 Web + 缓存等多服务应用 |
| 05 | 调试与生产化 | [lessons/05-debug-production](lessons/05-debug-production/README.md) | 使用日志、exec、健康检查、多阶段构建与非 root 用户 |
| 06 | 远程服务器部署流程 | [lessons/06-remote-deploy](lessons/06-remote-deploy/README.md) | 准备远程部署模板、发布清单和回滚步骤（不实际 SSH） |

## 本地验证

每课都有自己的 `validate.sh`，可以独立运行。总验证命令：

```bash
cd docker
./scripts/validate-all.sh
```

默认验证只做静态检查和可离线执行的语法检查，适合没有 Docker daemon 权限的环境。如果你确认本机 Docker daemon 可用，可以运行真实构建/运行检查：

```bash
cd docker
RUN_DOCKER=1 ./scripts/validate-all.sh
```

## 学习建议

1. 按课次顺序阅读每个 `README.md`。
2. 先运行 `./validate.sh`，确认示例文件完整。
3. 再按 README 中的命令手动执行 demo。
4. 每课结束后用 `docker ps -a`、`docker images`、`docker volume ls`、`docker network ls` 观察状态变化。
5. 执行清理命令，避免容器、网络、卷堆积。

> 远程服务器课程只提供模板与检查清单。由于本仓库没有任何 SSH 主机、账号或密钥信息，课程不会也不应该实际连接远程服务器。
