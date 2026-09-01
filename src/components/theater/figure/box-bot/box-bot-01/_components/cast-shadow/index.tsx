import type { RefObject } from 'react'
import type { Group } from 'three'

import type { Vec3 } from '../../index.types'

/** 接地面の回転(world)。水平に寝かせる */
const GROUND_ROTATION: Vec3 = [-Math.PI / 2, 0, 0]
/** 接地面の一辺の大きさ(world)。影が伸びても見切れないよう大きめに確保 */
const GROUND_SIZE = 40

/**
 * CastShadow — 平行光源による実影(シャドウマッピング)の受け皿
 *
 * - 地面 mesh(`receiveShadow`)へ本体側(`castShadow`)の影を落とす
 * - 光源位置に応じて影の向き・長さが変わる。低い角度の光源程、影が長く伸びる
 * - 転倒(fall)中は `liftRef` の group を fall が `position.y` で持ち上げ、\
 *   中心 pivot で浮いた体へ投影影を寄せる(直立時は 0)。画面追従は Canvas ごとの\
 *   DOM シフトで別途効いている
 */
export function CastShadow({
  liftRef,
  opacity,
  position,
}: {
  /** fall が `position.y` を持ち上げるグループの ref */
  liftRef?: RefObject<Group | null>
  /** 影の不透明度 */
  opacity: number
  /** 接地面(影の受け皿)の位置(world) */
  position: Vec3
}) {
  return (
    <group position={position}>
      <group ref={liftRef}>
        <mesh receiveShadow rotation={GROUND_ROTATION}>
          <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
          <shadowMaterial opacity={opacity} />
        </mesh>
      </group>
    </group>
  )
}
