import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { EnState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<EnState>('En')

/** En store 用 Context */
export const EnStoreContext = StoreContext

/** En store を selector 購読する */
export const useEnStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - tick ドライバ等、selector を経由せず `getState()` / `consume()` を直接叩く用途向け
 */
export const useEnStoreApi = (): StoreApi<EnState> => useStoreApi()
