#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🚀 Starting development servers (simple mode)...');
console.log('📝 Frontend: http://localhost:3000');
console.log('🔌 PartyKit: http://localhost:1999');
console.log('⚡ API: http://localhost:3001');
console.log('');
console.log('Press Ctrl+C to stop all servers');

// Start servers with reduced file watching
const vite = spawn('bun', ['run', 'dev'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    // Reduce file watching to prevent EMFILE errors
    CHOKIDAR_USEPOLLING: 'false',
    CHOKIDAR_INTERVAL: '1000',
  },
});

const partykit = spawn('bun', ['run', 'dev:party'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
});

// Start Nitro with a delay and reduced file watching
setTimeout(() => {
  const nitro = spawn('bun', ['run', 'dev:nitro'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      // Reduce file watching
      NITRO_WATCH: 'false',
    },
  });

  process.nitroProcess = nitro;
}, 3000);

// Clean shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  vite.kill('SIGTERM');
  partykit.kill('SIGTERM');
  if (process.nitroProcess) {
    process.nitroProcess.kill('SIGTERM');
  }

  // Force exit after a short delay
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

// Handle errors gracefully
vite.on('error', (err) => {
  console.error('❌ Vite error:', err.message);
});

partykit.on('error', (err) => {
  console.error('❌ PartyKit error:', err.message);
});
