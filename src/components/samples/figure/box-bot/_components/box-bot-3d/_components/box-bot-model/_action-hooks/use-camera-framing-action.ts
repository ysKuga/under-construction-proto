import { useFrame } from '@react-three/fiber'
import * as React from 'react'
import { PerspectiveCamera } from 'three'

import { approach } from '../../../_lib/approach'
import {
  CAMERA_FALLEN_FOV_OFFSET,
  CAMERA_FOV_APPROACH_RATE,
} from '../index.constants'
import { useBoxBotRefs } from '../index.contexts'

/**
 * 姿勢(posture)に応じた camera.fov の自動調整
 *
 * - 転倒(`postureRef.current !== 0`)時、box-bot 本体が Canvas の表示領域から\
 *   見切れやすくなるため、fov を広げて自動的に収める。呼び出し側(box-bot-3d の\
 *   camera props や Canvas サイズ)を個別に調整せずに済むようにする狙い
 * - 直立時の基準 fov はマウント時点の `camera.fov` を読み取って記憶する。box-bot-3d 側の\
 *   fov props の実値をこの hook 側で知らなくて済むようにするため
 * - `camera` は `useFrame` のコールバック引数(`state.camera`)から取得する。`useThree()`の\
 *   戻り値を直接 mutate すると React Compiler の `react-hooks/immutability` ルールに\
 *   抵触するため
 * - 複数の `BoxBotModel` が同一 Canvas を共有する場合(`OverlapGrid3D` story 等)、\
 *   各インスタンスがカメラを奪い合う懸念がある。現状は 1 Canvas = 1 インスタンスの\
 *   利用を前提とし、この懸念は将来課題として残す
 */
export const useCameraFramingAction = (): void => {
  const { postureRef } = useBoxBotRefs()
  const baseFovRef = React.useRef<null | number>(null)

  useFrame(({ camera }, dt) => {
    if (!(camera instanceof PerspectiveCamera)) return
    if (baseFovRef.current === null) baseFovRef.current = camera.fov

    const targetFov =
      postureRef.current === 0
        ? baseFovRef.current
        : baseFovRef.current + CAMERA_FALLEN_FOV_OFFSET
    const nextFov = approach(
      camera.fov,
      targetFov,
      CAMERA_FOV_APPROACH_RATE,
      dt,
    )
    if (Math.abs(nextFov - camera.fov) < 1e-4) return

    camera.fov = nextFov
    camera.updateProjectionMatrix()
  })
}
