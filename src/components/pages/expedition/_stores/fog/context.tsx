'use client'

import { PropsWithChildren, useState } from 'react'
import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { useStageLayout } from '../../_contexts/stage-layout'

import { createFogStore, visibleAreaOf } from './store'
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
 * - 盤面配置（`StageLayoutProvider`）から霧セル・視界の初期中心を決める
 *   - 霧セル（`partial`）: ゴールとその6近傍（仮の領域。issue #137）
 *   - 視界の初期中心: 開始位置
 */
export const FogStoreProvider = (props: FogStoreProviderProps) => {
  const { children, initialMode } = props

  const { goal, start } = useStageLayout()

  const [fogStore] = useState(() =>
    createFogStore({
      initialMode,
      partialFogCells: visibleAreaOf(goal),
      startCell: start,
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
