#!/usr/bin/env sh
# 中文注释：把命令行参数追加写入数据卷中的 notes.txt。
set -eu

NOTE="${*:-来自容器的一条默认笔记}"
mkdir -p /data
printf '%s\n' "$NOTE" >> /data/notes.txt

echo "已写入笔记：$NOTE"
echo "当前全部笔记："
cat /data/notes.txt
