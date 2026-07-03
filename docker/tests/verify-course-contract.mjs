#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(process.env.DOCKER_REPO_ROOT ?? path.join(__dirname, '..', '..'));
const courseRoot = path.resolve(process.env.DOCKER_COURSE_ROOT ?? path.join(repoRoot, 'docker'));
const lessonsRoot = path.join(courseRoot, 'lessons');

const expectedTopics = [
  ['01', 'Docker 基础运行'],
  ['02', '镜像与 Dockerfile'],
  ['03', '数据卷与网络'],
  ['04', 'Compose 多服务'],
  ['05', '调试与生产化'],
  ['06', '远程服务器部署流程'],
];

const failures = [];
const fail = (message) => failures.push(message);
const rel = (filePath) => path.relative(repoRoot, filePath) || '.';
const hasChinese = (text) => /[\u4e00-\u9fff]/.test(text);

function readRequired(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`缺少 ${label}: ${rel(filePath)}`);
    return '';
  }
  if (!statSync(filePath).isFile()) {
    fail(`${label} 不是普通文件: ${rel(filePath)}`);
    return '';
  }
  const text = readFileSync(filePath, 'utf8');
  if (!text.trim()) fail(`${label} 为空: ${rel(filePath)}`);
  return text;
}

function walkFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkFiles(target);
    return [target];
  });
}

function checkRootReadme() {
  const readme = readRequired(path.join(repoRoot, 'README.md'), '根 README 索引');
  if (readme && !readme.includes('docker/README.md') && !readme.includes('Docker')) {
    fail('根 README.md 未索引 Docker 课程');
  }
}

function checkCourseIndex() {
  const readme = readRequired(path.join(courseRoot, 'README.md'), 'docker/README.md');
  if (!readme) return;
  for (const [, topic] of expectedTopics) {
    if (!readme.includes(topic)) fail(`docker/README.md 缺少主题：${topic}`);
  }
  if (!hasChinese(readme)) fail('docker/README.md 缺少中文课程说明');
  if (!readme.includes('validate-all.sh')) fail('docker/README.md 缺少总验证说明');
  if (!readme.includes('RUN_DOCKER=1')) fail('docker/README.md 缺少真实 Docker 验证边界说明');
}

function readPackageScripts() {
  const text = readRequired(path.join(courseRoot, 'package.json'), 'docker/package.json');
  if (!text) return {};
  try {
    const scripts = JSON.parse(text).scripts ?? {};
    for (const scriptName of ['demo:list', 'demo:all', 'test', 'lint']) {
      if (!scripts[scriptName]) fail(`docker/package.json 缺少 ${scriptName} 脚本`);
    }
    for (const [lessonNo] of expectedTopics) {
      const actual = scripts[`demo:${lessonNo}`];
      const expected = `node scripts/serve-course.mjs ${lessonNo}`;
      if (actual !== expected) fail(`docker/package.json demo:${lessonNo} 应指向 ${expected}`);
    }
    return scripts;
  } catch (error) {
    fail(`docker/package.json JSON 解析失败: ${error.message}`);
    return {};
  }
}

