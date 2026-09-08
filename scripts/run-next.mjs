import { config } from 'dotenv';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
config({ path: '.env' });
const [requestedMode = 'auto', ...args] = process.argv.slice(2);
if (!['auto', 'dev', 'start'].includes(requestedMode)) throw new Error('Expected auto, dev or start');
const appEnv = process.env.APP_ENV?.trim() || 'development';
if (!['development', 'production'].includes(appEnv)) {
  console.error('APP_ENV must be development or production.');
  process.exit(1);
}
const mode = requestedMode === 'auto' ? (appEnv === 'production' ? 'start' : 'dev') : requestedMode;
const nodeEnv = mode === 'dev' ? 'development' : 'production';
if (requestedMode === 'auto' && mode === 'dev' && !args.includes('--turbopack')) args.push('--turbopack');
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
console.error('[VIBARY] ' + nodeEnv + ' | http://localhost:' + port);
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), mode, '--port', port, ...args], {
  stdio: 'inherit', env: { ...process.env, APP_ENV: nodeEnv, NODE_ENV: nodeEnv, PORT: port },
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
