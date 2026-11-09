import { useState } from 'react'
import {
  combineLatest,
  concat,
  distinctUntilChanged,
  map,
  of,
  pairwise,
  switchMap,
  timer,
} from 'rxjs'

import { fromStore } from '@/lib/rxjs/from-store'

import { BubbleSlotEntry } from '@/components/theater/aside/bubble-slots/_stores/bubble-slots/types'
import { EnergySpotChargedBubble } from '../../_components/energy-spot-charged-bubble'
import { EnergySpotChargingBubble } from '../../_components/energy-spot-charging-bubble'
import { useGamePhaseStoreApi } from '../../_stores/game-phase'
import { usePlayerActivityStoreApi } from '../../_stores/player-activity'
import { ENERGY_SPOT_CHARGED_NOTICE_MS } from '../../constants'

import { UseBotBubblesReturn } from './index.types'

/**
 * bot 頭上へ格納する吹き出しを組み立てる
 *
 * - 表示条件
 *   - 補給中: player が EN スポットで補給中
 *   - 補給完了: EN スポットでの補給の完了後、一定時間（`ENERGY_SPOT_CHARGED_NOTICE_MS`）
 *     または次の行為（移動等）まで
 * - 吹き出しの表示を許可しないフェーズ（ゴール後の終了状態）では全ての吹き出しを隠す
 *   （頭上の旗との重なりも避ける、issue #137）
 * - 補給完了（種類 `notice`）は、他の吹き出しの表示中は隠す（他の全ての吹き出しへ
 *   `hides: ['notice']` を指定する）
 * - store api は参照が安定しているため、初回のみ組み立てる
 */
export const useBotBubbles = (): UseBotBubblesReturn => {
  const playerActivityStoreApi = usePlayerActivityStoreApi()
  const gamePhaseStoreApi = useGamePhaseStoreApi()

  const [botBubbles] = useState(() => {
    /** 吹き出しの表示を許可するフェーズか */
    const showBubblesAllowed$ = fromStore(gamePhaseStoreApi).pipe(
      map((state) => state.allows('showBubbles')),
      distinctUntilChanged(),
    )
    /** 表示条件へ「フェーズが表示を許可している」を加える */
    const restrictByPhase = (entry: BubbleSlotEntry): BubbleSlotEntry => ({
      ...entry,
      visible$: combineLatest([entry.visible$, showBubblesAllowed$]).pipe(
        map(([visible, allowed]) => visible && allowed),
        distinctUntilChanged(),
      ),
    })
    /** player の行為 */
    const playerActivity$ = fromStore(playerActivityStoreApi).pipe(
      map((state) => state.activity),
      distinctUntilChanged(),
    )
    /** player が EN スポットで補給中か */
    const charging$ = playerActivity$.pipe(
      map((activity) => activity === 'charging'),
      distinctUntilChanged(),
    )
    /**
     * EN スポットでの補給の完了直後か
     *
     * - 補給中から停止中へ切り替わった時点で true にする
     * - `ENERGY_SPOT_CHARGED_NOTICE_MS` の経過、または次の行為の切替で false にする
     */
    const charged$ = playerActivity$.pipe(
      pairwise(),
      switchMap(([prev, next]) =>
        prev === 'charging' && next === 'idle'
          ? concat(
              of(true),
              timer(ENERGY_SPOT_CHARGED_NOTICE_MS).pipe(map(() => false)),
            )
          : of(false),
      ),
      distinctUntilChanged(),
    )
    return {
      playerBubbles: [
        {
          Bubble: EnergySpotChargingBubble,
          hides: ['notice'],
          id: 'energy-spot-charging',
          visible$: charging$,
        },
        {
          Bubble: EnergySpotChargedBubble,
          id: 'energy-spot-charged',
          kinds: ['notice'],
          visible$: charged$,
        },
      ].map(restrictByPhase),
    }
  })

  return botBubbles
}
