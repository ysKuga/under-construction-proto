'use client'

import { PropsWithChildren, useState } from 'react'
import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { createEnergySettingsStore } from './store'
import { EnergySettingsState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<EnergySettingsState>('EnergySettings')

/** EnergySettings store 用 Context */
export const EnergySettingsStoreContext = StoreContext

/** EnergySettings store を生成し Context 経由で配布する */
export const EnergySettingsStoreProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [energySettingsStore] = useState(createEnergySettingsStore)

  return (
    <EnergySettingsStoreContext.Provider value={energySettingsStore}>
      {children}
    </EnergySettingsStoreContext.Provider>
  )
}

/** EnergySettings store を selector 購読する */
export const useEnergySettingsStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/** EnergySettings store 本体を取得する（購読せず `getState()` で読む用途） */
export const useEnergySettingsStoreApi = (): StoreApi<EnergySettingsState> =>
  useStoreApi()
