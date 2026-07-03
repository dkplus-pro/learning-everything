// 中文注释：第 01 课：Docker 基础运行 的浏览器/Node 双用途 demo；浏览器中渲染步骤，Node 导入时用于验证语法。
export const lesson = "01-basic-run";
export const title = "第 01 课：Docker 基础运行";

export const concepts = [
  "镜像是可复用模板",
  "容器是运行实例",
  "端口映射让宿主机访问容器服务"
];
export const commands = [
  "docker build -t learn-docker-01 .",
  "docker run --name learn-docker-01 -p 8081:8000 learn-docker-01",
  "curl http://localhost:8081"
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
