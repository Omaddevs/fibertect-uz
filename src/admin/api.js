export const SESSION_EXPIRED = 'admin:session-expired'

export async function api(path, { method = 'GET', body } = {}) {
  let response
  try {
    response = await fetch(`/api/admin${path}`, {
      method,
      headers: method === 'GET' ? undefined : { 'Content-Type': 'application/json' },
      body: method === 'GET' ? undefined : JSON.stringify(body ?? {}),
    })
  } catch {
    throw new Error('Server bilan aloqa yöq. Internetni tekşirib, qayta urinib köring.')
  }
  const data = await response.json().catch(() => ({}))
  // Proksi yoki hosting javobi: server umuman ishlamayapti.
  if (response.status >= 502) throw new Error('Serverga ulanib bölmadi. Server ishlayotganini tekşiring (npm run dev).')
  if (response.status === 401 && path !== '/login' && path !== '/me') window.dispatchEvent(new Event(SESSION_EXPIRED))
  if (!response.ok) throw Object.assign(new Error(data.error ?? 'Xatolik yuz berdi.'), { status: response.status, data })
  return data
}

export const formatNumber = (n) => new Intl.NumberFormat('ru-RU').format(n)
