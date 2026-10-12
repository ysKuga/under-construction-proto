'use client'

import { PropsWithChildren, useState } from 'react'
import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { createGoalStore } from './store'
import { GoalState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<GoalState>('Goal')

/** Goal store 用 Context */
export const GoalStoreContext = StoreContext

/** Goal store を生成し Context 経由で配布する */
export const GoalStoreProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [goalStore] = useState(createGoalStore)

  return (
    <GoalStoreContext.Provider value={goalStore}>
      {children}
    </GoalStoreContext.Provider>
  )
}

/** Goal store を selector 購読する */
export const useGoalStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - 購読せず、呼出時点の値で判定・操作する用途向け
 */
export const useGoalStoreApi = (): StoreApi<GoalState> => useStoreApi()
