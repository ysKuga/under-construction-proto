import { useFrame } from '@react-three/fiber'

import { useBoxBotRefs } from '../index.contexts'
import type { BoxBotModelProps } from '../index.types'

/**
 * 自動回転
 *
 * - `autoRotate` が有効な間、`spinRef` を毎フレーム y 軸回転させる
 *
 * @param props BoxBotModel に渡される props
 */
export const useAutoRotateAction = (
  props: Pick<BoxBotModelProps, 'autoRotate' | 'rotateSpeed'>,
): void => {
  const { autoRotate = false, rotateSpeed = 0 } = props

  const { spinRef } = useBoxBotRefs()

  useFrame((_, dt) => {
    if (autoRotate && spinRef.current)
      spinRef.current.rotation.y += rotateSpeed * dt
  })
}
