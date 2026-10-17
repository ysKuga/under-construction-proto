import { GamePhase, PhasePermissions } from './types'

/**
 * フェーズごとに許可する操作・演出
 *
 * - フェーズを追加したら行を足す。各所の判定は変えない
 * - `clearing`・`cleared` は終了状態。操作を受け付けず、ゴール以外の演出を出さない
 */
export const PHASE_PERMISSIONS = {
  clearing: {
    enterCell: false,
    operateStage: false,
    performEnergyOut: false,
    showBubbles: false,
    warnEnergyShortage: false,
  },
  cleared: {
    enterCell: false,
    operateStage: false,
    performEnergyOut: false,
    showBubbles: false,
    warnEnergyShortage: false,
  },
  playing: {
    enterCell: true,
    operateStage: true,
    performEnergyOut: true,
    showBubbles: true,
    warnEnergyShortage: true,
  },
} as const satisfies Record<GamePhase, PhasePermissions>
