// 中文注释：第 06 课：远程服务器部署流程 的浏览器/Node 双用途 demo；浏览器中渲染步骤，Node 导入时用于验证语法。
export const lesson = "06-remote-deploy";
export const title = "第 06 课：远程服务器部署流程";

export const concepts = [
  "本课只提供模板，不实际连接远程服务器",
  "镜像标签应使用 Git SHA 等不可变版本",
  "失败时回滚到上一版 APP_IMAGE"
];
export const commands = [
  "DRY_RUN=1 ./templates/deploy-template.sh",
  "docker compose -f compose.prod.yml up -d",
  "docker compose -f compose.prod.yml ps"
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
