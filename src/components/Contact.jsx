import { useState } from 'react'
import { ArrowUpRight, Check, Info, Mail, Send } from 'lucide-react'
import { useSiteData } from '../data/SiteData.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'

function ContactLink({ href, icon: Icon, label, value, external }) {
  return (
    <a className="contact__link" href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      <span className="contact__link-inner">
        <span className="contact__link-top">
          <span className="contact__icon"><Icon size={19} strokeWidth={1.6} aria-hidden="true" /></span>
          <ArrowUpRight size={20} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <span className="contact__link-text">
          <small>{label}</small>
          {value}
        </span>
      </span>
    </a>
  )
}

export default function Contact() {
  const { t, lang } = useLanguage()
  const { contact: c, services } = t
  const { contact } = useSiteData()
  const [status, setStatus] = useState('idle')

  // Ariza serverda saqlanadi. Xato bo'lsa forma tozalanmaydi: yozilgan matn yo'qolmaydi.
  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    setStatus('sending')
    try {
      const response = await fetch('/api/public/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, lang }),
      })
      if (!response.ok) throw new Error(String(response.status))
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const notes = { idle: c.noteIdle, sending: c.sending, sent: c.noteSent, error: c.noteError }

  return (
    <section className="contact" id="contact">
      <div className="contact__grid">
        <div className="contact__intro">
          <h2 className="contact__title">
            {c.title.before} {c.title.serif} {c.title.after}
          </h2>
          <p className="contact__lead">{c.lead}</p>

          <div className="contact__steps">
            <h3 className="contact__steps-title">{c.stepsTitle}</h3>
            <ol>
              {c.steps.map((step, i) => (
                <li key={i}>
                  <span className="contact__step-num" aria-hidden="true">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <ul className="contact__links">
            <li>
              <ContactLink href={`mailto:${contact.email}`} icon={Mail} label="Email" value={contact.email} />
            </li>
            <li>
              <ContactLink href={contact.telegram.href} icon={Send} label="Telegram" value={contact.telegram.label} external />
            </li>
          </ul>
        </div>

        <div className="contact__card">
          <form className="contact__form" onSubmit={handleSubmit}>
            <label className="contact__field contact__field--half">
              <span className="contact__label">{c.name}</span>
              <input name="name" type="text" autoComplete="name" placeholder={c.namePlaceholder} minLength={2} maxLength={100} required />
            </label>
            <label className="contact__field contact__field--half">
              <span className="contact__label">{c.reach}</span>
              <input name="reach" type="text" placeholder={c.reachPlaceholder} minLength={3} maxLength={100} required />
            </label>

            <fieldset className="contact__services">
              <legend className="contact__label">{c.serviceLabel}</legend>
              <div className="contact__chips">
                {/* Kalit tilga bog'liq emas: til almashganda tanlangan xizmat saqlanadi. */}
                {services.items.map((s, i) => (
                  <label className="contact__chip" key={i}>
                    <input type="radio" name="service" value={s.title} />
                    <span>{s.title}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="contact__field contact__field--grow">
              <span className="contact__label">{c.message}</span>
              <textarea name="message" rows="4" placeholder={c.messagePlaceholder} minLength={3} maxLength={3000} required />
            </label>

            {/* Odam ko'rmaydi, botlar to'ldiradi. */}
            <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }} />

            <div className="contact__foot">
              <button type="submit" className="cta-btn cta-btn--primary contact__submit" disabled={status === 'sending'}>
                {c.submit}
                <span className="cta-btn__icon">
                  <Send size={20} strokeWidth={1.8} aria-hidden="true" />
                </span>
              </button>
              <p className={`contact__note ${status === 'sent' ? 'is-sent' : ''}`} role="status">
                {status === 'sent' ? <Check size={16} strokeWidth={2} aria-hidden="true" /> : <Info size={16} strokeWidth={1.7} aria-hidden="true" />}
                {notes[status]}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
