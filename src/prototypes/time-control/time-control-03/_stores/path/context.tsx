import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { PathState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<PathState>('Path')

/** Path store 用 Context */
export const PathStoreContext = StoreContext

/** Path store を selector 購読する */
export const usePathStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - tick ドライバ等、selector を経由せず `getState()` / `setPath` を直接叩く用途向け
 */
export const usePathStoreApi = (): StoreApi<PathState> => useStoreApi()
