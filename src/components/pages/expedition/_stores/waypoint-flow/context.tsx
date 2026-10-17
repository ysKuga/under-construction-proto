'use client'

import { PropsWithChildren, useState } from 'react'
import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { createWaypointFlowStore } from './store'
import { WaypointFlowStoreState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<WaypointFlowStoreState>('WaypointFlow')

/** WaypointFlow store 用 Context */
export const WaypointFlowStoreContext = StoreContext

/** WaypointFlow store を生成し Context 経由で配布する */
export const WaypointFlowStoreProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [waypointFlowStore] = useState(createWaypointFlowStore)

  return (
    <WaypointFlowStoreContext.Provider value={waypointFlowStore}>
      {children}
    </WaypointFlowStoreContext.Provider>
  )
}

/** WaypointFlow store を selector 購読する */
export const useWaypointFlowStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - クリック時点の値で経路を検証する等、購読せず操作する用途向け
 */
export const useWaypointFlowStoreApi = (): StoreApi<WaypointFlowStoreState> =>
  useStoreApi()
