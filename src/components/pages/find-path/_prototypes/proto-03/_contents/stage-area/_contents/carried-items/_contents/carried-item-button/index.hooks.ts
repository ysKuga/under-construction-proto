import { useCallback } from 'react'

import { useFindPathEventDispatcher } from '../../../../_events'
import { getPrimaryItemUsage } from '../../../../_lib/item-usage'
import {
  useCarriedItemStore,
  useCarriedItemStoreApi,
} from '../../../../_stores/carried-items'

/** 携行アイテム使用ボタンの表示値・操作 */
export type UseCarriedItemButtonReturn = {
  /** 携行中の回復アイテムの数 */
  carriedCount: number
  /**
   * クリック時。最古の携行アイテムを代表的な使用方法で使用する
   *
   * - 使用方法の許可判定・実処理は listener 側
   */
  handleClick: () => void
}

/** 携行数を購読し、使用操作を返す */
export const useCarriedItemButton = (): UseCarriedItemButtonReturn => {
  const carriedCount = useCarriedItemStore((state) => state.carriedItems.length)
  const carriedItemStoreApi = useCarriedItemStoreApi()
  const findPathEventDispatcher = useFindPathEventDispatcher()

  const handleClick = useCallback(() => {
    const [oldest] = carriedItemStoreApi.getState().carriedItems

    if (!oldest) {
      return
    }

    void findPathEventDispatcher['FindPath-use-item']({
      itemId: oldest.id,
      usage: getPrimaryItemUsage(oldest),
    })
  }, [carriedItemStoreApi, findPathEventDispatcher])

  return { carriedCount, handleClick }
}
