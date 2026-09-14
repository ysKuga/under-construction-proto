'use client'

import { CSSProperties } from 'react'

import { usePerspectiveControl } from '../stage-05/_hooks/use-perspective-control'

import { ActorsLayer } from './_components/actors-layer'
import { GeoLayer } from './_components/geo-layer'
import { useHexMove } from './_hooks/use-hex-move'
import { HexCell } from './_lib/hex'

type Stage07Props = {
  /** actor (box-bot-01) の一辺 px。マスサイズとは独立 */
  botSize: number
  /** 列数 */
  cols: number
  /** 六角形の外接円半径 (px) */
  hexSize: number
  /** 初期の現在地セル（省略時は axial 原点 (0, 0)） */
  initialCell?: HexCell
  /** rotateX の初期角度 (deg)（省略時は 0） */
  initialTiltDeg?: number
  /** perspective 視点距離 (px)。小さいほど遠近が強い（省略時は 800） */
  perspectivePx?: number
  /** 行数 */
  rows: number
}

/**
 * 舞台 (stage) — hex グリッド試作版
 *
 * - CSS Grid を使わず、矩形(col, row)を axial 座標へ変換した flat-top 六角形を
 *   absolute 配置する（issue #162）
 * - 遠近表現（perspective + rotateX の台形床）は stage-05/06 と同一。傾きは
 *   `usePerspectiveControl`（stage-05 から import）が `--floor-tilt` を ref 直書き
 * - box-bot-01 (`ActorsLayer`) をクリック移動中の現在地セルへ表示する。
 *   visibility / time-control 統合、複数 actor 対応は対象外（別途検討）
 */
export const Stage07 = (props: Stage07Props) => {
  const {
    botSize,
    cols,
    hexSize,
    initialCell = { q: 0, r: 0 },
    initialTiltDeg = 0,
    perspectivePx = 800,
    rows,
  } = props

  const { currentCell, handleCellClick } = useHexMove(initialCell)
  const { floorRef, setTilt } = usePerspectiveControl()

  /** 透視の視点距離を持つ外枠のスタイル（floor と同じくコンテンツ幅にフィットさせ、消失点を floor 中心付近に保つ） */
  const sceneStyle: CSSProperties = {
    display: 'inline-block',
    perspective: `${perspectivePx}px`,
    perspectiveOrigin: 'center 30%',
  }

  /** rotateX で寝かせた床本体のスタイル（傾きは --floor-tilt 経由） */
  const floorStyle = {
    '--floor-tilt': `${initialTiltDeg}deg`,
    // GeoLayer のコンテンツ幅にフィットさせ、rotateX の軸をセル群の中心下端に合わせる
    display: 'inline-block',
    transform: 'rotateX(var(--floor-tilt))',
    transformOrigin: 'center bottom',
    transformStyle: 'preserve-3d',
    transition: 'transform 150ms',
  } as CSSProperties

  return (
    <div>
      <div style={sceneStyle}>
        <div ref={floorRef} style={floorStyle}>
          <GeoLayer
            cols={cols}
            currentCell={currentCell}
            hexSize={hexSize}
            onCellClick={handleCellClick}
            rows={rows}
          />
          <ActorsLayer
            cols={cols}
            currentCell={currentCell}
            hexSize={hexSize}
            rows={rows}
            size={botSize}
          />
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
