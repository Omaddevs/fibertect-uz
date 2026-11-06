// Xizmat kartalaridagi illyustratsiyalar: rasm fayl emas, vektor, shuning uchun har qanday ekranda tiniq.
// Maydon 580x674, ramka (FRAME, Services.jsx) chetlarini qirqadi: muhim qismlar x 32-544, y 56-620 ichida.
// Matn deyarli yo'q: tilga bog'liq bo'lmasligi uchun faqat raqam va belgilar ishlatilgan.

const SURFACE = '#161b42'
const RAISED = '#20265a'
const LINE = 'rgba(255, 255, 255, 0.1)'
const VIOLET = '#9a7bff'
const LAVENDER = '#cfc4ff'
const MINT = '#7ce8a8'
const ACCENT = 'url(#art-accent)'
const ARROW = 'M8 3h21v21h-7V15L8 29l-5-5L17 10H8z'

function Bar({ x, y, w, h = 8, fill = '#fff', o = 0.22 }) {
  return <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} opacity={o} />
}

function Box({ x, y, w, h, r = 14, fill = SURFACE, stroke = LINE }) {
  return <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={stroke} />
}

// `alt` berilmasa rasm bezak hisoblanadi. `slice`: maydonni to'ldiradi, ortig'i pastdan qirqiladi (blog muqovasi).
function Art({ alt, glow, slice, children }) {
  const a11y = alt ? { role: 'img', 'aria-label': alt } : { 'aria-hidden': true }
  return (
    <svg className="service-art" viewBox="0 0 580 674" preserveAspectRatio={slice ? 'xMidYMin slice' : undefined} {...a11y}>
      <defs>
        <linearGradient id="art-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#221d6b" />
          <stop offset="0.6" stopColor="#100f3a" />
          <stop offset="1" stopColor="#090c26" />
        </linearGradient>
        <linearGradient id="art-accent" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#9a7bff" />
          <stop offset="0.6" stopColor="#6d4bf0" />
          <stop offset="1" stopColor="#5438d6" />
        </linearGradient>
        <linearGradient id="art-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a7bff" stopOpacity="0.42" />
          <stop offset="1" stopColor="#9a7bff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="art-glow-violet">
          <stop offset="0" stopColor="#7a5cff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#7a5cff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="art-glow-mint">
          <stop offset="0" stopColor="#3fd98a" stopOpacity="0.32" />
          <stop offset="1" stopColor="#3fd98a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="580" height="674" fill="url(#art-bg)" />
      <circle cx={glow[0]} cy={glow[1]} r="300" fill={`url(#art-glow-${glow[2]})`} />
      {children}
    </svg>
  )
}

function WebArt() {
  return (
    <>
      <Box x={52} y={92} w={560} h={640} r={18} />
      <rect x={52} y={92} width={560} height={42} rx={18} fill={RAISED} />
      {[76, 94, 112].map((cx) => <circle key={cx} cx={cx} cy={113} r={5} fill="#fff" opacity="0.28" />)}
      <rect x={136} y={103} width={300} height={20} rx={10} fill="#fff" opacity="0.08" />

      <rect x={74} y={152} width={24} height={24} rx={7} fill={ACCENT} />
      <Bar x={110} y={160} w={52} />
      <Bar x={330} y={160} w={36} />
      <Bar x={378} y={160} w={36} />
      <Bar x={426} y={160} w={36} />

      <Bar x={74} y={204} w={216} h={18} o={0.92} />
      <Bar x={74} y={232} w={164} h={18} o={0.92} />
      <Bar x={74} y={266} w={226} h={7} />
      <Bar x={74} y={281} w={184} h={7} />
      <rect x={74} y={304} width={118} height={36} rx={18} fill={ACCENT} />
      <rect x={202} y={304} width={88} height={36} rx={18} fill="none" stroke="rgba(255,255,255,.3)" />

      <rect x={322} y={196} width={260} height={144} rx={16} fill={RAISED} />
      <circle cx={494} cy={238} r={22} fill={MINT} />
      <path d="M322 340v-34l58-48 54 42 36-26 112 66z" fill={VIOLET} opacity="0.75" />

      {[74, 236].map((x) => (
        <g key={x}>
          <Box x={x} y={366} w={150} h={132} fill={RAISED} />
          <circle cx={x + 28} cy={396} r={14} fill={x === 74 ? MINT : VIOLET} opacity="0.9" />
          <Bar x={x + 14} y={424} w={96} h={9} o={0.7} />
          <Bar x={x + 14} y={444} w={120} h={6} />
          <Bar x={x + 14} y={458} w={92} h={6} />
        </g>
      ))}
      {[74, 236].map((x) => (
        <g key={`row-${x}`}>
          <Box x={x} y={514} w={150} h={132} fill={RAISED} />
          <Bar x={x + 14} y={532} w={84} h={9} o={0.7} />
          <Bar x={x + 14} y={552} w={120} h={6} />
        </g>
      ))}

      <rect x={396} y={372} width={142} height={250} rx={24} fill="#0b0e2c" stroke="rgba(255,255,255,.24)" strokeWidth="2" />
      <rect x={446} y={382} width={42} height={8} rx={4} fill="#fff" opacity="0.16" />
      <Bar x={410} y={404} w={84} h={10} o={0.92} />
      <Bar x={410} y={422} w={108} h={5} />
      <rect x={410} y={440} width={114} height={68} rx={10} fill={ACCENT} />
      <circle cx={498} cy={464} r={12} fill={MINT} />
      <rect x={410} y={520} width={70} height={22} rx={11} fill={ACCENT} />
      <Bar x={410} y={556} w={114} h={6} />
      <Bar x={410} y={570} w={88} h={6} />
      <Bar x={410} y={584} w={100} h={6} />
    </>
  )
}

function AppArt() {
  const kpis = [
    { x: 132, value: '12.4k', color: VIOLET, spark: 'M0 22 18 16l16 5 18-12 16 4 18-9' },
    { x: 268, value: '+24%', color: MINT, spark: 'M0 24 16 20l18 2 18-10 16-2 18-8' },
    { x: 404, value: '98%', color: LAVENDER, spark: 'M0 14 18 18l16-6 18 4 16-8 18 2' },
  ]
  return (
    <>
      <Box x={48} y={84} w={560} h={640} r={18} />
      <path d="M66 84h48v640H66a18 18 0 0 1-18-18V102a18 18 0 0 1 18-18z" fill={RAISED} />
      <rect x={66} y={102} width={30} height={30} rx={9} fill={ACCENT} />
      {[160, 204, 248, 292, 336].map((y, i) => (
        <rect key={y} x={70} y={y} width={22} height={22} rx={6} fill={i === 1 ? LAVENDER : '#fff'} opacity={i === 1 ? 0.9 : 0.16} />
      ))}

      {kpis.map(({ x, value, color, spark }) => (
        <g key={value}>
          <Box x={x} y={104} w={124} h={100} fill={RAISED} />
          <Bar x={x + 14} y={118} w={54} h={6} />
          <text x={x + 14} y={154} className="service-art__num" fontSize="24" fill="#fff">{value}</text>
          <path d={spark} transform={`translate(${x + 14} 166)`} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}

      <Box x={132} y={218} w={396} h={224} fill={RAISED} />
      <Bar x={150} y={236} w={110} h={9} o={0.7} />
      <rect x={452} y={230} width={58} height={22} rx={11} fill="#fff" opacity="0.08" />
      {[280, 320, 360, 400].map((y) => <line key={y} x1={150} y1={y} x2={510} y2={y} stroke="#fff" strokeOpacity="0.07" />)}
      <path d="M150 384c32-6 48-34 80-34s42 22 72 16 44-58 76-62 52 18 80-14 36-22 52-26v136H150z" fill="url(#art-area)" />
      <path d="M150 384c32-6 48-34 80-34s42 22 72 16 44-58 76-62 52 18 80-14 36-22 52-26" fill="none" stroke={VIOLET} strokeWidth="3" strokeLinecap="round" />
      <path d="M150 402c36 0 50-14 84-12s50 12 84 2 56-22 88-20 72-12 104-18" fill="none" stroke={MINT} strokeWidth="2.5" strokeLinecap="round" />
      <line x1={378} y1={304} x2={378} y2={420} stroke="#fff" strokeOpacity="0.28" strokeDasharray="4 4" />
      <circle cx={378} cy={304} r={6} fill="#fff" stroke={VIOLET} strokeWidth="3" />
      <rect x={342} y={262} width={72} height={28} rx={8} fill="#fff" />
      <text x={378} y={281} textAnchor="middle" className="service-art__num" fontSize="14" fill="#1b1660">+24%</text>

      {[458, 508, 558, 608].map((y, i) => (
        <g key={y}>
          <Box x={132} y={y} w={396} h={42} r={10} />
          <circle cx={156} cy={y + 21} r={10} fill={i % 2 ? MINT : VIOLET} opacity="0.85" />
          <Bar x={176} y={y + 13} w={104} h={7} o={0.6} />
          <Bar x={176} y={y + 26} w={66} h={5} />
          <rect x={452} y={y + 11} width={60} height={20} rx={10} fill={i === 2 ? VIOLET : MINT} opacity="0.22" />
          <Bar x={464} y={y + 18} w={36} h={6} fill={i === 2 ? LAVENDER : MINT} o={0.95} />
        </g>
      ))}
    </>
  )
}

function PhoneArt() {
  return (
    <>
      {[180, 250].map((r) => <circle key={r} cx={290} cy={340} r={r} fill="none" stroke="#fff" strokeOpacity="0.07" />)}

      <rect x={150} y={70} width={284} height={580} rx={46} fill="#0a0d2a" stroke="rgba(255,255,255,.26)" strokeWidth="3" />
      <rect x={162} y={82} width={260} height={556} rx={36} fill={SURFACE} />
      <rect x={258} y={94} width={68} height={18} rx={9} fill="#0a0d2a" />

      <Bar x={182} y={134} w={92} h={11} o={0.92} />
      <Bar x={182} y={153} w={62} h={6} />
      <circle cx={382} cy={144} r={17} fill={ACCENT} />

      <rect x={182} y={178} width={220} height={124} rx={20} fill={ACCENT} />
      <Bar x={200} y={196} w={70} h={6} o={0.6} />
      <text x={200} y={240} className="service-art__num" fontSize="32" fill="#fff">2 450</text>
      <path d="M200 276l26-10 24 6 28-16 26 8 28-14" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {[210, 263, 316, 369].map((cx, i) => (
        <g key={cx}>
          <circle cx={cx} cy={344} r={22} fill={i === 0 ? MINT : RAISED} stroke={i === 0 ? 'none' : LINE} />
          <rect x={cx - 7} y={337} width={14} height={14} rx={4} fill={i === 0 ? '#0d2a1c' : LAVENDER} opacity={i === 0 ? 1 : 0.8} />
        </g>
      ))}

      {[388, 452, 516].map((y, i) => (
        <g key={y}>
          <rect x={182} y={y} width={220} height={54} rx={14} fill={RAISED} />
          <rect x={194} y={y + 11} width={32} height={32} rx={10} fill={[VIOLET, MINT, LAVENDER][i]} opacity="0.9" />
          <Bar x={238} y={y + 15} w={82} h={8} o={0.75} />
          <Bar x={238} y={y + 31} w={54} h={6} />
          <Bar x={350} y={y + 22} w={38} h={8} o={0.6} />
        </g>
      ))}

      <rect x={196} y={590} width={192} height={32} rx={16} fill="#0a0d2a" />
      {[226, 272, 318, 362].map((cx, i) => <circle key={cx} cx={cx} cy={606} r={6} fill={i === 0 ? LAVENDER : '#fff'} opacity={i === 0 ? 1 : 0.25} />)}

      <Box x={368} y={226} w={172} h={66} r={16} fill="#fff" stroke="none" />
      <circle cx={400} cy={259} r={17} fill={MINT} />
      <path d="M392 259l6 6 11-12" fill="none" stroke="#0d2a1c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <Bar x={426} y={247} w={92} h={8} fill="#1b1660" o={0.85} />
      <Bar x={426} y={263} w={62} h={6} fill="#1b1660" o={0.32} />

      <Box x={40} y={414} w={136} h={96} r={16} fill={RAISED} />
      <Bar x={54} y={430} w={62} h={6} />
      {[0, 1, 2, 3, 4].map((i) => {
        const h = [18, 30, 22, 38, 44][i]
        return <rect key={i} x={54 + i * 22} y={496 - h} width={14} height={h} rx={4} fill={i === 4 ? MINT : VIOLET} opacity={i === 4 ? 1 : 0.7} />
      })}
    </>
  )
}

function UiArt() {
  return (
    <>
      <Box x={48} y={88} w={492} h={352} r={18} />
      <Bar x={76} y={118} w={180} h={16} o={0.92} />
      <Bar x={76} y={146} w={250} h={7} />
      <Bar x={76} y={162} w={190} h={7} />

      <rect x={76} y={190} width={208} height={42} rx={10} fill={RAISED} stroke={LINE} />
      <Bar x={92} y={207} w={92} h={7} />
      <rect x={300} y={190} width={208} height={42} rx={10} fill={RAISED} stroke={LAVENDER} strokeOpacity="0.5" />
      <Bar x={316} y={207} w={70} h={7} o={0.5} />

      <rect x={348} y={282} width={60} height={32} rx={16} fill={MINT} />
      <circle cx={392} cy={298} r={12} fill="#fff" />
      <rect x={424} y={282} width={60} height={32} rx={16} fill={RAISED} stroke={LINE} />
      <circle cx={440} cy={298} r={12} fill="#fff" opacity="0.5" />

      <rect x={98} y={270} width={204} height={56} rx={28} fill={ACCENT} />
      <Bar x={124} y={294} w={88} h={8} o={0.95} />
      <circle cx={274} cy={298} r={21} fill="#fff" />
      <path d="M268 304l12-12m-9 0h9v9" fill="none" stroke="#3a22b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      <rect x={90} y={262} width={220} height={72} fill="none" stroke={LAVENDER} strokeWidth="1.5" />
      {[[90, 262], [310, 262], [90, 334], [310, 334]].map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x - 5} y={y - 5} width={10} height={10} fill="#fff" stroke={LAVENDER} strokeWidth="1.5" />
      ))}
      <rect x={160} y={346} width={80} height={24} rx={6} fill={LAVENDER} />
      <text x={200} y={363} textAnchor="middle" className="service-art__num" fontSize="13" fill="#1b1660">204 × 56</text>

      <line x1={48} y1={298} x2={90} y2={298} stroke={MINT} strokeWidth="1.5" />
      <path d="M48 292v12m42-12v12" stroke={MINT} strokeWidth="1.5" />

      <path d="M326 348l7 38 9-14 17-2z" fill="#fff" stroke="#0a0d2a" strokeWidth="2" strokeLinejoin="round" />
      <rect x={350} y={382} width={62} height={24} rx={7} fill={MINT} />
      <Bar x={360} y={391} w={42} h={6} fill="#0d2a1c" o={0.85} />

      {[VIOLET, '#6d4bf0', '#3a22b8', LAVENDER, MINT].map((fill, i) => (
        <rect key={fill} x={48 + i * 100} y={462} width={88} height={64} rx={14} fill={fill} stroke={LINE} />
      ))}

      <text x={48} y={606} className="service-art__num" fontSize="64" fill="#fff">Aa</text>
      <Bar x={150} y={558} w={190} h={12} o={0.85} />
      <Bar x={150} y={580} w={150} h={8} o={0.4} />
      <Bar x={150} y={598} w={110} h={6} />
      <Box x={374} y={552} w={166} h={56} r={14} fill={RAISED} />
      <circle cx={402} cy={580} r={13} fill={VIOLET} />
      <Bar x={426} y={570} w={92} h={7} o={0.6} />
      <Bar x={426} y={584} w={64} h={5} />
    </>
  )
}

