import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const lessonsRoot = path.join(root, 'lessons');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const expectedLessons = ['01', '02', '03', '04', '05', '06'];

let failures = 0;
function fail(message) {
  console.error(message);
  failures += 1;
}

if (!existsSync(lessonsRoot)) {
  fail('缺少 Docker 课程目录 lessons');
} else {
  const lessons = readdirSync(lessonsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  if (lessons.length !== 6) fail(`课程数量应为 6，实际为 ${lessons.length}`);

  for (const id of expectedLessons) {
    const lesson = lessons.find((name) => name.startsWith(id));
    if (!lesson) {
      fail(`缺少第 ${id} 课目录`);
      continue;
    }

    const dir = path.join(lessonsRoot, lesson);
    for (const file of ['README.md', 'index.html', 'demo.js', 'validate.sh']) {
      const target = path.join(dir, file);
      if (!existsSync(target)) {
        fail(`缺少 ${lesson}/${file}`);
        continue;
      }
      const text = readFileSync(target, 'utf8');
      if (!text.trim()) fail(`${lesson}/${file} 为空`);
      if (['README.md', 'demo.js'].includes(file) && !/[\u4e00-\u9fff]/.test(text)) {
        fail(`${lesson}/${file} 缺少中文说明或中文注释`);
      }
    }

    const readme = readFileSync(path.join(dir, 'README.md'), 'utf8');
    if (!readme.includes(`npm run demo:${id}`)) fail(`${lesson}/README.md 缺少 npm run demo:${id} 说明`);

    const html = readFileSync(path.join(dir, 'index.html'), 'utf8');
    if (!html.includes('./demo.js')) fail(`${lesson}/index.html 未引用 ./demo.js`);
    if (!html.includes('id="visual"')) fail(`${lesson}/index.html 缺少 #visual 图示容器`);

    const script = pkg.scripts?.[`demo:${id}`];
    if (script !== `node scripts/serve-course.mjs ${id}`) fail(`package.json 缺少 demo:${id} 独立脚本`);

    try {
      await import(pathToFileURL(path.join(dir, 'demo.js')).href + `?verify=${Date.now()}`);
    } catch (error) {
      fail(`${lesson}/demo.js 无法被 Node 导入：${error.message}`);
    }
  }

  const remoteReadme = path.join(lessonsRoot, '06-remote-deploy', 'README.md');
  const remoteTemplates = path.join(lessonsRoot, '06-remote-deploy', 'templates');
  const remoteText = [
    existsSync(remoteReadme) ? readFileSync(remoteReadme, 'utf8') : '',
    existsSync(remoteTemplates) ? readdirSync(remoteTemplates).map((name) => readFileSync(path.join(remoteTemplates, name), 'utf8')).join('\n') : '',
  ].join('\n');
  if (/BEGIN (RSA|OPENSSH) PRIVATE KEY|password=|ssh\s+[^\n]*@|scp\s+/i.test(remoteText)) {
    fail('第 06 课包含真实远程连接或敏感信息，应只保留模板占位符');
  }
}

console.log('检查 Docker 课程数: 6');
if (failures > 0) process.exit(1);
console.log('所有 Docker 课程文档、独立 demo、HTML 引用、中文注释与远程模板边界检查通过。');
