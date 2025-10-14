#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🚀 Starting development servers...');
console.log('📝 Frontend: http://localhost:3000');
console.log('🔌 PartyKit: http://localhost:1999');
console.log('⚡ API: http://localhost:3001');

// Start Vite dev server (frontend)
const vite = spawn('bun', ['run', 'dev'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
});

// Start PartyKit dev server (real-time)
const partykit = spawn('bun', ['run', 'dev:party'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
});

// Start Nitro dev server (API) with a small delay to avoid conflicts
setTimeout(() => {
  const nitro = spawn('bun', ['run', 'dev:nitro'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
  });

  // Handle Nitro errors
  nitro.on('error', (err) => {
    console.error('Nitro error:', err);
  });

  // Store nitro process for cleanup
  process.nitroProcess = nitro;
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development servers...');
  vite.kill();
  partykit.kill();
  if (process.nitroProcess) {
    process.nitroProcess.kill();
  }
  process.exit(0);
});

// Handle errors
vite.on('error', (err) => {
  console.error('Vite error:', err);
});

partykit.on('error', (err) => {
  console.error('PartyKit error:', err);
});
