'use client'

import { PropsWithChildren, useState } from 'react'
import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { createFollowPathStore } from './store'
import { FollowPathState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<FollowPathState>('FollowPath')

/** FollowPath store 用 Context */
export const FollowPathStoreContext = StoreContext

/** FollowPath store を生成し Context 経由で配布する */
export const FollowPathStoreProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [followPathStore] = useState(createFollowPathStore)

  return (
    <FollowPathStoreContext.Provider value={followPathStore}>
      {children}
    </FollowPathStoreContext.Provider>
  )
}

/** FollowPath store を selector 購読する */
export const useFollowPathStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - `handleCellChange` 等、購読せずクリック・通知の時点の値で操作する用途向け
 */
export const useFollowPathStoreApi = (): StoreApi<FollowPathState> =>
  useStoreApi()
