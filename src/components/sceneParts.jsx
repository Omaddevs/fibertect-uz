import { techIcons } from '../data/techIcons.js'

// Odam siluetlari: boshi alohida ellips, koordinatalari HeroScene sahnasiga nisbatan.
export const PERSON_STANDING = 'M600 904 L610 904 L611 911 C620 913 628 917 631 927 L640 990 C641 999 638 1004 635 1003 C632 1003 630 997 629 990 L620 938 L618 1000 L624 1084 C628 1089 633 1092 630 1097 L610 1097 L607 1010 L605 1002 L603 1010 L598 1097 L578 1097 C575 1092 580 1089 584 1084 L591 1000 L590 938 L581 990 C580 997 578 1003 575 1003 C572 1004 569 999 570 990 L579 927 C582 917 590 913 599 911 Z'
export const PERSON_POINTING = 'M685 900 L695 900 L696 908 C703 909 710 912 714 917 C724 914 734 905 742 893 L755 870 L758 860 L762 861 L761 871 L767 870 L767 877 L757 885 C749 904 734 925 716 933 L706 940 L704 1000 L710 1084 C714 1089 719 1092 716 1097 L696 1097 L693 1010 L690 1002 L688 1010 L684 1097 L664 1097 C661 1092 666 1089 670 1084 L677 1000 L676 938 L667 990 C666 997 664 1003 661 1003 C658 1004 655 999 656 990 L665 927 C668 917 676 911 684 908 Z'

// Plitka burchaklari bo'yicha silliqlangan shakl: [yuqori-chap, yuqori-o'ng, past-o'ng, past-chap].
export function roundedPath(pts, r) {
  const n = pts.length
  let d = ''
  pts.forEach((p, i) => {
    const prev = pts[(i + n - 1) % n]
    const next = pts[(i + 1) % n]
    const toward = (a, b) => {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1])
      const k = Math.min(r, len / 2) / len
      return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]
    }
    const a = toward(p, prev)
    const b = toward(p, next)
    d += `${i ? 'L' : 'M'}${a[0].toFixed(1)} ${a[1].toFixed(1)}Q${p[0]} ${p[1]} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`
  })
  return `${d}Z`
}

// Logotipni plitka tekisligiga joylashtiruvchi matritsa.
function iconMatrix([tl, tr, br, bl], scale) {
  const k = scale / 24
  const ax = ((tr[0] - tl[0] + br[0] - bl[0]) / 2) * k
  const ay = ((tr[1] - tl[1] + br[1] - bl[1]) / 2) * k
  const bx = ((bl[0] - tl[0] + br[0] - tr[0]) / 2) * k
  const by = ((bl[1] - tl[1] + br[1] - tr[1]) / 2) * k
  const cx = (tl[0] + tr[0] + br[0] + bl[0]) / 4
  const cy = (tl[1] + tr[1] + br[1] + bl[1]) / 4
  return `matrix(${ax} ${ay} ${bx} ${by} ${cx} ${cy}) translate(-12 -12)`
}

export function Tile({ pts, r = 34, depth, face, side, icon, iconFill, iconScale = 0.58, opacity, filter, edge = 'rgba(255,255,255,.12)' }) {
  const d = roundedPath(pts, r)
  const steps = depth ? Math.ceil(Math.hypot(depth[0], depth[1]) / 1.5) : 0
  return (
    <g opacity={opacity} filter={filter}>
      {Array.from({ length: steps }, (_, i) => {
        const t = (steps - i) / steps
        return <path key={i} d={d} fill={side} transform={`translate(${depth[0] * t} ${depth[1] * t})`} />
      })}
      <path d={d} fill={`url(#${face})`} stroke={edge} strokeWidth="1.25" />
      {icon && <path d={techIcons[icon]} fill={iconFill} transform={iconMatrix(pts, iconScale)} />}
    </g>
  )
}
