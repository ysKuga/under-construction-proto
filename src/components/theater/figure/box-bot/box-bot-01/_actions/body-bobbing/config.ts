/**
 * body-bobbing action の内部イベント名
 *
 * - body-bobbing は dispatch で on/off しない (walking / marching に常時連動)。\
 *   `defineAction` の必須項目を満たすためのダミーで、購読も dispatch もしない
 */
export const ACTION_BODY_BOBBING = 'BoxBot-action-body-bobbing'

/** walking / marching 中の体の上下 (bobbing) の設定 */
export type BodyBobbingConfig = {
  /** marching の脚 bob 量の基準 (正規化の分母)。marching の `bobHeight` 既定と揃える */
  bobRef: number
  /** 体の最大持ち上げ量 (world) */
  height: number
  /** walking の脚スイング角の基準 (正規化の分母)。walking の `swingAngle` 既定と揃える */
  swingRef: number
}

/** `host.config`(body-bobbing)の既定値。`actionConfig.bodyBobbing` で部分上書きできる */
export const BODY_BOBBING_DEFAULTS: BodyBobbingConfig = {
  bobRef: 0.12,
  height: 0.025,
  swingRef: 0.5,
}
