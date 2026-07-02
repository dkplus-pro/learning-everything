// 用统一出口打印推导和图示，避免算法逻辑和 DOM 操作混在一起。
function render(lines, visualHtml) {
  document.querySelector('#visual').innerHTML = visualHtml;
  document.querySelector('#output').textContent = lines.join('\n');
}

// 难题通法一：动态规划。状态 dp[i] 表示「以 nums[i] 结尾」的最长递增子序列长度。
export function explainLongestIncreasingSubsequence(nums) {
  const dp = Array(nums.length).fill(1);
  const lines = [`题目：求 ${JSON.stringify(nums)} 的最长递增子序列长度`, '状态：dp[i] = 以 nums[i] 结尾的最佳答案'];

  for (let i = 0; i < nums.length; i += 1) {
    for (let j = 0; j < i; j += 1) {
      // 只有前面的数更小，才能把 nums[i] 接到 nums[j] 后面。
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1);
      }
    }
    lines.push(`处理 ${nums[i]} 后：dp = [${dp.join(', ')}]`);
  }

  lines.push(`答案：${Math.max(...dp)}`);
  lines.push('面试表达：先定义状态，再解释转移，最后说明边界 dp[i] 初始为 1。');
  return lines;
}

export function buildLisDiagram(nums) {
  const dp = Array(nums.length).fill(1);
  const cards = [];
  for (let i = 0; i < nums.length; i += 1) {
    for (let j = 0; j < i; j += 1) {
      // 图示复用同一转移：nums[j] < nums[i] 时更新 dp[i]。
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
    cards.push(`<div class="diagram-card">
      <strong>处理 nums[${i}] = ${nums[i]}</strong>
      <div class="bars">${dp.map((value, index) => `<div class="bar" style="height:${32 + value * 18}px" title="dp[${index}]=${value}">${value}</div>`).join('')}</div>
      <small>柱子高度代表 dp 值；越高表示以该位置结尾的递增子序列越长。</small>
    </div>`);
  }
  return cards.join('');
}

// 判定函数：给定最大子数组和上限 limit，判断能否在 maxGroups 组内完成分割。
export function canSplitWithin(nums, maxGroups, limit) {
  let groups = 1;
  let current = 0;

  for (const num of nums) {
    // 当前组放不下时，新开一组；这一步是判定题里的贪心子过程。
    if (current + num > limit) {
      groups += 1;
      current = 0;
    }
    current += num;
  }

  return groups <= maxGroups;
}

// 难题通法二：二分答案。优化目标不好直接求，就把「答案是否可行」变成判定题。
export function explainSplitArray(nums, groups) {
  let left = Math.max(...nums);
  let right = nums.reduce((sum, num) => sum + num, 0);
  const lines = [`题目：把 ${JSON.stringify(nums)} 分成 ${groups} 组，使最大组和尽量小`, `答案范围：[${left}, ${right}]`];

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const ok = canSplitWithin(nums, groups, mid);
    lines.push(`尝试上限 ${mid}：${ok ? '可行，收缩右边界' : '不可行，抬高左边界'}`);
    if (ok) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }

  lines.push(`答案：${left}`);
  lines.push('面试表达：先给出答案边界，再说明判定函数为什么单调。');
  return lines;
}

export function buildSplitDiagram(nums, groups) {
  let left = Math.max(...nums);
  let right = nums.reduce((sum, num) => sum + num, 0);
  const cards = [];
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const ok = canSplitWithin(nums, groups, mid);
    cards.push(`<div class="diagram-card">
      <strong>二分答案：left=${left}, mid=${mid}, right=${right}</strong>
      <div class="range"><span>${left}</span><span class="mid">${mid}</span><span>${right}</span></div>
      <small>${ok ? `上限 ${mid} 可行：答案在左半边或就是 mid。` : `上限 ${mid} 不可行：答案必须更大。`}</small>
    </div>`);
    if (ok) right = mid;
    else left = mid + 1;
  }
  cards.push(`<div class="diagram-card"><strong>收敛答案：${left}</strong><p>二分区间变成单点，说明最小可行最大组和就是 ${left}。</p></div>`);
  return cards.join('');
}

// 绑定按钮事件，让每个难题范式都能独立演示；Node 导入验证时不会访问 document。
if (typeof document !== 'undefined') {
  document.querySelector('#run-lis')?.addEventListener('click', () => {
    const nums = [10, 9, 2, 5, 3, 7, 101, 18];
    render(explainLongestIncreasingSubsequence(nums), buildLisDiagram(nums));
  });

  document.querySelector('#run-split')?.addEventListener('click', () => {
    const nums = [7, 2, 5, 10, 8];
    render(explainSplitArray(nums, 2), buildSplitDiagram(nums, 2));
  });
}
