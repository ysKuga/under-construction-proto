import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { PositionState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<PositionState>('Position')

/** Position store 用 Context */
export const PositionStoreContext = StoreContext

/** Position store を selector 購読する */
export const usePositionStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - React の再レンダリングを経由せず ref 経由で DOM を直接更新する購読\
 *   (`store.subscribe` + `store.getState()`) 向け
 */
export const usePositionStoreApi = (): StoreApi<PositionState> => useStoreApi()
