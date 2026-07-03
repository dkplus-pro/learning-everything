# 中文注释：使用官方 Python 运行时，便于启动一个零依赖 HTTP 服务。
ARG PYTHON_IMAGE=mirror.gcr.io/library/python:3.12-alpine
FROM ${PYTHON_IMAGE}

# 中文注释：把工作目录固定为 /app，后续命令都在这里执行。
WORKDIR /app

# 中文注释：复制本课示例页面和脚本到镜像中。
COPY app/ ./

# 中文注释：容器对外声明 8000 端口；实际映射由 docker run -p 决定。
EXPOSE 8000

# 中文注释：启动 Python 内置静态文件服务器。
CMD ["python", "-m", "http.server", "8000", "--bind", "0.0.0.0"]