function BotArt() {
  return (
    <>
      <Box x={48} y={84} w={484} h={560} r={24} />
      <path d="M72 84h436a24 24 0 0 1 24 24v44H48v-44a24 24 0 0 1 24-24z" fill={RAISED} />
      <circle cx={92} cy={118} r={23} fill={ACCENT} />
      <rect x={79} y={109} width={26} height={19} rx={7} fill="#fff" />
      <circle cx={87} cy={118} r={3} fill="#3a22b8" />
      <circle cx={97} cy={118} r={3} fill="#3a22b8" />
      <path d="M92 109v-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <Bar x={128} y={104} w={112} h={10} o={0.92} />
      <circle cx={133} cy={130} r={4} fill={MINT} />
      <Bar x={144} y={127} w={58} h={6} o={0.4} />

      <rect x={72} y={172} width={286} height={82} rx={18} fill={RAISED} />
      <Bar x={92} y={192} w={228} h={8} o={0.7} />
      <Bar x={92} y={210} w={190} h={8} o={0.4} />
      <Bar x={92} y={228} w={120} h={8} o={0.4} />

      <rect x={252} y={268} width={256} height={50} rx={18} fill={ACCENT} />
      <Bar x={272} y={289} w={186} h={8} o={0.95} />

      <rect x={72} y={332} width={320} height={64} rx={18} fill={RAISED} />
      <Bar x={92} y={352} w={260} h={8} o={0.7} />
      <Bar x={92} y={370} w={166} h={8} o={0.4} />

      {[[72, 408], [234, 408], [72, 456], [234, 456]].map(([x, y], i) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={152} height={40} rx={12} fill={i === 0 ? LAVENDER : '#fff'} fillOpacity={i === 0 ? 1 : 0.07} stroke={i === 0 ? 'none' : LINE} />
          <Bar x={x + 38} y={y + 17} w={76} h={7} fill={i === 0 ? '#1b1660' : '#fff'} o={i === 0 ? 0.9 : 0.6} />
        </g>
      ))}

      <line x1={48} y1={520} x2={532} y2={520} stroke="#fff" strokeOpacity="0.08" />
      <rect x={72} y={544} width={366} height={52} rx={26} fill="#fff" opacity="0.07" />
      <Bar x={96} y={566} w={150} h={8} />
      <circle cx={480} cy={570} r={27} fill={ACCENT} />
      <path d="M469 570l24-11-7 24-5-9zM481 574l5-7" fill="#fff" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
    </>
  )
}

