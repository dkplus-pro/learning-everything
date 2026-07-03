#!/usr/bin/env node
import { mkdtempSync, mkdirSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractScript = path.join(__dirname, 'verify-course-contract.mjs');
const tempRoot = mkdtempSync(path.join(tmpdir(), 'docker-course-contract-'));

const lessons = [
  ['01', 'basic-run', 'Docker 基础运行', 'Dockerfile'],
  ['02', 'image-dockerfile', '镜像与 Dockerfile', 'Dockerfile'],
  ['03', 'volumes-networking', '数据卷与网络', 'Dockerfile'],
  ['04', 'compose-multi-service', 'Compose 多服务', 'compose.yml'],
  ['05', 'debug-production', '调试与生产化', 'Dockerfile'],
  ['06', 'remote-deploy', '远程服务器部署流程', 'deploy-template.sh'],
];

const file = (target, body) => writeFileSync(target, body, 'utf8');

function makeFixture({ valid }) {
  const repo = path.join(tempRoot, valid ? 'valid-repo' : 'invalid-repo');
  const docker = path.join(repo, 'docker');
  const lessonsRoot = path.join(docker, 'lessons');
  const scriptsRoot = path.join(docker, 'scripts');
  mkdirSync(lessonsRoot, { recursive: true });
  mkdirSync(scriptsRoot, { recursive: true });

  file(path.join(repo, 'README.md'), '# Learning Everything\n\n- [Docker 课程](docker/README.md)\n');
  file(path.join(docker, 'README.md'), `# Docker 从零课程\n\n${lessons.map(([, , title]) => `- ${title}`).join('\n')}\n\n运行 ./scripts/validate-all.sh。需要真实 Docker 时运行 RUN_DOCKER=1。\n`);
  file(path.join(docker, 'package.json'), JSON.stringify({
    private: true,
    type: 'module',
    scripts: Object.fromEntries([
      ['demo:list', 'node scripts/serve-course.mjs --list'],
      ['demo:all', 'node scripts/smoke-demos.mjs'],
      ['test', 'node scripts/verify-course-demos.mjs && ./scripts/validate-all.sh'],
      ['lint', 'node scripts/verify-course-demos.mjs'],
      ...lessons.map(([id]) => [`demo:${id}`, `node scripts/serve-course.mjs ${id}`]),
    ]),
  }, null, 2));
  file(path.join(scriptsRoot, 'serve-course.mjs'), "console.log('demo 已启动');\n");
  file(path.join(scriptsRoot, 'smoke-demos.mjs'), "console.log('全部 demo 通过');\n");
  file(path.join(scriptsRoot, 'verify-course-demos.mjs'), "console.log('课程自检通过');\n");
  const validateAll = path.join(scriptsRoot, 'validate-all.sh');
  file(validateAll, '#!/usr/bin/env bash\nset -euo pipefail\n# 中文注释：总验证\necho 全部通过\n');
  chmodSync(validateAll, 0o755);

  for (const [id, slug, title, artifact] of lessons) {
    const dir = path.join(lessonsRoot, `${id}-${slug}`);
    mkdirSync(dir, { recursive: true });
    file(path.join(dir, 'README.md'), `# ${title}\n\n中文说明：运行 npm run demo:${id}。\n\n先运行 ./validate.sh。\n`);
    file(path.join(dir, 'index.html'), '<script type="module" src="./demo.js"></script>\n');
    file(path.join(dir, 'demo.js'), '// 中文注释：浏览器 demo\nconsole.log("demo");\n');
    const validator = path.join(dir, 'validate.sh');
    file(validator, `#!/usr/bin/env bash\nset -euo pipefail\n# 中文提示：第 ${id} 课验证\necho 验证通过\n`);
    chmodSync(validator, 0o755);
    if (artifact === 'Dockerfile') file(path.join(dir, artifact), '# 中文注释：镜像演示\nFROM alpine:3.20\n');
    else if (artifact.includes('compose')) file(path.join(dir, artifact), 'services:\n  app:\n    # 中文注释：Compose 服务\n    image: alpine:3.20\n');
    else {
      const templates = path.join(dir, 'templates');
      mkdirSync(templates, { recursive: true });
      file(path.join(templates, artifact), '#!/usr/bin/env bash\n# 中文注释：远程部署模板\n');
    }
  }

  if (!valid) file(path.join(lessonsRoot, '04-compose-multi-service', 'compose.yml'), 'name: bad\n');
  return { repo, docker };
}

function runContract(fixture) {
  return spawnSync(process.execPath, [contractScript], {
    cwd: fixture.repo,
    env: { ...process.env, DOCKER_REPO_ROOT: fixture.repo, DOCKER_COURSE_ROOT: fixture.docker },
    encoding: 'utf8',
  });
}

try {
  const valid = runContract(makeFixture({ valid: true }));
  if (valid.status !== 0) {
    console.error('有效课程契约夹具应通过。');
    console.error(valid.stdout);
    console.error(valid.stderr);
    process.exit(1);
  }

  const invalid = runContract(makeFixture({ valid: false }));
  if (invalid.status === 0 || !invalid.stderr.includes('缺少 services')) {
    console.error('无效课程契约夹具应被拒绝。');
    console.error(invalid.stdout);
    console.error(invalid.stderr);
    process.exit(1);
  }

  console.log('Docker 课程契约测试自测通过：有效夹具通过，无效 Compose 夹具被拒绝。');
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
