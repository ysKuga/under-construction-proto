/** fall action の発火イベント名 (クリック起点・外部 dispatch 共通) */
export const ACTION_FALL = 'BoxBot-action-fall'

/** 転倒 (直立 → 前傾) の継続時間 (秒) */
export const FALL_DUR = 0.4

/** 起き上がり (横倒し → 直立) の継続時間 (秒) */
export const GET_UP_DUR = 0.6

/** 倒れきった状態の前傾角度 (rad、接地点まわりの x 軸回転) */
export const FALL_ANGLE = Math.PI / 2

/**
 * 転倒中に腕を頭の近くへ引き寄せる角度 (rad、x 軸回転)
 *
 * - fall 発火時に即座に切替える (経過時間による補間はしない)。頭をかばう動きを意図
 * - get-up は体の起き上がりと同じ進行度でこの角度から 0 (垂直) へ戻す
 * - 将来この動き自体を独立 action (軌道) にする際に見直す想定
 */
export const FALL_ARM_ANGLE = (-3 * Math.PI) / 4
