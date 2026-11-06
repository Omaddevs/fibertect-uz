// Maqola matni admin panelda oddiy yozuvda tahrirlanadi, saytda bo'limlar ko'rinishida saqlanadi:
//   ## Sarlavha        yangi bo'lim
//   - Band             ro'yxat bandi
//   Oddiy matn         xatboshi (bo'sh qator bilan ajratiladi)
// HTML ishlatilmaydi: matn saytda doim oddiy matn bo'lib chiqadi.
export function parseBody(source) {
  const sections = []
  let current = null
  const open = (h) => {
    current = { ...(h ? { h } : {}), p: [] }
    sections.push(current)
    return current
  }

  for (const block of source.replace(/\r\n/g, '\n').split(/\n\s*\n/)) {
    let paragraph = []
    const flush = () => {
      if (!paragraph.length) return
      // Ro'yxatdan keyingi xatboshi yangi bo'lim: tartib buzilmasin.
      if (!current || current.list) open()
      current.p.push(paragraph.join(' '))
      paragraph = []
    }
    for (const raw of block.split('\n')) {
      const line = raw.trim()
      if (!line) continue
      if (line.startsWith('## ')) {
        flush()
        open(line.slice(3).trim())
      } else if (line.startsWith('- ')) {
        flush()
        if (!current) open()
        current.list = [...(current.list ?? []), line.slice(2).trim()]
      } else {
        paragraph.push(line)
      }
    }
    flush()
  }
  return sections
}

export function formatBody(sections = []) {
  return sections
    .map((s) => [
      s.h ? `## ${s.h}` : null,
      ...s.p,
      s.list?.length ? s.list.map((item) => `- ${item}`).join('\n') : null,
    ].filter(Boolean).join('\n\n'))
    .join('\n\n')
}
