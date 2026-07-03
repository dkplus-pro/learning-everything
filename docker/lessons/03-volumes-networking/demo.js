// 中文注释：第 03 课：数据卷与网络 的浏览器/Node 双用途 demo；浏览器中渲染步骤，Node 导入时用于验证语法。
export const lesson = "03-volumes-networking";
export const title = "第 03 课：数据卷与网络";

export const concepts = [
  "named volume 独立于容器生命周期",
  "自定义 bridge 网络提供容器 DNS",
  "容器名可作为同网络内服务名"
];
export const commands = [
  "docker volume create learn-docker-notes",
  "docker run --rm -v learn-docker-notes:/data learn-docker-03 第一条笔记",
  "docker network create learn-docker-net"
];

export function buildLearningPlan() {
  // 中文注释：把概念和命令组合成可视化步骤，帮助学习者先理解再执行。
  return concepts.map((concept, index) => ({
    step: index + 1,
    concept,
    command: commands[index] ?? '阅读 README 并完成清理',
  }));
}

function render() {
  const plan = buildLearningPlan();
  document.querySelector('#visual').innerHTML = plan
    .map((item) => `<div class="card"><strong>步骤 ${item.step}</strong><p>${item.concept}</p><code>${item.command}</code></div>`)
    .join('');
  document.querySelector('#trace').textContent = commands.join('\n');
}

// 中文注释：只有在浏览器里才访问 document；验证脚本用 Node 导入时不会触发 DOM 逻辑。
if (typeof document !== 'undefined') {
  document.querySelector('#run-demo')?.addEventListener('click', render);
}
