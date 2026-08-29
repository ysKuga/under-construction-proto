/** spin action の発火イベント名 (クリック起点・外部 dispatch 共通) */
export const ACTION_SPIN = 'BoxBot-action-spin'

/** スピン (単発。加速 → 最大速度維持 → 減速 → 停止 の 1 サイクル) の設定 */
export type SpinConfig = {
  /** 加速フェーズの長さ(秒) */
  accelSec: number
  /** 減速フェーズの長さ(秒) */
  decelSec: number
  /** 最大速度を維持するフェーズの長さ(秒) */
  holdSec: number
  /** 最大角速度(rad/s) */
  maxSpeed: number
}

/**
 * スピン 1 回ごとの上書きパラメータ
 *
 * - dispatch(`useBoxBotActionDispatcher().spin(...)`)時に指定する
 * - 省略したキーは `host.config`(`SPIN_DEFAULTS` ← `actionConfig.spin` 上書き)の値を使う
 */
export type SpinOverride = Partial<SpinConfig>

/** `host.config`(spin)の既定値。`actionConfig.spin` で部分上書きできる */
export const SPIN_DEFAULTS: SpinConfig = {
  accelSec: 0.35,
  decelSec: 0.8,
  holdSec: 0.5,
  maxSpeed: 12,
}
