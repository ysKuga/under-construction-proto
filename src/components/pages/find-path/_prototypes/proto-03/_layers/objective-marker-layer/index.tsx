import { CSSProperties, memo, useCallback } from 'react'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import {
  computeHexGridBounds,
  hexCellCenter,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'
import { useActorsStore } from '@/prototypes/stage/stage-07/_stores/actors'

import { OBJECTIVE_OVERLAY_ID } from '../../constants'

import * as styles from './index.css'

type ObjectiveMarkerLayerProps = {
  /** オーバーレイアンカーの一辺 px。bot（box-bot-01）の一辺と同じ値を渡す */
  anchorSize: number
  /** 列数 */
  cols: number
  /** 六角形の外接円半径 (px)。`GeoLayer`/`ActorsLayer` と同じ値を渡し座標をズレさせない */
  hexSize: number
  /** 目標セル。未指定なら何も表示しない */
  objectiveCell: HexCell | undefined
  /** 行数 */
  rows: number
}

/**
 * 目標セルの表示レイヤー
 *
 * - 非隣接クリックで指定した目標セルへ、経路プレビューと同色のリングを表示する
 *   非対話層（`PathPreviewLayer` 同型）。経路プレビューの点だけでは終端が
 *   どこか分からないため（issue #226）
 * - ゴールの旗（`GoalMarkerLayer`）・中継点の 📍 と見分けがつくよう、絵文字でなく
 *   リングにする。ゴールセルを目標にした場合も旗を囲む形で重なる
 * - リングは縮小 → 非表示 → 初期表示を繰り返す（`index.css.ts`）。目標セルが
 *   変わるたび `key` でマウントし直し、アニメーションを最初から再生する
 * - 目標セルに bot の位置決め div と同じ大きさ・tilt 打消しのアンカーを置き、
 *   actors store へ擬似 id（`OBJECTIVE_OVERLAY_ID`）で登録する。`ActorOverlayLayer` が
 *   用意するコンテナへ bot と同じ吹き出しを、bot 基準の `offset` のまま注入できる
 *   （リングは縮小アニメーションで大きさが変わるため、アンカーは別要素にする）
 * - `registerVisibilityNode` は持たない（`PathPreviewLayer` と同じく、プレイヤーが
 *   選んだ移動先を示す表示のため常時表示）
 */
export const ObjectiveMarkerLayer = memo((props: ObjectiveMarkerLayerProps) => {
  const { anchorSize, cols, hexSize, objectiveCell, rows } = props

  const registerOverlayAnchor = useActorsStore(
    (state) => state.registerOverlayAnchor,
  )
  const registerObjectiveOverlayAnchor = useCallback(
    (el: HTMLDivElement | null) =>
      registerOverlayAnchor(OBJECTIVE_OVERLAY_ID, el),
    [registerOverlayAnchor],
  )

  if (!objectiveCell) return null

  const bounds = computeHexGridBounds(cols, rows, hexSize)
  const center = hexCellCenter(objectiveCell, hexSize, bounds)

  const style: CSSProperties = {
    height: bounds.cellHeight * 0.7,
    left: center.x,
    top: center.y,
    width: bounds.cellHeight * 0.7,
  }

  /** オーバーレイアンカーのスタイル（`ActorsLayer` の bot の位置決め div と同形） */
  const anchorStyle: CSSProperties = {
    height: anchorSize,
    left: center.x,
    pointerEvents: 'none',
    position: 'absolute',
    top: center.y,
    transform: 'translate(-50%, -53%) rotateX(calc(-1 * var(--floor-tilt)))',
    transformOrigin: 'center bottom',
    width: anchorSize,
  }

  return (
    <>
      <div
        className={styles.ring}
        key={`${objectiveCell.q},${objectiveCell.r}`}
        style={style}
      />
      <div ref={registerObjectiveOverlayAnchor} style={anchorStyle} />
    </>
  )
})

ObjectiveMarkerLayer.displayName = 'ObjectiveMarkerLayer'
