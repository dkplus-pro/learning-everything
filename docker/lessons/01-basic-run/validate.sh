#!/usr/bin/env bash
# 中文注释：本脚本先做静态检查；RUN_DOCKER=1 时再尝试真实构建镜像。
set -euo pipefail

test -f Dockerfile
test -f app/index.html
test -x app/hello.sh
bash -n app/hello.sh

grep -q 'http.server' Dockerfile
grep -q '你好，Docker' app/index.html

if [[ "${RUN_DOCKER:-0}" == "1" ]]; then
  if ! docker info >/dev/null 2>&1; then
    cat <<'EOF' >&2
Docker 不可用：请确认 Docker Desktop/daemon 已启动，并且当前用户有权限访问 Docker。
EOF
    exit 1
  fi

  python_image="${PYTHON_IMAGE:-mirror.gcr.io/library/python:3.12-alpine}"
  echo "正在使用基础镜像：${python_image}"
  if ! docker build --build-arg "PYTHON_IMAGE=${python_image}" -t learn-docker-01 .; then
    cat <<'EOF' >&2

Docker 构建失败。如果错误停在 "load metadata" 或 "failed to resolve source metadata"，
通常是当前网络无法访问基础镜像仓库，而不是 Dockerfile 语法错误。

可以换一个你当前网络可访问的 Docker Hub 镜像代理后重试，例如：

  PYTHON_IMAGE=<你的镜像源>/library/python:3.12-alpine RUN_DOCKER=1 ./validate.sh

如果你的网络已经恢复，也可以切回官方名称：

  PYTHON_IMAGE=python:3.12-alpine RUN_DOCKER=1 ./validate.sh
EOF
    exit 1
  fi
fi

echo "第 01 课验证通过。"
