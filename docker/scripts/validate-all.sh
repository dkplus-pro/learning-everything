#!/usr/bin/env bash
# 中文说明：聚合运行每一课的验证脚本；默认离线静态验证，可用 RUN_DOCKER=1 开启真实 Docker 检查。
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

lessons=(
  "01-basic-run"
  "02-image-dockerfile"
  "03-volumes-networking"
  "04-compose-multi-service"
  "05-debug-production"
  "06-remote-deploy"
)

for lesson in "${lessons[@]}"; do
  echo "==> 验证 ${lesson}"
  (cd "${ROOT_DIR}/lessons/${lesson}" && ./validate.sh)
done

echo "全部 Docker 课程验证通过。"
