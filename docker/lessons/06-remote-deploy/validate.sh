#!/usr/bin/env bash
# 中文注释：验证远程部署模板只使用占位符，不包含真实服务器信息或密钥。
set -euo pipefail

test -f templates/compose.prod.yml
test -f templates/.env.example
test -x templates/deploy-template.sh
bash -n templates/deploy-template.sh

grep -q 'registry.example.com/your-app' templates/.env.example
grep -q 'DRY_RUN' templates/deploy-template.sh
if grep -RInE 'ssh |scp |BEGIN (RSA|OPENSSH) PRIVATE KEY|password=' templates README.md; then
  echo "发现真实远程连接或敏感信息，请改为占位符。" >&2
  exit 1
fi

if [[ "${RUN_DOCKER:-0}" == "1" ]]; then
  (cd templates && APP_IMAGE=example.invalid/app:test docker compose -f compose.prod.yml config >/dev/null)
fi

echo "第 06 课验证通过。"
