'use client'

import { FlagOverhead } from './_components/flag-overhead'
import { useEffectRaiseArmsOnPhaseCleared } from './_hooks/use-effect-raise-arms-on-phase-cleared'

export { useGoalFloorFlagHidden } from './_hooks/use-goal-floor-flag-hidden'

/**
 * フェーズ `cleared`（bot がゴールセルの中心へ着いた後）に紐づく処理をまとめる
 *
 * - ゴールの演出を個別に実装せず、フェーズを起点にここへ集める（issue #137）
 * - bot 頭上の旗を表示し、player bot の両手を上げる
 * - 床上の旗を隠す判定（`useGoalFloorFlagHidden`）も提供する。描画は `GoalMarkerLayer` 側
 */
export const ClearedPhase = () => {
  useEffectRaiseArmsOnPhaseCleared()

  return <FlagOverhead />
}
