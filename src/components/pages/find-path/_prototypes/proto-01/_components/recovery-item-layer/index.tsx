import { CSSProperties } from 'react'

import { useItemStore } from '../../_stores/items'

type RecoveryItemLayerProps = {
  /** 列数 */
  cols: number
  /** 行数 */
  rows: number
}

/**
 * セル1マスのスタイル
 *
 * - `gridColumn`/`gridRow` を明示指定する（`ObstacleLayer` と同じ理由）
 */
const cellStyle = (col: number, row: number): CSSProperties => ({
  alignItems: 'center',
  display: 'flex',
  fontSize: 20,
  gridColumn: col + 1,
  gridRow: row + 1,
  justifyContent: 'center',
})

/**
 * 回復アイテムの表示レイヤー
 *
 * - `Stage06` の floor(grid) へ children として重ねる絶対配置オーバーレイ。
 *   `ItemStore` 中の `stock` 未指定（1個ずつ使い切り）のアイテムを表示する
 *   非対話層。消費済み（store から削除済み）のアイテムは表示されない
 * - `pointerEvents: none` でクリックを下層（`PlannedPathLayer`）へ通す。実際の
 *   回復処理は `use-find-path-tick` の `applyNextStep` が行う
 */
export const RecoveryItemLayer = (props: RecoveryItemLayerProps) => {
  const { cols, rows } = props

  const items = useItemStore((state) => state.itemsById)
  const recoveryItems = Object.values(items).filter(
    (item) => item.stock === undefined,
  )

  const overlayStyle: CSSProperties = {
    display: 'grid',
    gap: 2,
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    inset: 0,
    pointerEvents: 'none',
    position: 'absolute',
  }

  return (
    <div style={overlayStyle}>
      {recoveryItems.map((item) => (
        <div
          className="ui-term-energy-recovery-item"
          key={item.id}
          style={cellStyle(item.cell.col, item.cell.row)}
        >
          🔋
        </div>
      ))}
    </div>
  )
}
