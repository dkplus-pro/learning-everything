# 前端面试算法题课程

这套课程从零开始讲解前端面试算法题：先建立通用思考框架，再分别覆盖简单题、中等题、难题和完全不会时的破局方法。每一课都包含：

- `README.md`：课程文档、面试表达模板、解题步骤。
- `demo.js`：带中文注释的核心算法代码。
- `index.html`：可在浏览器中运行的交互 demo。
- 独立 npm 脚本：`npm run demo:XX`。

## 课程目录

| 课次 | 主题 | 重点 | 运行方式 |
| --- | --- | --- | --- |
| 01 | [从零建立算法题思维](../../courses/frontend-algorithms/01-zero-to-algorithm-thinking/README.md) | 输入输出、手算样例、暴力到优化 | `npm run demo:01` |
| 02 | [遇到陌生算法题的解题思路](../../courses/frontend-algorithms/02-unfamiliar-problem-playbook/README.md) | 陌生题五步法、从题意识别结构 | `npm run demo:02` |
| 03 | [简单题通用解题思路](../../courses/frontend-algorithms/03-simple-problem-patterns/README.md) | 一次遍历、哈希表、边界表达 | `npm run demo:03` |
| 04 | [中等题通用解题思路](../../courses/frontend-algorithms/04-medium-problem-patterns/README.md) | 滑动窗口、维护合法状态 | `npm run demo:04` |
| 05 | [难题通用解题思路](../../courses/frontend-algorithms/05-hard-problem-patterns/README.md) | 拆状态、递推/搜索、先降维 | `npm run demo:05` |
| 06 | [不懂的题怎么破局](../../courses/frontend-algorithms/06-unknown-problem-breakthrough/README.md) | 卡住时的降级策略和沟通话术 | `npm run demo:06` |

## 如何运行 demo

查看所有课程：

```bash
npm run demo:list
```

运行单课 demo：

```bash
npm run demo:01
npm run demo:02
npm run demo:03
npm run demo:04
npm run demo:05
npm run demo:06
```

也可以使用通用入口：

```bash
npm run demo -- 01
```

启动后终端会输出本地地址，例如 `http://127.0.0.1:12345`，在浏览器打开即可交互运行。

## 学习顺序建议

1. **先不要背模板**：第 01 课先练“把题目说清楚”。
2. **遇到陌生题先破冰**：第 02 课训练如何从题意找数据结构。
3. **简单题要快准稳**：第 03 课把边界、复杂度、变量含义讲清楚。
4. **中等题重在维护状态**：第 04 课练滑动窗口这类“动态合法区间”。
5. **难题先拆小**：第 05 课学习把难题拆成状态、选择、转移。
6. **完全不会也要拿过程分**：第 06 课提供卡住时的沟通和降级路线。
