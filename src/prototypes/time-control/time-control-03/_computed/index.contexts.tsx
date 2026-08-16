import { PropsWithChildren, useState } from 'react'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { useActorSettingsStoreApi } from '../_stores'
import { useTimeControl03Props } from '../index.contexts'

import { createComputedStore } from './store'
import { ComputedState } from './types'

const { StoreContext, useStoreSelector } =
  createStoreContext<ComputedState>('Computed')

export const ComputedStoreContext = StoreContext
export const useTimeControl03Computed = useStoreSelector

/**
 * props (actorIds) と actor-settings-store から算出する派生値を生成し配布する
 *
 * - `StoresProvider` の内側に配置する前提 (actor-settings-store の Context を\
 *   参照するため)
 */
export const ComputedProvider = (props: PropsWithChildren) => {
  const { children } = props

  const { actorIds } = useTimeControl03Props()
  const actorSettingsStoreApi = useActorSettingsStoreApi()

  const [computedStore] = useState(() =>
    createComputedStore(actorIds, actorSettingsStoreApi),
  )

  return (
    <ComputedStoreContext.Provider value={computedStore}>
      {children}
    </ComputedStoreContext.Provider>
  )
}
