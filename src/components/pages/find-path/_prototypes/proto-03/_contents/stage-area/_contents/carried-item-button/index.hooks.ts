import { useCallback } from 'react'

import { useFindPathEventDispatcher } from '../../../../_events'
import { useCarriedItemStore } from '../../../../_stores/carried-items'

/** 携行アイテム使用ボタンの表示値・操作 */
export type UseCarriedItemButtonReturn = {
  /** 携行中の回復アイテムの数 */
  carriedCount: number
  /** クリック時。携行中の回復アイテムを1つ使用する（実処理は listener 側） */
  handleClick: () => void
}

/** 携行数を購読し、使用操作を返す */
export const useCarriedItemButton = (): UseCarriedItemButtonReturn => {
  const carriedCount = useCarriedItemStore((state) => state.carriedItems.length)
  const findPathEventDispatcher = useFindPathEventDispatcher()

  const handleClick = useCallback(() => {
    void findPathEventDispatcher['FindPath-use-carried-item'](undefined)
  }, [findPathEventDispatcher])

  return { carriedCount, handleClick }
}
