import { CSSProperties } from 'react'

import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { usePlannedPathStore } from '@/prototypes/time-control/time-control-03/_stores/planned-path'

import { usePlannedPathCellRegistry } from '../../_contexts/planned-path-cell-registry'
import { usePlannedPathSteps } from '../../_hooks/use-planned-path-steps'

type PlannedPathLayerProps = {
  /** 列数 */
  cols: number
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

/** セル1マスのスタイル（予定経路に含まれるかで見た目を変える） */
const cellStyle = (order: number | undefined): CSSProperties => ({
  alignItems: 'center',
  background: order ? 'rgba(56, 189, 248, 0.35)' : 'transparent',
  border: order ? '1px solid #0284c7' : '1px solid transparent',
  color: '#0c4a6e',
  cursor: 'pointer',
  display: 'flex',
  font: 'inherit',
  fontWeight: 700,
  justifyContent: 'center',
  opacity: 1,
  padding: 0,
  transition: 'opacity 300ms',
})

/**
 * 予定経路の積み込みレイヤー
 *
 * - `Stage06` の floor(grid) へ children として重ねる絶対配置オーバーレイ。
 *   セルクリックで予定経路の末尾へその座標を push する
 * - 予定経路に含まれるセルには積んだ順番（1 始まり）を表示する
 * - tick 走行中（`isRunning`）はセル選択を disabled にする
 * - planned-path store のみ購読。bot の移動（path / position）では再レンダリングしない
 * - 各セルの DOM を `PlannedPathCellRegistryProvider` へ登録する。到達済みセルの
 *   フェードアウト（`useFindPathTick`）はここを経由して opacity を直書きする\
 *   （再レンダリングなし）。DOM 直書きは React の style diffing に乗らないため、\
 *   フェードアウト済みセルを再選択した際は `onClick` で `resetCell` を明示的に呼ぶ
 */
export const PlannedPathLayer = (props: PlannedPathLayerProps) => {
  const { cols, isRunning, rows } = props

  const { appendStep } = usePlannedPathSteps(PLAYER_ACTOR_ID)
  const { registerCellNode, resetCell } = usePlannedPathCellRegistry()
  const planned = usePlannedPathStore((state) =>
    state.getPlannedPath(PLAYER_ACTOR_ID),
  )

  /** "col,row" → 積んだ順番（1 始まり） */
  const orderByCell = new Map<string, number>()
  planned.forEach((position, index) => {
    orderByCell.set(`${position.x},${position.y}`, index + 1)
  })

  const overlayStyle: CSSProperties = {
    display: 'grid',
    gap: 2,
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    inset: 0,
    position: 'absolute',
  }

  return (
    <div style={overlayStyle}>
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => {
          const order = orderByCell.get(`${col},${row}`)

          return (
            <button
              aria-label={`予定経路へ ${col}-${row} を追加`}
              disabled={isRunning}
              key={`${row}-${col}`}
              onClick={() => {
                // 到達済みで fadeOutCell 済みのセルを再選択した場合に備え、
                // 見た目（opacity）も明示的に戻す（DOM 直書きは再レンダリングで戻らない）
                resetCell({ col, row })
                appendStep({ col, row })
              }}
              ref={(el) => registerCellNode({ col, row }, el)}
              style={cellStyle(order)}
              type="button"
            >
              {order ?? ''}
            </button>
          )
        }),
      )}
    </div>
  )
}
