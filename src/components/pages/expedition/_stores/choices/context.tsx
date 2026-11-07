'use client'

import { PropsWithChildren, useState } from 'react'
import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { createChoicesStore } from './store'
import { ChoicesState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<ChoicesState>('Choices')

/** Choices store 用 Context */
export const ChoicesStoreContext = StoreContext

/** Choices store を生成し Context 経由で配布する */
export const ChoicesStoreProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [choicesStore] = useState(createChoicesStore)

  return (
    <ChoicesStoreContext.Provider value={choicesStore}>
      {children}
    </ChoicesStoreContext.Provider>
  )
}

/** Choices store を selector 購読する */
export const useChoicesStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - event listener 等、購読せず通知の時点の値で判定・操作する用途向け
 */
export const useChoicesStoreApi = (): StoreApi<ChoicesState> => useStoreApi()
