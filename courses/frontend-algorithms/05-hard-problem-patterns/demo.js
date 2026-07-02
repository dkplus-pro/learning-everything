// 用统一出口打印推导，避免算法逻辑和 DOM 操作混在一起。
function render(lines) {
  const output = document.querySelector('#output');
  output.textContent = lines.join('\n');
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

// 绑定按钮事件，让每个难题范式都能独立演示；Node 导入验证时不会访问 document。
if (typeof document !== 'undefined') {
  document.querySelector('#run-lis')?.addEventListener('click', () => {
    render(explainLongestIncreasingSubsequence([10, 9, 2, 5, 3, 7, 101, 18]));
  });

  document.querySelector('#run-split')?.addEventListener('click', () => {
    render(explainSplitArray([7, 2, 5, 10, 8], 2));
  });
}
