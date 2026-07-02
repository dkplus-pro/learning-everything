import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const coursesRoot = path.join(root, 'courses', 'frontend-algorithms');

if (!existsSync(coursesRoot)) {
  console.error('缺少课程目录 courses/frontend-algorithms');
  process.exit(1);
}

const courses = readdirSync(coursesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

let failures = 0;
for (const course of courses) {
  const dir = path.join(coursesRoot, course);
  for (const file of ['README.md', 'index.html', 'demo.js']) {
    const target = path.join(dir, file);
    if (!existsSync(target)) {
      console.error(`缺少 ${course}/${file}`);
      failures += 1;
      continue;
    }
    const text = readFileSync(target, 'utf8');
    if (!text.trim()) {
      console.error(`${course}/${file} 为空`);
      failures += 1;
    }
  }
}

console.log(`检查课程数: ${courses.length}`);
if (failures > 0) process.exit(1);
console.log('所有课程文档与 demo 文件存在。');
