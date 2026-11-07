import assert from 'node:assert/strict'
import { createVerify, generateKeyPairSync } from 'node:crypto'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, describe, test } from 'node:test'
import { createSearchConsole } from '../server/gsc.js'
import { leadMessage } from '../server/notify.js'
import { imageExtension } from '../server/uploads.js'
import { defaultClients, defaultProjects } from '../src/data/editable.js'
import { isKnownPath } from '../src/data/routes.js'
import { formatBody, imageFromParagraph, parseBody } from '../src/lib/postFormat.js'

const IMAGE = '/uploads/0123456789abcdef0123456789abcdef.webp'

describe('maqola formati', () => {
  test('rasm alohida xatboshi bo\'ladi, atrofdagi matn buzilmaydi', () => {
    const [section] = parseBody(`Birinchi\n![Izoh](${IMAGE})\nIkkinchi`)
    assert.deepEqual(section.p, ['Birinchi', `![Izoh](${IMAGE})`, 'Ikkinchi'])
  })

  test('rasmli matn saqlab o\'qilganda o\'zgarmaydi', () => {
    const source = `## Sarlavha\n\nMatn\n\n![](${IMAGE})\n\n- Band`
    assert.equal(formatBody(parseBody(source)), source)
  })

  test('faqat yuklangan rasm tan olinadi', () => {
    assert.deepEqual(imageFromParagraph(`![Izoh](${IMAGE})`), { alt: 'Izoh', src: IMAGE })
    for (const text of ['![x](https://evil.example/a.png)', '![x](javascript:alert(1))', '![x](/works/iau.webp)', `Oddiy matn ![x](${IMAGE})`, 'Oddiy matn']) {
      assert.equal(imageFromParagraph(text), null, text)
    }
  })
})

describe('marshrutlar', () => {
  test('loyiha manzili ro\'yxat bo\'yicha tekshiriladi', () => {
    assert.equal(isKnownPath('/projects/bir', [], ['bir']), true)
    assert.equal(isKnownPath('/projects/ikki', [], ['bir']), false)
    assert.equal(isKnownPath('/blog/m', ['m'], []), true)
    assert.equal(isKnownPath('/services/websites', [], []), true)
  })
})

describe('boshlang\'ich ma\'lumot', () => {
  test('har bir loyiha hamma tilda to\'liq, galereya izohlari mos', () => {
    assert.equal(defaultProjects.length, 4)
    for (const project of defaultProjects) {
      for (const lang of ['uz', 'ru', 'en']) {
        const t = project.texts[lang]
        assert.ok(t.name && t.category && t.summary && t.task && t.solution && t.result, `${project.slug} ${lang}`)
        assert.equal(t.galleryAlt.length, project.gallery.length, `${project.slug} ${lang}`)
      }
    }
  })

  test('mijozlar mavjud loyihalarga bog\'langan', () => {
    for (const client of defaultClients) assert.ok(defaultProjects.some((p) => p.slug === client.project), client.id)
  })
})

