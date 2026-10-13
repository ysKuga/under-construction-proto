import { useRegisterEnergyOut } from '@/components/pages/find-path/_prototypes/_stores/energy'
import {
  energyOutAction,
  useBoxBotActionDispatcher,
} from '@/components/theater/figure/box-bot'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { usePlayerActorEventTarget } from '../../../../../_contexts/player-actor-event-target'
import { useEnergyOutAfterStop } from '../../../../../_hooks/use-energy-out-after-stop'
import { useGoalStoreApi } from '../../../../../_stores/goal'

/**
 * player bot の EN 切れ演出を登録する
 *
 * - EN 切れ演出(予防姿勢)の発火・復帰は `useOutOfEnergyEventListener`（`_stores/energy`、
 *   scope 全体で 1 回だけマウント。issue-181-en）が Energy-depleted/Energy-recovered
 *   購読で一元的に担う。ここでは player bot と共有する EventTarget
 *   （`PlayerActorEventTargetProvider`）宛ての energyOut dispatcher を actorId キーで
 *   登録するだけでよい
 * - 演出は歩いている途中で始まらないよう、停止まで待たせる（`useEnergyOutAfterStop`）
 * - ゴール到達後は演出しない（両手上げを優先、issue #137）。\
 *   `energyOut` は切替式のため、切れ・復帰とも止めて偶奇を崩さない。\
 *   EN はゴール進入時に消費されるため、停止待ちを経た発火時点で到達判定済み
 */
export const useRegisterPlayerEnergyOut = () => {
  const actorEventTarget = usePlayerActorEventTarget()
  const { energyOut } = useBoxBotActionDispatcher(actorEventTarget, [
    energyOutAction,
  ])
  const goalStoreApi = useGoalStoreApi()
  const energyOutAfterStop = useEnergyOutAfterStop(PLAYER_ACTOR_ID, async () => {
    // ゴール到達後: 演出しない
    if (goalStoreApi.getState().reached) return

    await energyOut()
  })

  useRegisterEnergyOut({
    actorId: PLAYER_ACTOR_ID,
    energyOut: energyOutAfterStop,
  })
}
