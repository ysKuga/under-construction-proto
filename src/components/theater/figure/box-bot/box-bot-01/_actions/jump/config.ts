/** jump action の発火イベント名 (クリック起点・外部 dispatch・hopping 共通) */
export const ACTION_JUMP = 'BoxBot-action-jump'

/** ジャンプ (単発 jump / 待機 hopping 共通) の設定 */
export type JumpConfig = {
  /** 継続時間(秒) */
  durSec: number
  /** ジャンプ時に表示領域(Canvas ラッパー)を持ち上げる最大量(px) */
  liftPx: number
}

/**
 * ジャンプ 1 回ごとの上書きパラメータ
 *
 * - dispatch(`useBoxBotActionDispatcher().jump(...)`)時に指定する
 * - 省略したキーは `ctx.config`(`JUMP_DEFAULTS` ← `actionConfig.jump` 上書き)の値を使う
 */
export type JumpOverride = Partial<JumpConfig>

/** `ctx.config`(jump)の既定値。`actionConfig.jump` で部分上書きできる */
export const JUMP_DEFAULTS: JumpConfig = { durSec: 0.55, liftPx: 130 }

/** ジャンプ中の縦方向のスクイッシュ量 */
export const JUMP_SQUASH_Y = 0.08
/** ジャンプ中の横方向のスクイッシュ量 */
export const JUMP_SQUASH_X = 0.05
