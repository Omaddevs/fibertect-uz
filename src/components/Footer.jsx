import { ArrowUp, Mail, Send } from 'lucide-react'
import { nav } from '../data/content.js'
import { useSiteData } from '../data/SiteData.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import { Tile, roundedPath } from './sceneParts.jsx'
import { Wordmark } from './Logo.jsx'

const ARROW = 'M8 3h21v21h-7V15L8 29l-5-5L17 10H8z'

const GRADIENTS = {
  ftDark: [['0', '#121020'], ['.55', '#2a1f55'], ['1', '#6d57d6']],
  ftTile: [['0', '#4a4458'], ['.5', '#17141f'], ['1', '#6a55c8']],
  ftGhost: [['0', '#33286a'], ['1', '#1b1542']],
  ftPanel: [['0', '#7c68ea'], ['.28', '#1c1a44'], ['1', '#0a0c26']],
  ftGreen: [['0', '#9cf7bb'], ['1', '#66e596']],
  ftBar: [['0', '#b35fd8'], ['1', '#7a55ea']],
}

// `suffix`: yashirin svg ichidagi gradientga murojaat brauzerlarda ishlamaydi,
// shuning uchun har bir sahna o'z nusxasini e'lon qiladi.
function Gradients({ suffix = '' }) {
  return Object.entries(GRADIENTS).map(([id, stops]) => (
    <linearGradient key={id} id={id + suffix} x1=".1" y1="0" x2=".8" y2="1">
      {stops.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
    </linearGradient>
  ))
}

function Scene({ f }) {
  return (
    <svg className="footer-scene" viewBox="0 0 1440 821" aria-hidden="true">
      <defs>
        <Gradients />
        <radialGradient id="ftSpark"><stop offset="0" stopColor="#d8ccff" stopOpacity=".8" /><stop offset=".35" stopColor="#c4b4ff" stopOpacity=".28" /><stop offset="1" stopColor="#b5a2ff" stopOpacity="0" /></radialGradient>
        <linearGradient id="ftBeam" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#a58cff" stopOpacity=".16" /><stop offset=".6" stopColor="#a58cff" stopOpacity=".05" /><stop offset="1" stopColor="#a58cff" stopOpacity="0" /></linearGradient>
        <filter id="ftB18" colorInterpolationFilters="sRGB" x="-40%" y="-20%" width="180%" height="140%"><feGaussianBlur stdDeviation="34" /></filter>
        <filter id="ftB3" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.5" /></filter>
        <filter id="ftGlow" colorInterpolationFilters="sRGB" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="11" /></filter>
      </defs>

      {/* Vertikal nurlar. Asosiy yorug'lik .footer-cta::before da */}
      <g filter="url(#ftB18)">
        <polygon points="130,821 220,821 200,300 150,300" fill="url(#ftBeam)" />
        <polygon points="330,821 420,821 390,420 350,420" fill="url(#ftBeam)" />
        <polygon points="990,821 1080,821 1060,320 1010,320" fill="url(#ftBeam)" />
        <polygon points="1290,821 1400,821 1380,120 1320,120" fill="url(#ftBeam)" />
      </g>
      {[[310, 270], [340, 455], [395, 415], [205, 420], [120, 660], [260, 700], [390, 540], [1115, 580], [1290, 490], [1330, 545], [1095, 470], [1200, 700], [1370, 655], [1010, 460], [980, 610], [620, 560]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2 + (i % 4) * 2.5} fill="url(#ftSpark)" />
      ))}

      {/* Xira plitkalar */}
      <Tile pts={[[140, 268], [206, 268], [178, 334], [114, 334]]} r={16} face="ftGhost" opacity={0.55} filter="url(#ftB3)" />
      <Tile pts={[[274, 616], [322, 656], [276, 708], [226, 668]]} r={12} face="ftGhost" opacity={0.75} filter="url(#ftB3)" />
      <Tile pts={[[1360, 362], [1442, 382], [1370, 476], [1282, 440]]} r={20} face="ftGhost" opacity={0.5} filter="url(#ftB3)" />
      <Tile pts={[[330, 206], [428, 206], [392, 250], [306, 248]]} r={14} face="ftGhost" opacity={0.3} filter="url(#ftB3)" />

      {/* Chap plitka: tasdiq belgisi */}
      <Tile pts={[[63, 516], [191, 467], [315, 559], [187, 613]]} r={40} depth={[0, 14]} face="ftDark" side="#5a47c0" edge="rgba(255,255,255,.2)" />
      <ellipse cx="190" cy="536" rx="60" ry="34" fill="#66e596" opacity=".55" filter="url(#ftGlow)" />
      <ellipse cx="190" cy="536" rx="57" ry="31" fill="url(#ftGreen)" />
      <path d="M166 535 L184 548 L216 523" fill="none" stroke="#10131f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

      {/* O'ng plitka: FiberTech belgisi */}
      <Tile pts={[[1057, 508], [1195, 501], [1260, 631], [1109, 642]]} r={38} depth={[-2, 12]} face="ftTile" side="#c39ae6" edge="rgba(255,255,255,.3)" />
      <path d={roundedPath([[1082, 520], [1183, 516], [1238, 615], [1125, 622]], 28)} fill="url(#ftGreen)" />
      <g transform="translate(1160 568) rotate(6) scale(2.7 2.4) translate(-16 -16)">
        <path d={ARROW} fill="#1a2b36" />
      </g>

      {/* Halqa */}
      <g transform="translate(1260 314) rotate(14)">
        <ellipse rx="90" ry="62" cy="9" fill="#2c1e4a" />
        <ellipse rx="90" ry="62" fill="#0c0a16" stroke="rgba(255,255,255,.2)" />
        <ellipse rx="64" ry="42" fill="none" stroke="rgba(255,255,255,.24)" strokeWidth="8" />
        <ellipse rx="64" ry="42" fill="none" stroke="#7ff2a8" strokeWidth="6" strokeLinecap="round" />
        <text className="scene-text" textAnchor="middle" y="-1" fontSize="19" transform="rotate(-8)">100%</text>
        <text className="scene-text" textAnchor="middle" y="17" fontSize="12.5" transform="rotate(-8)">{f.done}</text>
      </g>

      {/* Loyiha paneli */}
      <path d={roundedPath([[468, 631], [1015, 739], [958, 860], [425, 716]], 26)} fill="url(#ftPanel)" stroke="rgba(255,255,255,.14)" />
      <g transform="matrix(.97 .2 -.28 .82 612 642)">
        <text className="scene-text" fontSize="29" fontStyle="italic">{f.project}</text>
      </g>
      <g transform="matrix(.97 .2 -.28 .82 870 688)" opacity=".7">
        <text className="scene-text" fontSize="26" fontStyle="italic">{f.stage}</text>
      </g>
      <path d="M605 672 L1020 758" stroke="#47249a" strokeWidth="16" strokeLinecap="round" transform="translate(0 4)" />
      <path d="M605 672 L1020 758" stroke="url(#ftBar)" strokeWidth="13" strokeLinecap="round" />
      <g transform="matrix(.97 .2 -.2 .82 700 726)">
        <rect width="130" height="44" rx="22" fill="none" stroke="rgba(255,255,255,.34)" strokeWidth="1.5" />
        <path d="M30 11 L18 25 L27 25 L23 36 L37 20 L27 20 Z" fill="#a66df0" />
        <text className="scene-text" x="46" y="30" fontSize="20" fontStyle="italic">{f.design}</text>
      </g>
      <g transform="matrix(.97 .2 -.2 .82 842 756)">
        <rect width="102" height="42" rx="21" fill="none" stroke="rgba(255,255,255,.34)" strokeWidth="1.5" />
        <path d="M34 13 L23 21 L34 29 M44 13 L55 21 L44 29" transform="translate(-12 0)" fill="none" stroke="#f2b24a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <text className="scene-text" x="52" y="29" fontSize="20" fontStyle="italic">{f.code}</text>
      </g>

      {/* Kod belgisi tushirilgan plitka */}
      <path d={roundedPath([[428, 618], [518, 541], [600, 572], [516, 658]], 30)} fill="#6d57d6" transform="translate(0 11)" />
      <path d={roundedPath([[428, 618], [518, 541], [600, 572], [516, 658]], 30)} fill="#eceaf2" />
      <g transform="translate(514 600) rotate(-8) scale(3.5 3.1) translate(-12 -12)" fill="none" stroke="#5a39cf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 16 4-4-4-4" />
        <path d="m6 8-4 4 4 4" />
        <path d="m14.5 4-5 16" />
      </g>
    </svg>
  )
}

