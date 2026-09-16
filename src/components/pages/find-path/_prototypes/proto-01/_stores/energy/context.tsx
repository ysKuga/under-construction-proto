import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { EnergyState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<EnergyState>('Energy')

/** Energy store 用 Context */
export const EnergyStoreContext = StoreContext

/** Energy store を selector 購読する */
export const useEnergyStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - tick ドライバ等、selector を経由せず `getState()` / `consume()` を直接叩く用途向け
 */
export const useEnergyStoreApi = (): StoreApi<EnergyState> => useStoreApi()
