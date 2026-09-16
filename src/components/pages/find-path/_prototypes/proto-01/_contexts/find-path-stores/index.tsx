'use client'

import { PropsWithChildren, useState } from 'react'

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

import { createEnStore, EnStoreContext } from '../../_stores/en'

/**
 * find-path 試作の store Provider
 *
 * - time-control-03 の game-clock / path / planned-path を無改変で流用する
 *   （座標系非依存。セル座標は `Position` へ `{x: col, y: row}` で載せる）
 * - en（EN、issue #181）は find-path 固有の store。ゲームデザイン上の資源管理概念で\
 *   時間管理ロジックの tc-03 へは持ち込まない
 * - 4 store は相互依存なし。セル単位・単一 bot と噛み合わない position / intent は持ち込まない
 * - tick はまだ載せない（PR-C）。ここは store 生成と Context 配布のみ
 */
export const FindPathStoresProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [gameClockStore] = useState(() => createGameClockStore())
  const [pathStore] = useState(() => createPathStore())
  const [plannedPathStore] = useState(() => createPlannedPathStore())
  const [enStore] = useState(() => createEnStore())

  return (
    <GameClockStoreContext.Provider value={gameClockStore}>
      <PathStoreContext.Provider value={pathStore}>
        <PlannedPathStoreContext.Provider value={plannedPathStore}>
          <EnStoreContext.Provider value={enStore}>
            {children}
          </EnStoreContext.Provider>
        </PlannedPathStoreContext.Provider>
      </PathStoreContext.Provider>
    </GameClockStoreContext.Provider>
  )
}
