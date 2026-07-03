# 第 04 课：Compose 多服务

## 目标

- 用 `compose.yml` 声明多个服务、网络和卷。
- 理解服务名就是默认 DNS 名称。
- 学会 `docker compose up`、`logs`、`exec`、`down -v` 的基本用法。

## Demo 架构

- `web`：Python HTTP 服务，返回课程页面和缓存服务地址。
- `cache`：Redis 服务，用于演示多服务依赖。
- `app_net`：Compose 自动创建的内部网络。
- `cache_data`：缓存服务数据卷。

## 运行步骤

```bash
cd docker/lessons/04-compose-multi-service
./validate.sh

docker compose up --build
```

访问：

```bash
curl http://localhost:8084
```

查看服务：

```bash
docker compose ps
docker compose logs web
docker compose exec web python -c "import os; print(os.getenv('CACHE_HOST'))"
```

清理：

```bash
docker compose down -v
```
## 浏览器辅助 demo

```bash
cd docker
npm run demo:04
```
