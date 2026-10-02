'use client'

import { PropsWithChildren, useState } from 'react'
import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { createPlayerActivityStore } from './store'
import { PlayerActivityState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<PlayerActivityState>('PlayerActivity')

/** PlayerActivity store 用 Context */
export const PlayerActivityStoreContext = StoreContext

/** PlayerActivity store を生成し Context 経由で配布する */
export const PlayerActivityStoreProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [playerActivityStore] = useState(createPlayerActivityStore)

  return (
    <PlayerActivityStoreContext.Provider value={playerActivityStore}>
      {children}
    </PlayerActivityStoreContext.Provider>
  )
}

/** PlayerActivity store を selector 購読する */
export const usePlayerActivityStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - event listener 等、購読せず通知の時点の値で判定・操作する用途向け
 */
export const usePlayerActivityStoreApi = (): StoreApi<PlayerActivityState> =>
  useStoreApi()
