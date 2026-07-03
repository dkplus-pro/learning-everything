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
  ['01', 'docker-basics', 'Docker 基础运行', 'Dockerfile'],
  ['02', 'image-dockerfile', '镜像与 Dockerfile', 'Dockerfile'],
  ['03', 'volume-network', '数据卷与网络', 'Dockerfile'],
  ['04', 'compose-multi-service', 'Compose 多服务', 'compose.yaml'],
  ['05', 'debug-production', '调试与生产化', 'Dockerfile'],
  ['06', 'remote-deploy', '远程服务器部署流程', 'deploy-template.sh'],
];

function file(target, body) {
  writeFileSync(target, body, 'utf8');
}

function makeFixture({ valid }) {
  const repo = path.join(tempRoot, valid ? 'valid-repo' : 'invalid-repo');
  const docker = path.join(repo, 'docker');
  const lessonsRoot = path.join(docker, 'lessons');
  const scriptsRoot = path.join(docker, 'scripts');
  mkdirSync(lessonsRoot, { recursive: true });
  mkdirSync(scriptsRoot, { recursive: true });

  file(path.join(repo, 'README.md'), valid ? '# Learning Everything\n\n- [Docker 课程](docker/README.md)\n' : '# Learning Everything\n');
  file(path.join(docker, 'README.md'), `# Docker 从零课程\n\n${lessons.map(([id, , title]) => `- ${title}：npm run demo:${id}`).join('\n')}\n`);
  file(path.join(docker, 'package.json'), JSON.stringify({
    private: true,
    type: 'module',
    scripts: Object.fromEntries([
      ['demo:list', 'node scripts/list-lessons.mjs'],
      ['demo:all', 'node scripts/run-dry-demos.mjs'],
      ['test', 'node scripts/verify-course.mjs'],
      ['lint', 'node scripts/verify-course.mjs --lint-only'],
      ...lessons.map(([id, slug]) => [`demo:${id}`, `bash lessons/${id}-${slug}/run-demo.sh`]),
    ]),
  }, null, 2));
  file(path.join(scriptsRoot, 'verify-course.mjs'), "console.log('课程自检通过');\n");
  file(path.join(scriptsRoot, 'list-lessons.mjs'), "console.log('列出课程');\n");
  file(path.join(scriptsRoot, 'run-dry-demos.mjs'), "console.log('dry-run 通过');\n");

  for (const [id, slug, title, artifact] of lessons) {
    const dir = path.join(lessonsRoot, `${id}-${slug}`);
    mkdirSync(dir, { recursive: true });
    file(path.join(dir, 'README.md'), `# ${title}\n\n中文说明：运行 npm run demo:${id}。\n\n## 验证\n使用 dry-run 验证。\n`);
    const runner = path.join(dir, 'run-demo.sh');
    file(runner, `#!/usr/bin/env bash\nset -euo pipefail\n# 中文提示：第 ${id} 课 dry-run\nif [[ "${'${DEMO_DRY_RUN:-}'}" == "1" ]]; then echo 验证通过; exit 0; fi\necho 运行 demo\n`);
    chmodSync(runner, 0o755);
    if (artifact === 'Dockerfile') file(path.join(dir, artifact), `# 中文注释：镜像演示\nFROM alpine:3.20\n`);
    else if (artifact.includes('compose')) file(path.join(dir, artifact), 'services:\n  app:\n    # 中文注释：Compose 服务\n    image: alpine:3.20\n');
    else file(path.join(dir, artifact), '#!/usr/bin/env bash\n# 中文注释：远程部署模板\n');
  }

  if (!valid) file(path.join(lessonsRoot, '04-compose-multi-service', 'compose.yaml'), 'name: bad\n');
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
