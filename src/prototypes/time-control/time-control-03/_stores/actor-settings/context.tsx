import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { ActorSettingsState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<ActorSettingsState>('ActorSettings')

/** ActorSettings store 用 Context */
export const ActorSettingsStoreContext = StoreContext

/** ActorSettings store を selector 購読する */
export const useActorSettingsStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - `_computed` 等、他 store から算出する派生値の store 生成 (`store.subscribe` +\
 *   `store.getState()`) 向け
 */
export const useActorSettingsStoreApi = (): StoreApi<ActorSettingsState> =>
  useStoreApi()
