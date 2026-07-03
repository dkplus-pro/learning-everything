#!/usr/bin/env python3
"""第 02 课示例：读取环境变量并输出镜像元信息。"""

import os
import platform


def main() -> None:
    # 中文注释：APP_MESSAGE 可以在 docker run -e 中覆盖。
    message = os.getenv("APP_MESSAGE", "你好，Docker 镜像")
    print(message)
    # 中文注释：输出 Python 版本，帮助确认程序确实在容器环境中运行。
    print(f"Python 版本：{platform.python_version()}")


if __name__ == "__main__":
    main()
