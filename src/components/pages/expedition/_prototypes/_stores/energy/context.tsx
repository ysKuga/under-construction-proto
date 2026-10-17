'use client'

import { PropsWithChildren, useState } from 'react'

import { EnergyStoreContext } from './_contexts/store-context'
import { EnergyEventListeners } from './_events/_event-listeners'
import { EnergyEventProvider } from './_events/index.contexts'
import { createEnergyStore } from './store'

export { useEnergyStore, useEnergyStoreApi } from './_contexts/store-context'
export { EnergyStoreContext } from './_contexts/store-context'

/**
 * Energy store を生成し Context 経由で配布する
 *
 * - EN 消費・EN 切れ検知（issue #181）の event 機構（`EnergyEventProvider`/\
 *   `EnergyEventListeners`）を内側にまとめて配線する。利用側（各 proto の\
 *   `index.tsx`）は `EnergyStoreProvider` を置くだけでよい
 */
export const EnergyStoreProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [energyStore] = useState(() => createEnergyStore())

  return (
    <EnergyStoreContext.Provider value={energyStore}>
      <EnergyEventProvider>
        <EnergyEventListeners />
        {children}
      </EnergyEventProvider>
    </EnergyStoreContext.Provider>
  )
}
