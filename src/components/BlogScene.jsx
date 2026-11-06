import { PERSON_POINTING, PERSON_STANDING, Tile, roundedPath } from './sceneParts.jsx'

// Blog sahifasining sahnasi, 1440x720 maydonda: to'lqinli "o'qish yo'li" ustida ochiq kitob plitkasi,
// atrofda maqola va xatcho'p ushlagan odamlar. Bezak: ekran o'quvchilar o'qimaydi, yozuv sahifada bor.
const TRACK = 'M-60 660C280 600 500 690 790 600S1210 470 1500 420'
const BOOK = 'M2 4h6a4 4 0 0 1 3 1.500V20a3 3 0 0 0-3-2H2zM22 4h-6a4 4 0 0 0-3 1.500V20a3 3 0 0 1 3-2h6z'
const INK = '#0a0c24'

const GRADIENTS = {
  blgCenter: [['0', '#1a1730'], ['.55', '#2a2350'], ['1', '#8d7be8']],
  blgMint: [['0', '#a6f8c4'], ['1', '#5fe08f']],
  blgGhostA: [['0', '#2c2562'], ['1', '#15123a']],
  blgGhostB: [['0', '#3a2a78'], ['1', '#191444']],
  blgDoc: [['0', '#8a6bee'], ['1', '#d27fd6']],
}

