// 中文注释：第 05 课：调试与生产化 的浏览器/Node 双用途 demo；浏览器中渲染步骤，Node 导入时用于验证语法。
export const lesson = "05-debug-production";
export const title = "第 05 课：调试与生产化";

export const concepts = [
  "日志、exec、inspect 是常用调试入口",
  "HEALTHCHECK 暴露容器健康状态",
  "非 root 用户和多阶段构建降低风险"
];
export const commands = [
  "docker build --target runtime -t learn-docker-05:prod .",
  "docker run -d --name learn-docker-05 -p 8085:8000 learn-docker-05:prod",
  "docker inspect --format={{json .State.Health}} learn-docker-05"
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
