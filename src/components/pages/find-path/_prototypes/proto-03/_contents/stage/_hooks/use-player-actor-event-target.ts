import { useState } from 'react'

import { useRegisterEnergyOut } from '@/components/pages/find-path/_prototypes/_stores/energy'
import {
  energyOutAction,
  useBoxBotActionDispatcher,
} from '@/components/theater/figure/box-bot'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { useEnergyOutAfterStop } from '../../../_hooks/use-energy-out-after-stop'
import { UseStageReturn } from '../index.types'

/**
 * `Stage07` と player bot で共有する EventTarget を生成し、EN 切れ演出を登録する
 *
 * - EN 切れ演出(予防姿勢)の発火・復帰は `useOutOfEnergyEventListener`（`_stores/energy`、
 *   scope 全体で 1 回だけマウント。issue-181-en）が Energy-depleted/Energy-recovered
 *   購読で一元的に担う。ここでは自分の energyOut dispatcher を actorId キーで
 *   登録するだけでよい
 * - 演出は歩いている途中で始まらないよう、停止まで待たせる（`useEnergyOutAfterStop`）
 */
export const usePlayerActorEventTarget =
  (): UseStageReturn['actorEventTarget'] => {
    const [actorEventTarget] = useState<EventTarget>(() => new EventTarget())
    const { energyOut } = useBoxBotActionDispatcher(actorEventTarget, [
      energyOutAction,
    ])
    const energyOutAfterStop = useEnergyOutAfterStop(PLAYER_ACTOR_ID, energyOut)

    useRegisterEnergyOut({
      actorId: PLAYER_ACTOR_ID,
      energyOut: energyOutAfterStop,
    })

    return actorEventTarget
  }