function listLessons() {
  if (!existsSync(lessonsRoot)) {
    fail('缺少 docker/lessons 课程目录');
    return [];
  }
  const dirs = readdirSync(lessonsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (dirs.length !== expectedTopics.length) fail(`课程数量应为 ${expectedTopics.length}，实际为 ${dirs.length}`);
  for (const [lessonNo] of expectedTopics) {
    if (!dirs.some((name) => name.startsWith(`${lessonNo}-`))) fail(`缺少第 ${lessonNo} 课目录`);
  }
  return dirs;
}

function checkLesson(lessonDirName) {
  const lessonNo = lessonDirName.slice(0, 2);
  const dir = path.join(lessonsRoot, lessonDirName);
  const readme = readRequired(path.join(dir, 'README.md'), `${lessonDirName}/README.md`);
  const html = readRequired(path.join(dir, 'index.html'), `${lessonDirName}/index.html`);
  const demo = readRequired(path.join(dir, 'demo.js'), `${lessonDirName}/demo.js`);
  const validator = readRequired(path.join(dir, 'validate.sh'), `${lessonDirName}/validate.sh`);

  if (readme) {
    if (!hasChinese(readme)) fail(`${lessonDirName}/README.md 缺少中文文档`);
    if (!readme.includes(`npm run demo:${lessonNo}`)) fail(`${lessonDirName}/README.md 缺少 npm run demo:${lessonNo} 说明`);
    if (!readme.includes('./validate.sh')) fail(`${lessonDirName}/README.md 缺少 validate.sh 验证入口说明`);
  }
  if (html && !html.includes('./demo.js')) fail(`${lessonDirName}/index.html 未引用 ./demo.js`);
  if (demo && !hasChinese(demo)) fail(`${lessonDirName}/demo.js 缺少中文注释`);
  if (validator) {
    const validatorPath = path.join(dir, 'validate.sh');
    if (!validator.startsWith('#!/usr/bin/env bash')) fail(`${lessonDirName}/validate.sh 缺少 bash shebang`);
    if (!validator.includes('set -euo pipefail')) fail(`${lessonDirName}/validate.sh 缺少 set -euo pipefail`);
    if (!hasChinese(validator)) fail(`${lessonDirName}/validate.sh 缺少中文提示或注释`);
    if ((statSync(validatorPath).mode & 0o111) === 0) fail(`${lessonDirName}/validate.sh 不可执行`);
    const syntax = spawnSync('bash', ['-n', validatorPath], { cwd: courseRoot, encoding: 'utf8' });
    if (syntax.status !== 0) fail(`${lessonDirName}/validate.sh bash -n 失败: ${syntax.stderr.trim()}`);
  }

  const files = walkFiles(dir);
  const dockerAssets = files.filter((file) => ['Dockerfile', 'compose.yml', 'compose.yaml', 'compose.prod.yml', '.env.example', 'deploy-template.sh'].includes(path.basename(file)));
  if (dockerAssets.length === 0) fail(`${lessonDirName} 缺少 Docker/Compose/部署模板资产`);
  for (const artifactPath of dockerAssets) {
    const artifact = path.basename(artifactPath);
    const text = readFileSync(artifactPath, 'utf8');
    if (artifact === 'Dockerfile' && !/^FROM\s+/m.test(text)) fail(`${rel(artifactPath)} 缺少 FROM`);
    if (artifact.includes('compose') && !/services:/m.test(text)) fail(`${rel(artifactPath)} 缺少 services`);
    if (['Dockerfile', 'compose.yml', 'compose.yaml', 'compose.prod.yml', 'deploy-template.sh'].includes(artifact) && !hasChinese(text)) {
      fail(`${rel(artifactPath)} 缺少中文注释或说明`);
    }
  }
}

function runCommand(name, args) {
  const result = spawnSync(args[0], args.slice(1), { cwd: courseRoot, encoding: 'utf8' });
  if (result.status !== 0) fail(`${name} 执行失败:\n${result.stdout}${result.stderr}`);
}

console.log(`验证 Docker 课程契约: ${rel(courseRoot)}`);
checkRootReadme();
checkCourseIndex();
readPackageScripts();
for (const lesson of listLessons()) checkLesson(lesson);

if (existsSync(path.join(courseRoot, 'package.json'))) {
  runCommand('npm test', ['npm', 'test']);
  runCommand('npm run lint', ['npm', 'run', 'lint']);
  runCommand('npm run demo:all', ['npm', 'run', 'demo:all']);
}

if (failures.length > 0) {
  console.error('Docker 课程契约验证失败:');
  for (const message of failures) console.error(`- ${message}`);
  process.exit(1);
}
console.log('Docker 课程契约验证通过：根索引、6 课结构、中文文档/注释、独立浏览器 demo、课程验证与自检均已覆盖。');
