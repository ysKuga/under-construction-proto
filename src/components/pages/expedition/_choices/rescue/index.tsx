import { useCallback, useMemo } from 'react'

import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import { useEnergyStore } from '@/components/pages/expedition/_stores/energy'

import { useExpeditionEventDispatcher } from '../../_events'
import { getCarriedItemPresentation } from '../../_lib/item-presentation'
import { getItemUsages } from '../../_lib/item-usage'
import {
  useCarriedItemStore,
  useCarriedItemStoreApi,
} from '../../_stores/carried-items'
import { useGamePhaseStore } from '../../_stores/game-phase'
import { ItemInstance } from '../../_stores/items/types'
import { usePlayerActivityStore } from '../../_stores/player-activity'
import { useChoiceSelectEventListener } from '../_hooks/use-choice-select-event-listener'
import { useEffectRegisterChoice } from '../_hooks/use-effect-register-choice'

/** EN 補給に使えるアイテムか */
const canChargeEnergy = (item: ItemInstance) =>
  getItemUsages(item).includes('charge-energy')

/**
 * EN 切れの救助の選択肢を登録し、選択時に救済手段を実行する
 *
 * - 登録: 盤面を操作できるフェーズ（`operateStage`）で、player が EN 切れ中、かつ EN スポットで補給中でない
 * - 文言
 *   - 手持ち（EN 補給を許可された携行アイテム）あり: アイテムのアイコン + 「使う」
 *   - 手持ちなし: 「チェックポイントへ戻る」
 * - 選択時
 *   - 手持ちがあれば最古のものを使う（`Expedition-use-item`）
 *   - なければチェックポイントへのリセットを要求する（`Expedition-reset-to-checkpoint`）
 *   - 受理の判定・効果は各 listener が担う。拒否されたら通知する（`Expedition-action-rejected`）
 */
export const useRescueChoice = (): void => {
  /** 盤面を操作できるフェーズか */
  const operateStageAllowed = useGamePhaseStore((state) =>
    state.allows('operateStage'),
  )
  /** player が EN スポットで補給中か */
  const charging = usePlayerActivityStore(
    (state) => state.activity === 'charging',
  )
  /** player の EN が切れているか */
  const energyEmpty = useEnergyStore(
    (state) => state.getEnergyInfo(PLAYER_ACTOR_ID).current <= 0,
  )
  /** 救済手段として使う手持ちのアイテムの種類。なければ `undefined` */
  const rescueItemKind = useCarriedItemStore(
    (state) => state.carriedItems.find(canChargeEnergy)?.kind,
  )
  /** 携行アイテムの store（選択時の手持ちの取得に使う） */
  const carriedItemStoreApi = useCarriedItemStoreApi()
  /** 救済手段・拒否の通知の event の発行に使う */
  const expeditionEventDispatcher = useExpeditionEventDispatcher()

  /** 救済手段を実行し、拒否されたら通知する */
  const rescue = useCallback(async () => {
    /** 救済手段として使う手持ちのアイテム */
    const rescueItem = carriedItemStoreApi
      .getState()
      .carriedItems.find(canChargeEnergy)

    /** listener が救済手段を受理したか */
    const accepted = rescueItem
      ? await expeditionEventDispatcher['Expedition-use-item']({
          itemId: rescueItem.id,
          usage: 'charge-energy',
        })
      : await expeditionEventDispatcher['Expedition-reset-to-checkpoint'](
          undefined,
        )

    // 拒否された: 拒否を通知する
    if (!accepted) {
      await expeditionEventDispatcher['Expedition-action-rejected'](undefined)
    }
  }, [carriedItemStoreApi, expeditionEventDispatcher])
  /** EN 切れ中か（補給中は救済手段を提示しないため除く） */
  const energyDepleted = operateStageAllowed && energyEmpty && !charging

  useEffectRegisterChoice(
    useMemo(
      () =>
        energyDepleted
          ? {
              id: 'rescue',
              label: rescueItemKind ? (
                <>{getCarriedItemPresentation(rescueItemKind).icon}使う</>
              ) : (
                'チェックポイントへ戻る'
              ),
              order: 50,
            }
          : undefined,
      [energyDepleted, rescueItemKind],
    ),
  )

  useChoiceSelectEventListener(
    'rescue',
    useCallback(() => void rescue(), [rescue]),
  )
}
