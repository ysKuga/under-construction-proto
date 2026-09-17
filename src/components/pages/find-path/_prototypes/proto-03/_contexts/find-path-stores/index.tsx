'use client'

import { PropsWithChildren, useState } from 'react'

import {
  createEnergyStore,
  EnergyStoreContext,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
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

/**
 * find-path 試作の store Provider（proto-01 と同内容、hex 座標系にも無改変で流用可）
 *
 * - time-control-03 の game-clock / path / planned-path を無改変で流用する
 *   （座標系非依存。セル座標は `Position` へ `{x: q, y: r}` で載せる）
 * - energy（画面表示は EN 表記、issue #181）は find-path 固有の store。\
 *   ゲームデザイン上の資源管理概念で時間管理ロジックの tc-03 へは持ち込まない
 * - 4 store は相互依存なし。セル単位・単一 bot と噛み合わない position / intent は持ち込まない
 */
export const FindPathStoresProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [gameClockStore] = useState(() => createGameClockStore())
  const [pathStore] = useState(() => createPathStore())
  const [plannedPathStore] = useState(() => createPlannedPathStore())
  const [energyStore] = useState(() => createEnergyStore())

  return (
    <GameClockStoreContext.Provider value={gameClockStore}>
      <PathStoreContext.Provider value={pathStore}>
        <PlannedPathStoreContext.Provider value={plannedPathStore}>
          <EnergyStoreContext.Provider value={energyStore}>
            {children}
          </EnergyStoreContext.Provider>
        </PlannedPathStoreContext.Provider>
      </PathStoreContext.Provider>
    </GameClockStoreContext.Provider>
  )
}
