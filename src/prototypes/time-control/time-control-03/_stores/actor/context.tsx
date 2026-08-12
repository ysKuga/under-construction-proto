import { createStoreContext } from '@/stores/utils/create-store-context'

import { ActorState } from './types'

const { StoreContext, useStoreSelector } =
  createStoreContext<ActorState>('Actor')

export const ActorStoreContext = StoreContext
export const useActorStore = useStoreSelector
