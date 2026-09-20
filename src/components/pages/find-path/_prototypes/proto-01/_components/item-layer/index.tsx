import { CSSProperties } from 'react'

import { getItemPresentation } from '../../_lib/item-presentation'
import { useItemStore } from '../../_stores/items'

type ItemLayerProps = {
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
 * アイテムの表示レイヤー
 *
 * - `Stage06` の floor(grid) へ children として重ねる絶対配置オーバーレイ。
 *   `ItemStore` の全アイテムを種類問わず表示する非対話層。消費済み（store から
 *   削除済み）のアイテムは表示されない
 * - 表示（絵文字・className）は `getItemPresentation`（`ItemKind` ベースの辞書、
 *   `_lib/item-presentation.ts`）で解決する。新しい種類のアイテムが増えても辞書へ
 *   追記するだけで対応でき、このレイヤー自体を種類ごとに増やす必要はない
 *   （旧 `RecoveryItemLayer`/`RecoverySpotLayer` を統合、issue #137）
 * - `pointerEvents: none` でクリックを下層（`PlannedPathLayer`）へ通す。実際の
 *   携行処理（即時回復でなく `CarriedItemStore` へ pickup）は `use-find-path-tick`
 *   の `applyNextStep` が行う（issue #181）
 */
export const ItemLayer = (props: ItemLayerProps) => {
  const { cols, rows } = props

  const items = useItemStore((state) => state.itemsById)

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
      {Object.values(items).map((item) => {
        const presentation = getItemPresentation(item)

        return (
          <div
            className={presentation.className}
            key={item.id}
            style={cellStyle(item.cell.col, item.cell.row)}
          >
            {presentation.emoji}
          </div>
        )
      })}
    </div>
  )
}
