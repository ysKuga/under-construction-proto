/** fall action の発火イベント名 (クリック起点・外部 dispatch 共通) */
export const ACTION_FALL = 'BoxBot-action-fall'

/** 転倒 (直立 → 前傾) の継続時間 (秒) */
export const FALL_DUR = 0.4

/** 起き上がり (横倒し → 直立) の継続時間 (秒) */
export const GET_UP_DUR = 0.6

/** 倒れきった状態の前傾角度 (rad、シルエット中心まわりの x 軸回転) */
export const FALL_ANGLE = Math.PI / 2

/**
 * 転倒中に腕を頭側へ引き寄せる角度の既定値 (rad、x 軸回転、`FallConfig.armAngle` の下地)
 *
 * - -180° = 肩を支点に腕を体へ畳む。倒れた体に沿って腕が寝るため、横倒しでの
 *   はみ出しが最小になる (samples の転倒姿勢に近い)
 * - 静的な肩の開き (`cfg.arm.leftAngle` / `rightAngle`) と合成される。肩の開きを
 *   変えたら Fall story の armAngle スライダーで再調整する
 * - 将来この動き自体を独立 action (軌道) にする際に見直す想定
 */
export const FALL_ARM_ANGLE = -Math.PI

/**
 * 転倒の見た目を合わせるための表示領域ずらし量 (px)
 *
 * - Canvas 内ではシルエット中心まわりに回すだけ。足元が前方へ出た「倒れ込み」の見た目は、
 *   表示領域 (Canvas ラッパー) を DOM でずらして表現する (#108 フェーズ1、jump と同じ機構)
 * - 進行方向 (facing のカメラ投影) へ `shiftDistance`、加えて facing 非依存で `dropDistance` 下げ
 * - 転倒進行度に同期してこの距離まで補間し、get-up で 0 へ戻す
 */
export type FallConfig = {
  /**
   * 転倒中に腕を頭側へ引き寄せる角度 (rad、x 軸回転、実測要)
   *
   * - fall 発火時に即座にこの角度へ切替える (経過時間による補間はしない)。頭をかばう動き
   * - get-up は体の起き上がりと同じ進行度でこの角度から 0 (垂直) へ戻す
   * - 静的な肩の開き (`cfg.arm.leftAngle` / `rightAngle` の z 傾き) と合成されるため、
   *   肩の開きを変えたらここも見直す
   */
  armAngle: number
  /**
   * facing 非依存で画面下へ下げる量 (px、実測要)
   *
   * - シルエット中心まわりに回すため、横倒しでは足元が立ち姿勢の接地点より上に浮く。
   *   その浮きを打ち消すための下げ量。どの向きでも一定
   * - 転倒進行度に同期してこの量まで補間し、get-up で 0 へ戻す
   */
  dropDistance: number
  /**
   * 横倒し時に接地影を体へ近づける量 (world +y、実測要)
   *
   * - 影は接地面固定なので、体が中心 pivot で浮くと影だけ下に取り残される。
   *   転倒進行度に同期して影を world +y へ持ち上げ、寝た体の近くへ寄せる
   *   (体である程度覆われてよい)。get-up で 0 へ戻す
   */
  shadowLift: number
  /**
   * 進行方向へずらす距離 (px、実測要)
   *
   * - 倒れ始めの facing をカメラ投影した画面 2D 方向 (右+ / 上+) に掛ける。
   *   奥向きは上、手前向きは下、横向きは左右へ倒れ込む
   */
  shiftDistance: number
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
  armAngle: FALL_ARM_ANGLE,
  dropDistance: 25,
  shadowLift: 0.5,
  shiftDistance: 55,
}
