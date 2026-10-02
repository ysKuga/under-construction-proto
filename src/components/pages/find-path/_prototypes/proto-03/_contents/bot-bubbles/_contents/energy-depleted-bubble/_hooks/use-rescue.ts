import { useCallback } from 'react'

import { useFindPathEventDispatcher } from '../../../../../_events'
import { getItemUsages } from '../../../../../_lib/item-usage'
import {
  useCarriedItemStore,
  useCarriedItemStoreApi,
} from '../../../../../_stores/carried-items'
import { ItemInstance } from '../../../../../_stores/items/types'
import { UseEnergyDepletedBubbleContentReturn } from '../index.types'

/** EN 回復に使えるアイテムか */
const canRecoverEnergy = (item: ItemInstance) =>
  getItemUsages(item).includes('recover-energy')

/**
 * EN 切れの救済手段を決め、実行する操作を返す
 *
 * - 手持ち（EN 回復を許可された携行アイテム）があれば最古のものを使う（`FindPath-use-item`）
 * - なければチェックポイントへのリセットを要求する（`FindPath-reset-to-checkpoint`）
 * - 受理の判定・効果は各 listener が担う。拒否されたら吹き出しを揺らすのみ
 */
export const useRescue = (): Pick<
  UseEnergyDepletedBubbleContentReturn,
  'handleRescueClick' | 'rescueItemKind'
> => {
  const rescueItemKind = useCarriedItemStore(
    (state) => state.carriedItems.find(canRecoverEnergy)?.kind,
  )
  const carriedItemStoreApi = useCarriedItemStoreApi()
  const findPathEventDispatcher = useFindPathEventDispatcher()

  const handleRescueClick = useCallback(async () => {
    const rescueItem = carriedItemStoreApi
      .getState()
      .carriedItems.find(canRecoverEnergy)

    /** listener が救済手段を受理したか */
    const accepted = rescueItem
      ? await findPathEventDispatcher['FindPath-use-item']({
          itemId: rescueItem.id,
          usage: 'recover-energy',
        })
      : await findPathEventDispatcher['FindPath-reset-to-checkpoint'](undefined)

    // 拒否された: 吹き出しを揺らして知らせる
    if (!accepted) {
      await findPathEventDispatcher['FindPath-shake-bot-bubble'](undefined)
    }
  }, [carriedItemStoreApi, findPathEventDispatcher])

  return { handleRescueClick, rescueItemKind }
}
