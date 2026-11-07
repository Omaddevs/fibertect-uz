// Admin paneldan yuklangan rasmlar. Fayl turi nomidan emas, ichidagi baytlardan aniqlanadi.
// SVG va HTML qabul qilinmaydi: ular brauzerda skript sifatida ishlashi mumkin.
import { randomBytes } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const UPLOAD_PATH = /^\/uploads\/([a-f0-9]{32}\.(?:webp|png|jpg))$/

export function imageExtension(buffer) {
  if (buffer.length < 12) return null
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg'
  if (buffer.toString('latin1', 0, 4) === 'RIFF' && buffer.toString('latin1', 8, 12) === 'WEBP') return 'webp'
  return null
}

export function saveUpload(dir, buffer) {
  const extension = imageExtension(buffer)
  if (!extension) return null
  mkdirSync(dir, { recursive: true })
  const name = `${randomBytes(16).toString('hex')}.${extension}`
  writeFileSync(join(dir, name), buffer, { flag: 'wx' })
  return `/uploads/${name}`
}
