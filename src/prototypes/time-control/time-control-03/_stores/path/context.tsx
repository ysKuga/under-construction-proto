import { createStoreContext } from '@/stores/utils/create-store-context'

import { PathState } from './types'

const { StoreContext, useStoreSelector } = createStoreContext<PathState>('Path')

/** Path store 用 Context */
export const PathStoreContext = StoreContext

/** Path store を selector 購読する */
export const usePathStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)
