import { useState } from 'react'
import { combineLatest, distinctUntilChanged, map } from 'rxjs'

import { useEnergyStoreApi } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { fromStore } from '@/lib/rxjs/from-store'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useActorsStoreApi } from '@/prototypes/stage/stage-07/_stores/actors'

import { BubbleSlotEntry } from '../../_components/bubble-slots/_stores/bubble-slots/types'
import { countEnergySpotRecovery } from '../../_lib/count-energy-spot-recovery'
import { useItemStoreApi } from '../../_stores/items'
import { usePlayerActivityStoreApi } from '../../_stores/player-activity'
import { useWaypointFlowStoreApi } from '../../_stores/waypoint-flow'

import { EnergyDepletedBubbleContent } from './_contents/energy-depleted-bubble'
import { EnergySpotBubbleContent } from './_contents/energy-spot-bubble'
import { ExecuteBubbleContent } from './_contents/execute-bubble'
import { WaypointBubbleContent } from './_contents/waypoint-bubble'
import { UseBotBubblesReturn } from './index.types'

/**
 * bot 頭上・目標セル上それぞれへ格納する吹き出しを組み立てる
 *
 * - 表示条件
 *   - 中継点・実行: 経路提示中（中継点フローが `idle` 以外）
 *   - EN 切れ: player が EN 切れ中、かつ EN スポットで回復中でない。表示中は中継点・実行
 *     （種類 `action`）を隠す
 *   - EN スポット: player が EN スポット上で停止中、かつ回復できる（EN が上限未満・残量あり）
 * - store api は参照が安定しているため、初回のみ組み立てる
 */
export const useBotBubbles = (): UseBotBubblesReturn => {
  const waypointFlowStoreApi = useWaypointFlowStoreApi()
  const energyStoreApi = useEnergyStoreApi()
  const actorsStoreApi = useActorsStoreApi()
  const itemStoreApi = useItemStoreApi()
  const playerActivityStoreApi = usePlayerActivityStoreApi()

  const [botBubbles] = useState(() => {
    /** 経路提示中か */
    const proposing$ = fromStore(waypointFlowStoreApi).pipe(
      map((state) => state.flowState !== 'idle'),
      distinctUntilChanged(),
    )
    /** player の行為 */
    const playerActivity$ = fromStore(playerActivityStoreApi).pipe(
      map((state) => state.activity),
      distinctUntilChanged(),
    )
    /** player が EN 切れ中か（回復中は救済手段を提示しないため除く） */
    const energyDepleted$ = combineLatest([
      fromStore(energyStoreApi),
      playerActivity$,
    ]).pipe(
      map(
        ([state, activity]) =>
          state.getEnergyInfo(PLAYER_ACTOR_ID).current <= 0 &&
          activity !== 'recovering',
      ),
      distinctUntilChanged(),
    )
    /** player が EN スポット上で停止中、かつ回復できるか */
    const energySpotUsable$ = combineLatest([
      fromStore(actorsStoreApi),
      fromStore(itemStoreApi),
      fromStore(energyStoreApi),
      playerActivity$,
    ]).pipe(
      map(([actors, items, energy, activity]) => {
        const cell = actors.actors[PLAYER_ACTOR_ID]

        return (
          activity === 'idle' &&
          cell !== undefined &&
          countEnergySpotRecovery(
            items.getItemAtCell(cell),
            energy.getEnergyInfo(PLAYER_ACTOR_ID),
          ) > 0
        )
      }),
      distinctUntilChanged(),
    )
    /** 中継点・実行の組 */
    const pairBubbles: BubbleSlotEntry[] = [
      {
        Bubble: WaypointBubbleContent,
        id: 'waypoint',
        kinds: ['action'],
        visible$: proposing$,
      },
      {
        Bubble: ExecuteBubbleContent,
        id: 'execute',
        kinds: ['action'],
        visible$: proposing$,
      },
    ]

    return {
      objectiveBubbles: pairBubbles,
      playerBubbles: [
        ...pairBubbles,
        {
          Bubble: EnergyDepletedBubbleContent,
          hides: ['action'],
          id: 'energy-depleted',
          kinds: ['rescue'],
          visible$: energyDepleted$,
        },
        {
          Bubble: EnergySpotBubbleContent,
          id: 'energy-spot',
          visible$: energySpotUsable$,
        },
      ],
    }
  })

  return botBubbles
}
