import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const coursesRoot = path.join(root, 'frontend-interview', 'courses');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

if (!existsSync(coursesRoot)) {
  console.error('缺少课程目录 frontend-interview/courses');
  process.exit(1);
}

const courses = readdirSync(coursesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

let failures = 0;
function fail(message) {
  console.error(message);
  failures += 1;
}

for (const course of courses) {
  const dir = path.join(coursesRoot, course);
  const lesson = course.slice(0, 2);

  for (const file of ['README.md', 'index.html', 'demo.js']) {
    const target = path.join(dir, file);
    if (!existsSync(target)) {
      fail(`缺少 ${course}/${file}`);
      continue;
    }
    const text = readFileSync(target, 'utf8');
    if (!text.trim()) fail(`${course}/${file} 为空`);
  }

  const readme = readFileSync(path.join(dir, 'README.md'), 'utf8');
  if (!readme.includes(`npm run demo:${lesson}`)) fail(`${course}/README.md 缺少独立 demo 脚本说明`);

  const html = readFileSync(path.join(dir, 'index.html'), 'utf8');
  if (!html.includes('./demo.js')) fail(`${course}/index.html 未引用 ./demo.js`);
  if (!html.includes('id="visual"')) fail(`${course}/index.html 缺少 #visual 图示容器`);

  const demo = readFileSync(path.join(dir, 'demo.js'), 'utf8');
  if (!/[\u4e00-\u9fff]/.test(demo)) fail(`${course}/demo.js 缺少中文注释或说明`);

  const script = pkg.scripts?.[`demo:${lesson}`];
  if (script !== `node scripts/serve-course.mjs ${lesson}`) fail(`package.json 缺少 demo:${lesson} 独立脚本`);

  try {
    await import(pathToFileURL(path.join(dir, 'demo.js')).href + `?verify=${Date.now()}`);
  } catch (error) {
    fail(`${course}/demo.js 无法被 Node 导入：${error.message}`);
  }
}

console.log(`检查课程数: ${courses.length}`);
if (failures > 0) process.exit(1);
console.log('所有课程文档、独立 demo 脚本、HTML 引用与 JS 注释检查通过。');
