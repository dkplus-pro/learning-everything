#!/usr/bin/env sh
# 中文注释：这个脚本可以通过 docker exec 在容器内执行，用来观察容器文件系统。
set -eu
echo "容器内当前目录：$(pwd)"
echo "容器内文件列表："
ls -la
