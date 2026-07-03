# 中文注释：使用 Alpine 让示例尽量小；脚本负责写入 /data。
ARG ALPINE_IMAGE=mirror.gcr.io/library/alpine:3.20
FROM ${ALPINE_IMAGE}

WORKDIR /app

# 中文注释：复制写笔记脚本，并赋予执行权限。
COPY app/write-note.sh ./write-note.sh
RUN chmod +x ./write-note.sh

# 中文注释：声明 /data 是数据目录，运行时建议挂载 volume。
VOLUME ["/data"]

# 中文注释：默认把传入参数追加到 /data/notes.txt。
ENTRYPOINT ["/app/write-note.sh"]
