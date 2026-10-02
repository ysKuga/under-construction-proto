'use client'

import { PropsWithChildren, useEffect, useState } from 'react'
import { map, merge } from 'rxjs'
import { StoreApi } from 'zustand/vanilla'

import { createStoreContext } from '@/stores/utils/create-store-context'

import { createBubbleSlotsStore } from './store'
import {
  BubbleSlotEntry,
  BubbleSlotsStore,
  BubbleSlotsStoreState,
} from './types'

const { StoreContext, useStoreApi, useStoreSelector } =
  createStoreContext<BubbleSlotsStoreState>('BubbleSlots')

/** BubbleSlots store 用 Context */
export const BubbleSlotsStoreContext = StoreContext

type BubbleSlotsStoreProviderProps = PropsWithChildren<{
  /**
   * 格納する吹き出しの初期値
   *
   * - store 生成時に 1 回だけ使う。以降の変更は反映しない
   */
  initialBubbles: BubbleSlotEntry[]
}>

/**
 * 各吹き出しの表示条件(`visible$`)を購読し、store の表示状態へ反映する
 *
 * - React の再レンダリングを経ずに反映する。再レンダリングされるのは表示状態を購読する側のみ
 *
 * @param bubbleSlotsStore 反映先の store
 */
const useEffectSyncVisibility = (bubbleSlotsStore: BubbleSlotsStore) => {
  useEffect(() => {
    // 全吹き出しの表示条件の変化を store へ反映する
    const { bubbles, setVisible } = bubbleSlotsStore.getState()
    const subscription = merge(
      ...bubbles.map(({ id, visible$ }) =>
        visible$.pipe(map((visible) => ({ id, visible }))),
      ),
    ).subscribe(({ id, visible }) => setVisible(id, visible))

    return () => subscription.unsubscribe()
  }, [bubbleSlotsStore])
}

/**
 * BubbleSlots store を生成し Context 経由で配布する
 *
 * - 各吹き出しの表示条件(`visible$`)を購読し、表示状態を store へ反映する
 */
export const BubbleSlotsStoreProvider = (
  props: BubbleSlotsStoreProviderProps,
) => {
  const { children, initialBubbles } = props

  const [bubbleSlotsStore] = useState(() =>
    createBubbleSlotsStore(initialBubbles),
  )

  useEffectSyncVisibility(bubbleSlotsStore)

  return (
    <BubbleSlotsStoreContext.Provider value={bubbleSlotsStore}>
      {children}
    </BubbleSlotsStoreContext.Provider>
  )
}

/** BubbleSlots store を selector 購読する */
export const useBubbleSlotsStore = <T,>(
  ...args: Parameters<typeof useStoreSelector<T>>
): T => useStoreSelector(...args)

/**
 * 生の store を返す
 *
 * - 表示制御の操作等、購読せず操作する用途向け
 */
export const useBubbleSlotsStoreApi = (): StoreApi<BubbleSlotsStoreState> =>
  useStoreApi()
