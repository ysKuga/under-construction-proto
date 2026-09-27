import { getItemUsages } from '../../../_lib/item-usage'
import { useCarriedItemStoreApi } from '../../../_stores/carried-items'
import { useFindPathEventDispatcher } from '../../_hooks/use-find-path-event-dispatcher'
import { useFindPathEventListener } from '../../_hooks/use-find-path-event-listener'

/**
 * 携行中のアイテムの使用を受け付け、使用を通知する
 *
 * - 携行していないアイテム、または許可されていない使用方法（`getItemUsages`）なら\
 *   `preventDefault()` で拒否する
 * - 受理したアイテムは携行から取り除き、`FindPath-item-used` を発行する
 * - 使用方法ごとの効果は扱わない（`FindPath-item-used` を購読する用途ごとの listener が担う）
 */
export const useItemUseEventListener = () => {
  const carriedItemStoreApi = useCarriedItemStoreApi()
  const findPathEventDispatcher = useFindPathEventDispatcher()

  useFindPathEventListener('FindPath-use-item', async (event) => {
    const { itemId, usage } = event.detail
    const item = carriedItemStoreApi
      .getState()
      .carriedItems.find((carried) => carried.id === itemId)

    /** 携行中のアイテムに、指定された使用方法が許可されているか */
    const isUsable = item !== undefined && getItemUsages(item).includes(usage)

    // 携行していない、または許可されていない使用方法: 使用を拒否する
    if (!isUsable) {
      event.preventDefault()

      return
    }

    carriedItemStoreApi.getState().removeItem(item.id)

    await findPathEventDispatcher['FindPath-item-used']({ item, usage })
  })
}
