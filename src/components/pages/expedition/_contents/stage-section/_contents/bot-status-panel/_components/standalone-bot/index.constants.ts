import {
  armToggleAction,
  bodyBobbingAction,
  energyOutAction,
  faceAction,
  walkingAction,
  walkingResetAction,
} from '@/components/theater/figure/box-bot'

/**
 * 独立 bot が受け付け、ステージ上の bot から同期する action
 *
 * - face（向き）は含めない。同期の有無を切り替えるため `useRelayFacing` で別途中継する
 * - energyOut はステージ上の bot 宛てに停止待ち（`useEnergyOutAfterStop`）を経て
 *   dispatch されるため、独立 bot も停止後に演出する
 * - armToggle はゴール到達時の両手上げ（issue #137）。`energyOut` より後に置き、腕の持ち上げ角を後勝ちで書く
 */
export const STANDALONE_BOT_RELAYED_ACTIONS = [
  walkingAction,
  walkingResetAction,
  energyOutAction,
  armToggleAction,
]

/**
 * 独立 bot の `actions`
 *
 * - 中継対象に加え、dispatch 不要で walking に連動する bodyBobbing を含める（中継はしない）
 * - face は向き同期オプション(`useRelayFacing`)の dispatch 先として含める
 */
export const STANDALONE_BOT_ACTIONS = [
  ...STANDALONE_BOT_RELAYED_ACTIONS,
  bodyBobbingAction,
  faceAction,
]

/**
 * action 設定の上書き
 *
 * - EN 切れ時に接地影を 2 倍にする(状態表示のみ。ステージ上の bot は等倍のまま)
 */
export const STANDALONE_BOT_ACTION_CONFIG = { energyOut: { shadowScale: 2.2 } }
