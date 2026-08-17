import { createStoreContext } from '@/stores/utils/create-store-context'

import { PlannedPathState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<PlannedPathState>('PlannedPath')

export const PlannedPathStoreContext = StoreContext
export const usePlannedPathStore = useStoreSelector

/**
 * 生の store を返す
 *
 * - `_computed` 等、他 store から算出する派生値の store 生成 (`store.subscribe` +\
 *   `store.getState()`) 向け
 */
export const usePlannedPathStoreApi = useStoreApi
