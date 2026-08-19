import type { CSSProperties, SVGProps } from 'react'

import { makeRng } from './_lib/make-rng'
import { rectPoints } from './_lib/rect-points'
import { roughen } from './_lib/roughen'
import { toPoints } from './_lib/to-points'
import type { BoxBotConfig, BoxBotProps, Pt } from './index.types'

/**
 * BoxBot — 手書き風ボックスロボットの可変 SVG コンポーネント(TypeScript)
 *
 * 構造は直線ジオメトリ(head / body / arms / legs / eyes / mouth)。
 * 手描きの揺らぎは「各線分を細分し、頂点をシード乱数で法線方向へずらす」
 * 頂点ジッター方式で生成する(feDisplacementMap の波打ちではなく、
 * 手ブレの折れ線に近い質感)。wobble=0 で完全な直線に戻る。
 *
 * すべての座標・長さは props で上書き可能。viewBox 基準の座標系なので
 * 親要素の width/height に追従してレスポンシブに拡縮する。
 */

const DEFAULTS: BoxBotConfig = {
  animate: false,
  arms: {
    left: [
      [36, 82],
      [19, 109],
    ],
    right: [
      [144, 82],
      [165, 74],
    ],
  },
  body: { h: 85, w: 100, x: 40, y: 68 },
  color: '#191B21',
  drawDuration: 0.4,
  eyes: { len: 13, lx: 66, rx: 114, y: 37 },
  head: { h: 50, w: 90, x: 45, y: 12 },
  legs: { len: 13, lx: 66, rx: 114, y: 157 },
  mouth: { x1: 80, x2: 100, y: 55 },
  roughness: 0.12,
  seed: 7,
  strokeWidth: 3,
  wobble: 1.8,
}

/**
 * polyline で c.animate の場合の props
 *
 * - インデントに関して ESLint と Prettier が競合するのでここで変数化
 */
const getPolylinePropsForAnimated: (
  c: BoxBotConfig,
  i: number,
) => SVGProps<SVGPolylineElement> = (c, i) => ({
  className: 'boxbot-draw',
  pathLength: 1,
  style: {
    ['--dur' as string]: `${c.drawDuration}s`,
    animationDelay: `${i * c.drawDuration}s`,
  } as CSSProperties,
})

export default function BoxBot({
  className,
  height,
  style,
  viewBox = '0 0 200 210',
  width,
  ...opts
}: BoxBotProps) {
  // 部位ごとに浅くマージ(位置・長さの部分上書きを許可)
  const c: BoxBotConfig = {
    ...DEFAULTS,
    ...opts,
    arms: { ...DEFAULTS.arms, ...opts.arms },
    body: { ...DEFAULTS.body, ...opts.body },
    eyes: { ...DEFAULTS.eyes, ...opts.eyes },
    head: { ...DEFAULTS.head, ...opts.head },
    legs: { ...DEFAULTS.legs, ...opts.legs },
    mouth: { ...DEFAULTS.mouth, ...opts.mouth },
  }

  const strokeProps = {
    fill: 'none',
    stroke: c.color,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: c.strokeWidth,
  }

  const eyeLine = (x: number): Pt[] => [
    [x, c.eyes.y - c.eyes.len / 2],
    [x, c.eyes.y + c.eyes.len / 2],
  ]

  // 描画順に並べたストローク(closed=矩形の輪郭)
  const strokes: { closed: boolean; pts: Pt[] }[] = [
    { closed: true, pts: rectPoints(c.head) },
    { closed: true, pts: rectPoints(c.body) },
    { closed: false, pts: c.arms.left },
    { closed: false, pts: c.arms.right },
    {
      closed: false,
      pts: [
        [c.legs.lx, c.legs.y],
        [c.legs.lx, c.legs.y + c.legs.len],
      ],
    },
    {
      closed: false,
      pts: [
        [c.legs.rx, c.legs.y],
        [c.legs.rx, c.legs.y + c.legs.len],
      ],
    },
    {
      closed: false,
      pts: [
        [c.mouth.x1, c.mouth.y],
        [c.mouth.x2, c.mouth.y],
      ],
    },
    { closed: false, pts: eyeLine(c.eyes.lx) },
    { closed: false, pts: eyeLine(c.eyes.rx) },
  ]

  // 同一 render 内で順に消費するため、seed から決定論的に確定する
  const rng = makeRng(c.seed)

  return (
    <svg
      className={className}
      height={height}
      preserveAspectRatio="xMidYMid meet"
      style={style}
      viewBox={viewBox}
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      {c.animate && (
        <style>{`
          .boxbot-draw {
            stroke-dasharray: 1;
            stroke-dashoffset: 1;
            animation: boxbot-dash var(--dur, 0.4s) ease forwards;
          }
          @keyframes boxbot-dash { to { stroke-dashoffset: 0; } }
        `}</style>
      )}
      <g>
        {strokes.map((s, i) => (
          <polyline
            key={i}
            points={toPoints(
              roughen(s.pts, c.wobble, c.roughness, rng, s.closed),
            )}
            {...strokeProps}
            {...(c.animate ? getPolylinePropsForAnimated(c, i) : {})}
          />
        ))}
      </g>
    </svg>
  )
}
