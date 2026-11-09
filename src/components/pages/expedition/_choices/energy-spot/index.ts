import { useCallback, useMemo } from 'react'

import { useActorsStore } from '@/components/pages/expedition/_stage-components/hex-stage/_stores/actors'
import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import { useEnergyStore } from '@/components/pages/expedition/_stores/energy'

import { useExpeditionEventDispatcher } from '../../_events'
import { countEnergySpotCharge } from '../../_lib/count-energy-spot-charge'
import { useGamePhaseStore } from '../../_stores/game-phase'
import { useItemStore } from '../../_stores/items'
import { usePlayerActivityStore } from '../../_stores/player-activity'
import { useChoiceSelectEventListener } from '../_hooks/use-choice-select-event-listener'
import { useEffectRegisterChoice } from '../_hooks/use-effect-register-choice'

/**
 * EN スポットの使用の選択肢を登録し、選択時に補給する
 *
 * - 登録: 盤面を操作できるフェーズ（`operateStage`）で、player が EN スポット上で停止中、かつ補給できる
 *   （EN が上限未満・残量あり）
 * - EN の判定は境界の boolean で購読する（EN の増減ごとに再レンダリングしない）
 * - 選択時: `Expedition-use-energy-spot` を発行する。受理の判定・補給は listener が担う。
 *   拒否されたら通知する（`Expedition-action-rejected`）
 */
export const useEnergySpotChoice = (): void => {
  /** 盤面を操作できるフェーズか */
  const operateStageAllowed = useGamePhaseStore((state) =>
    state.allows('operateStage'),
  )
  /** player が停止中か */
  const idle = usePlayerActivityStore((state) => state.activity === 'idle')
  /** player の現在セル */
  const playerCell = useActorsStore((state) => state.actors[PLAYER_ACTOR_ID])
  /** player の現在セルのアイテム */
  const cellItem = useItemStore((state) =>
    playerCell === undefined ? undefined : state.getItemAtCell(playerCell),
  )
  /** 現在セルの EN スポットで補給できるか（EN が上限未満・残量あり） */
  const chargeable = useEnergyStore(
    (state) =>
      countEnergySpotCharge(cellItem, state.getEnergyInfo(PLAYER_ACTOR_ID)) > 0,
  )
  /** 使用・拒否の通知の event の発行に使う */
  const expeditionEventDispatcher = useExpeditionEventDispatcher()

  /** EN スポットを使用し、拒否されたら通知する */
  const chargeAtEnergySpot = useCallback(async () => {
    /** listener が使用を受理したか */
    const accepted =
      await expeditionEventDispatcher['Expedition-use-energy-spot'](undefined)

    // 拒否された: 拒否を通知する
    if (!accepted) {
      await expeditionEventDispatcher['Expedition-action-rejected'](undefined)
    }
  }, [expeditionEventDispatcher])
  /** EN スポットを使用できるか */
  const usable = operateStageAllowed && idle && chargeable

  useEffectRegisterChoice(
    useMemo(
      () =>
        usable
          ? { id: 'energy-spot', label: 'EN スポットで補給', order: 40 }
          : undefined,
      [usable],
    ),
  )

  useChoiceSelectEventListener(
    'energy-spot',
    useCallback(() => void chargeAtEnergySpot(), [chargeAtEnergySpot]),
  )
}
