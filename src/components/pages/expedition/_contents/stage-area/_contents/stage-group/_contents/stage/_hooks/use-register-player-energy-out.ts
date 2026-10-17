import { useRegisterEnergyOut } from '@/components/pages/expedition/_stores/energy'
import {
  energyOutAction,
  useBoxBotActionDispatcher,
} from '@/components/theater/figure/box-bot'
import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'

import { usePlayerActorEventTarget } from '../../../../../../../_contexts/player-actor-event-target'
import { useEnergyOutAfterStop } from '../../../../../../../_hooks/use-energy-out-after-stop'
import { useGamePhaseStoreApi } from '../../../../../../../_stores/game-phase'

/**
 * player bot の EN 切れ演出を登録する
 *
 * - EN 切れ演出(予防姿勢)の発火・復帰は `useOutOfEnergyEventListener`（`_stores/energy`、
 *   scope 全体で 1 回だけマウント。issue-181-en）が Energy-depleted/Energy-recovered
 *   購読で一元的に担う。ここでは player bot と共有する EventTarget
 *   （`PlayerActorEventTargetProvider`）宛ての energyOut dispatcher を actorId キーで
 *   登録するだけでよい
 * - 演出は歩いている途中で始まらないよう、停止まで待たせる（`useEnergyOutAfterStop`）
 * - EN 切れ演出を許可しないフェーズ（ゴール後の終了状態）では演出しない（issue #137）。\
 *   `energyOut` は切替式のため、切れ・復帰とも止めて偶奇を崩さない。\
 *   EN はゴール進入時に消費されるため、停止待ちを経た発火時点で到達判定済み
 */
export const useRegisterPlayerEnergyOut = () => {
  const actorEventTarget = usePlayerActorEventTarget()
  const { energyOut } = useBoxBotActionDispatcher(actorEventTarget, [
    energyOutAction,
  ])
  const gamePhaseStoreApi = useGamePhaseStoreApi()
  const energyOutAfterStop = useEnergyOutAfterStop(PLAYER_ACTOR_ID, async () => {
    // 演出を許可しないフェーズ: 演出しない
    if (!gamePhaseStoreApi.getState().allows('performEnergyOut')) return

    await energyOut()
  })

  useRegisterEnergyOut({
    actorId: PLAYER_ACTOR_ID,
    energyOut: energyOutAfterStop,
  })
}
