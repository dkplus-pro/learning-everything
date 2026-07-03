# 中文注释：Web 服务使用 Python 标准库，无需安装第三方依赖。
ARG PYTHON_IMAGE=mirror.gcr.io/library/python:3.12-alpine
FROM ${PYTHON_IMAGE}
WORKDIR /app
COPY server.py ./server.py
EXPOSE 8000
CMD ["python", "server.py"]
