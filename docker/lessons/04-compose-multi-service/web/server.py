#!/usr/bin/env python3
"""第 04 课 Web 服务：展示 Compose 注入的服务地址。"""

import os
from http.server import BaseHTTPRequestHandler, HTTPServer


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802 - http.server 约定方法名
        # 中文注释：从环境变量读取缓存服务名，默认就是 Compose 中的 cache。
        cache_host = os.getenv("CACHE_HOST", "cache")
        body = f"Docker Compose 多服务 demo；缓存服务地址：{cache_host}\n".encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    # 中文注释：监听 0.0.0.0，容器外才能通过端口映射访问。
    HTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
