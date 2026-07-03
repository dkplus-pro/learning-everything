# 中文注释：选择轻量 Python 基础镜像，减少示例镜像体积。
ARG PYTHON_IMAGE=mirror.gcr.io/library/python:3.12-alpine
FROM ${PYTHON_IMAGE}

# 中文注释：通过标签记录课程信息，便于 docker image inspect 查看。
LABEL org.opencontainers.image.title="learn-docker-02"
LABEL org.opencontainers.image.description="Dockerfile 构建示例"

# 中文注释：设置默认环境变量，运行时可用 -e 覆盖。
ENV APP_MESSAGE="来自 Dockerfile 的默认问候"

WORKDIR /app

# 中文注释：只复制应用文件，避免把无关上下文带进镜像。
COPY app/ ./

# 中文注释：这里故意保留一个可见 RUN 层，演示构建阶段命令。
RUN python -m compileall main.py

# 中文注释：容器启动时运行 Python 程序。
CMD ["python", "main.py"]
