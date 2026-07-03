# 第 01 课：Docker 基础运行

## 目标

- 理解镜像（image）和容器（container）的关系。
- 学会用 `docker build`、`docker run`、`docker logs`、`docker stop`、`docker rm` 完成基础生命周期。
- 通过端口映射访问容器内的 HTTP 服务。

## Demo 文件

- `Dockerfile`：基于 Python 镜像启动一个静态 HTTP 服务。
- `app/index.html`：容器内返回的中文页面。
- `app/hello.sh`：演示容器内执行脚本。
- `validate.sh`：本课验证脚本。

## 运行步骤

```bash
cd docker/lessons/01-basic-run
./validate.sh

docker build -t learn-docker-01 .
docker run --name learn-docker-01 -p 8081:8000 learn-docker-01
```

本课默认使用 `mirror.gcr.io/library/python:3.12-alpine`，避免网络不稳定时卡在 Docker Hub 的 `auth.docker.io`。如果你想切回 Docker Hub 官方名称，可以显式传入：

```bash
PYTHON_IMAGE=python:3.12-alpine RUN_DOCKER=1 ./validate.sh

docker build \
  --build-arg PYTHON_IMAGE=python:3.12-alpine \
  -t learn-docker-01 .
```

如果你的网络无法访问 `mirror.gcr.io`，把 `PYTHON_IMAGE` 换成公司、学校或云厂商提供的镜像源。

另开一个终端访问：

```bash
curl http://localhost:8081
```

查看日志并清理：

```bash
docker logs learn-docker-01
docker stop learn-docker-01
docker rm learn-docker-01
```

## 关键概念

- 镜像是只读模板；容器是镜像运行后的实例。
- `-p 8081:8000` 表示把宿主机 8081 端口映射到容器 8000 端口。
- 容器停止后仍会存在，需要 `docker rm` 删除；镜像需要 `docker rmi` 删除。
## 浏览器辅助 demo

```bash
cd docker
npm run demo:01
```
