'use client'

import * as THREE from 'three'

/** リング外周半径(world 単位)。ground-ring と同じ目視調整値 */
const OUTER_RADIUS = 2.4

/** リング内周半径(world 単位)。外周よりやや小さく、細い輪状にする */
const INNER_RADIUS = 2.2

/** リング中心の高さ(world y 座標)。box-bot の接地面(GROUND_POSITION.y = -1.42)付近 */
const RING_Y = -1.42

type TiltRingProps = {
  /** 地面水平からの傾き(度)。0 = 水平、90 = 垂直 */
  tiltDeg?: number
  /** Y 軸まわりの向き(度)。傾ける軸の方向を回す */
  yawDeg?: number
}

/**
 * TiltRing — 傾き可変・bot 姿勢に非追随のリングメッシュ
 *
 * - r3f Canvas 内でのみ使用可能。`BoxBot` の `children` として渡す(呼び出し側の例: `index.stories.tsx`)
 * - `ground-ring` と異なり、水平からの傾き(`tiltDeg`)と向き(`yawDeg`)を props で調整できる
 * - world 座標へ固定配置。bot の spin/auto-rotate/fall には追随しない
 */
export const TiltRing = ({ tiltDeg = 0, yawDeg = 0 }: TiltRingProps) => {
  const tilt = THREE.MathUtils.degToRad(tiltDeg)
  const yaw = THREE.MathUtils.degToRad(yawDeg)

  return (
    <group position={[0, RING_Y, 0]} rotation={[0, yaw, 0]}>
      <mesh rotation={[-Math.PI / 2 + tilt, 0, 0]}>
        <ringGeometry args={[INNER_RADIUS, OUTER_RADIUS, 64]} />
        <meshBasicMaterial color="white" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
