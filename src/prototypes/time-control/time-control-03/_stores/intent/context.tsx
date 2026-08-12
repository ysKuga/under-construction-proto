import { createStoreContext } from '@/stores/utils/create-store-context'

import { IntentState } from './types'

const { StoreContext, useStoreSelector } =
  createStoreContext<IntentState>('Intent')

export const IntentStoreContext = StoreContext
export const useIntentStore = useStoreSelector
