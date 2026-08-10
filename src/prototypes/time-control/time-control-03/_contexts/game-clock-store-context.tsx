import { createContext, useContext } from 'react'
import { useStore } from 'zustand'

import { GameClockState, GameClockStore } from '../_stores/game-clock-store'

export const GameClockStoreContext = createContext<GameClockStore | null>(null)

/**
 * @param selector 購読する state の一部を取り出す関数
 * @param equalityFn 再レンダリング要否の比較関数 (省略時は `Object.is`)
 */
export const useGameClockStore = <T,>(
  selector: (state: GameClockState) => T,
  equalityFn?: (a: T, b: T) => boolean,
): T => {
  const store = useContext(GameClockStoreContext)

  if (store === null) {
    throw new Error(
      'useGameClockStore should be used within <GameClockStoreContext.Provider>',
    )
  }

  return useStore(store, selector, equalityFn)
}
