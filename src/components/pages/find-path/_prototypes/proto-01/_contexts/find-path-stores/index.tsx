'use client'

import { PropsWithChildren, useState } from 'react'

import { EnergyStoreProvider } from '@/components/pages/find-path/_prototypes/_stores/energy'
import {
  createGameClockStore,
  GameClockStoreContext,
} from '@/prototypes/time-control/time-control-03/_stores/game-clock'
import {
  createPathStore,
  PathStoreContext,
} from '@/prototypes/time-control/time-control-03/_stores/path'
import {
  createPlannedPathStore,
  PlannedPathStoreContext,
} from '@/prototypes/time-control/time-control-03/_stores/planned-path'

import { ItemStoreProvider } from '../../_stores/items'
import { ItemInstance } from '../../_stores/items/types'
import { TickStatusStoreProvider } from '../../_stores/tick-status'
import { RECOVERY_ITEM_CELLS, RECOVERY_SPOT_CELLS } from '../../constants'

/**
 * 初期配置するアイテム一覧（`RECOVERY_ITEM_CELLS`/`RECOVERY_SPOT_CELLS` から組み立てる）
 *
 * - 回復アイテムは `stock` 未指定（1個ずつ使い切り）、回復スポットは `stock` 指定
 *   （指定回数で枯渇しうる）で区別する
 */
const INITIAL_ITEMS: ItemInstance[] = [
  ...RECOVERY_ITEM_CELLS.map((cell, index): ItemInstance => ({
    amount: cell.amount,
    cell: { col: cell.col, row: cell.row },
    id: `recovery-item-${index}`,
    kind: 'energy-recovery',
  })),
  ...RECOVERY_SPOT_CELLS.map((cell, index): ItemInstance => ({
    amount: cell.amount,
    cell: { col: cell.col, row: cell.row },
    id: `recovery-spot-${index}`,
    kind: 'energy-recovery',
    stock: cell.stock,
  })),
]

/**
 * find-path 試作の store Provider
 *
 * - time-control-03 の game-clock / path / planned-path を無改変で流用する
 *   （座標系非依存。セル座標は `Position` へ `{x: col, y: row}` で載せる）
 * - energy（画面表示は EN 表記、issue #181）は find-path 固有の store。\
 *   ゲームデザイン上の資源管理概念で時間管理ロジックの tc-03 へは持ち込まない
 * - item（回復アイテム/回復スポット、issue #181）は proto-01 固有の汎用アイテム
 *   store。energy store とは責務を分け、将来の種類拡張（`ItemKind`）に備える。
 *   障害物（`_lib/obstacle.ts`、静的定数）とは別管理のまま、セル上の要素を種類問わず
 *   取得する窓口は `_lib/get-cell-contents.ts`（pure function）が担う
 *   （issue #137、PR #196 レビュー対応）
 * - tick-status（`isRunning`/`reachedGoal`、issue #137）は `useFindPathTick` の
 *   走行状態。`FindPathContent` の `useState` に持たせると値変更のたび配下ツリー
 *   全体（`Stage06` 含む）が再レンダリングされるため、選択購読可能な store へ分離した
 * - 6 store は相互依存なし。セル単位・単一 bot と噛み合わない position / intent は持ち込まない
 * - tick はまだ載せない（PR-C）。ここは store 生成と Context 配布のみ
 */
export const FindPathStoresProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [gameClockStore] = useState(() => createGameClockStore())
  const [pathStore] = useState(() => createPathStore())
  const [plannedPathStore] = useState(() => createPlannedPathStore())

  return (
    <GameClockStoreContext.Provider value={gameClockStore}>
      <PathStoreContext.Provider value={pathStore}>
        <PlannedPathStoreContext.Provider value={plannedPathStore}>
          <EnergyStoreProvider>
            <ItemStoreProvider initialItems={INITIAL_ITEMS}>
              <TickStatusStoreProvider>{children}</TickStatusStoreProvider>
            </ItemStoreProvider>
          </EnergyStoreProvider>
        </PlannedPathStoreContext.Provider>
      </PathStoreContext.Provider>
    </GameClockStoreContext.Provider>
  )
}
