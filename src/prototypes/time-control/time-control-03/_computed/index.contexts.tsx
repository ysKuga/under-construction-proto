import { PropsWithChildren, useState } from 'react'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { useActorSettingsStoreApi, usePlannedPathStoreApi } from '../_stores'
import { useTimeControl03Props } from '../index.contexts'

import { createComputedStore } from './store'
import { ComputedState } from './types'

const { StoreContext, useStoreSelector } =
  createStoreContext<ComputedState>('Computed')

/** Computed store 用 Context */
export const ComputedStoreContext = StoreContext

/** Computed store を selector 購読する */
export const useTimeControl03Computed = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * props (actorIds)・store (actor-settings/planned-path) から算出する派生値を生成し配布する
 *
 * - `StoresProvider` の内側に配置する前提 (依存元 store の Context を参照するため)
 */
export const ComputedProvider = (props: PropsWithChildren) => {
  const { children } = props

  const { actorIds } = useTimeControl03Props()
  const actorSettingsStoreApi = useActorSettingsStoreApi()
  const plannedPathStoreApi = usePlannedPathStoreApi()

  const [computedStore] = useState(() =>
    createComputedStore(actorIds, actorSettingsStoreApi, plannedPathStoreApi),
  )

  return (
    <ComputedStoreContext.Provider value={computedStore}>
      {children}
    </ComputedStoreContext.Provider>
  )
}
