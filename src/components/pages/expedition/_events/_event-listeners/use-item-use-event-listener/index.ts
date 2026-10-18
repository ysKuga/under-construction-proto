import { getItemUsages } from '../../../_lib/item-usage'
import { useCarriedItemStoreApi } from '../../../_stores/carried-items'
import { useMoveHistoryStoreApi } from '../../../_stores/move-history'
import { usePlayerActivityStoreApi } from '../../../_stores/player-activity'
import { useExpeditionEventDispatcher } from '../../_hooks/use-expedition-event-dispatcher'
import { useExpeditionEventListener } from '../../_hooks/use-expedition-event-listener'

/**
 * 携行中のアイテムの使用を受け付け、使用を通知する
 *
 * - 携行していないアイテム、または許可されていない使用方法（`getItemUsages`）なら\
 *   `preventDefault()` で拒否する
 * - EN スポットで補給中も拒否する（補給の完了まで他の操作を受け付けない。issue #297）
 * - 受理したアイテムは携行から取り除き、`Expedition-item-used` を発行する
 * - 受理した使用は手数の履歴へ記録する
 * - 使用方法ごとの効果は扱わない（`Expedition-item-used` を購読する用途ごとの listener が担う）
 */
export const useItemUseEventListener = () => {
  const carriedItemStoreApi = useCarriedItemStoreApi()
  const expeditionEventDispatcher = useExpeditionEventDispatcher()
  const moveHistoryStoreApi = useMoveHistoryStoreApi()
  const playerActivityStoreApi = usePlayerActivityStoreApi()

  useExpeditionEventListener('Expedition-use-item', async (event) => {
    const { itemId, usage } = event.detail
    const item = carriedItemStoreApi
      .getState()
      .carriedItems.find((carried) => carried.id === itemId)

    /** 補給中でなく、携行中のアイテムに指定された使用方法が許可されているか */
    const isUsable =
      playerActivityStoreApi.getState().activity !== 'charging' &&
      item !== undefined &&
      getItemUsages(item).includes(usage)

    // 補給中、携行していない、または許可されていない使用方法: 使用を拒否する
    if (!isUsable) {
      event.preventDefault()

      return
    }

    carriedItemStoreApi.getState().removeItem(item.id)
    moveHistoryStoreApi
      .getState()
      .record({ itemKind: item.kind, kind: 'use-item' })

    await expeditionEventDispatcher['Expedition-item-used']({ item, usage })
  })
}
