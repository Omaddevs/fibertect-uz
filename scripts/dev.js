// `npm run dev`: sayt (Vite) va server birga ishga tushadi, server kodi o'zgarsa o'zi qayta yuklanadi.
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const viteBin = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url))

const children = [
  spawn(process.execPath, ['--env-file-if-exists=.env', '--watch', 'server/index.js'], { cwd: root, stdio: 'inherit' }),
  spawn(process.execPath, [viteBin, ...process.argv.slice(2)], { cwd: root, stdio: 'inherit' }),
]

const stop = () => {
  for (const child of children) child.kill()
  process.exit()
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
