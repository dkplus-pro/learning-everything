# 第 02 课：镜像与 Dockerfile

## 目标

- 掌握 Dockerfile 的常见指令：`FROM`、`WORKDIR`、`COPY`、`RUN`、`ENV`、`CMD`。
- 理解构建上下文和 `.dockerignore` 的作用。
- 构建一个带健康信息输出的自定义镜像。

## 运行步骤

```bash
cd docker/lessons/02-image-dockerfile
./validate.sh

docker build -t learn-docker-02:dev .
docker run --rm learn-docker-02:dev
```

本课默认使用 `mirror.gcr.io/library/python:3.12-alpine` 作为基础镜像。如果你的网络无法访问它，可以换成自己的镜像源：

```bash
PYTHON_IMAGE=<你的镜像源>/library/python:3.12-alpine RUN_DOCKER=1 ./validate.sh
docker build --build-arg PYTHON_IMAGE=<你的镜像源>/library/python:3.12-alpine -t learn-docker-02:dev .
```

尝试传入环境变量：

```bash
docker run --rm -e APP_MESSAGE="自定义问候" learn-docker-02:dev
```

## 观察点

- 修改 `app/main.py` 后重新构建，观察哪些层会复用缓存。
- 把临时文件写入 `tmp/`，确认 `.dockerignore` 会排除它们。
## 浏览器辅助 demo

```bash
cd docker
npm run demo:02
```
