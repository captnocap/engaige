/**
 * Dev script that runs both server and vite together
 * Used by `bun run tauri dev` via beforeDevCommand
 */

import { spawn } from 'child_process'

console.log('[dev] Starting server and vite...')

// Start the backend server
const server = spawn('bun', ['run', 'server/src/index.ts'], {
  stdio: 'inherit',
  shell: true,
})

// Give server a moment to start, then start vite
setTimeout(() => {
  const vite = spawn('bun', ['run', 'vite'], {
    stdio: 'inherit',
    shell: true,
  })

  vite.on('close', (code) => {
    console.log('[dev] Vite exited with code', code)
    server.kill()
    process.exit(code ?? 0)
  })
}, 500)

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n[dev] Shutting down...')
  server.kill()
  process.exit(0)
})

process.on('SIGTERM', () => {
  server.kill()
  process.exit(0)
})
