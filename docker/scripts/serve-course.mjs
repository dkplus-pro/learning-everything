import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const lessonsRoot = path.join(root, 'lessons');

function listLessons() {
  if (!existsSync(lessonsRoot)) return [];
  return readdirSync(lessonsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function usage() {
  console.log('可用 Docker 课程 demo:');
  for (const lesson of listLessons()) console.log(`- ${lesson}: npm run demo:${lesson.slice(0, 2)}`);
}

const arg = process.argv[2];
if (!arg || arg === '--list') {
  usage();
  process.exit(0);
}

const lessonDir = listLessons().find((name) => name.startsWith(String(arg).padStart(2, '0')));
if (!lessonDir) {
  console.error(`找不到 Docker 课程 demo: ${arg}`);
  usage();
  process.exit(1);
}

const demoDir = path.join(lessonsRoot, lessonDir);
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.md', 'text/markdown; charset=utf-8'],
]);

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const safePath = url.pathname === '/' ? '/index.html' : url.pathname;
    const filePath = path.normalize(path.join(demoDir, safePath));
    if (!filePath.startsWith(demoDir)) throw new Error('Bad path');
    const body = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': mime.get(path.extname(filePath)) ?? 'text/plain; charset=utf-8' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
});

server.listen(0, '127.0.0.1', () => {
  const { port } = server.address();
  console.log(`Docker 课程 ${lessonDir} demo 已启动: http://127.0.0.1:${port}`);
  console.log('按 Ctrl+C 停止。');
});
