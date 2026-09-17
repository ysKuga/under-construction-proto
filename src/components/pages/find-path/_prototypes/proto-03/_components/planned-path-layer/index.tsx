import { CSSProperties } from 'react'

import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import {
  colRowToAxial,
  HexCell,
  isHexAdjacent,
} from '@/prototypes/stage/stage-07/_lib/hex'
import {
  computeHexGridBounds,
  hexCellCenter,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'
import { usePlannedPathStore } from '@/prototypes/time-control/time-control-03/_stores/planned-path'

import {
  toHexCell,
  usePlannedPathSteps,
} from '../../_hooks/use-planned-path-steps'

type PlannedPathLayerProps = {
  /** 対象セルへ進入可能か（障害物・一方通行の逆走を除外。呼び出し元の `canEnterCell` をそのまま渡す） */
  canEnterCell: (cell: HexCell) => boolean
  /** 列数 */
  cols: number
  /** actor の現在セル（予定経路が空のときの隣接判定の起点） */
  currentCell: HexCell
  /** 六角形の外接円半径 (px)。`GeoLayer`/`ActorsLayer` と同じ値を渡し座標をズレさせない */
  hexSize: number
  /**
   * tick 走行中か
   *
   * - 走行中はセル選択（`appendStep`）を無効化する。走行中に追加した指定は
   *   実行用の残り経路（path store）へ反映されず「消化されない指定」になるため
   */
  isRunning: boolean
  /** 行数 */
  rows: number
}

/** セル1マスのボタンスタイル */
const cellStyle = (selectable: boolean, hasOrders: boolean): CSSProperties => ({
  alignItems: 'center',
  background: hasOrders ? 'rgba(56, 189, 248, 0.35)' : 'transparent',
  border: selectable ? '1px dashed #0284c7' : '1px solid transparent',
  borderRadius: '50%',
  color: '#0c4a6e',
  cursor: selectable ? 'pointer' : 'default',
  display: 'flex',
  font: 'inherit',
  fontWeight: 700,
  justifyContent: 'center',
  padding: 0,
  pointerEvents: selectable || hasOrders ? 'auto' : 'none',
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
})

/**
 * 予定経路の積み込みレイヤー（proto-01 `PlannedPathLayer` の hex 版）
 *
 * - `Stage07`（`interactive=false`）の floor へ children として重ねる絶対配置
 *   オーバーレイ。セルクリックで予定経路の末尾へその座標を push する
 * - proto-01 と異なり選択可能マスは「予定経路末尾セル（空なら actor の現在セル）に
 *   隣接」に制限する（視界コンセプト維持のためのユーザー判断、issue-181-en）
 * - 番号表示は list（カンマ区切り）のみ。fadeOut 等の演出は持たない
 *   （実行完了で予定経路 store 自体が空になり自然に消える。比較試作段階のため
 *   proto-01 の `PlannedPathCellRegistryProvider` 相当は持ち込まない、YAGNI）
 * - tick 走行中（`isRunning`）はセル選択を disabled にする
 */
export const PlannedPathLayer = (props: PlannedPathLayerProps) => {
  const { canEnterCell, cols, currentCell, hexSize, isRunning, rows } = props

  const { appendStep } = usePlannedPathSteps(PLAYER_ACTOR_ID)
  const planned = usePlannedPathStore((state) =>
    state.getPlannedPath(PLAYER_ACTOR_ID),
  )

  const bounds = computeHexGridBounds(cols, rows, hexSize)
  const cells = Array.from({ length: rows }).flatMap((_, row) =>
    Array.from({ length: cols }).map((_, col) => colRowToAxial(col, row)),
  )

  /** "q,r" → 積んだ順番（1 始まり）の一覧。同じセルを複数回選択すると複数持つ */
  const ordersByCell = new Map<string, number[]>()
  planned.forEach((position, index) => {
    const cell = toHexCell(position)

    ordersByCell.set(`${cell.q},${cell.r}`, [
      ...(ordersByCell.get(`${cell.q},${cell.r}`) ?? []),
      index + 1,
    ])
  })

  /** 隣接判定の起点（予定経路の末尾、空なら actor の現在セル） */
  const lastPlanned = planned[planned.length - 1]
  const precedingCell = lastPlanned ? toHexCell(lastPlanned) : currentCell

  return (
    <>
      {cells.map((axial) => {
        const orders = ordersByCell.get(`${axial.q},${axial.r}`) ?? []
        const selectable =
          !isRunning &&
          isHexAdjacent(precedingCell, axial) &&
          canEnterCell(axial)
        const center = hexCellCenter(axial, hexSize, bounds)

        return (
          <button
            aria-label={`予定経路へ ${axial.q}-${axial.r} を追加`}
            disabled={!selectable}
            key={`${axial.q},${axial.r}`}
            onClick={() => appendStep(axial)}
            style={{
              ...cellStyle(selectable, orders.length > 0),
              height: bounds.cellHeight * 0.7,
              left: center.x,
              top: center.y,
              width: bounds.cellWidth * 0.7,
            }}
            type="button"
          >
            {orders.length > 0 && (
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {orders.join(',')}
              </span>
            )}
          </button>
        )
      })}
    </>
  )
}
