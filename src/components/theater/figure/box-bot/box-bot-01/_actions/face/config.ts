/** face action の発火イベント名 */
export const ACTION_FACE = 'BoxBot-action-face'

/**
 * face 発火時に渡す向き指定
 *
 * - dispatch(`useBoxBotActionDispatcher().face(...)`)時に必須で渡す
 */
export type FaceOverride = {
  /** 向かせる絶対角度(rad)。0 = カメラ正面(world +z) */
  rad: number
}
