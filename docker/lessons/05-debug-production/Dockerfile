# 中文注释：builder 阶段负责编译检查，避免把构建缓存带入运行阶段。
ARG PYTHON_IMAGE=mirror.gcr.io/library/python:3.12-alpine
FROM ${PYTHON_IMAGE} AS builder
WORKDIR /src
COPY app/ ./
RUN python -m compileall server.py

# 中文注释：runtime 阶段只复制运行需要的文件。
FROM ${PYTHON_IMAGE} AS runtime
WORKDIR /app

# 中文注释：创建非 root 用户，降低容器逃逸或误操作带来的风险。
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder /src/server.py ./server.py
USER app

EXPOSE 8000

# 中文注释：健康检查帮助编排系统判断容器是否可接收流量。
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health', timeout=2)"

# 中文注释：生产容器启动命令。
CMD ["python", "server.py"]
