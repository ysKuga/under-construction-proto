import { useRegisterEnergyOut } from '@/components/pages/find-path/_prototypes/_stores/energy'
import {
  energyOutAction,
  useBoxBotActionDispatcher,
} from '@/components/theater/figure/box-bot'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { usePlayerActorEventTarget } from '../../../../../_contexts/player-actor-event-target'
import { useEnergyOutAfterStop } from '../../../../../_hooks/use-energy-out-after-stop'

/**
 * player bot の EN 切れ演出を登録する
 *
 * - EN 切れ演出(予防姿勢)の発火・復帰は `useOutOfEnergyEventListener`（`_stores/energy`、
 *   scope 全体で 1 回だけマウント。issue-181-en）が Energy-depleted/Energy-recovered
 *   購読で一元的に担う。ここでは player bot と共有する EventTarget
 *   （`PlayerActorEventTargetProvider`）宛ての energyOut dispatcher を actorId キーで
 *   登録するだけでよい
 * - 演出は歩いている途中で始まらないよう、停止まで待たせる（`useEnergyOutAfterStop`）
 */
export const useRegisterPlayerEnergyOut = () => {
  const actorEventTarget = usePlayerActorEventTarget()
  const { energyOut } = useBoxBotActionDispatcher(actorEventTarget, [
    energyOutAction,
  ])
  const energyOutAfterStop = useEnergyOutAfterStop(PLAYER_ACTOR_ID, energyOut)

  useRegisterEnergyOut({
    actorId: PLAYER_ACTOR_ID,
    energyOut: energyOutAfterStop,
  })
}
