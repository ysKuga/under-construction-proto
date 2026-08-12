import { createStoreContext } from '@/stores/utils/create-store-context'

import { ActorSettingsState } from './store'

const { StoreContext, useStoreSelector } =
  createStoreContext<ActorSettingsState>('ActorSettings')

export const ActorSettingsStoreContext = StoreContext
export const useActorSettingsStore = useStoreSelector
