'use client'

import { PropsWithChildren, useState } from 'react'
import { StoreApi } from 'zustand/vanilla'

import { ActorId } from '@/prototypes/time-control/time-control-03/types'
import { createStoreContext } from '@/stores/utils/create-store-context'

import { HexCell } from '../../_lib/hex'

import { createActorsStore } from './store'
import { ActorsState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<ActorsState>('Actors')

/** Actors store 用 Context */
export const ActorsStoreContext = StoreContext

type ActorsStoreProviderProps = PropsWithChildren<{
  /** 初期配置する actor 一覧(actorId → セル) */
  initialActors: Record<ActorId, HexCell>
}>

/** Actors store を生成し Context 経由で配布する */
export const ActorsStoreProvider = (props: ActorsStoreProviderProps) => {
  const { children, initialActors } = props

  const [actorsStore] = useState(() => createActorsStore(initialActors))

  return (
    <ActorsStoreContext.Provider value={actorsStore}>
      {children}
    </ActorsStoreContext.Provider>
  )
}

/** Actors store を selector 購読する */
export const useActorsStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - mob spawn/despawn 等、selector を経由せず `getState()` を直接叩く用途向け
 */
export const useActorsStoreApi = (): StoreApi<ActorsState> => useStoreApi()
