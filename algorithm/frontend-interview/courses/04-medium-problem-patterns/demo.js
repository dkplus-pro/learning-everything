// 本课用“无重复字符的最长子串”演示中等题通法：滑动窗口维护合法状态。
const sample = 'pwwkew';

/**
 * 计算不含重复字符的最长子串长度。
 * 中文注释说明窗口含义：left 到 right 始终表示当前无重复字符窗口。
 */
export function lengthOfLongestSubstring(text) {
  let left = 0;
  let best = 0;
  const lastSeen = new Map();
  const trace = [];
  const snapshots = [];

  for (let right = 0; right < text.length; right += 1) {
    const char = text[right];
    const previousIndex = lastSeen.get(char);
    let action = '扩张右边界';

    // 如果重复字符位于当前窗口内，左边界直接跳过它上次出现的位置。
    if (previousIndex !== undefined && previousIndex >= left) {
      action = `重复 ${char}，left 从 ${left} 跳到 ${previousIndex + 1}`;
      trace.push(`遇到重复字符 ${char}：left 从 ${left} 跳到 ${previousIndex + 1}`);
      left = previousIndex + 1;
    }

    // 更新当前字符最后出现的位置，再用当前合法窗口刷新答案。
    lastSeen.set(char, right);
    const window = text.slice(left, right + 1);
    best = Math.max(best, window.length);
    snapshots.push({ left, right, best, window, action });
    trace.push(`窗口 [${left}, ${right}] = "${window}"，当前最大长度 ${best}`);
  }

  return { best, trace, snapshots };
}

function renderWindowDiagram(text, snapshots) {
  return snapshots
    .map(({ left, right, best, window, action }) => `<div class="step">
      <strong>${action}</strong> · 当前窗口 "${window}" · best=${best}
      <div class="chars">${[...text].map((char, i) => `<span class="char ${i >= left && i <= right ? 'window' : ''} ${i === right ? 'right' : ''}">${i}<br/>${char}</span>`).join('')}</div>
      <small>窗口边界：left=${left}, right=${right}</small>
    </div>`)
    .join('');
}

function render() {
  const { best, trace, snapshots } = lengthOfLongestSubstring(sample);
  const result = document.querySelector('#result');
  const traceBox = document.querySelector('#trace');

  result.textContent = `最长长度：${best}`;
  document.querySelector('#visual').innerHTML = renderWindowDiagram(sample, snapshots);
  traceBox.textContent = trace.join('\n');
}

// 点击按钮运行示例，观察窗口如何扩张和收缩。
if (typeof document !== 'undefined') {
  document.querySelector('#run-demo')?.addEventListener('click', render);
}
