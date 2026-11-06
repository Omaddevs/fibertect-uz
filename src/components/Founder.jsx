import { technologies } from '../data/content.js'
import { techIcons } from '../data/techIcons.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

// Tungi deraza va aurora: rasm orqasidagi to'liq vektor sahna.
function WindowScene() {
  const stars = [
    [800, 120, 1.4], [905, 210, 1], [1120, 150, 1.6], [1210, 300, 1.2], [1100, 330, 1], [1240, 90, 1.1],
    [960, 90, 1], [1180, 480, 1.5], [1250, 520, 1.1], [1140, 560, 1.3], [1290, 430, 1], [1075, 500, 1],
    [720, 300, 1.1], [660, 170, 1], [1215, 620, 1.2], [1110, 640, 1], [1295, 590, 1.4],
  ]
  return (
    <svg className="founder__scene" viewBox="0 0 1440 929" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="fnSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#061a38" />
          <stop offset=".55" stopColor="#08234a" />
          <stop offset="1" stopColor="#061a30" />
        </linearGradient>
        <filter id="fnClouds" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".007 .011" numOctaves="4" seed="8" />
          <feColorMatrix values="0 0 0 0 .3  0 0 0 0 .55  0 0 0 0 .85  1.5 0 0 0 -.62" />
        </filter>
        <filter id="fnBlur40" colorInterpolationFilters="sRGB" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="34" /></filter>
        <filter id="fnBlur22" colorInterpolationFilters="sRGB" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="22" /></filter>
        <linearGradient id="fnAurora" x1=".1" y1="1" x2=".8" y2="0">
          <stop offset="0" stopColor="#f4e8ff" stopOpacity=".95" />
          <stop offset=".35" stopColor="#b58cff" stopOpacity=".8" />
          <stop offset=".75" stopColor="#6a57e8" stopOpacity=".35" />
          <stop offset="1" stopColor="#4a3bd0" stopOpacity="0" />
        </linearGradient>
        <clipPath id="fnPanes">
          <rect x="440" y="0" width="1000" height="800" />
        </clipPath>
      </defs>

      <g clipPath="url(#fnPanes)">
        <rect x="440" y="0" width="1000" height="800" fill="url(#fnSky)" />
        <rect x="440" y="0" width="1000" height="800" filter="url(#fnClouds)" opacity=".42" />
        <ellipse cx="1000" cy="640" rx="230" ry="120" fill="#127a58" opacity=".28" filter="url(#fnBlur40)" />
        {stars.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#dbe8ff" opacity=".8" />)}
      </g>

      {/* Aurora */}
      <g filter="url(#fnBlur22)">
        <polygon points="1150,600 1215,360 1290,340 1370,500 1310,590" fill="url(#fnAurora)" opacity=".85" />
        <polygon points="1210,590 1285,380 1340,400 1350,560" fill="url(#fnAurora)" opacity=".6" />
      </g>
      <ellipse cx="1245" cy="570" rx="120" ry="50" fill="#e9dcff" opacity=".3" filter="url(#fnBlur40)" />

      {/* Deraza romi */}
      <g fill="#030b18">
        <rect x="764" y="0" width="22" height="800" />
        <rect x="1020" y="0" width="24" height="800" />
        <rect x="440" y="404" width="1000" height="18" />
        <rect x="1270" y="0" width="12" height="800" />
      </g>
      <rect x="1044" y="421" width="226" height="1.5" fill="#7d8aa8" opacity=".4" />
    </svg>
  )
}

function TechCard({ tech }) {
  return (
    <li className="tech-card">
      <span className="tech-card__inner">
        <span className="tech-card__logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill={tech.color} aria-hidden="true">
            <path d={techIcons[tech.icon]} />
          </svg>
          {tech.name}
        </span>
      </span>
    </li>
  )
}

export default function Founder() {
  const { founder } = useLanguage().t

  return (
    <section className="founder" id="about">
      <WindowScene />

      <div className="founder__portrait">
        <img src="/team/founder.png" alt={founder.alt} width="1254" height="1254" loading="lazy" />
        <span className="founder__shade" aria-hidden="true" />
      </div>

      <div className="founder__text">
        <div>
          <h2>{founder.title}</h2>
          <p className="founder__body">{founder.text}</p>
        </div>
        <p className="founder__note">{founder.note}</p>
      </div>

      <div className="marquee">
        <div className="marquee__track">
          <ul className="marquee__list" aria-label={founder.techLabel}>
            {technologies.map((t) => <TechCard key={t.name} tech={t} />)}
          </ul>
          {/* Uzluksiz aylanish uchun takror nusxa */}
          <ul className="marquee__list" aria-hidden="true">
            {technologies.map((t) => <TechCard key={t.name} tech={t} />)}
          </ul>
        </div>
      </div>
    </section>
  )
}
