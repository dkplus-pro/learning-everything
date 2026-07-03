# 第 03 课：数据卷与网络

## 目标

- 理解容器删除后，容器可写层会消失。
- 使用 named volume 把数据持久化到 Docker 管理的卷中。
- 使用自定义 bridge 网络，让容器用服务名互相访问。

## 运行步骤：数据卷

```bash
cd docker/lessons/03-volumes-networking
./validate.sh

docker build -t learn-docker-03 .
docker volume create learn-docker-notes
docker run --rm -v learn-docker-notes:/data learn-docker-03 "第一条笔记"
docker run --rm -v learn-docker-notes:/data learn-docker-03 "第二条笔记"
docker run --rm -v learn-docker-notes:/data learn-docker-03 cat /data/notes.txt
```

清理：

```bash
docker volume rm learn-docker-notes
```

## 运行步骤：网络

```bash
docker network create learn-docker-net
docker run -d --name lesson03-web --network learn-docker-net nginx:alpine
docker run --rm --network learn-docker-net curlimages/curl:8.8.0 http://lesson03-web
docker rm -f lesson03-web
docker network rm learn-docker-net
```

## 观察点

- named volume 不依赖容器生命周期。
- 同一个自定义网络内可以通过容器名解析 DNS。
## 浏览器辅助 demo

```bash
cd docker
npm run demo:03
```
