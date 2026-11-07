import { useMemo } from 'react'

import { useActorsStore } from '@/components/pages/expedition/_stage-components/hex-stage/_stores/actors'
import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import { useEnergyStore } from '@/components/pages/expedition/_stores/energy'

import { countEnergySpotCharge } from '../../../../../../../_lib/count-energy-spot-charge'
import { getCarriedItemPresentation } from '../../../../../../../_lib/item-presentation'
import { useGamePhaseStore } from '../../../../../../../_stores/game-phase'
import { useItemStore } from '../../../../../../../_stores/items'
import { usePlayerActivityStore } from '../../../../../../../_stores/player-activity'
import { UseChoicePanelContentReturn } from '../index.types'

/**
 * EN に関わる選択肢（EN スポットの使用・救助）を組み立てる
 *
 * - 盤面を操作できるフェーズ（`operateStage`）のみ並べる
 * - EN スポットの使用: player が EN スポット上で停止中、かつ補給できる（EN が上限未満・残量あり）
 * - 救助: player が EN 切れ中、かつ EN スポットで補給中でない
 *   - 手持ちあり: アイテムのアイコン + 「使う」
 *   - 手持ちなし: 「チェックポイントへ戻る」
 *
 * @param params 各選択肢の選択時の処理と、救済手段のアイテムの種類
 */
export const useEnergyChoices = (
  params: Pick<
    UseChoicePanelContentReturn,
    'handleEnergySpotSelect' | 'handleRescueSelect' | 'rescueItemKind'
  >,
): UseChoicePanelContentReturn['choices'] => {
  const { handleEnergySpotSelect, handleRescueSelect, rescueItemKind } = params
  /** 盤面を操作できるフェーズか */
  const operateStageAllowed = useGamePhaseStore((state) =>
    state.allows('operateStage'),
  )
  /** player の行為 */
  const activity = usePlayerActivityStore((state) => state.activity)
  /** player の現在セル */
  const playerCell = useActorsStore((state) => state.actors[PLAYER_ACTOR_ID])
  /** player の現在セルのアイテム */
  const cellItem = useItemStore((state) =>
    playerCell === undefined ? undefined : state.getItemAtCell(playerCell),
  )
  /** player の EN が切れているか */
  const energyEmpty = useEnergyStore(
    (state) => state.getEnergyInfo(PLAYER_ACTOR_ID).current <= 0,
  )
  /** 現在セルの EN スポットで補給できるか（EN が上限未満・残量あり） */
  const energySpotChargeable = useEnergyStore(
    (state) =>
      countEnergySpotCharge(cellItem, state.getEnergyInfo(PLAYER_ACTOR_ID)) > 0,
  )

  return useMemo(() => {
    // 盤面を操作できないフェーズ: 選択肢なし
    if (!operateStageAllowed) return []

    /** EN スポット上で停止中、かつ補給できるか */
    const energySpotUsable = activity === 'idle' && energySpotChargeable
    /** EN 切れ中か（補給中は救済手段を提示しないため除く） */
    const energyDepleted = energyEmpty && activity !== 'charging'

    return [
      ...(energySpotUsable
        ? [
            {
              id: 'energy-spot',
              label: 'EN スポットで補給',
              onSelect: () => void handleEnergySpotSelect(),
            },
          ]
        : []),
      ...(energyDepleted
        ? [
            {
              id: 'rescue',
              label: rescueItemKind ? (
                <>{getCarriedItemPresentation(rescueItemKind).icon}使う</>
              ) : (
                'チェックポイントへ戻る'
              ),
              onSelect: () => void handleRescueSelect(),
            },
          ]
        : []),
    ]
  }, [
    activity,
    energyEmpty,
    energySpotChargeable,
    handleEnergySpotSelect,
    handleRescueSelect,
    operateStageAllowed,
    rescueItemKind,
  ])
}
