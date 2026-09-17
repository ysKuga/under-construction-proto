/** energy-out action の発火イベント名(EN 切れ検知・外部 dispatch 共通) */
export const ACTION_ENERGY_OUT = 'BoxBot-action-energy-out'

/** 予防姿勢への移行(直立 → 前傾)の継続時間(秒) */
export const ENERGY_OUT_DUR = 0.35

/** 復帰(前傾 → 直立)の継続時間(秒) */
export const ENERGY_OUT_RECOVER_DUR = 0.5

/**
 * 予防姿勢の上半身前傾角度の既定値(rad、腰まわりの x 軸回転、実測要)
 *
 * - EN 切れは経路実行中に検知できる(想定内の停止)ため、fall(不意の転倒)のような
 *   崩れ落ちる動きでなく、自ら姿勢を低くして静止する動き。fall の `FALL_ANGLE`(90°)
 *   よりずっと小さい角度に留める
 */
export const ENERGY_OUT_TILT_ANGLE = Math.PI / 10

/**
 * 予防姿勢で腕を体側へ寄せる量の既定値(rad、z 軸回転、実測要)
 *
 * - 静的な肩の開き(`DEFAULTS.arm.leftAngle` -0.5 / `rightAngle` 0.5)を打ち消す方向へ\
 *   左右対称に加える。0(既定)は静的な開きをそのまま残す ― 完全に体側へ寄せる(正味 0)と\
 *   体に埋もれてほぼ見えなくなるため。腕を地面に対し鉛直に保つ処理(`applyArmAngle`、x 軸)\
 *   とは独立した軸なので、ここを 0 のままでも鉛直は保たれる
 */
export const ENERGY_OUT_ARM_LIFT = 0

/** `host.config`(energyOut)の型 */
export type EnergyOutConfig = {
  /** 予防姿勢で腕を体側へ寄せる量(rad、z 軸回転、実測要) */
  armLift: number
  /** 予防姿勢の上半身前傾角度(rad、腰まわりの x 軸回転、実測要) */
  tiltAngle: number
}

/**
 * energy-out 1 回ごとの上書きパラメータ
 *
 * - dispatch(`useBoxBotActionDispatcher().energyOut(...)`)時に指定する
 * - 省略したキーは `host.config`(`ENERGY_OUT_DEFAULTS` ← `actionConfig.energyOut` 上書き)の値を使う
 */
export type EnergyOutOverride = Partial<EnergyOutConfig>

/** `host.config`(energyOut)の既定値。`actionConfig.energyOut` で部分上書きできる */
export const ENERGY_OUT_DEFAULTS: EnergyOutConfig = {
  armLift: ENERGY_OUT_ARM_LIFT,
  tiltAngle: ENERGY_OUT_TILT_ANGLE,
}
