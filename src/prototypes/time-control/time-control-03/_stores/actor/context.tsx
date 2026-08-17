import { createStoreContext } from '@/stores/utils/create-store-context'

import { ActorState } from './types'

const { StoreContext, useStoreSelector } =
  createStoreContext<ActorState>('Actor')

/** Actor store 用 Context */
export const ActorStoreContext = StoreContext

/** Actor store を selector 購読する */
export const useActorStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)
