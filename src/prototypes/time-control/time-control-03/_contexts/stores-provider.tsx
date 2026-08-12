import { ReactNode, useState } from 'react'

import { ActorStoreContext, createActorStore } from '../_stores/actor'
import {
  ActorSettingsStoreContext,
  createActorSettingsStore,
} from '../_stores/actor-settings'
import { createGameClockStore } from '../_stores/game-clock-store'
import { createIntentStore } from '../_stores/intent-store'
import { createPathStore } from '../_stores/path-store'
import { createPlannedPathStore } from '../_stores/planned-path-store'
import { createPositionStore } from '../_stores/position-store'

import { GameClockStoreContext } from './game-clock-store-context'
import { IntentStoreContext } from './intent-store-context'
import { PathStoreContext } from './path-store-context'
import { PlannedPathStoreContext } from './planned-path-store-context'
import { PositionStoreContext } from './position-store-context'

type StoresProviderProps = {
  children: ReactNode
}

/**
 * 7 store (game-clock/actor/actor-settings/path/planned-path/position/intent) を生成し、\
 * それぞれの Context.Provider をまとめてネストする
 *
 * - 生成順は依存関係の順 (position は actor/actor-settings/path/game-clock に依存、\
 *   intent はそれに加え planned-path/position にも依存)
 */
export const StoresProvider = (props: StoresProviderProps) => {
  const { children } = props

  const [gameClockStore] = useState(() => createGameClockStore())
  const [actorStore] = useState(() => createActorStore())
  const [actorSettingsStore] = useState(() => createActorSettingsStore())
  const [pathStore] = useState(() => createPathStore())
  const [plannedPathStore] = useState(() => createPlannedPathStore())
  const [positionStore] = useState(() =>
    createPositionStore(
      actorStore,
      actorSettingsStore,
      pathStore,
      gameClockStore,
    ),
  )
  const [intentStore] = useState(() =>
    createIntentStore(
      actorStore,
      actorSettingsStore,
      pathStore,
      plannedPathStore,
      positionStore,
      gameClockStore,
    ),
  )

  return (
    <GameClockStoreContext.Provider value={gameClockStore}>
      <ActorStoreContext.Provider value={actorStore}>
        <ActorSettingsStoreContext.Provider value={actorSettingsStore}>
          <PathStoreContext.Provider value={pathStore}>
            <PlannedPathStoreContext.Provider value={plannedPathStore}>
              <PositionStoreContext.Provider value={positionStore}>
                <IntentStoreContext.Provider value={intentStore}>
                  {children}
                </IntentStoreContext.Provider>
              </PositionStoreContext.Provider>
            </PlannedPathStoreContext.Provider>
          </PathStoreContext.Provider>
        </ActorSettingsStoreContext.Provider>
      </ActorStoreContext.Provider>
    </GameClockStoreContext.Provider>
  )
}
