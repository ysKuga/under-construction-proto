import { createStoreContext } from '@/stores/utils/create-store-context'

import { PlannedPathState } from './types'

const { StoreContext, useStoreSelector } =
  createStoreContext<PlannedPathState>('PlannedPath')

export const PlannedPathStoreContext = StoreContext
export const usePlannedPathStore = useStoreSelector
