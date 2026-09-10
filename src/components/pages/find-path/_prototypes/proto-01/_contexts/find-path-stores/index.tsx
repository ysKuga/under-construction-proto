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

/**
 * find-path 試作の store Provider
 *
 * - time-control-03 の game-clock / path / planned-path を無改変で流用する
 *   （座標系非依存。セル座標は `Position` へ `{x: col, y: row}` で載せる）
 * - 3 store は相互依存なし。セル単位・単一 bot と噛み合わない position / intent は持ち込まない
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
          {children}
        </PlannedPathStoreContext.Provider>
      </PathStoreContext.Provider>
    </GameClockStoreContext.Provider>
  )
}
