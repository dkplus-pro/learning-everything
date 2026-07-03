// 中文注释：第 02 课：镜像与 Dockerfile 的浏览器/Node 双用途 demo；浏览器中渲染步骤，Node 导入时用于验证语法。
export const lesson = "02-image-dockerfile";
export const title = "第 02 课：镜像与 Dockerfile";

export const concepts = [
  "Dockerfile 把构建步骤写成版本化文件",
  ".dockerignore 控制构建上下文",
  "环境变量让镜像保持可配置"
];
export const commands = [
  "docker build -t learn-docker-02:dev .",
  "docker run --rm -e APP_MESSAGE=自定义问候 learn-docker-02:dev"
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
