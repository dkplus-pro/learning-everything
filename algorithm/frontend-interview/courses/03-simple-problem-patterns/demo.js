// 本课用“两数之和”演示简单题通法：一次遍历 + 哈希表记录已经看过的数字。
const nums = [2, 7, 11, 15];
const target = 9;

/**
 * 返回两个下标，使 nums[indexA] + nums[indexB] === target。
 * 中文注释说明循环不变量：进入每轮循环前，seen 保存当前下标左侧所有数字的位置。
 */
export function twoSum(input, expectedSum) {
  const seen = new Map();
  const trace = [];
  const snapshots = [];

  for (let index = 0; index < input.length; index += 1) {
    const value = input[index];
    const need = expectedSum - value;
    const beforeSeen = [...seen.entries()];

    // 如果补数已经出现，说明“之前的数 + 当前数”正好组成答案。
    if (seen.has(need)) {
      snapshots.push({ index, value, need, seen: beforeSeen, answer: [seen.get(need), index], hit: true });
      trace.push(`第 ${index + 1} 步：当前值 ${value}，补数 ${need} 已存在，找到答案。`);
      return { answer: [seen.get(need), index], trace, snapshots };
    }

    // 当前值暂时不是答案的一半，就记录它，供后面的数字匹配。
    seen.set(value, index);
    snapshots.push({ index, value, need, seen: [...seen.entries()], answer: [], hit: false });
    trace.push(`第 ${index + 1} 步：记录 ${value} 的下标 ${index}，继续向右扫描。`);
  }

  // 面试时要说明无解策略：这里用空数组代表没有找到。
  return { answer: [], trace, snapshots };
}

function renderTwoSumDiagram(input, snapshots) {
  return snapshots
    .map(({ index, value, need, seen, answer, hit }) => `<div class="step">
      <strong>第 ${index + 1} 步：当前 ${value}，需要补数 ${need}</strong>
      <div class="array">${input.map((num, i) => `<span class="cell ${i === index ? 'current' : ''} ${answer.includes(i) ? 'hit' : ''}">${i}<br/>${num}</span>`).join('')}</div>
      <div>哈希表 seen：</div>
      <div class="map">${seen.length ? seen.map(([num, i]) => `<span class="cell ${num === need ? 'need' : ''}">${num} → ${i}</span>`).join('') : '<span>空</span>'}</div>
      <small>${hit ? '命中补数，组成答案。' : '未命中，记录当前数字。'}</small>
    </div>`)
    .join('');
}

function render() {
  const { answer, trace, snapshots } = twoSum(nums, target);
  const result = document.querySelector('#result');
  const traceBox = document.querySelector('#trace');

  result.textContent = `答案下标：${JSON.stringify(answer)}，数字：${answer.map((i) => nums[i]).join(' + ')}`;
  document.querySelector('#visual').innerHTML = renderTwoSumDiagram(nums, snapshots);
  traceBox.textContent = trace.join('\n');
}

// 点击按钮时运行 demo，方便在浏览器里观察每一步。
if (typeof document !== 'undefined') {
  document.querySelector('#run-demo')?.addEventListener('click', render);
}
