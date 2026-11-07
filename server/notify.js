// Yangi ariza haqida Telegram'ga xabar. Token sozlanmagan bo'lsa jim turadi: ariza baribir bazada saqlanadi.
const TIMEOUT_MS = 10000

export function createTelegram({ token, chatId, apiBase = 'https://api.telegram.org', fetchImpl = globalThis.fetch }) {
  const configured = Boolean(token && chatId)
  return {
    configured,
    // Xabar yetib borsa true. Xatoda token logga tushmasligi uchun faqat holat kodi yoziladi.
    async send(text) {
      if (!configured) return false
      try {
        const response = await fetchImpl(`${apiBase}/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        })
        if (!response.ok) console.error(`Telegram xabari yuborilmadi: HTTP ${response.status}`)
        return response.ok
      } catch (error) {
        console.error(`Telegram xabari yuborilmadi: ${error.name}`)
        return false
      }
    },
  }
}

export function leadMessage(lead) {
  return [
    '🆕 Yangi ariza (fibertech.uz)',
    '',
    `Ism: ${lead.name}`,
    `Aloqa: ${lead.reach}`,
    lead.service ? `Xizmat: ${lead.service}` : null,
    '',
    lead.message,
  ].filter((line) => line !== null).join('\n')
}
