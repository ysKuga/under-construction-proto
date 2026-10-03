import { useEffect, useRef } from 'react'
import { interval, Subscription, take } from 'rxjs'

import {
  useEnergyEventDispatcher,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useActorsStoreApi } from '@/prototypes/stage/stage-07/_stores/actors'

import { useFindPathEventListener } from '../../../../../_events'
import { countEnergySpotCharge } from '../../../../../_lib/count-energy-spot-charge'
import { useItemStoreApi } from '../../../../../_stores/items'
import { usePlayerActivityStoreApi } from '../../../../../_stores/player-activity'
import { useWaypointFlowStoreApi } from '../../../../../_stores/waypoint-flow'
import { ENERGY_SPOT_CHARGE_INTERVAL_MS } from '../../../../../constants'

/**
 * player の現在セルの EN スポットの使用を受け付け、時間経過とともに EN を補給する
 *
 * - 停止中かつ補給できる（EN が上限未満・スポットの残量あり）場合のみ受理する。\
 *   それ以外は `preventDefault()` で拒否する
 * - 補給回数（`countEnergySpotCharge`）を先に決め、`ENERGY_SPOT_CHARGE_INTERVAL_MS`
 *   ごとにスポットを 1 回分消費し補給する。中断はしない（issue #297）
 * - 補給中は行為 store を `charging` にし、完了で `idle` へ戻す
 * - 時間経過は time-control 導入までの暫定として rxjs の `interval` で持つ
 */
export const useEnergySpotUseEventListener = (): void => {
  const actorsStoreApi = useActorsStoreApi()
  const energy = useEnergyStoreApi()
  const energyDispatch = useEnergyEventDispatcher()
  const itemStoreApi = useItemStoreApi()
  const playerActivityStoreApi = usePlayerActivityStoreApi()
  const waypointFlowStoreApi = useWaypointFlowStoreApi()
  /** 補給の時間経過の購読 */
  const chargeSubscriptionRef = useRef<Subscription>(undefined)

  // unmount（リセットによる再マウント含む）: 補給の時間経過を止める
  useEffect(() => () => chargeSubscriptionRef.current?.unsubscribe(), [])

  useFindPathEventListener('FindPath-use-energy-spot', (event) => {
    const cell = actorsStoreApi.getState().actors[PLAYER_ACTOR_ID]
    const spot = cell && itemStoreApi.getState().getItemAtCell(cell)
    /** 補給回数 */
    const count = countEnergySpotCharge(
      spot,
      energy.getState().getEnergyInfo(PLAYER_ACTOR_ID),
    )

    /** 停止中かつ補給できるか */
    const isAcceptable =
      spot !== undefined &&
      count > 0 &&
      playerActivityStoreApi.getState().activity === 'idle'

    // 移動中・補給中、または補給できない: 使用を拒否する
    if (!isAcceptable) {
      event.preventDefault()

      return
    }

    // 補給中は経路の提示・実行を受け付けないため、提示中の目標・中継点を消す
    waypointFlowStoreApi.getState().clear()
    playerActivityStoreApi.getState().setActivity('charging')

    chargeSubscriptionRef.current = interval(ENERGY_SPOT_CHARGE_INTERVAL_MS)
      .pipe(take(count))
      .subscribe({
        complete: () => {
          playerActivityStoreApi.getState().setActivity('idle')
        },
        next: () => {
          const consumed = itemStoreApi.getState().consumeItem(spot.id)

          if (!consumed) return

          void energyDispatch['Energy-charge']({
            actorId: PLAYER_ACTOR_ID,
            amount: consumed.amount,
          })
        },
      })
  })
}
