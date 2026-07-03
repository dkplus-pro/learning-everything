#!/usr/bin/env bash
# 中文注释：验证 Dockerfile、忽略规则和 Python 代码；可选真实构建。
set -euo pipefail

test -f Dockerfile
test -f .dockerignore
test -f app/main.py
python3 -m py_compile app/main.py

grep -q 'APP_MESSAGE' Dockerfile
grep -q 'tmp/' .dockerignore

if [[ "${RUN_DOCKER:-0}" == "1" ]]; then
  python_image="${PYTHON_IMAGE:-mirror.gcr.io/library/python:3.12-alpine}"
  docker build --build-arg "PYTHON_IMAGE=${python_image}" -t learn-docker-02:dev .
  docker run --rm learn-docker-02:dev | grep -q 'Dockerfile'
fi

echo "第 02 课验证通过。"
