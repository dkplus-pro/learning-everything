# 第 05 课：调试与生产化

## 目标

- 使用 `docker logs`、`docker exec`、`docker inspect` 定位问题。
- 通过 `HEALTHCHECK` 暴露健康状态。
- 使用多阶段构建和非 root 用户降低生产镜像风险。
- 理解开发镜像和生产镜像的差异。

## 运行步骤

```bash
cd docker/lessons/05-debug-production
./validate.sh

docker build --target runtime -t learn-docker-05:prod .
docker run -d --name learn-docker-05 -p 8085:8000 learn-docker-05:prod
curl http://localhost:8085/health
```

本课默认使用 `mirror.gcr.io/library/python:3.12-alpine` 作为多阶段构建的基础镜像。如果你的网络无法访问它，可以换成自己的镜像源：

```bash
PYTHON_IMAGE=<你的镜像源>/library/python:3.12-alpine RUN_DOCKER=1 ./validate.sh
docker build --build-arg PYTHON_IMAGE=<你的镜像源>/library/python:3.12-alpine --target runtime -t learn-docker-05:prod .
```

调试：

```bash
docker logs learn-docker-05
docker exec learn-docker-05 id
docker inspect --format='{{json .State.Health}}' learn-docker-05
```

清理：

```bash
docker rm -f learn-docker-05
```

## 生产化检查清单

- 镜像只包含运行所需文件。
- 容器使用非 root 用户运行。
- 有健康检查和优雅关闭日志。
- 配置通过环境变量注入，不把密钥写入镜像。
## 浏览器辅助 demo

```bash
cd docker
npm run demo:05
```
