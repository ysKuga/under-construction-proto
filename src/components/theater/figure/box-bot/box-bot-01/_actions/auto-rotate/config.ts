/** auto-rotate action の発火イベント名 (外部 dispatch から on/off をトグル) */
export const ACTION_AUTO_ROTATE = 'BoxBot-action-auto-rotate'

/** 自動回転の設定 */
export type AutoRotateConfig = {
  /** y 軸の角速度 (rad/s)。正で反時計回り */
  speed: number
}

/**
 * 自動回転 1 回の起動ごとの上書きパラメータ
 *
 * - dispatch(`useBoxBotActionDispatcher().autoRotate(...)`)時に指定する
 * - 省略したキーは `host.config`(`AUTO_ROTATE_DEFAULTS` ← `actionConfig.autoRotate` 上書き)の値を使う
 * - on への切替時のみ反映。off 側は既に固定した値を使う
 */
export type AutoRotateOverride = Partial<AutoRotateConfig>

/** `host.config`(auto-rotate)の既定値。`actionConfig.autoRotate` で部分上書きできる */
export const AUTO_ROTATE_DEFAULTS: AutoRotateConfig = { speed: 0.6 }
