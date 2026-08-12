import { createStoreContext } from '@/stores/utils/create-store-context'

import { PositionState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<PositionState>('Position')

export const PositionStoreContext = StoreContext
export const usePositionStore = useStoreSelector

/**
 * 生の store を返す
 *
 * - React の再レンダリングを経由せず ref 経由で DOM を直接更新する購読\
 *   (`store.subscribe` + `store.getState()`) 向け
 */
export const usePositionStoreApi = useStoreApi
