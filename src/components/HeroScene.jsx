import { PERSON_POINTING, PERSON_STANDING, Tile, roundedPath } from './sceneParts.jsx'

// Sahna 1440x1060 maydonda chizilgan. Har bir qatlam alohida <svg>: intro paytida
// faqat transform va opacity o'zgaradi, blur filtrlari qayta chizilmaydi.
const VIEW = '0 0 1440 1060'

function Layer({ className = '', children }) {
  return (
    <svg className={`scene__layer ${className}`} viewBox={VIEW}>
      {children}
    </svg>
  )
}

const GRADIENTS = {
  violetPink: [['0', '#3a2285'], ['.5', '#6b3cc9'], ['.82', '#c566cf'], ['1', '#f0a0d4']],
  violetDeep: [['0', '#5236c4'], ['.55', '#7349d6'], ['1', '#d27fd6']],
  lilacRose: [['0', '#8a6bee'], ['.5', '#ae8df0'], ['1', '#f3bfd9']],
  lilacMint: [['0', '#8767ea'], ['.62', '#9a80ee'], ['1', '#8cf0b6']],
  indigoMint: [['0', '#46309f'], ['.55', '#5c47c8'], ['1', '#8fe6cc']],
  indigoDeep: [['0', '#2f2080'], ['.65', '#45329f'], ['1', '#6f70d8']],
  centerDark: [['0', '#1c181f'], ['.6', '#1d1826'], ['1', '#46357d']],
  centerLit: [['0', '#26222a'], ['.45', '#55515c'], ['.8', '#6a6484'], ['1', '#8d80d6']],
  frontB: [['0', '#2f2650'], ['1', '#07060c']],
  ghostViolet: [['0', '#2c2562'], ['1', '#15123a']],
  ghostGreen: [['0', '#2d9163'], ['1', '#0f3a30']],
  ghostDark: [['0', '#1a1a35'], ['1', '#0d0d20']],
}

