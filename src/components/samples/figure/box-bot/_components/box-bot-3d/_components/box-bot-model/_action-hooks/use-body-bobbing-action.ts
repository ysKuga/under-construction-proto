import { useFrame } from '@react-three/fiber'

import {
  BODY_BOB_HEIGHT,
  LEG_BOB_HEIGHT,
  LEG_SWING_ANGLE,
} from '../index.constants'
import { useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps } from '../index.types'

/**
 * walking/marching 中の body 全体上下(bobbing)
 *
 * - `bodyBobbing` が有効な間、脚の実際の動きから体の高さを計算する。パラメータで\
 *   周期・位相を独立に持つ(=脚と別々に回る sin 波を近似で合わせる)のではなく、\
 *   脚の ref の現在値を毎フレーム読むため常に正確に連動する
 * - marching(脚 bob): 左右脚の `position.y` オフセットのうち最も低い方(最も伸びている方)を\
 *   体の持ち上げ量に変換する
 * - walking(脚 swing): 左右脚の `rotation.x` の余弦(垂直に近いほど大きい)のうち大きい方を\
 *   「支持度」として体の高さに変換する
 * - どちらも歩いていない、または `bodyBobbing` が無効な間は 0 に固定する。脚自体が\
 *   `approach` で base 値へ戻るため、body 側で別途減衰処理は不要
 * - `walkingBobRef` は jump 用の `rootRef` とは別グループのため、jump 中の\
 *   位置制御と衝突しない
 *
 * @param props BoxBotModel に渡される props
 * @param legY 脚グループの base y 座標(付け根)
 */
export const useBodyBobbingAction = (
  props: Pick<BoxBotModelProps, 'bodyBobbing'>,
  legY: number,
): void => {
  const { bodyBobbing } = props

  const { leftLegRef, marchingRef, rightLegRef, walkingBobRef, walkingRef } =
    useBoxBotRefs()

  useFrame(() => {
    if (!walkingBobRef.current || !leftLegRef.current || !rightLegRef.current)
      return

    if (!bodyBobbing || (!walkingRef.current && !marchingRef.current)) {
      walkingBobRef.current.position.y = 0
      return
    }

    if (marchingRef.current) {
      const leftOffset = leftLegRef.current.position.y - legY
      const rightOffset = rightLegRef.current.position.y - legY
      const lift = -Math.min(leftOffset, rightOffset)
      walkingBobRef.current.position.y =
        (lift / LEG_BOB_HEIGHT) * BODY_BOB_HEIGHT
      return
    }

    const minSupport = Math.cos(LEG_SWING_ANGLE)
    const support = Math.max(
      Math.cos(leftLegRef.current.rotation.x),
      Math.cos(rightLegRef.current.rotation.x),
    )
    const normalized = (support - minSupport) / (1 - minSupport)
    walkingBobRef.current.position.y = normalized * BODY_BOB_HEIGHT
  })
}
