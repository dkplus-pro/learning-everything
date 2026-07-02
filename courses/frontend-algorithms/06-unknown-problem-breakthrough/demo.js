const input = document.querySelector('#numbers');
const output = document.querySelector('#output');

// 把用户输入转换成数字数组；无效项会被过滤，避免演示时因为空格或多余逗号崩溃。
function parseNumbers(text) {
  return text
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((num) => Number.isFinite(num));
}

// 暴力锚点：排序后比较差异位置。它不一定最优，但非常适合作为陌生题的第一版正确方案。
function sortedAnchor(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  let left = 0;
  let right = nums.length - 1;

  while (left < nums.length && nums[left] === sorted[left]) left += 1;
  while (right >= 0 && nums[right] === sorted[right]) right -= 1;

  return { sorted, left, right, length: right > left ? right - left + 1 : 0 };
}

// 优化观察：不用完整排序，只找逆序边界，并用区间最小最大值向外扩展。
function boundaryOptimization(nums) {
  let start = -1;
  let end = -1;
  let maxSeen = -Infinity;
  let minSeen = Infinity;

  for (let i = 0; i < nums.length; i += 1) {
    maxSeen = Math.max(maxSeen, nums[i]);
    // 如果当前值小于左侧最大值，说明它必须被纳入右边界。
    if (nums[i] < maxSeen) end = i;
  }

  for (let i = nums.length - 1; i >= 0; i -= 1) {
    minSeen = Math.min(minSeen, nums[i]);
    // 如果当前值大于右侧最小值，说明它必须被纳入左边界。
    if (nums[i] > minSeen) start = i;
  }

  return { start, end, length: end === -1 ? 0 : end - start + 1 };
}

// 输出面试可说的话：每一步都体现「我在缩小未知范围」。
function explainBreakthrough(nums) {
  if (nums.length === 0) return ['请输入至少一个数字。'];

  const anchor = sortedAnchor(nums);
  const optimized = boundaryOptimization(nums);
  return [
    `原题复述：找出 ${JSON.stringify(nums)} 中最短的一段，只要排序这一段，整个数组就有序。`,
    `第一版正确锚点：排序得到 ${JSON.stringify(anchor.sorted)}。`,
    `对照差异位置：left=${anchor.left}, right=${anchor.right}, 长度=${anchor.length}。`,
    '优化信号：完整排序是 O(n log n)，但题目只关心边界。',
    `从左维护最大值、从右维护最小值：start=${optimized.start}, end=${optimized.end}, 长度=${optimized.length}。`,
    '面试表达：我先用排序对照保证正确，再把差异边界转化为一次正扫和一次反扫。',
  ];
}

// 事件入口保持很薄，方便把算法函数复制到面试白板或在线编辑器中。
document.querySelector('#run').addEventListener('click', () => {
  output.textContent = explainBreakthrough(parseNumbers(input.value)).join('\n');
});
