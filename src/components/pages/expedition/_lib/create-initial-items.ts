import { StageLayout } from '../_contexts/stage-layout/types'
import { ItemInstance } from '../_stores/items/types'

/**
 * 盤面配置の `items`/`spots` から初期配置のアイテム一覧を組み立てる
 *
 * - EN 補給アイテムは `stock` 未指定（1個ずつ使い切り）、EN スポットは `stock` 指定
 *   （指定回数で枯渇しうる）で区別する（proto-01 と同型）
 *
 * @param stageLayout 盤面配置
 */
export const createInitialItems = (
  stageLayout: StageLayout,
): ItemInstance[] => [
  ...stageLayout.items.map((cell, index): ItemInstance => ({
    amount: cell.amount,
    cell: { q: cell.q, r: cell.r },
    id: `charge-item-${index}`,
    kind: 'energy-charge',
  })),
  ...stageLayout.spots.map((cell, index): ItemInstance => ({
    amount: cell.amount,
    cell: { q: cell.q, r: cell.r },
    id: `charge-spot-${index}`,
    kind: 'energy-charge',
    stock: cell.stock,
  })),
]
