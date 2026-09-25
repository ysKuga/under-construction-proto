'use client'

import { PropsWithChildren, useState } from 'react'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { createGoalStore } from './store'
import { GoalState } from './types'

const { StoreContext, useStoreSelector } = createStoreContext<GoalState>('Goal')

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
