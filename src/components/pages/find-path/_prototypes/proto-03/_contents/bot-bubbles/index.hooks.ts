import { useState } from 'react'
import { distinctUntilChanged, map } from 'rxjs'

import { useEnergyStoreApi } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { fromStore } from '@/lib/rxjs/from-store'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'

import { BubbleSlotEntry } from '../../_components/bubble-slots/_stores/bubble-slots/types'
import { useWaypointFlowStoreApi } from '../../_stores/waypoint-flow'

import { EnergyDepletedBubbleContent } from './_contents/energy-depleted-bubble'
import { ExecuteBubbleContent } from './_contents/execute-bubble'
import { WaypointBubbleContent } from './_contents/waypoint-bubble'
import { UseBotBubblesReturn } from './index.types'

/**
 * bot 頭上・目標セル上それぞれへ格納する吹き出しを組み立てる
 *
 * - 表示条件
 *   - 中継点・実行: 経路提示中（中継点フローが `idle` 以外）
 *   - EN 切れ: player が EN 切れ中。表示中は中継点・実行（種類 `action`）を隠す
 * - store api は参照が安定しているため、初回のみ組み立てる
 */
export const useBotBubbles = (): UseBotBubblesReturn => {
  const waypointFlowStoreApi = useWaypointFlowStoreApi()
  const energyStoreApi = useEnergyStoreApi()

  const [botBubbles] = useState(() => {
    /** 経路提示中か */
    const proposing$ = fromStore(waypointFlowStoreApi).pipe(
      map((state) => state.flowState !== 'idle'),
      distinctUntilChanged(),
    )
    /** player が EN 切れ中か */
    const energyDepleted$ = fromStore(energyStoreApi).pipe(
      map((state) => state.getEnergyInfo(PLAYER_ACTOR_ID).current <= 0),
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
      ],
    }
  })

  return botBubbles
}
