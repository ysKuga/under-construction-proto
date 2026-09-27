/** face action の発火イベント名 */
export const ACTION_FACE = 'BoxBot-action-face'

/**
 * face 発火時に渡す向き指定
 *
 * - dispatch(`useBoxBotActionDispatcher().face(...)`)時に必須で渡す
 */
export type FaceOverride = {
  /**
   * 向きを変える所要時間(ms)
   *
   * - 省略時・0 以下は瞬時に切り替える
   */
  durationMs?: number
  /** 向かせる絶対角度(rad)。0 = カメラ正面(world +z) */
  rad: number
}
