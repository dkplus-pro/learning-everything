// 本课用“买卖股票的最佳时机”演示从零解题：先定义状态，再单次扫描。
const prices = [7, 1, 5, 3, 6, 4];

/**
 * 计算只买卖一次时的最大利润。
 * 核心循环不变量：扫描到第 i 天时，minPrice 表示 0..i 中最低买入价，best 表示目前最大利润。
 */
export function maxProfit(input) {
  let minPrice = Number.POSITIVE_INFINITY;
  let best = 0;
  const trace = [];

  for (let day = 0; day < input.length; day += 1) {
    const price = input[day];

    // 如果今天价格更低，就把它作为之后卖出的候选买入价。
    if (price < minPrice) {
      minPrice = price;
      trace.push(`第 ${day + 1} 天价格 ${price}：刷新最低买入价为 ${minPrice}`);
      continue;
    }

    // 如果今天卖出，利润等于今天价格减去此前最低买入价。
    const profitIfSellToday = price - minPrice;
    best = Math.max(best, profitIfSellToday);
    trace.push(`第 ${day + 1} 天价格 ${price}：若今天卖出利润 ${profitIfSellToday}，当前最大利润 ${best}`);
  }

  return { best, trace };
}

function render() {
  const { best, trace } = maxProfit(prices);
  document.querySelector('#result').textContent = `最大利润：${best}`;
  document.querySelector('#trace').textContent = trace.join('\n');
}

// 浏览器里点击按钮运行；Node 导入测试时不会访问 document。
if (typeof document !== 'undefined') {
  document.querySelector('#run-demo')?.addEventListener('click', render);
}