function TileGradients() {
  return (
    <defs>
      {Object.entries(GRADIENTS).map(([id, stops]) => (
        <linearGradient key={id} id={id} x1=".15" y1="0" x2=".7" y2="1">
          {stops.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
        </linearGradient>
      ))}
    </defs>
  )
}

// Yorug'lik zarrachalari: har safar bir xil joylashuv uchun qat'iy seed.
function makeSparks() {
  let s = 1337
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const zones = [
    { x: [900, 1370], y: [340, 640], n: 40 },
    { x: [90, 350], y: [190, 480], n: 22 },
    { x: [780, 1150], y: [640, 960], n: 26 },
    { x: [480, 720], y: [440, 620], n: 8 },
  ]
  return zones.flatMap(({ x, y, n }) =>
    Array.from({ length: n }, () => ({
      cx: Math.round(x[0] + rnd() * (x[1] - x[0])),
      cy: Math.round(y[0] + rnd() * (y[1] - y[0])),
      r: rnd() < 0.2 ? 9 + rnd() * 7 : 2 + rnd() * 4,
    })),
  )
}

const SPARKS = makeSparks()

const PHONE_OUTER = 'M412 762 L1064 762 Q1096 762 1112 788 L1190 950 Q1202 980 1170 980 L296 980 Q258 980 274 950 L366 788 Q382 762 412 762 Z'
const PHONE_SCREEN = 'M416 772 L1060 772 Q1086 772 1100 794 L1176 948 Q1184 968 1160 968 L304 968 Q278 968 288 948 L378 794 Q392 772 416 772 Z'
const CENTER = [[655, 572], [925, 637], [840, 887], [555, 802]]
const ARROW = 'M8 3h21v21h-7V15L8 29l-5-5L17 10H8z'

export default function HeroScene() {
  return (
    <div className="scene" aria-hidden="true">
      {/* Orqa fondagi xira plitkalar */}
      <Layer>
        <TileGradients />
        <defs>
          <filter colorInterpolationFilters="sRGB" id="b3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.5" /></filter>
        </defs>
        <Tile pts={[[228, 128], [296, 128], [262, 194], [200, 194]]} r={16} face="ghostViolet" opacity={0.7} filter="url(#b3)" />
        <Tile pts={[[1155, 170], [1200, 232], [1140, 282], [1092, 220]]} r={14} face="ghostDark" opacity={0.75} filter="url(#b3)" />
        <Tile pts={[[116, 248], [208, 246], [276, 340], [170, 348]]} r={18} depth={[0, 10]} face="ghostGreen" side="#2a2560" icon="kotlin" iconFill="#10241f" iconScale={0.5} />
        <Tile pts={[[1340, 484], [1368, 532], [1300, 582], [1274, 522]]} r={12} face="ghostDark" opacity={0.6} filter="url(#b3)" />
        <Tile pts={[[90, 850], [136, 892], [116, 974], [56, 912]]} r={14} face="ghostViolet" opacity={0.65} filter="url(#b3)" />
      </Layer>

      {/* Markaziy plitka osti va o'ng xira plitka: telefon orqasidan ko'tariladi */}
      <Layer className="scene__rise">
        <Tile pts={[[1240, 268], [1368, 288], [1290, 380], [1174, 362]]} r={18} depth={[0, 10]} face="ghostGreen" side="#0d2f28" icon="nodejs" iconFill="#10301f" iconScale={0.5} opacity={0.62} />
      </Layer>

      {/* Telefon, qorong'i holat */}
      <Layer>
        <defs>
          <linearGradient id="phoneRimDark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4d3a78" />
            <stop offset=".45" stopColor="#2a3346" />
            <stop offset="1" stopColor="#4c5128" />
          </linearGradient>
          <linearGradient id="phoneBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6f6fc4" />
            <stop offset=".22" stopColor="#3b4464" />
            <stop offset=".6" stopColor="#10141f" />
            <stop offset=".92" stopColor="#1e2a2c" />
            <stop offset="1" stopColor="#7c8a5c" />
          </linearGradient>
          <linearGradient id="phoneGlass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#14243a" />
            <stop offset="1" stopColor="#2c3a52" />
          </linearGradient>
        </defs>
        <path d="M272 950 L286 1000 Q294 1022 318 1022 L1148 1022 Q1176 1022 1182 1000 L1192 950 Z" fill="url(#phoneBody)" />
        <rect x="348" y="980" width="7" height="42" fill="#2a2f4c" />
        <rect x="1084" y="980" width="7" height="42" fill="#2a2f3a" />
        <rect x="855" y="991" width="73" height="20" rx="10" fill="#2a3556" />
        <rect x="940" y="991" width="73" height="20" rx="10" fill="#2a3556" />
        <path d={PHONE_OUTER} fill="url(#phoneRimDark)" />
        <path d={PHONE_SCREEN} fill="url(#phoneGlass)" />
        <path d="M388 836 L346 906" stroke="#ffffff" strokeOpacity=".18" strokeWidth="7" strokeLinecap="round" />
        <path d="M1096 812 L1124 862" stroke="#8f9650" strokeOpacity=".8" strokeWidth="17" strokeLinecap="round" />
        <circle cx="1106" cy="828" r="4" fill="#20240f" />
      </Layer>

      {/* Fon rangi: nurlar */}
      <Layer className="scene__fade">
        <defs>
          <filter colorInterpolationFilters="sRGB" id="b26" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="26" /></filter>
          <filter colorInterpolationFilters="sRGB" id="b12" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="12" /></filter>
          <radialGradient id="gBlue">
            <stop offset="0" stopColor="#1d33d6" stopOpacity=".95" />
            <stop offset=".6" stopColor="#1a2bb0" stopOpacity=".45" />
            <stop offset="1" stopColor="#10186e" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gGreen">
            <stop offset="0" stopColor="#10b24e" stopOpacity=".95" />
            <stop offset=".6" stopColor="#0a7a3a" stopOpacity=".5" />
            <stop offset="1" stopColor="#063d24" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gCore">
            <stop offset="0" stopColor="#c9c2ff" stopOpacity=".55" />
            <stop offset=".5" stopColor="#7d75e4" stopOpacity=".3" />
            <stop offset="1" stopColor="#5a50c8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="beamBlue" x1="1" y1=".3" x2="0" y2=".7">
            <stop offset="0" stopColor="#6470dc" stopOpacity=".55" />
            <stop offset=".7" stopColor="#3546a8" stopOpacity=".32" />
            <stop offset="1" stopColor="#25307a" stopOpacity=".12" />
          </linearGradient>
          <linearGradient id="beamGreen" x1="0" y1=".3" x2="1" y2=".7">
            <stop offset="0" stopColor="#7fd9a0" stopOpacity=".5" />
            <stop offset=".6" stopColor="#1b8a4a" stopOpacity=".32" />
            <stop offset="1" stopColor="#0b4d2c" stopOpacity=".1" />
          </linearGradient>
          <linearGradient id="curtain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c8d4ff" stopOpacity="0" />
            <stop offset=".35" stopColor="#c8d4ff" stopOpacity=".1" />
            <stop offset="1" stopColor="#c8d4ff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="470" cy="480" rx="520" ry="310" fill="url(#gBlue)" />
        <ellipse cx="1120" cy="470" rx="470" ry="340" fill="url(#gGreen)" />
        <g filter="url(#b26)">
          {/* Chap pastga yo'nalgan keng ko'k nur */}
          <polygon points="640,640 -100,250 -100,560 300,960 520,960" fill="url(#beamBlue)" />
          {/* O'ng yashil nur */}
          <polygon points="830,640 1540,340 1540,640 1180,960 940,960" fill="url(#beamGreen)" />
          {/* Yuqoriga ochilgan markaziy yorug'lik */}
          <polygon points="640,700 420,380 1060,380 850,700" fill="#8f8ae0" opacity=".35" />
        </g>
        <ellipse cx="730" cy="660" rx="430" ry="290" fill="url(#gCore)" />
        <g filter="url(#b12)">
          <rect x="366" y="0" width="52" height="520" fill="url(#curtain)" />
          <rect x="1090" y="0" width="60" height="520" fill="url(#curtain)" />
          <rect x="1340" y="0" width="40" height="520" fill="url(#curtain)" />
          <rect x="196" y="0" width="30" height="420" fill="url(#curtain)" />
          <polygon points="830,0 880,0 900,640 790,640" fill="url(#curtain)" />
        </g>
      </Layer>

      {/* Telefon yorug'ligi */}
      <Layer className="scene__fade">
        <defs>
          <linearGradient id="glassLit" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7f6a80" />
            <stop offset=".17" stopColor="#7f6a80" />
            <stop offset=".18" stopColor="#a48f96" />
            <stop offset=".55" stopColor="#c5bdc0" />
            <stop offset=".85" stopColor="#a9b294" />
            <stop offset=".86" stopColor="#8d9a7c" />
            <stop offset="1" stopColor="#7c8c6c" />
          </linearGradient>
          <linearGradient id="glassFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1e2d4f" stopOpacity=".62" />
            <stop offset=".65" stopColor="#1e2d4f" stopOpacity=".16" />
            <stop offset="1" stopColor="#1e2d4f" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rimLit" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7a74b8" />
            <stop offset=".5" stopColor="#85868a" />
            <stop offset="1" stopColor="#868c58" />
          </linearGradient>
        </defs>
        <path d={PHONE_OUTER} fill="url(#rimLit)" />
        <path d={PHONE_SCREEN} fill="url(#glassLit)" />
        <path d={PHONE_SCREEN} fill="url(#glassFade)" />
        <path d="M388 836 L346 906" stroke="#ffffff" strokeOpacity=".32" strokeWidth="7" strokeLinecap="round" />
        <path d="M1096 812 L1124 862" stroke="#c3c98a" strokeOpacity=".85" strokeWidth="17" strokeLinecap="round" />
        <circle cx="1106" cy="828" r="4" fill="#3d4220" />
      </Layer>

      {/* Yon plitkalar: markaziy plitka orqasidan chiqadi */}
      <Layer className="scene__tile scene__tile--l3">
        <Tile pts={[[168, 704], [258, 652], [435, 742], [305, 817]]} depth={[0, 13]} face="lilacRose" side="#c75eaa" icon="swift" iconFill="#5a3bb0" iconScale={0.5} />
      </Layer>
      <Layer className="scene__tile scene__tile--l2">
        <Tile pts={[[225, 557], [420, 557], [472, 712], [292, 719]]} depth={[0, 12]} face="violetDeep" side="#cf61b8" icon="javascript" iconFill="#b596ff" iconScale={0.52} />
      </Layer>
      <Layer className="scene__tile scene__tile--l1">
        <Tile pts={[[330, 475], [515, 517], [546, 678], [360, 617]]} r={40} depth={[3, 9]} face="violetPink" side="#d26cbc" icon="python" iconFill="#a678f5" />
      </Layer>
      <Layer className="scene__tile scene__tile--r3">
        <Tile pts={[[1060, 742], [1200, 657], [1327, 707], [1195, 804]]} depth={[0, 12]} face="indigoDeep" side="#74e0c0" icon="docker" iconFill="#8270f0" iconScale={0.5} />
      </Layer>
      <Layer className="scene__tile scene__tile--r2">
        <Tile pts={[[1100, 557], [1272, 562], [1195, 717], [1028, 702]]} depth={[0, 11]} face="indigoMint" side="#7ae4c4" icon="typescript" iconFill="#2f1f88" iconScale={0.5} />
      </Layer>
      <Layer className="scene__tile scene__tile--r1">
        <Tile pts={[[985, 512], [1165, 479], [1130, 657], [948, 677]]} depth={[0, 11]} face="lilacMint" side="#4fe08c" icon="react" iconFill="#6a45e0" />
      </Layer>

      {/* Markaziy plitka, qorong'i holat */}
      <Layer>
        <defs>
          <filter colorInterpolationFilters="sRGB" id="glow14" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>
        <path d={roundedPath(CENTER, 44)} fill="#6a50d4" transform="translate(0 15)" />
        <Tile pts={CENTER} r={44} depth={[10, 9]} face="centerDark" side="#2b2438" edge="rgba(255,255,255,.08)" />
        <g transform="translate(735 722) rotate(10) scale(5.6) translate(-16 -16)">
          <path d={ARROW} fill="#fff" opacity=".7" filter="url(#glow14)" />
          <path d={ARROW} fill="#fff" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
        </g>
      </Layer>

      {/* Markaziy plitka, yonib turgan holat va nur */}
      <Layer className="scene__fade">
        <defs>
          <radialGradient id="tileHalo">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".32" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="shaft" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".28" />
            <stop offset=".75" stopColor="#ffffff" stopOpacity=".1" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter colorInterpolationFilters="sRGB" id="glow14b" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" /></filter>
        </defs>
        <path d={roundedPath(CENTER, 44)} fill="#8d7be8" transform="translate(0 15)" />
        <Tile pts={CENTER} r={44} depth={[10, 9]} face="centerLit" side="#403a52" edge="rgba(255,255,255,.14)" />
        <ellipse cx="735" cy="722" rx="150" ry="135" fill="url(#tileHalo)" />
        <polygon points="760,690 850,690 905,330 850,330" fill="url(#shaft)" filter="url(#b12)" />
        <g transform="translate(735 722) rotate(10) scale(5.6) translate(-16 -16)">
          <path d={ARROW} fill="#fff" opacity=".85" filter="url(#glow14b)" />
          <path d={ARROW} fill="#fff" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
        </g>
      </Layer>

      {/* Zarrachalar */}
      <Layer className="scene__fade">
        <defs>
          <radialGradient id="spark">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".95" />
            <stop offset=".35" stopColor="#eafff0" stopOpacity=".55" />
            <stop offset="1" stopColor="#dfffe8" stopOpacity="0" />
          </radialGradient>
        </defs>
        {SPARKS.map(({ cx, cy, r }, i) => <circle key={i} cx={cx} cy={cy} r={r} fill="url(#spark)" />)}
      </Layer>

      {/* Odamlar */}
      <Layer>
        <g transform="translate(-9.5 -10.3) scale(.9)" fill="#090c20" stroke="rgba(190,180,235,.4)" strokeWidth="1.3" strokeLinejoin="round">
          <ellipse cx="605" cy="892" rx="10.5" ry="13.5" />
          <path d={PERSON_STANDING} />
          <ellipse cx="689" cy="887" rx="10.5" ry="13.5" />
          <path d={PERSON_POINTING} />
        </g>
      </Layer>

      {/* Oldingi plan: PostgreSQL va xira qora plitka */}
      <Layer className="scene__front scene__front--a">
        <Tile pts={[[190, 322], [330, 437], [205, 597], [60, 467]]} r={40} depth={[4, 8]} face="violetPink" side="#d26cbc" icon="postgresql" iconFill="#a678f5" iconScale={0.56} />
      </Layer>
      <Layer className="scene__front scene__front--b">
        <defs>
          <filter colorInterpolationFilters="sRGB" id="b4" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4.5" /></filter>
        </defs>
        <Tile pts={[[1210, 767], [1400, 877], [1290, 1047], [1110, 932]]} r={40} depth={[-8, 6]} face="frontB" side="#3a2a78" filter="url(#b4)" edge="none" />
      </Layer>
    </div>
  )
}
