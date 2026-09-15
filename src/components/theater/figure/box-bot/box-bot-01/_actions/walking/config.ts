/** walking action の発火イベント名 (外部 dispatch から歩行を on/off トグル) */
export const ACTION_WALKING = 'BoxBot-action-walking'

/** 歩行(脚の前後スイング・腕の振り)の設定 */
export type WalkingConfig = {
  /** 腕の前後振りの振幅 (rad、肩支点の x 軸回転)。脚と逆側が同位相(反対の脚が前へ出るとき腕も前へ) */
  armSwingAngle: number
  /** 左右 1 往復の周期 (秒) */
  cycleSec: number
  /** 停止後に脚角・腕角を 0 へ戻す速さ (approach の減衰係数) */
  settleRate: number
  /** 角速度が目標へ寄る速さ (approach の減衰係数)。開始/停止時の加減速に効く */
  speedApproachRate: number
  /** 脚の前後スイング角の振幅 (rad、付け根支点の x 軸回転) */
  swingAngle: number
}

/** `host.config`(walking)の既定値。`actionConfig.walking` で部分上書きできる */
export const WALKING_DEFAULTS: WalkingConfig = {
  armSwingAngle: 0.35,
  cycleSec: 1,
  settleRate: 10,
  speedApproachRate: 3,
  swingAngle: 0.5,
}
