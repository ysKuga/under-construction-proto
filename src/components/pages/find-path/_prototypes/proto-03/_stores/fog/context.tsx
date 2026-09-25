'use client'

import { PropsWithChildren, useState } from 'react'
import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { PARTIAL_FOG_CELLS, START_POSITION } from '../../constants'

import { createFogStore } from './store'
import { FogMode, FogState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<FogState>('Fog')

/** Fog store 用 Context */
export const FogStoreContext = StoreContext

type FogStoreProviderProps = PropsWithChildren<{
  /** 初期の霧の適用範囲 */
  initialMode: FogMode
}>

/**
 * Fog store を生成し Context 経由で配布する
 *
 * - 霧セル（`partial`）は `PARTIAL_FOG_CELLS`、視界の初期中心は `START_POSITION` に固定
 */
export const FogStoreProvider = (props: FogStoreProviderProps) => {
  const { children, initialMode } = props

  const [fogStore] = useState(() =>
    createFogStore({
      initialMode,
      partialFogCells: PARTIAL_FOG_CELLS,
      startCell: START_POSITION,
    }),
  )

  return (
    <FogStoreContext.Provider value={fogStore}>
      {children}
    </FogStoreContext.Provider>
  )
}

/** Fog store を selector 購読する */
export const useFogStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - `VisibilityRegistryProvider` 等、`store.subscribe` で変化を受けて DOM を直書きする用途向け
 */
export const useFogStoreApi = (): StoreApi<FogState> => useStoreApi()
