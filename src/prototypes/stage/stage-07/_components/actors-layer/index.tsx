import { CSSProperties, TransitionEvent } from 'react'

import {
  BoxBot01,
  faceAction,
  walkingAction,
} from '@/components/theater/figure/box-bot'

import { HexCell } from '../../_lib/hex'
import { computeHexGridBounds, hexCellCenter } from '../../_lib/hex-layout'

type ActorsLayerProps = {
  /** 列数 */
  cols: number
  /** 現在地セル */
  currentCell: HexCell
  /**
   * player bot と共有する EventTarget
   *
   * - 省略時は box-bot-01 が instance 固有のものを内部生成する（向き変更を発火できない）
   */
  eventTarget?: EventTarget
  /** 六角形の外接円半径 (px) */
  hexSize: number
  /**
   * セル間移動アニメーション(位置決め div の CSS transition)完了時(省略可)
   *
   * - `left`/`top`/`transform` の 3 プロパティで発火するため `propertyName === 'left'`
   *   のみ拾う(1 回の移動につき 1 回だけ呼ぶ)
   */
  onArrived?: () => void
  /** 行数 */
  rows: number
  /** actor (box-bot-01) の一辺 px。マスサイズとは独立 */
  size: number
}

/**
 * hex グリッド上の actor (box-bot-01) 表示
 *
 * - 現在地セル中心へ絶対配置する。座標計算は `GeoLayer` と同じ `hexCellCenter`/
 *   `computeHexGridBounds` を共有し、セルの見た目位置とズレないようにする
 * - 床の rotateX を打ち消す逆 rotateX で、傾いた床の上でも直立させる（stage-06 の
 *   `ActorsLayer` と同一手法）
 * - visibility registry・複数 actor・ref registry 化は対象外（試作スコープ、issue #162）
 */
/** face / walking を有効化する(jump/spin 等は無効のまま) */
const ACTIONS = [faceAction, walkingAction]

export const ActorsLayer = (props: ActorsLayerProps) => {
  const { cols, currentCell, eventTarget, hexSize, onArrived, rows, size } =
    props

  const bounds = computeHexGridBounds(cols, rows, hexSize)
  const center = hexCellCenter(currentCell, hexSize, bounds)

  const style: CSSProperties = {
    height: size,
    left: center.x,
    position: 'absolute',
    top: center.y,
    transform: 'translate(-50%, -53%) rotateX(calc(-1 * var(--floor-tilt)))',
    transformOrigin: 'center bottom',
    transition: 'left 150ms, top 150ms, transform 150ms',
    width: size,
  }

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'left') return

    onArrived?.()
  }

  return (
    <div onTransitionEnd={handleTransitionEnd} style={style}>
      <BoxBot01
        actions={ACTIONS}
        eventTarget={eventTarget}
        orbit={false}
        style={{ height: size, width: size }}
      />
    </div>
  )
}