// Mobil sahna: tepada burchaklardagi plitkalar, tugmalar ostida loyiha paneli.
function PhoneScene({ f }) {
  return (
    <>
      <svg className="footer-phone footer-phone--top" viewBox="0 0 660 560" aria-hidden="true">
        <defs>
          <Gradients suffix="M" />
          <filter id="fmBlur" colorInterpolationFilters="sRGB" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2" /></filter>
          <filter id="fmGlow" colorInterpolationFilters="sRGB" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="12" /></filter>
        </defs>

        {/* Xira plitka matn orqasida */}
        <Tile pts={[[640, 395], [720, 440], [650, 530], [565, 480]]} r={22} face="ftGhostM" opacity={0.28} filter="url(#fmBlur)" />

        {/* Chap burchak: tasdiq belgisi */}
        <Tile pts={[[-70, 62], [30, 6], [126, 96], [14, 158]]} r={28} depth={[0, 11]} face="ftDarkM" side="#5a47c0" edge="rgba(255,255,255,.2)" />
        <ellipse cx="22" cy="82" rx="50" ry="30" fill="#66e596" opacity=".55" filter="url(#fmGlow)" />
        <ellipse cx="22" cy="82" rx="47" ry="27" fill="url(#ftGreenM)" />
        <path d="M6 82 L20 92 L44 72" fill="none" stroke="#10131f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

        {/* O'ng burchak: halqa */}
        <g transform="translate(628 74) rotate(14)">
          <ellipse rx="76" ry="56" cy="10" fill="#8a5fb0" />
          <ellipse rx="76" ry="56" fill="#0c0a16" stroke="rgba(255,255,255,.2)" />
          <ellipse rx="54" ry="38" fill="none" stroke="rgba(255,255,255,.24)" strokeWidth="7" />
          <ellipse rx="54" ry="38" fill="none" stroke="#7ff2a8" strokeWidth="5" />
          <text className="scene-text" textAnchor="middle" y="5" fontSize="17" transform="rotate(-8)">100%</text>
        </g>
      </svg>

      <svg className="footer-phone footer-phone--bottom" viewBox="0 0 660 340" aria-hidden="true">
        {/* Loyiha paneli: pastki qismi footer paneli ortiga kirib ketadi */}
        <Tile pts={[[135, 82], [604, 196], [525, 300], [22, 160]]} r={26} depth={[0, 11]} face="ftPanelM" side="#4a39ad" edge="rgba(255,255,255,.16)" />
        <g transform="matrix(.97 .22 -.28 .82 206 104)">
          <text className="scene-text" fontSize="25" fontStyle="italic">{f.project}</text>
        </g>
        <g transform="matrix(.97 .22 -.28 .82 438 146)" opacity=".7">
          <text className="scene-text" fontSize="24" fontStyle="italic">{f.stage}</text>
        </g>
        <path d="M192 128 L584 216" stroke="#47249a" strokeWidth="14" strokeLinecap="round" transform="translate(0 4)" />
        <path d="M192 128 L584 216" stroke="url(#ftBarM)" strokeWidth="11" strokeLinecap="round" />
        <g transform="matrix(.87 .19 -.18 .74 272 172)">
          <rect width="130" height="44" rx="22" fill="none" stroke="rgba(255,255,255,.34)" strokeWidth="1.5" />
          <path d="M30 11 L18 25 L27 25 L23 36 L37 20 L27 20 Z" fill="#a66df0" />
          <text className="scene-text" x="46" y="30" fontSize="20" fontStyle="italic">{f.design}</text>
        </g>
        <g transform="matrix(.87 .19 -.18 .74 402 200)">
          <rect width="102" height="42" rx="21" fill="none" stroke="rgba(255,255,255,.34)" strokeWidth="1.5" />
          <path d="M34 13 L23 21 L34 29 M44 13 L55 21 L44 29" transform="translate(-12 0)" fill="none" stroke="#f2b24a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <text className="scene-text" x="52" y="29" fontSize="20" fontStyle="italic">{f.code}</text>
        </g>

        {/* Kod belgisi tushirilgan plitka */}
        <path d={roundedPath([[28, 86], [130, 12], [190, 46], [110, 122]], 26)} fill="#6d57d6" transform="translate(0 9)" />
        <path d={roundedPath([[28, 86], [130, 12], [190, 46], [110, 122]], 26)} fill="#eceaf2" />
        <g transform="translate(108 66) rotate(-8) scale(2.5 2.2) translate(-12 -12)" fill="none" stroke="#5a39cf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m18 16 4-4-4-4" />
          <path d="m6 8-4 4 4 4" />
          <path d="m14.5 4-5 16" />
        </g>
      </svg>
    </>
  )
}

