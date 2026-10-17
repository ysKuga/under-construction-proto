import { useEnergyEventDispatcher } from '@/components/pages/expedition/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'

import { useExpeditionEventListener } from '../../_hooks/use-expedition-event-listener'

/**
 * 使用方法 `charge-energy` で使用されたアイテムの効果として、EN を補給する
 *
 * - 補給量はアイテムの `amount`。補給の実処理は energy store 側の listener
 * - 用途ごとの効果 listener が同じ `Expedition-item-used` を購読するため `allowMultiple` で購読する
 */
export const useChargeEnergyItemEffectEventListener = () => {
  const energyDispatch = useEnergyEventDispatcher()

  useExpeditionEventListener(
    'Expedition-item-used',
    async (event) => {
      const { item, usage } = event.detail

      // 別の使用方法: この listener の対象外
      if (usage !== 'charge-energy') {
        return
      }

      await energyDispatch['Energy-charge']({
        actorId: PLAYER_ACTOR_ID,
        amount: item.amount,
      })
    },
    { allowMultiple: true },
  )
}
