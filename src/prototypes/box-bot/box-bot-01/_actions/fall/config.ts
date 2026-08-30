/** fall action の発火イベント名 (クリック起点・外部 dispatch 共通) */
export const ACTION_FALL = 'BoxBot-action-fall'

/** 転倒 (直立 → 前傾) の継続時間 (秒) */
export const FALL_DUR = 0.4

/** 起き上がり (横倒し → 直立) の継続時間 (秒) */
export const GET_UP_DUR = 0.6

/** 倒れきった状態の前傾角度 (rad、体心まわりの x 軸回転) */
export const FALL_ANGLE = Math.PI / 2

/**
 * 転倒中に腕を頭の近くへ引き寄せる角度 (rad、x 軸回転)
 *
 * - fall 発火時に即座に切替える (経過時間による補間はしない)。頭をかばう動きを意図
 * - get-up は体の起き上がりと同じ進行度でこの角度から 0 (垂直) へ戻す
 * - 将来この動き自体を独立 action (軌道) にする際に見直す想定
 */
export const FALL_ARM_ANGLE = (-3 * Math.PI) / 4

/**
 * 転倒の見た目を合わせるための表示領域ずらし量 (px)
 *
 * - Canvas 内では体心まわりに回すだけ。足元が前方へ出た「倒れ込み」の見た目は、
 *   表示領域 (Canvas ラッパー) を DOM でずらして表現する (#108 フェーズ1、jump と同じ機構)
 * - 転倒進行度に同期してこの量まで補間し、get-up で 0 へ戻す
 */
export type FallConfig = {
  /** 画面右方向へのずらし量 (px)。負で左 */
  shiftX: number
  /** 画面上方向へのずらし量 (px)。負で下 */
  shiftY: number
}

/**
 * 転倒 1 回ごとの上書きパラメータ
 *
 * - dispatch(`useBoxBotActionDispatcher().fall(...)`)時に指定する
 * - 省略したキーは `host.config`(`FALL_DEFAULTS` ← `actionConfig.fall` 上書き)の値を使う
 * - 直立 → 転倒の起動時のみ反映。get-up 側は起動時の値をそのまま逆再生する
 */
export type FallOverride = Partial<FallConfig>

/** `host.config`(fall)の既定値。`actionConfig.fall` で部分上書きできる */
export const FALL_DEFAULTS: FallConfig = {
  shiftX: -40,
  shiftY: -70,
}
