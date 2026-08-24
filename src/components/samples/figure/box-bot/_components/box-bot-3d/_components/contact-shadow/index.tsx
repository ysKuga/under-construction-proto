import { ContactShadows } from '@react-three/drei'

import type { Vec3 } from '../../index.types'

/** 接地影のぼかし量 */
const BLUR = 2.4
/** 接地影の減衰距離(world) */
const FAR = 4
/** 接地影の広がり(world) */
const SCALE = 8

/**
 * ContactShadow — 俯瞰ブラー式の疑似接地影(drei ContactShadows)
 *
 * - 光源とは無関係、本体シルエットを真上から撮影しぼかすだけの軽量な影
 * - 対称に広がるため、遠い側は本体に隠れほぼ見えない(伸ばす演出には不向き)
 */
export function ContactShadow({
  opacity,
  position,
}: {
  /** 影の不透明度 */
  opacity: number
  /** 接地影の中心位置(world) */
  position: Vec3
}) {
  return (
    <ContactShadows
      blur={BLUR}
      far={FAR}
      opacity={opacity}
      position={position}
      scale={SCALE}
    />
  )
}
