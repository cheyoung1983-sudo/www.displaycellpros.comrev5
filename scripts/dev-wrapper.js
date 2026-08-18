import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nextBin = path.resolve(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');

const rawArgs = process.argv.slice(2);
const sanitizedArgs = [];

let hasPort = false;
let hasHostname = false;

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--host') {
    hasHostname = true;
    sanitizedArgs.push('-H');
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
      sanitizedArgs.push(rawArgs[i + 1]);
      i++;
    } else {
      sanitizedArgs.push('0.0.0.0');
    }
  } else if (arg.startsWith('--host=')) {
    hasHostname = true;
    const val = arg.split('=')[1] || '0.0.0.0';
    sanitizedArgs.push('-H', val);
  } else if (arg === '-H' || arg === '--hostname') {
    hasHostname = true;
    sanitizedArgs.push(arg);
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
      sanitizedArgs.push(rawArgs[i + 1]);
      i++;
    }
  } else if (arg.startsWith('-H=') || arg.startsWith('--hostname=')) {
    hasHostname = true;
    sanitizedArgs.push('-H', arg.split('=')[1] || '0.0.0.0');
  } else if (arg === '-p' || arg === '--port') {
    hasPort = true;
    sanitizedArgs.push(arg);
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith('-')) {
      sanitizedArgs.push(rawArgs[i + 1]);
      i++;
    }
  } else if (arg.startsWith('-p=') || arg.startsWith('--port=')) {
    hasPort = true;
    sanitizedArgs.push('-p', arg.split('=')[1] || '3000');
  } else {
    sanitizedArgs.push(arg);
  }
}

if (!hasPort) {
  sanitizedArgs.unshift('-p', '3000');
}
if (!hasHostname) {
  sanitizedArgs.unshift('-H', '0.0.0.0');
}

const child = spawn(process.execPath, [nextBin, 'dev', ...sanitizedArgs], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});