function BrandArt() {
  const guides = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => 88 + i * 50)
  const points = [[8, 3], [29, 3], [29, 24], [22, 24], [22, 15], [8, 29], [3, 24], [17, 10], [8, 10]]
  const px = (v) => 130 + v * 10
  return (
    <>
      <g stroke={LAVENDER} strokeOpacity="0.2">
        {guides.map((p) => <line key={`v${p}`} x1={p - 8} y1={72} x2={p - 8} y2={488} />)}
        {guides.map((p) => <line key={`h${p}`} x1={64} y1={p - 8} x2={496} y2={p - 8} />)}
        <line x1={80} y1={80} x2={480} y2={480} />
        <line x1={480} y1={80} x2={80} y2={480} />
      </g>
      <g fill="none" stroke={LAVENDER} strokeOpacity="0.38">
        <circle cx={280} cy={280} r={200} />
        <circle cx={280} cy={280} r={120} />
      </g>
      <path d={ARROW} transform="translate(130 130) scale(10)" fill={ACCENT} />
      {points.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={px(x) - 5} y={px(y) - 5} width={10} height={10} fill="#fff" stroke={VIOLET} strokeWidth="1.5" />
      ))}
      <line x1={px(8)} y1={92} x2={px(29)} y2={92} stroke={MINT} strokeWidth="1.5" />
      <path d={`M${px(8)} 86v12m${px(29) - px(8)}-12v12`} stroke={MINT} strokeWidth="1.5" />

      {[VIOLET, '#3a22b8', MINT, '#f4f3f0'].map((fill, i) => (
        <rect key={fill} x={64 + i * 84} y={518} width={72} height={100} rx={14} fill={fill} stroke={LINE} />
      ))}
      <text x={414} y={584} className="service-art__num" fontSize="64" fill="#fff">Aa</text>
      <Bar x={414} y={600} w={104} h={7} o={0.4} />
    </>
  )
}

// Tartibi translations.js dagi `services.items` bilan bir xil.
const ARTS = [
  { Scene: WebArt, glow: [120, 120, 'violet'] },
  { Scene: AppArt, glow: [500, 560, 'mint'] },
  { Scene: PhoneArt, glow: [290, 340, 'violet'] },
  { Scene: UiArt, glow: [460, 120, 'violet'] },
  { Scene: BotArt, glow: [80, 600, 'mint'] },
  { Scene: BrandArt, glow: [280, 280, 'violet'] },
]

export default function ServiceArt({ index, alt, slice }) {
  const { Scene, glow } = ARTS[index]
  return (
    <Art alt={alt} glow={glow} slice={slice}>
      <Scene />
    </Art>
  )
}