export default function Footer() {
  const { t } = useLanguage()
  const { contact } = useSiteData()
  const f = t.footer

  return (
    <footer className="site-footer">
      <div className="footer-cta">
        <Scene f={f} />
        <PhoneScene f={f} />
        <h2>
          {f.title[0]}
          <br />
          {f.title[1]}
          <br />
          {f.title[2]}
        </h2>
        <p>{f.lead}</p>
        <div className="hero__actions">
          <a className="cta-btn cta-btn--primary" href={contact.telegram.href} target="_blank" rel="noreferrer">
            <span className="cta-btn__label"><small>Telegram</small>{f.telegram}</span>
            <span className="cta-btn__icon">
              <Send size={20} strokeWidth={1.8} aria-hidden="true" />
            </span>
          </a>
          <a className="cta-btn cta-btn--ghost" href={`mailto:${contact.email}`}>
            <span className="cta-btn__label"><small>Email</small>{f.email}</span>
            <span className="cta-btn__icon">
              <Mail size={20} strokeWidth={1.8} aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>

      <div className="footer-panel">
        <svg className="footer-panel__corner" viewBox="0 0 86 64" aria-hidden="true">
          <path d="M0 0 H86 V1 C74 1 69 8 68 22 C66 40 54 46 34 46 C14 46 2 50 0 64 Z" fill="#080b26" />
          <path d="M0 64 C2 50 14 46 34 46 C54 46 66 40 68 22 C69 8 74 1 86 1" fill="none" stroke="rgba(191,191,191,.22)" />
        </svg>
        <svg className="footer-panel__notch" viewBox="0 0 86 64" aria-hidden="true">
          <path d="M0 64 C2 50 14 46 34 46 C54 46 66 40 68 22 C69 8 74 0 86 0 H87 V64 Z" fill="#030916" />
          <path d="M0 64 C2 50 14 46 34 46 C54 46 66 40 68 22 C69 8 74 0 86 0" fill="none" stroke="rgba(191,191,191,.22)" />
        </svg>
        <div className="footer-panel__top">
          <a className="footer-panel__logo" href="/" aria-label={t.a11y.home}><Wordmark /></a>
          <div className="footer-panel__social">
            <a href={contact.telegram.href} target="_blank" rel="noreferrer" aria-label="Telegram"><Send size={22} strokeWidth={1.6} aria-hidden="true" /></a>
            <a href={`mailto:${contact.email}`} aria-label="Email"><Mail size={22} strokeWidth={1.6} aria-hidden="true" /></a>
            <a href="/" aria-label={t.a11y.home}><ArrowUp size={22} strokeWidth={1.6} aria-hidden="true" /></a>
          </div>
        </div>
        <div className="footer-panel__bottom">
          <p>© {new Date().getFullYear()} FiberTech. {f.rights}</p>
          <nav className="footer-panel__links" aria-label={t.a11y.footerNav}>
            {nav.map((l) => (
              <a key={l.href} href={l.href}>{t.nav[l.key]}</a>
            ))}
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