// Yorug'lik zarrachalari: har safar bir xil joylashuv.
const SPARKS = Array.from({ length: 46 }, (_, i) => ({
  cx: Math.round(((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1 * 1440),
  cy: Math.round(150 + (((Math.sin(i * 78.233) * 12543.1234) % 1 + 1) % 1) * 470),
  r: i % 7 === 0 ? 7 : 1.5 + (i % 3),
}))

function Glows() {
  return (
    <>
      <ellipse cx="290" cy="520" rx="520" ry="300" fill="url(#blgGlowBlue)" />
      <ellipse cx="1140" cy="470" rx="500" ry="320" fill="url(#blgGlowPink)" />
      <ellipse cx="770" cy="470" rx="330" ry="230" fill="url(#blgGlowMint)" />
      <g filter="url(#blgBlur24)">
        {[150, 300, 450, 1010, 1180, 1330].map((x, i) => (
          <rect key={x} x={x} y="110" width={i % 2 ? 80 : 50} height="500" fill="url(#blgColumn)" />
        ))}
      </g>
    </>
  )
}

function Track() {
  return (
    <g fill="none">
      <path d={TRACK} stroke="#4a33a8" strokeWidth="120" transform="translate(0 18)" />
      <path d={TRACK} stroke="url(#blgTrack)" strokeWidth="120" />
      <path d={TRACK} stroke="#6d45d6" strokeWidth="38" transform="translate(0 8)" pathLength="100" strokeDasharray="83 100" strokeLinecap="round" />
      <path d={TRACK} stroke="url(#blgLane)" strokeWidth="38" pathLength="100" strokeDasharray="83 100" strokeLinecap="round" />
      <path d={TRACK} stroke="#fff" strokeOpacity=".32" strokeWidth="1.500" transform="translate(0 60)" />
    </g>
  )
}

// Uchayotgan odam: qo'li yuqori o'ngga cho'zilgan siluet, `flip` chapga qaratadi.
const FLYER = 'M83 18C90 17 96 20 99 22L116 4C118 2 122 5 120 8L103 32C99 37 94 38 90 38C86 50 76 62 62 72L58 78 40 100 34 122C33 126 26 125 26 120L30 96 40 76 30 76 8 84C3 85 0 78 5 75L30 62 46 56C56 46 66 34 76 24Z'

function Flyer({ x, y, s = 1, flip, o = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={o} fill={INK} stroke="rgba(190,180,235,.4)" strokeWidth={1.2 / s} strokeLinejoin="round">
      <ellipse cx="93" cy="7" rx="9" ry="11" transform="rotate(24 93 7)" />
      <path d={FLYER} />
    </g>
  )
}

export default function BlogScene({ label }) {
  return (
    <svg className="blog-scene" viewBox="0 0 1440 720" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        {Object.entries(GRADIENTS).map(([id, stops]) => (
          <linearGradient key={id} id={id} x1=".1" y1="0" x2=".8" y2="1">
            {stops.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
          </linearGradient>
        ))}
        <radialGradient id="blgGlowBlue">
          <stop offset="0" stopColor="#4a3ad8" stopOpacity=".62" />
          <stop offset="1" stopColor="#4a3ad8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blgGlowPink">
          <stop offset="0" stopColor="#7b3bb8" stopOpacity=".6" />
          <stop offset="1" stopColor="#7b3bb8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blgGlowMint">
          <stop offset="0" stopColor="#3fd98a" stopOpacity=".16" />
          <stop offset="1" stopColor="#3fd98a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blgHalo">
          <stop offset="0" stopColor="#fff" stopOpacity=".4" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blgMintHalo">
          <stop offset="0" stopColor="#7ce8a8" stopOpacity=".5" />
          <stop offset="1" stopColor="#7ce8a8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blgSpark">
          <stop offset="0" stopColor="#fff" stopOpacity=".9" />
          <stop offset=".4" stopColor="#e4dcff" stopOpacity=".45" />
          <stop offset="1" stopColor="#e4dcff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="blgColumn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8d7bff" stopOpacity="0" />
          <stop offset=".6" stopColor="#8d7bff" stopOpacity=".2" />
          <stop offset="1" stopColor="#8d7bff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="blgTrack" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a1740" />
          <stop offset=".55" stopColor="#272055" />
          <stop offset="1" stopColor="#3a2b78" />
        </linearGradient>
        <linearGradient id="blgLane" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7a55ea" />
          <stop offset=".6" stopColor="#9a66e0" />
          <stop offset="1" stopColor="#c066d8" />
        </linearGradient>
        <linearGradient id="blgBeam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".3" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="blgFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#010916" stopOpacity="0" />
          <stop offset="1" stopColor="#010916" />
        </linearGradient>
        <filter id="blgBlur24" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation="24" /></filter>
        <filter id="blgBlur12" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation="12" /></filter>
        <filter id="blgBlur3" x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>

      <Glows />

      {/* Uzoqdagi xira plitkalar va odamlar */}
      <g filter="url(#blgBlur3)" opacity=".75">
        <Tile pts={[[120, 180], [215, 215], [185, 315], [85, 280]]} r={18} depth={[3, 7]} face="blgGhostA" side="#241d58" edge="none" />
        <Tile pts={[[1235, 150], [1320, 165], [1305, 255], [1215, 235]]} r={18} depth={[3, 7]} face="blgGhostA" side="#241d58" edge="none" />
        <Tile pts={[[1270, 400], [1385, 370], [1400, 480], [1290, 515]]} r={22} depth={[3, 7]} face="blgGhostB" side="#241d58" edge="none" />
        <Tile pts={[[470, 480], [550, 450], [575, 520], [495, 555]]} r={16} depth={[2, 6]} face="blgGhostB" side="#241d58" edge="none" />
      </g>
      <Flyer x={440} y={232} s={0.5} o={0.75} />
      <rect x={498} y={214} width="26" height="32" rx="5" fill="#3f3490" transform="rotate(14 511 230)" />
      <Flyer x={1200} y={268} s={0.48} flip o={0.7} />
      <Flyer x={60} y={420} s={0.42} o={0.55} />

      <Track />

      {/* Yorug'lik va markaziy kitob */}
      <polygon points="668,470 882,470 950,720 610,720" fill="url(#blgBeam)" filter="url(#blgBlur12)" />
      <g className="blog-scene__float">
        <path d={roundedPath([[640, 244], [900, 226], [926, 462], [660, 486]], 38)} fill="#7a66e0" transform="translate(0 14)" opacity=".85" />
        <Tile pts={[[640, 244], [900, 226], [926, 462], [660, 486]]} r={38} depth={[6, 10]} face="blgCenter" side="#2b2448" edge="rgba(255,255,255,.14)" />
        <ellipse cx="782" cy="356" rx="150" ry="130" fill="url(#blgHalo)" />
        <g transform="translate(782 356) rotate(-4) scale(6.800) translate(-12 -12)">
          <path d={BOOK} fill="#fff" opacity=".85" filter="url(#blgBlur3)" />
          <path d={BOOK} fill="#fff" />
        </g>
      </g>

      {/* Chapdagi maqola plitkasi */}
      <g className="blog-scene__float blog-scene__float--b">
        <ellipse cx="318" cy="392" rx="120" ry="104" fill="url(#blgMintHalo)" />
        <Tile pts={[[258, 340], [370, 326], [392, 428], [276, 446]]} r={20} depth={[-5, 10]} face="blgMint" side="#d9c6f0" edge="rgba(255,255,255,.3)" />
        <g fill="#16432c" transform="rotate(-7 322 388)">
          <rect x="292" y="356" width="58" height="9" rx="4.500" />
          <rect x="292" y="376" width="58" height="6" rx="3" opacity=".7" />
          <rect x="292" y="390" width="58" height="6" rx="3" opacity=".7" />
          <rect x="292" y="404" width="34" height="6" rx="3" opacity=".7" />
        </g>
      </g>
      <Flyer x={132} y={436} s={1.18} />

      {/* O'ngdagi xatcho'p */}
      <g className="blog-scene__float blog-scene__float--c">
        <ellipse cx="1090" cy="372" rx="72" ry="60" fill="#3a2b78" transform="translate(0 8) rotate(-12 1090 372)" />
        <ellipse cx="1090" cy="372" rx="72" ry="60" fill="#0d0e24" stroke="rgba(255,255,255,.14)" transform="rotate(-12 1090 372)" />
        <ellipse cx="1090" cy="372" rx="52" ry="42" fill="none" stroke="#7ce8a8" strokeWidth="5" transform="rotate(-12 1090 372)" />
        <path d="M1074 348h32v50l-16-12-16 12z" fill="#7ce8a8" transform="rotate(-8 1090 372)" />
      </g>
      <Flyer x={1282} y={362} s={1.05} flip />

      {/* Yo'l ustida turgan odamlar */}
      <g transform="translate(-25 -336) scale(.9)" fill={INK} stroke="rgba(190,180,235,.4)" strokeWidth="1.3" strokeLinejoin="round">
        <ellipse cx="605" cy="892" rx="10.5" ry="13.5" />
        <path d={PERSON_STANDING} />
        <ellipse cx="689" cy="887" rx="10.5" ry="13.5" />
        <path d={PERSON_POINTING} />
      </g>

      {/* Yo'ldagi bo'rtma yozuv */}
      <g className="blog-scene__tag" transform="rotate(-11 1370 610)" fontSize="50" textAnchor="end">
        {[6, 5, 4, 3, 2, 1].map((n) => (
          <text key={n} x={1370 + n * 0.6} y={610 + n} className="scene-text blog-scene__label" style={{ fill: '#6f60c8' }}>{label}</text>
        ))}
        <text x={1370} y={610} className="scene-text blog-scene__label">{label}</text>
      </g>

      {SPARKS.map(({ cx, cy, r }) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill="url(#blgSpark)" />)}

      <rect y="600" width="1440" height="120" fill="url(#blgFade)" />
    </svg>
  )
}
