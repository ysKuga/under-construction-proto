import { createStoreContext } from '@/stores/utils/create-store-context'

import { IntentState } from './types'

const { StoreContext, useStoreSelector } =
  createStoreContext<IntentState>('Intent')

/** Intent store 用 Context */
export const IntentStoreContext = StoreContext

/** Intent store を selector 購読する */
export const useIntentStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)
