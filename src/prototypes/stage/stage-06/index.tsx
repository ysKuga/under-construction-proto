'use client'

import { CSSProperties } from 'react'

import { usePerspectiveControl } from '../stage-05/_hooks/use-perspective-control'

import { ActorsLayer } from './_components/actors-layer'
import { GeoLayer } from './_components/geo-layer'
import { ActorNodeRegistryProvider } from './_contexts/actor-node-registry'

type Stage06Props = {
  /** actor (box-bot-01) の一辺 px。マスサイズとは独立 */
  botSize: number
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
 * 舞台 (stage) — 遠近 + actor 位置の ref 化版
 *
 * - 遠近 (perspective + rotateX の台形床) は stage-05 と同一。傾きは
 *   `usePerspectiveControl` (stage-05 から import) が `--floor-tilt` を ref 直書き
 * - actor の位置は `ActorNodeRegistryProvider` が bot ラッパー DOM の `left/top` を
 *   直書きして反映する。stage-05 の `ActorPositionProvider` (useState) と違い、
 *   移動でセル群も actor も再レンダリングされない
 * - 段階 3 (time-control) の tick 接続はこの ref 基盤の上に載せる
 */
export const Stage06 = (props: Stage06Props) => {
  const { botSize, cols, initialTiltDeg, perspectivePx, rows, size } = props

  const { floorRef, setTilt } = usePerspectiveControl()

  console.log('render: Stage06')

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
    // ActorsLayer の bot ラッパーを絶対配置する基準
    position: 'relative',
    transform: 'rotateX(var(--floor-tilt))',
    transformOrigin: 'center bottom',
    // 子 (ActorsLayer) を同じ 3D 空間へ置き、逆 rotateX が正しく相殺されるようにする
    transformStyle: 'preserve-3d',
    transition: 'transform 150ms',
    width: '100%',
  } as CSSProperties

  return (
    <ActorNodeRegistryProvider gridSize={{ cols, rows }}>
      <div>
        <div style={sceneStyle}>
          <div ref={floorRef} style={floorStyle}>
            <GeoLayer />
            <ActorsLayer botSize={botSize} />
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
    </ActorNodeRegistryProvider>
  )
}
