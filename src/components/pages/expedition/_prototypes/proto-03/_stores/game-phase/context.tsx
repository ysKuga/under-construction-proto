'use client'

import { PropsWithChildren, useState } from 'react'
import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { createGamePhaseStore } from './store'
import { GamePhaseState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<GamePhaseState>('GamePhase')

/** GamePhase store 用 Context */
export const GamePhaseStoreContext = StoreContext

/** GamePhase store を生成し Context 経由で配布する */
export const GamePhaseStoreProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [gamePhaseStore] = useState(createGamePhaseStore)

  return (
    <GamePhaseStoreContext.Provider value={gamePhaseStore}>
      {children}
    </GamePhaseStoreContext.Provider>
  )
}

/** GamePhase store を selector 購読する */
export const useGamePhaseStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - 購読せず、呼出時点の値で判定・操作する用途向け
 */
export const useGamePhaseStoreApi = (): StoreApi<GamePhaseState> => useStoreApi()
