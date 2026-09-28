import { useCallback } from 'react'

import { useFindPathEventDispatcher } from '../../../../../../_events'
import { getPrimaryItemUsage } from '../../../../../../_lib/item-usage'
import {
  useCarriedItemStore,
  useCarriedItemStoreApi,
} from '../../../../../../_stores/carried-items'
import { ItemKind } from '../../../../../../_stores/items/types'

/** 携行アイテム使用ボタンの props */
export type CarriedItemButtonProps = {
  /** 対象のアイテムの種類 */
  kind: ItemKind
}

/** 携行アイテム使用ボタンの表示値・操作 */
export type UseCarriedItemButtonReturn = {
  /** 携行中の対象種類のアイテムの数 */
  carriedCount: number
  /**
   * クリック時。対象種類で最古の携行アイテムを代表的な使用方法で使用する
   *
   * - 使用方法の許可判定・実処理は listener 側
   */
  handleClick: () => void
}

/**
 * 対象種類の携行数を購読し、使用操作を返す
 *
 * @param props コンポーネント props
 */
export const useCarriedItemButton = (
  props: CarriedItemButtonProps,
): UseCarriedItemButtonReturn => {
  const { kind } = props

  const carriedCount = useCarriedItemStore(
    (state) => state.carriedItems.filter((item) => item.kind === kind).length,
  )
  const carriedItemStoreApi = useCarriedItemStoreApi()
  const findPathEventDispatcher = useFindPathEventDispatcher()

  const handleClick = useCallback(() => {
    const oldest = carriedItemStoreApi
      .getState()
      .carriedItems.find((item) => item.kind === kind)

    if (!oldest) {
      return
    }

    void findPathEventDispatcher['FindPath-use-item']({
      itemId: oldest.id,
      usage: getPrimaryItemUsage(oldest),
    })
  }, [carriedItemStoreApi, findPathEventDispatcher, kind])

  return { carriedCount, handleClick }
}
