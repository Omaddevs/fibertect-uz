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

const MAX_UPLOAD_MB = 5

const imageSize = (url) => new Promise((done, fail) => {
  const image = new Image()
  image.onload = () => done({ width: image.naturalWidth, height: image.naturalHeight })
  image.onerror = () => fail(new Error('Rasmni öqib bölmadi. Boşqa fayl tanlang.'))
  image.src = url
})

// Natija: { url, width, height }.
export async function uploadImage(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Faqat PNG, JPG yoki WebP rasm yuklang.')
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new Error(`Rasm ${MAX_UPLOAD_MB} MB dan oşmasin.`)
  let response
  try {
    response = await fetch('/api/admin/uploads', { method: 'POST', headers: { 'Content-Type': file.type }, body: file })
  } catch {
    throw new Error('Server bilan aloqa yöq. Internetni tekşirib, qayta urinib köring.')
  }
  const data = await response.json().catch(() => ({}))
  if (response.status === 401) window.dispatchEvent(new Event(SESSION_EXPIRED))
  if (!response.ok) throw new Error(data.error ?? 'Rasm yuklanmadi.')
  return { url: data.url, ...(await imageSize(data.url)) }
}

export const formatNumber = (n) => new Intl.NumberFormat('ru-RU').format(n)
