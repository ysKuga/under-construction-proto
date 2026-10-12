import { useEffect } from 'react'

import {
  armToggleAction,
  useBoxBotActionDispatcher,
} from '@/components/theater/figure/box-bot'

import { usePlayerActorEventTarget } from '../../../../../_contexts/player-actor-event-target'
import { useGoalStoreApi } from '../../../../../_stores/goal'

/**
 * 旗を頭上へ掲げた時点で、player bot の両手を上げる
 *
 * - goal store の `flagRaised` が立った瞬間に `armToggle` を 1 回発火し、上げたまま止める
 * - `flagRaised` は一度しか立たず、リセットで store ごと作り直されるため、トグル式の
 *   `armToggle` のままで下がることはない
 * - store を直接購読し、再レンダリングを起こさない
 */
export const useEffectRaiseArmsOnGoalFlag = (): void => {
  const actorEventTarget = usePlayerActorEventTarget()
  const goalStoreApi = useGoalStoreApi()
  const { armToggle } = useBoxBotActionDispatcher(actorEventTarget, [
    armToggleAction,
  ])

  useEffect(
    // flagRaised の立ち上がりで両手を上げる
    () =>
      goalStoreApi.subscribe((state, prevState) => {
        if (!state.flagRaised || prevState.flagRaised) return

        void armToggle()
      }),
    [armToggle, goalStoreApi],
  )
}
