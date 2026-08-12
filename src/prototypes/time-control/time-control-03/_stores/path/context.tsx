import { createStoreContext } from '@/stores/utils/create-store-context'

import { PathState } from './types'

const { StoreContext, useStoreSelector } = createStoreContext<PathState>('Path')

export const PathStoreContext = StoreContext
export const usePathStore = useStoreSelector
