import { match } from 'ts-pattern'

import { useEnergyEventDispatcher } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { getItemUsages } from '../../../_lib/item-usage'
import { useCarriedItemStoreApi } from '../../../_stores/carried-items'
import { useFindPathEventListener } from '../../_hooks/use-find-path-event-listener'

/**
 * 携行中のアイテムを、指定された使用方法で使用する
 *
 * - 使用方法ごとの処理はここで振り分ける。アイテムの種類は問わず、許可の判定は\
 *   `getItemUsages`（ホワイトリスト）に委ねる
 * - 携行していないアイテム、または許可されていない使用方法なら `preventDefault()` で拒否する
 * - 使用したアイテムは携行から取り除く
 */
export const useItemUseEventListener = () => {
  const carriedItemStoreApi = useCarriedItemStoreApi()
  const energyDispatch = useEnergyEventDispatcher()

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

    await match(usage)
      .with('recover-energy', () =>
        energyDispatch['Energy-recover']({
          actorId: PLAYER_ACTOR_ID,
          amount: item.amount,
        }),
      )
      .exhaustive()
  })
}
