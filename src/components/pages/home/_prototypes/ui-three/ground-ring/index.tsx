'use client'

import * as THREE from 'three'

/** リング外周半径(world 単位)。action-ring の RING_RADIUS と同じ目視調整値 */
const OUTER_RADIUS = 2.4

/** リング内周半径(world 単位)。外周よりやや小さく、細い輪状にする */
const INNER_RADIUS = 2.2

/** リングの高さ(world y 座標)。box-bot の接地面(GROUND_POSITION.y = -1.42)付近 */
const RING_Y = -1.42

/**
 * GroundRing — bot 足元を囲む平面リングメッシュ
 *
 * - r3f Canvas 内でのみ使用可能。`BoxBot` の `children` として渡す(呼び出し側の例: `index.stories.tsx`)
 * - 地面と水平にするため x 軸周りに -90度回転する
 */
export const GroundRing = () => {
  return (
    <mesh position={[0, RING_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[INNER_RADIUS, OUTER_RADIUS, 64]} />
      <meshBasicMaterial color="white" side={THREE.DoubleSide} />
    </mesh>
  )
}
