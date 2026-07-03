#!/usr/bin/env bash
# 中文注释：验证 volume/network 课程的脚本和 Dockerfile；可选真实构建。
set -euo pipefail

test -f Dockerfile
test -x app/write-note.sh
bash -n app/write-note.sh

grep -q 'VOLUME' Dockerfile
grep -q '/data/notes.txt' app/write-note.sh
grep -q 'docker network create' README.md

if [[ "${RUN_DOCKER:-0}" == "1" ]]; then
  alpine_image="${ALPINE_IMAGE:-mirror.gcr.io/library/alpine:3.20}"
  docker build --build-arg "ALPINE_IMAGE=${alpine_image}" -t learn-docker-03 .
fi

echo "第 03 课验证通过。"
