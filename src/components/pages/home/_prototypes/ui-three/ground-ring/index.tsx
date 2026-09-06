'use client'

import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'

/** リング外周半径(world 単位)。ui/ring の RING_RADIUS と同じ目視調整値 */
const OUTER_RADIUS = 2.4

/** リング内周半径(world 単位)。外周よりやや小さく、細い輪状にする */
const INNER_RADIUS = 2.2

/** リングの高さ(world y 座標)。box-bot の接地面(GROUND_POSITION.y = -1.42)付近 */
const RING_Y = -1.42

/**
 * カメラ位置(world)。`BoxBot3D` の CAMERA_POSITION と一致させる
 *
 * - TODO: BoxBot3D と共有モジュール化。現状は直書きで `withBot` decorator(canvasHeight=640)前提に固定
 */
const CAMERA_POSITION: [number, number, number] = [3.6, 2.2, 5.4]

/** カメラ注視点(world)。`BoxBot3D` の ORBIT_TARGET と一致させる */
const CAMERA_TARGET: [number, number, number] = [0, -0.6, 0]

/** カメラ視野角(度)。`BoxBot3D` の effectiveFov(fov=64、canvasHeightPx/heightPx=640/480)相当 */
const CAMERA_FOV = 79.6

/** Canvas 高さ(px)。`BoxBot3D` の canvasHeightPx(canvasHeight=640)と一致 */
const CANVAS_HEIGHT = 640

/** Canvas 幅(px)。`BoxBot3D` の canvasWidth 省略時の値(heightPx=480)と一致 */
const CANVAS_WIDTH = 480

/** Canvas を表示領域中央から下方向へずらすオフセット(px)。`BoxBot3D` の verticalOffsetPx と一致 */
const VERTICAL_OFFSET = 55

/**
 * GroundRing — bot 足元を囲む平面リング(独立 Canvas)
 *
 * - `BoxBot` の `children` へ渡さず、専用 `<Canvas>` を透過オーバーレイする独立コンポーネント
 * - カメラを `BoxBot3D` に合わせるため、bot と同じ位置・見えでリングが描かれる
 * - bot 本体・bot 側 OrbitControls とは無関係。bot が回転してもカメラ操作されてもリングは動かない
 * - 地面と水平にするため x 軸周りに -90 度回転する
 */
export const GroundRing = () => {
  return (
    <Canvas
      camera={{ fov: CAMERA_FOV, position: CAMERA_POSITION }}
      onCreated={(state) => state.camera.lookAt(...CAMERA_TARGET)}
      style={{
        height: CANVAS_HEIGHT,
        left: '50%',
        pointerEvents: 'none',
        position: 'absolute',
        top: '50%',
        transform: `translate(-50%, calc(-50% + ${VERTICAL_OFFSET}px))`,
        width: CANVAS_WIDTH,
      }}
    >
      <mesh position={[0, RING_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[INNER_RADIUS, OUTER_RADIUS, 64]} />
        <meshBasicMaterial color="white" side={THREE.DoubleSide} />
      </mesh>
    </Canvas>
  )
}
