#!/usr/bin/env bash
# 中文注释：远程部署模板。默认只 dry-run 打印步骤，不会连接任何服务器。
set -euo pipefail

DRY_RUN="${DRY_RUN:-1}"
APP_IMAGE="${APP_IMAGE:-registry.example.com/your-app:replace-with-git-sha}"
COMPOSE_FILE="${COMPOSE_FILE:-compose.prod.yml}"

run_step() {
  # 中文注释：集中输出命令，真实环境可把 echo 替换为命令执行。
  echo "+ $*"
  if [[ "${DRY_RUN}" != "1" ]]; then
    "$@"
  fi
}

echo "准备部署镜像：${APP_IMAGE}"
echo "安全提示：本模板不包含 ssh/scp；请先在远程服务器上准备好 compose 文件和 .env。"
run_step docker pull "${APP_IMAGE}"
run_step docker compose -f "${COMPOSE_FILE}" up -d
run_step docker compose -f "${COMPOSE_FILE}" ps
echo "部署后请执行业务健康检查；失败时回滚到上一版 APP_IMAGE。"
