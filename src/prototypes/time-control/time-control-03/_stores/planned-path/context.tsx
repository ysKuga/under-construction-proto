import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { PlannedPathState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<PlannedPathState>('PlannedPath')

/** PlannedPath store 用 Context */
export const PlannedPathStoreContext = StoreContext

/** PlannedPath store を selector 購読する */
export const usePlannedPathStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - `_computed` 等、他 store から算出する派生値の store 生成 (`store.subscribe` +\
 *   `store.getState()`) 向け
 */
export const usePlannedPathStoreApi = (): StoreApi<PlannedPathState> =>
  useStoreApi()
