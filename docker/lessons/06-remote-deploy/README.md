# 第 06 课：远程服务器部署流程

## 目标

- 设计远程部署前的检查清单。
- 准备 Compose 生产模板、环境变量模板和部署脚本模板。
- 理解镜像发布、远程拉取、健康检查、回滚的基本流程。
- 明确本课程不会实际连接远程服务器。

## 重要边界

本仓库没有 SSH 主机、用户名、端口、密钥或云厂商凭证信息。因此本课只提供模板和说明，不会执行 `ssh`、`scp` 或真实远程发布命令。请在自己的受控环境中复制模板并替换占位符。

## 文件说明

- `templates/compose.prod.yml`：生产 Compose 模板。
- `templates/.env.example`：环境变量模板，不包含真实密钥。
- `templates/deploy-template.sh`：部署流程脚本模板，默认 dry-run。
- `validate.sh`：检查模板是否只包含占位符和安全默认值。

## 推荐部署流程

1. 本地构建并测试镜像。
2. 给镜像打不可变标签，例如 Git SHA：`registry.example.com/app:${GIT_SHA}`。
3. 推送到镜像仓库。
4. 登录远程服务器（本课程不执行），拉取新镜像。
5. 使用 `docker compose -f compose.prod.yml up -d` 滚动更新。
6. 访问 `/health` 做健康检查。
7. 如果失败，改回上一版镜像标签并重新 `up -d`。

## 本地模板演练

```bash
cd docker/lessons/06-remote-deploy
./validate.sh
DRY_RUN=1 ./templates/deploy-template.sh
```
## 浏览器辅助 demo

```bash
cd docker
npm run demo:06
```
