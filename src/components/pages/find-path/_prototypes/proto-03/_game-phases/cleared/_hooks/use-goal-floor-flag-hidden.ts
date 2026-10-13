import { useGamePhaseStore } from '../../../_stores/game-phase'

/**
 * 床上のゴールの旗を隠すか
 *
 * - bot がゴールセルの中心へ着いた後（フェーズ `cleared`）は隠し、bot 頭上の旗へ表示を移す（issue #137）
 * - 描画は `GoalMarkerLayer` が担い、隠す判定だけをフェーズ `cleared` の処理側に置く
 */
export const useGoalFloorFlagHidden = (): boolean =>
  useGamePhaseStore((state) => state.phase === 'cleared')
