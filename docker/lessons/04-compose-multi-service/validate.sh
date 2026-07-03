#!/usr/bin/env bash
# 中文注释：验证 Compose 文件和 Web 服务代码；RUN_DOCKER=1 时解析 Compose 配置。
set -euo pipefail

test -f compose.yml
test -f web/Dockerfile
test -f web/server.py
python3 -m py_compile web/server.py

grep -q '^  web:' compose.yml
grep -q '^  cache:' compose.yml
grep -q 'CACHE_HOST: cache' compose.yml

if [[ "${RUN_DOCKER:-0}" == "1" ]]; then
  docker compose -f compose.yml config >/dev/null
fi

echo "第 04 课验证通过。"
