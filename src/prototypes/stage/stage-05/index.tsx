import { CSSProperties } from 'react'

import { usePerspectiveControl } from './_hooks/use-perspective-control'

type Stage05Props = {
  /** 列数 */
  cols: number
  /** rotateX の初期角度 (deg) */
  initialTiltDeg: number
  /** perspective 視点距離 (px)。小さいほど遠近が強い */
  perspectivePx: number
  /** 行数 */
  rows: number
  /** 描画領域の一辺 (px) */
  size: number
}

/**
 * 舞台 (stage) — CSS perspective + rotateX で床面を台形にした版
 *
 * - 等間隔の正方形グリッドを `perspective` 空間で寝かせ、遠近は透視変換に任せる
 * - 傾き (rotateX) は `usePerspectiveControl` が ref 経由で `--floor-tilt` を書換える。
 *   スライダー操作でセル群は再レンダリングされない
 * - 子要素も同じ 3D 空間に乗るため、この上に載せる actor は段階 2 で逆 rotateX が要る
 */
export const Stage05 = (props: Stage05Props) => {
  const { cols, initialTiltDeg, perspectivePx, rows, size } = props

  const { floorRef, setTilt } = usePerspectiveControl()

  console.log('render: Stage05')

  /** 透視の視点距離を持つ外枠のスタイル */
  const sceneStyle: CSSProperties = {
    height: size,
    perspective: `${perspectivePx}px`,
    perspectiveOrigin: 'center 30%',
    width: size,
  }

  /** rotateX で寝かせたグリッド本体のスタイル (傾きは --floor-tilt 経由) */
  const floorStyle = {
    '--floor-tilt': `${initialTiltDeg}deg`,
    display: 'grid',
    gap: 2,
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    height: '100%',
    transform: 'rotateX(var(--floor-tilt))',
    transformOrigin: 'center bottom',
    transition: 'transform 150ms',
    width: '100%',
  } as CSSProperties

  return (
    <div>
      <div style={sceneStyle}>
        <div ref={floorRef} style={floorStyle}>
          {Array.from({ length: cols * rows }).map((_, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
              }}
            />
          ))}
        </div>
      </div>
      <label>
        tilt{' '}
        <input
          defaultValue={initialTiltDeg}
          max={85}
          min={0}
          onChange={(event) => {
            setTilt(Number(event.target.value))
          }}
          step={1}
          type="range"
        />
      </label>
    </div>
  )
}
