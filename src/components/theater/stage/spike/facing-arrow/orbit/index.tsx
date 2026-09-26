import { FacingArrowProps } from '../types'

/** 基準 hex の外接円半径(viewBox 単位) */
const HEX_RADIUS = 0.7

/**
 * 基準 hex(flat-top)の頂点列
 *
 * - 頂点を 0°・60°… に置く。stage のセルと同じ flat-top にし、隣接6方向\
 *   (30°・90°…)が各辺の中点方向と一致するようにする
 */
const HEX_OUTLINE_POINTS = Array.from({ length: 6 }, (_, i) => {
  const rad = (i * Math.PI) / 3

  return `${HEX_RADIUS * Math.cos(rad)},${HEX_RADIUS * Math.sin(rad)}`
}).join(' ')

/**
 * 向き矢印(半径端)
 *
 * - 基準 hex の外側に置いた矢印を、hex の中心を軸に周回させる。矢印の位置で向きを表す
 */
export const FacingArrowOrbit = (props: FacingArrowProps) => {
  const { ref } = props

  return (
    <div className="relative size-16">
      <svg className="absolute inset-0 size-full" viewBox="-1 -1 2 2">
        <polygon
          fill="none"
          opacity={0.4}
          points={HEX_OUTLINE_POINTS}
          stroke="currentColor"
          strokeWidth={0.05}
        />
      </svg>
      <div
        className="absolute inset-0 transition-transform duration-150"
        ref={ref}
      >
        <svg className="size-full" viewBox="-1 -1 2 2">
          <polygon fill="currentColor" points="0.98,0 0.68,0.22 0.68,-0.22" />
        </svg>
      </div>
    </div>
  )
}
