'use client'

import { PropsWithChildren, useState } from 'react'
import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { createMoveHistoryStore } from './store'
import { MoveHistoryState } from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<MoveHistoryState>('MoveHistory')

/** MoveHistory store 用 Context */
export const MoveHistoryStoreContext = StoreContext

/** MoveHistory store を生成し Context 経由で配布する */
export const MoveHistoryStoreProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [moveHistoryStore] = useState(createMoveHistoryStore)

  return (
    <MoveHistoryStoreContext.Provider value={moveHistoryStore}>
      {children}
    </MoveHistoryStoreContext.Provider>
  )
}

/** MoveHistory store を selector 購読する */
export const useMoveHistoryStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - event listener 等、購読せず通知の時点の値で判定・操作する用途向け
 */
export const useMoveHistoryStoreApi = (): StoreApi<MoveHistoryState> =>
  useStoreApi()
