import { config } from 'dotenv';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
config({ path: '.env' });
const [mode, ...args] = process.argv.slice(2);
if (!['dev', 'start'].includes(mode)) throw new Error('Expected dev or start');
let port = process.env.PORT || '3009';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '-p' || args[i] === '--port') {
    port = args[i + 1];
    args.splice(i, 2); i--;
  } else if (args[i].startsWith('--port=')) {
    port = args[i].slice(7); args.splice(i, 1); i--;
  }
}
if (!/^\d+$/.test(port || '') || Number(port) < 1 || Number(port) > 65535) {
  console.error('PORT must be an integer between 1 and 65535.');
  process.exit(1);
}
const require = createRequire(import.meta.url);
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), mode, '--port', port, ...args], {
  stdio: 'inherit', env: { ...process.env, PORT: port },
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
