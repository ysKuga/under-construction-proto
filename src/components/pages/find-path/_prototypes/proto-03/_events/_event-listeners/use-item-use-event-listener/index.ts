import { useEnergyEventDispatcher } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { useCarriedItemStoreApi } from '../../../_stores/carried-items'
import { useFindPathEventListener } from '../../_hooks/use-find-path-event-listener'

/**
 * 携行中の回復アイテムを1つ使用し、EN を回復する
 *
 * - 最古の携行アイテムを取り出し、`Energy-recover` を発行する（回復の実処理は energy store 側の listener）
 * - 携行が空なら `preventDefault()` し、dispatcher の戻り値を `false` にする
 */
export const useCarriedItemRecoverEventListener = () => {
  const carriedItemStoreApi = useCarriedItemStoreApi()
  const energyDispatch = useEnergyEventDispatcher()

  useFindPathEventListener('FindPath-use-carried-item', async (event) => {
    const item = carriedItemStoreApi.getState().useItem()

    // 携行が空: 使用を拒否する
    if (!item) {
      event.preventDefault()

      return
    }

    await energyDispatch['Energy-recover']({
      actorId: PLAYER_ACTOR_ID,
      amount: item.amount,
    })
  })
}