describe('fayl turi', () => {
  test('baytlar bo\'yicha aniqlanadi', () => {
    assert.equal(imageExtension(Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(8)])), 'png')
    assert.equal(imageExtension(Buffer.concat([Buffer.from([0xff, 0xd8, 0xff]), Buffer.alloc(16)])), 'jpg')
    assert.equal(imageExtension(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP')])), 'webp')
    assert.equal(imageExtension(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WAVE')])), null)
    assert.equal(imageExtension(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')), null)
    assert.equal(imageExtension(Buffer.alloc(0)), null)
  })
})

describe('Telegram xabari', () => {
  test('xizmat bo\'lmasa qator chiqmaydi', () => {
    assert.ok(!leadMessage({ name: 'A', reach: 'B', service: '', message: 'M' }).includes('Xizmat'))
    assert.ok(leadMessage({ name: 'A', reach: 'B', service: 'Sayt', message: 'M' }).includes('Xizmat: Sayt'))
  })
})

describe('Search Console', () => {
  const dir = mkdtempSync(join(tmpdir(), 'fibertech-gsc-'))
  const keyFile = join(dir, 'key.json')
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const key = { client_email: 'bot@misol.iam.gserviceaccount.com', private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }) }
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status })
  after(() => rmSync(dir, { recursive: true, force: true }))

  function google({ tokenStatus = 200, queryStatus = 200 } = {}) {
    const calls = []
    const fetchImpl = async (url, init) => {
      calls.push({ url: String(url), init })
      if (String(url).includes('oauth2')) return json({ access_token: 'TOK' }, tokenStatus)
      const body = JSON.parse(init.body)
      if (!body.dimensions) return json({ rows: [{ clicks: 5, impressions: 50, ctr: 0.1, position: 3 }] }, queryStatus)
      return json({ rows: [{ keys: [body.dimensions[0] === 'query' ? 'it agentlik' : 'https://fibertech.uz/'], clicks: 5, impressions: 50, ctr: 0.1, position: 3 }] }, queryStatus)
    }
    return { calls, fetchImpl }
  }

  test('kalit bo\'lmasa o\'chiq, Google\'ga so\'rov ketmaydi', async () => {
    const { calls, fetchImpl } = google()
    const gsc = createSearchConsole({ keyFile: join(dir, 'yoq.json'), site: 'sc-domain:fibertech.uz', fetchImpl })
    assert.equal(gsc.configured, false)
    assert.deepEqual(await gsc.report(), { configured: false })
    assert.equal(calls.length, 0)
  })

  test('imzolangan token bilan so\'zlarni oladi va keshlaydi', async () => {
    writeFileSync(keyFile, JSON.stringify(key))
    const { calls, fetchImpl } = google()
    let now = Date.UTC(2026, 10, 7)
    const gsc = createSearchConsole({ keyFile, site: 'sc-domain:fibertech.uz', fetchImpl, now: () => now })
    const report = await gsc.report()

    assert.equal(report.configured, true)
    assert.deepEqual(report.queries.map((q) => q.key), ['it agentlik'])
    assert.equal(report.totals.clicks, 5)
    assert.equal(report.to, '2026-11-07')
    assert.equal(report.from, '2026-10-11')

    const assertion = new URLSearchParams(calls[0].init.body).get('assertion')
    const [head, claims, signature] = assertion.split('.')
    const verified = createVerify('RSA-SHA256').update(`${head}.${claims}`).verify(publicKey, signature, 'base64url')
    assert.equal(verified, true)
    const decoded = JSON.parse(Buffer.from(claims, 'base64url'))
    assert.equal(decoded.iss, key.client_email)
    assert.equal(decoded.aud, 'https://oauth2.googleapis.com/token')
    assert.match(decoded.scope, /webmasters\.readonly$/)
    assert.equal(decoded.exp - decoded.iat, 3600)

    const query = calls.find((c) => c.url.includes('searchAnalytics'))
    assert.ok(query.url.includes(encodeURIComponent('sc-domain:fibertech.uz')))
    assert.equal(query.init.headers.Authorization, 'Bearer TOK')

    const count = calls.length
    await gsc.report()
    assert.equal(calls.length, count, 'kesh ishlashi kerak')
    now += 13 * 60 * 60 * 1000
    await gsc.report()
    assert.ok(calls.length > count, 'kesh eskirgach yangilanadi')
  })

  test('xatolar tushunarli xabarga aylanadi va tez qayta urinadi', async () => {
    writeFileSync(keyFile, JSON.stringify(key))
    const forbidden = createSearchConsole({ keyFile, site: 's', fetchImpl: google({ queryStatus: 403 }).fetchImpl })
    assert.match((await forbidden.report()).error, /ruxsat/)
    const badGrant = createSearchConsole({ keyFile, site: 's', fetchImpl: google({ tokenStatus: 400 }).fetchImpl })
    assert.match((await badGrant.report()).error, /kalit/i)
    const offline = createSearchConsole({ keyFile, site: 's', fetchImpl: async () => { throw new TypeError('network') } })
    assert.match((await offline.report()).error, /boğlanib/)

    writeFileSync(keyFile, 'bu json emas')
    assert.match((await createSearchConsole({ keyFile, site: 's', fetchImpl: google().fetchImpl }).report()).error, /Kalit fayli/)
    writeFileSync(keyFile, JSON.stringify({ client_email: 'x' }))
    assert.match((await createSearchConsole({ keyFile, site: 's', fetchImpl: google().fetchImpl }).report()).error, /Kalit fayli/)
    writeFileSync(keyFile, JSON.stringify({ client_email: 'x', private_key: 'not a pem' }))
    assert.match((await createSearchConsole({ keyFile, site: 's', fetchImpl: google().fetchImpl }).report()).error, /Kalit fayli/)

    let calls = 0
    let now = 1000
    writeFileSync(keyFile, JSON.stringify(key))
    const retry = createSearchConsole({ keyFile, site: 's', now: () => now, fetchImpl: async () => { calls += 1; throw new TypeError('network') } })
    await retry.report()
    await retry.report()
    assert.equal(calls, 1)
    now += 6 * 60 * 1000
    await retry.report()
    assert.equal(calls, 2)
  })
})
