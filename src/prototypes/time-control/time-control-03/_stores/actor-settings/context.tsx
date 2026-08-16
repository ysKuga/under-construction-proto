import { createStoreContext } from '@/stores/utils/create-store-context'

import { ActorSettingsState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<ActorSettingsState>('ActorSettings')

export const ActorSettingsStoreContext = StoreContext
export const useActorSettingsStore = useStoreSelector

/**
 * 生の store を返す
 *
 * - `_computed` 等、他 store から算出する派生値の store 生成 (`store.subscribe` +\
 *   `store.getState()`) 向け
 */
export const useActorSettingsStoreApi = useStoreApi
