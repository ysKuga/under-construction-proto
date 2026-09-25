import { CSSProperties, memo } from 'react'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'
import {
  computeHexGridBounds,
  hexCellCenter,
} from '@/prototypes/stage/stage-07/_lib/hex-layout'

import { getItemPresentation } from '../../_lib/item-presentation'
import { useItemStore } from '../../_stores/items'

type ItemLayerProps = {
  /** 列数 */
  cols: number
  /** 六角形の外接円半径 (px)。`GeoLayer`/`ActorsLayer` と同じ値を渡し座標をズレさせない */
  hexSize: number
  /**
   * アイテムセルの DOM を visibility registry へ登録する
   *
   * - 省略時は常時表示。渡した場合は未到達マスへ隣接するまで表示されない
   */
  registerVisibilityNode?: (cell: HexCell, el: HTMLElement | null) => void
  /** 行数 */
  rows: number
}

/**
 * アイテムの表示レイヤー
 *
 * - `Stage07` の floor へ children として重ねる絶対配置オーバーレイ。`ItemStore`
 *   の全アイテムを種類問わず表示する非対話層。消費済み（store から削除済み）の
 *   アイテムは表示されない
 * - 表示（絵文字・className）は `getItemPresentation`（`ItemKind` ベースの辞書、
 *   `_lib/item-presentation.ts`）で解決する。新しい種類のアイテムが増えても辞書へ
 *   追記するだけで対応でき、このレイヤー自体を種類ごとに増やす必要はない
 *   （proto-01 の `ItemLayer` と同型、issue #137）
 * - 座標計算は `ObstacleLayer` と同じ `computeHexGridBounds`/`hexCellCenter` を
 *   共有し、見た目位置がズレないようにする
 * - `pointerEvents: none` でクリックを下層（`GeoLayer`）へ通す。実際の回復処理は
 *   `index.tsx` の `handleCellChange` が行う
 * - `React.memo` 化済み（issue-181-en backlog）。EN 残量等の find-path 固有の
 *   状態変化に巻き込まれて再レンダリングしない（アイテム変化自体は `useItemStore`
 *   の直接購読により従来通り反応する）
 */
export const ItemLayer = memo((props: ItemLayerProps) => {
  const { cols, hexSize, registerVisibilityNode, rows } = props

  const items = useItemStore((state) => state.itemsById)
  const bounds = computeHexGridBounds(cols, rows, hexSize)

  return (
    <>
      {Object.values(items).map((item) => {
        const presentation = getItemPresentation(item)
        const center = hexCellCenter(item.cell, hexSize, bounds)

        const style: CSSProperties = {
          alignItems: 'center',
          display: 'flex',
          fontSize: 20,
          height: bounds.cellHeight * 0.7,
          justifyContent: 'center',
          left: center.x,
          pointerEvents: 'none',
          position: 'absolute',
          top: center.y,
          transform: 'translate(-50%, -50%)',
          width: bounds.cellWidth * 0.7,
        }

        return (
          <div
            className={presentation.className}
            key={item.id}
            ref={(el) => registerVisibilityNode?.(item.cell, el)}
            style={style}
          >
            {presentation.emoji}
          </div>
        )
      })}
    </>
  )
})

ItemLayer.displayName = 'ItemLayer'
