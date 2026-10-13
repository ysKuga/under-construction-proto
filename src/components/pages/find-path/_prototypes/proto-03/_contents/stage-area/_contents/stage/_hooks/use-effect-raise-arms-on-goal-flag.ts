import { useEffect } from 'react'

import {
  armToggleAction,
  useBoxBotActionDispatcher,
} from '@/components/theater/figure/box-bot'

import { usePlayerActorEventTarget } from '../../../../../_contexts/player-actor-event-target'
import { useGamePhaseStoreApi } from '../../../../../_stores/game-phase'

/** ゴール到達時の両手の持ち上げ角 (rad、下げ位置から)。万歳に近づけ既定より高く上げる */
const GOAL_ARMS_UP_DELTA = 2.2

/**
 * ゴールセルの中心へ着いた時点で、player bot の両手を上げる
 *
 * - フェーズが `cleared` へ入った瞬間に `armToggle` を 1 回発火し、上げたまま止める
 * - 持ち上げ角は `GOAL_ARMS_UP_DELTA` で指定する。状態表示 bot へもイベントごと中継され同じ角度になる
 * - `cleared` へは一度しか入らず、リセットで store ごと作り直されるため、トグル式の
 *   `armToggle` のままで下がることはない
 * - store を直接購読し、再レンダリングを起こさない
 */
export const useEffectRaiseArmsOnGoalFlag = (): void => {
  const actorEventTarget = usePlayerActorEventTarget()
  const gamePhaseStoreApi = useGamePhaseStoreApi()
  const { armToggle } = useBoxBotActionDispatcher(actorEventTarget, [
    armToggleAction,
  ])

  useEffect(
    // cleared へ入った時点で両手を上げる
    () =>
      gamePhaseStoreApi.subscribe((state, prevState) => {
        if (state.phase !== 'cleared' || prevState.phase === 'cleared') return

        void armToggle({ upDelta: GOAL_ARMS_UP_DELTA })
      }),
    [armToggle, gamePhaseStoreApi],
  )
}
