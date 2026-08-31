import { Shadow } from '@react-three/drei'

import type { Vec3 } from '../../index.types'

/** 接地面へ寝かせる回転(world)。plane を水平に */
const FLAT_ROTATION: Vec3 = [-Math.PI / 2, 0, 0]

/** 楕円を body 実寸より少し広げる倍率 */
const MARGIN = 1.08

/** 中心の不透明部分の比率(0 に近いほど中心からすぐぼける) */
const COLOR_STOP = 0.2

/**
 * ContactShadow — body の底面形状に紐づく楕円ボケ影(drei Shadow)
 *
 * - シルエット投影(ContactShadows)ではなく、body の幅 × 奥行に合わせた楕円 1 枚。\
 *   `facing`(bot の向き)ぶん接地面内で回すので、横向きの bot は影も横長に寝る
 * - 転倒で姿勢(前傾)が変わっても形・位置は変えない(接地面に貼り付いたただの影)
 * - fall 中は Canvas ごと DOM シフトされるため画面上は bot に追従する
 */
export function ContactShadow({
  bodyDepth,
  bodyWidth,
  facing,
  opacity,
  position,
}: {
  /** body の奥行(world)。楕円の短径側 */
  bodyDepth: number
  /** body の幅(world)。楕円の長径側 */
  bodyWidth: number
  /** bot の向き(rad)。楕円を接地面内でこのぶん回す */
  facing: number
  /** 影の不透明度 */
  opacity: number
  /** 接地影の中心位置(world) */
  position: Vec3
}) {
  return (
    <group position={position} rotation={[0, facing, 0]}>
      <Shadow
        colorStop={COLOR_STOP}
        opacity={opacity}
        rotation={FLAT_ROTATION}
        scale={[bodyWidth * MARGIN, bodyDepth * MARGIN, 1]}
      />
    </group>
  )
}
