'use client'

import { PropsWithChildren, useState } from 'react'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { createDisplaySettingsStore } from './store'
import { DisplaySettingsState } from './types'

const { StoreContext, useStoreSelector } =
  createStoreContext<DisplaySettingsState>('DisplaySettings')

/** DisplaySettings store 用 Context */
export const DisplaySettingsStoreContext = StoreContext

/** DisplaySettings store を生成し Context 経由で配布する */
export const DisplaySettingsStoreProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [displaySettingsStore] = useState(createDisplaySettingsStore)

  return (
    <DisplaySettingsStoreContext.Provider value={displaySettingsStore}>
      {children}
    </DisplaySettingsStoreContext.Provider>
  )
}

/** DisplaySettings store を selector 購読する */
export const useDisplaySettingsStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)
