import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

// 中文说明：逐个启动课程的浏览器 demo，看到“已启动”即认为 demo 可运行，然后主动停止服务。
const lessons = ['01', '02', '03', '04', '05', '06'];
let failures = 0;

async function smokeLesson(lesson) {
  const child = spawn(process.execPath, ['scripts/serve-course.mjs', lesson], {
    cwd: new URL('..', import.meta.url),
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (output.includes('demo 已启动')) {
      child.kill('SIGTERM');
      console.log(`PASS demo:${lesson} 已启动`);
      return;
    }
    if (child.exitCode !== null) break;
    await delay(100);
  }

  child.kill('SIGTERM');
  failures += 1;
  console.error(`FAIL demo:${lesson} 未能启动\n${output}`);
}

for (const lesson of lessons) {
  await smokeLesson(lesson);
}

if (failures > 0) process.exit(1);
console.log('全部 Docker 课程浏览器 demo 启动冒烟通过。');
