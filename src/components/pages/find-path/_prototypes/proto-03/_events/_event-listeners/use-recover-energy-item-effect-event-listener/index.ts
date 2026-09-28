import { useEnergyEventDispatcher } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { useFindPathEventListener } from '../../_hooks/use-find-path-event-listener'

/**
 * 使用方法 `recover-energy` で使用されたアイテムの効果として、EN を回復する
 *
 * - 回復量はアイテムの `amount`。回復の実処理は energy store 側の listener
 * - 用途ごとの効果 listener が同じ `FindPath-item-used` を購読するため `allowMultiple` で購読する
 */
export const useRecoverEnergyItemEffectEventListener = () => {
  const energyDispatch = useEnergyEventDispatcher()

  useFindPathEventListener(
    'FindPath-item-used',
    async (event) => {
      const { item, usage } = event.detail

      // 別の使用方法: この listener の対象外
      if (usage !== 'recover-energy') {
        return
      }

      await energyDispatch['Energy-recover']({
        actorId: PLAYER_ACTOR_ID,
        amount: item.amount,
      })
    },
    { allowMultiple: true },
  )
}
