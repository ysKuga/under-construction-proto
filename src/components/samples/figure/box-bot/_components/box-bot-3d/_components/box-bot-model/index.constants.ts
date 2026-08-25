import type { BoxBot3DConfig } from './index.types'

export const DEFAULTS: BoxBot3DConfig = {
  arm: {
    d: 0.18,
    leftAngle: -0.5,
    leftLen: 1.15,
    rightAngle: 2.4,
    rightLen: 1.0,
    w: 0.18,
  },
  body: { d: 1.4, h: 1.7, w: 2.0 },
  eye: { d: 0.06, h: 0.34, offset: 0.42, w: 0.06 },
  head: { d: 1.2, h: 1.0, w: 1.6 },
  ink: '#191B21',
  leg: { d: 0.22, gap: 0.5, h: 0.5, w: 0.22 },
  lineWidth: 2.5,
  outline: true,
  outlineWidth: 0.03,
  paper: '#FBFAF6',
  seed: 7,
  sketch: 0.035,
  sketchDetail: 7,
}

/** ジャンプ action の発火イベント名。クリックと useEventListener 両経路から同じ action を実行するための scope prefix 付きイベント名 */
export const ACTION_JUMP = 'BoxBot-action-jump'

/** body クリックの発火イベント名。どの action を実行するかは CLICK_ACTION_MAP 側の対応で決める */
export const CLICK_BODY = 'BoxBot-click-body'
/** head クリックの発火イベント名。どの action を実行するかは CLICK_ACTION_MAP 側の対応で決める */
export const CLICK_HEAD = 'BoxBot-click-head'

/** 左腕上げ下げ action の発火イベント名 */
export const ACTION_ARM_LEFT_TOGGLE = 'BoxBot-action-arm-left-toggle'
/** 右腕上げ下げ action の発火イベント名 */
export const ACTION_ARM_RIGHT_TOGGLE = 'BoxBot-action-arm-right-toggle'

/** 左腕クリックの発火イベント名。どの action を実行するかは CLICK_ACTION_MAP 側の対応で決める */
export const CLICK_ARM_LEFT = 'BoxBot-click-arm-left'
/** 右腕クリックの発火イベント名。どの action を実行するかは CLICK_ACTION_MAP 側の対応で決める */
export const CLICK_ARM_RIGHT = 'BoxBot-click-arm-right'

/** 歩いている状態の toggle action の発火イベント名 */
export const ACTION_WALKING_TOGGLE = 'BoxBot-action-walking-toggle'
/** 足踏みしている状態の toggle action の発火イベント名 */
export const ACTION_MARCHING_TOGGLE = 'BoxBot-action-marching-toggle'

/** 転倒 action の発火イベント名 */
export const ACTION_FALL = 'BoxBot-action-fall'
/** 起き上がり action の発火イベント名 */
export const ACTION_GET_UP = 'BoxBot-action-get-up'

/** 回転(加速→最大速度→減速して停止) action の発火イベント名 */
export const ACTION_SPIN = 'BoxBot-action-spin'

/** ジャンプの継続時間(秒) */
export const JUMP_DUR = 0.55
/** ジャンプの最大上昇量(world) */
export const JUMP_H = 0.55
/** ジャンプ中の縦方向のスクイッシュ量 */
export const JUMP_SQUASH_Y = 0.08
/** ジャンプ中の横方向のスクイッシュ量 */
export const JUMP_SQUASH_X = 0.05

/** leftUp = true(上げ)時の左腕角度(z 軸回転) */
export const ARM_UP_ANGLE = -2.25
/** rightUp = false(下げ)時の右腕角度(z 軸回転) */
export const ARM_DOWN_ANGLE = 0.5
/** 腕の角度が目標値へ近づく速さ(approach の減衰係数) */
export const ARM_APPROACH_RATE = 9

/** 胴体上端から頭下端までの隙間(world) */
export const HEAD_GAP = 0.1
/** 肩の y 位置。胴体上端からのオフセット(world) */
export const SHOULDER_Y_OFFSET = 0.2
/** 頭前面から目・口を浮かせる量(world、z-fighting 回避) */
export const HEAD_FRONT_MARGIN = 0.01

/** 脚アニメーション(bob/swing)の既定周期(秒) */
export const LEG_CYCLE_SEC = 1
/** 脚 bob(上下)の振幅(world) */
export const LEG_BOB_HEIGHT = 0.12
/** 脚 swing(前後スイング)の振幅(rad) */
export const LEG_SWING_ANGLE = 0.5
/** body bobbing(上下)の振幅(world) */
export const BODY_BOB_HEIGHT = 0.025
/**
 * 脚アニメーションの角速度が目標値へ近づく速さ(approach の減衰係数)
 *
 * - 小さいほど加速・減速がゆっくりになる
 */
export const LEG_SPEED_APPROACH_RATE = 3
/** 歩行系の値が目標値(停止時は 0)へ近づく速さ(approach の減衰係数) */
export const WALK_APPROACH_RATE = 10

/** 転倒の継続時間(秒) */
export const FALL_DUR = 0.4
/** 起き上がりの継続時間(秒) */
export const GET_UP_DUR = 0.6
/** 回転の最大角速度(rad/s) */
export const SPIN_MAX_SPEED = Math.PI * 3
/** 回転の加速度(rad/s^2)。角速度が 0 から `SPIN_MAX_SPEED` に達するまでの速さ */
export const SPIN_ACCEL_RATE = Math.PI * 8
/** 回転の減速度(rad/s^2)。角速度が `SPIN_MAX_SPEED` から 0 に落ちるまでの速さ */
export const SPIN_DECEL_RATE = Math.PI * 6
/** 回転が最大角速度を維持する時間(秒)。加速・減速に要する時間は別途 */
export const SPIN_CRUISE_DUR = 0.15
/** 倒れきった状態の fallPivotRef 前傾角度(rad、x 軸回転) */
export const FALL_ANGLE = Math.PI / 2
/**
 * 転倒中に腕を頭の近くへ引き寄せる角度(rad、x 軸回転)
 *
 * - fall 発火時に即座に切替える toggle 実装(経過時間による補間はしない)。\
 *   転倒に対して防御的に頭をかばう動きを意図している
 * - 将来 この動き自体を独立 action(軌道)にする際に見直す想定
 */
export const FALL_ARM_ANGLE = (-3 * Math.PI) / 4
