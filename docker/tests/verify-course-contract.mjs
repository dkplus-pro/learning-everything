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
function fail(message) {
  failures.push(message);
}

function rel(filePath) {
  return path.relative(repoRoot, filePath) || '.';
}

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

function hasChinese(text) {
  return /[\u4e00-\u9fff]/.test(text);
}

function checkRootReadme() {
  const readme = readRequired(path.join(repoRoot, 'README.md'), '根 README 索引');
  if (!readme) return;
  if (!readme.includes('docker/README.md') && !readme.includes('Docker')) {
    fail('根 README.md 未索引 Docker 课程');
  }
}

function checkCourseIndex() {
  const readme = readRequired(path.join(courseRoot, 'README.md'), 'docker/README.md');
  if (!readme) return;
  for (const [lessonNo, topic] of expectedTopics) {
    if (!readme.includes(`demo:${lessonNo}`)) fail(`docker/README.md 缺少 demo:${lessonNo} 运行方式`);
    if (!readme.includes(topic)) fail(`docker/README.md 缺少主题：${topic}`);
  }
  if (!hasChinese(readme)) fail('docker/README.md 缺少中文课程说明');
}

function readPackageScripts() {
  const text = readRequired(path.join(courseRoot, 'package.json'), 'docker/package.json');
  if (!text) return {};
  try {
    const pkg = JSON.parse(text);
    const scripts = pkg.scripts ?? {};
    for (const scriptName of ['demo:list', 'demo:all', 'test', 'lint']) {
      if (!scripts[scriptName]) fail(`docker/package.json 缺少 ${scriptName} 脚本`);
    }
    for (const [lessonNo] of expectedTopics) {
      if (!scripts[`demo:${lessonNo}`]) fail(`docker/package.json 缺少 demo:${lessonNo} 独立脚本`);
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

function checkLesson(lessonDirName, scripts) {
  const lessonNo = lessonDirName.slice(0, 2);
  const dir = path.join(lessonsRoot, lessonDirName);
  const readme = readRequired(path.join(dir, 'README.md'), `${lessonDirName}/README.md`);
  const runner = readRequired(path.join(dir, 'run-demo.sh'), `${lessonDirName}/run-demo.sh`);

  if (readme) {
    if (!hasChinese(readme)) fail(`${lessonDirName}/README.md 缺少中文文档`);
    if (!readme.includes(`npm run demo:${lessonNo}`)) fail(`${lessonDirName}/README.md 缺少 npm run demo:${lessonNo} 说明`);
    if (!readme.includes('验证')) fail(`${lessonDirName}/README.md 缺少验证说明`);
  }

  if (runner) {
    const runnerPath = path.join(dir, 'run-demo.sh');
    if (!runner.startsWith('#!/usr/bin/env bash')) fail(`${lessonDirName}/run-demo.sh 缺少 bash shebang`);
    if (!runner.includes('set -euo pipefail')) fail(`${lessonDirName}/run-demo.sh 缺少 set -euo pipefail`);
    if (!runner.includes('DEMO_DRY_RUN')) fail(`${lessonDirName}/run-demo.sh 缺少 DEMO_DRY_RUN dry-run 支持`);
    if (!hasChinese(runner)) fail(`${lessonDirName}/run-demo.sh 缺少中文提示或注释`);
    if ((statSync(runnerPath).mode & 0o111) === 0) fail(`${lessonDirName}/run-demo.sh 不可执行`);
    const syntax = spawnSync('bash', ['-n', runnerPath], { cwd: courseRoot, encoding: 'utf8' });
    if (syntax.status !== 0) fail(`${lessonDirName}/run-demo.sh bash -n 失败: ${syntax.stderr.trim()}`);
  }

  const expectedScript = `bash lessons/${lessonDirName}/run-demo.sh`;
  if (scripts[`demo:${lessonNo}`] !== expectedScript) {
    fail(`docker/package.json demo:${lessonNo} 应指向 ${expectedScript}`);
  }

  const artifactNames = ['Dockerfile', 'compose.yaml', 'compose.yml', 'compose.prod.yaml', 'docker-compose.yml', '.env.example', 'deploy-template.sh'];
  const artifacts = artifactNames.filter((name) => existsSync(path.join(dir, name)));
  const runnerHasDockerDemo = /\bdocker\s+(run|build|network|volume|compose)\b/.test(runner);
  if (artifacts.length === 0 && !runnerHasDockerDemo) {
    fail(`${lessonDirName} 缺少 Docker/Compose/部署模板资产，且 run-demo.sh 未包含 docker demo 命令`);
  }

  for (const artifact of artifacts) {
    const artifactPath = path.join(dir, artifact);
    const text = readFileSync(artifactPath, 'utf8');
    if (artifact === 'Dockerfile' && !/^FROM\s+/m.test(text)) fail(`${lessonDirName}/Dockerfile 缺少 FROM`);
    if (artifact.includes('compose') && !/services:/m.test(text)) fail(`${lessonDirName}/${artifact} 缺少 services`);
    if (['Dockerfile', 'compose.yaml', 'compose.yml', 'compose.prod.yaml', 'deploy-template.sh'].includes(artifact) && !hasChinese(text)) {
      fail(`${lessonDirName}/${artifact} 缺少中文注释或说明`);
    }
  }
}

function runCommand(name, args) {
  const result = spawnSync(args[0], args.slice(1), { cwd: courseRoot, encoding: 'utf8' });
  if (result.status !== 0) {
    fail(`${name} 执行失败:\n${result.stdout}${result.stderr}`);
  }
}

function main() {
  console.log(`验证 Docker 课程契约: ${rel(courseRoot)}`);
  checkRootReadme();
  checkCourseIndex();
  const scripts = readPackageScripts();
  for (const lesson of listLessons()) checkLesson(lesson, scripts);

  // 复用课程自带验证，确保结构检查和 dry-run 运行入口都能端到端通过。
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
  console.log('Docker 课程契约验证通过：根索引、6 课结构、中文文档/注释、独立 demo、dry-run 与课程自检均已覆盖。');
}

main();
