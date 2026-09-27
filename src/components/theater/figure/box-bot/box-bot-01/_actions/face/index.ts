import { defineAction } from '../define-action'

import { ACTION_FACE, type FaceOverride } from './config'
import { useFace } from './use-face'

export * from './config'

/**
 * 向き変更(facing)action
 *
 * - 進行方向へ bot を向かせる用途。既定は指定角度へ瞬時に切り替える\
 *   (`spin` の相対回転とは別、絶対角度指定)
 * - `FaceOverride.durationMs` を指定すると、その時間をかけて回す
 * - 設定(`defaults`)は持たない。dispatch 時の `FaceOverride.rad` が必須
 */
export const faceAction = defineAction<'face', FaceOverride>({
  event: ACTION_FACE,
  name: 'face',
  use: useFace,
})
