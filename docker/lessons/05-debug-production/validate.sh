#!/usr/bin/env bash
# 中文注释：验证生产化示例是否包含健康检查、非 root 用户和可编译代码。
set -euo pipefail

test -f Dockerfile
test -f app/server.py
python3 -m py_compile app/server.py

grep -q 'HEALTHCHECK' Dockerfile
grep -q 'USER app' Dockerfile
grep -q 'SIGTERM' app/server.py

if [[ "${RUN_DOCKER:-0}" == "1" ]]; then
  docker build --target runtime -t learn-docker-05:prod .
fi

echo "第 05 课验证通过。"
