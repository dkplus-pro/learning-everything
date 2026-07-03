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
  docker build -t learn-docker-01 .
fi

echo "第 01 课验证通过。"
