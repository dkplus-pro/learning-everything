#!/usr/bin/env python3
"""第 05 课：带健康检查和优雅关闭日志的 HTTP 服务。"""

import os
import signal
from http.server import BaseHTTPRequestHandler, HTTPServer

shutdown_requested = False


def handle_signal(signum, _frame) -> None:
    # 中文注释：生产容器收到 SIGTERM 时应记录日志，便于排查滚动发布行为。
    global shutdown_requested
    shutdown_requested = True
    print(f"收到退出信号：{signum}", flush=True)


class Handler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802 - http.server 约定方法名
        if self.path == "/health":
            body = b"ok\n"
        else:
            # 中文注释：APP_ENV 用于区分 dev/staging/prod，不应把环境写死进镜像。
            env = os.getenv("APP_ENV", "dev")
            body = f"debug/production demo, APP_ENV={env}\n".encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    signal.signal(signal.SIGTERM, handle_signal)
    # 中文注释：监听所有网卡，确保端口映射后宿主机可以访问。
    HTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
