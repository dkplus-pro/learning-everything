// 本课用“有效括号”演示陌生题破冰：从题意中的“最近匹配”识别出栈。
const defaultInput = '{[()]}';

const pairs = new Map([
  [')', '('],
  [']', '['],
  ['}', '{'],
]);

const leftBrackets = new Set(['(', '[', '{']);
const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);

/**
 * 判断括号字符串是否有效，并返回可视化步骤。
 * 栈的含义：stack 保存尚未被匹配的左括号，栈顶永远是“最近打开”的括号。
 */
export function isValidBrackets(text) {
  const stack = [];
  const trace = [];
  const snapshots = [];

  for (const char of text) {
    if (leftBrackets.has(char)) {
      // 左括号暂时无法确定匹配对象，先入栈等待后续右括号。
      stack.push(char);
      snapshots.push({ char, stack: [...stack], ok: true, action: '左括号入栈' });
      trace.push(`读到 ${char}：左括号入栈，当前栈 = [${stack.join(' ')}]`);
      continue;
    }

    const expectedLeft = pairs.get(char);
    if (!expectedLeft) {
      snapshots.push({ char, stack: [...stack], ok: false, action: '非法字符' });
      trace.push(`读到 ${char}：不是合法括号字符，直接失败。`);
      return { ok: false, trace, snapshots };
    }

    // 右括号必须匹配最近的左括号，因此只检查栈顶。
    const top = stack.pop();
    if (top !== expectedLeft) {
      snapshots.push({ char, stack: [...stack], ok: false, action: `需要 ${expectedLeft}，实际 ${top ?? '空'}` });
      trace.push(`读到 ${char}：需要 ${expectedLeft}，但栈顶是 ${top ?? '空'}，匹配失败。`);
      return { ok: false, trace, snapshots };
    }

    snapshots.push({ char, stack: [...stack], ok: true, action: `匹配 ${top}` });
    trace.push(`读到 ${char}：与栈顶 ${top} 匹配，弹栈后 = [${stack.join(' ')}]`);
  }

  const ok = stack.length === 0;
  snapshots.push({ char: '结束', stack: [...stack], ok, action: ok ? '栈为空' : '仍有未匹配左括号' });
  trace.push(ok ? '扫描结束：栈为空，全部匹配。' : `扫描结束：还剩 [${stack.join(' ')}] 未匹配。`);
  return { ok, trace, snapshots };
}

function renderStackDiagram(snapshots) {
  return snapshots
    .map(({ char, stack, ok, action }) => `<div class="step">
      <strong>读到：${escapeHtml(char)}</strong> · ${escapeHtml(action)} · ${ok ? '继续' : '失败'}
      <div class="stack">${stack.length ? stack.map((item) => `<span class="box">${escapeHtml(item)}</span>`).join('') : '<span class="empty">空栈</span>'}</div>
    </div>`)
    .join('');
}

function render() {
  const source = document.querySelector('#source').value || defaultInput;
  const { ok, trace, snapshots } = isValidBrackets(source);
  document.querySelector('#result').textContent = ok ? '结果：有效括号' : '结果：无效括号';
  document.querySelector('#visual').innerHTML = renderStackDiagram(snapshots);
  document.querySelector('#trace').textContent = trace.join('\n');
}

// 浏览器运行时绑定按钮；Node 语法检查/导入时不会触发 DOM 访问。
if (typeof document !== 'undefined') {
  document.querySelector('#run-demo')?.addEventListener('click', render);
}
