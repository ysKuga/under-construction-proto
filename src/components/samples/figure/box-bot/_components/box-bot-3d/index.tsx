'use client'

import { ContactShadows, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { BoxBotModel } from './_components/box-bot-model'
import type { BoxBot3DProps, Vec3 } from './index.types'

/** 外側 div のデフォルト高さ(px)。style で上書き可能 */
const DEFAULT_HEIGHT = 480

/** カメラ位置(world) */
const CAMERA_POSITION: Vec3 = [3.6, 2.2, 5.4]

/** Canvas の devicePixelRatio 範囲 */
const CANVAS_DPR: [number, number] = [1, 2]

const AMBIENT_LIGHT_INTENSITY = 0.85

const DIRECTIONAL_LIGHT_INTENSITY = 0.7
const DIRECTIONAL_LIGHT_POSITION: Vec3 = [4, 6, 4]
const DIRECTIONAL_LIGHT_SHADOW_MAP_SIZE: [number, number] = [1024, 1024]

/** hemisphereLight の args。[空の色, 地面の色, 強度] */
const HEMISPHERE_LIGHT_ARGS: [string, string, number] = [
  '#ffffff',
  '#d8d8dc',
  0.35,
]

const CONTACT_SHADOWS_BLUR = 2.4
const CONTACT_SHADOWS_FAR = 4
const CONTACT_SHADOWS_OPACITY = 0.35
const CONTACT_SHADOWS_POSITION: Vec3 = [0, -1.42, 0]

const ORBIT_MAX_DISTANCE = 12
const ORBIT_MIN_DISTANCE = 3.5
const ORBIT_TARGET: Vec3 = [0, 0.4, 0]

/**
 * BoxBot3D — 手描き風ボックスロボットの 3D 版(react-three-fiber)
 *
 * papercraft 表現に 2 つの手描き技法を適用:
 *   - sketch    : 箱の12辺を細分し頂点を 3D ジッター(手ブレの折れ線)。0 で直線。
 *   - outline   : 反転ハル方式のシルエット縁取り(一回り大きい裏面ソリッド)。
 * 辺は drei <Line>(fat-line)で描くため lineWidth(px)が効く。
 *
 * インタラクション(interactive=true):
 *   - 腕をクリック  … その腕を上げ下げ
 *   - 頭/胴をクリック … ジャンプ(ホップ)
 *
 * 依存: three, @react-three/fiber, @react-three/drei
 *   npm i three @react-three/fiber @react-three/drei
 *   npm i -D @types/three
 *
 * Next.js(App Router)では先頭の "use client" が必須(付与済み)。
 */

export default function BoxBot3D({
  autoRotate = true,
  background = 'transparent',
  className,
  fov = 42,
  interactive = true,
  orbit = true,
  rotateSpeed,
  shadowScale = 8,
  style,
  ...cfg
}: BoxBot3DProps) {
  return (
    <div
      className={className}
      style={{ height: DEFAULT_HEIGHT, width: '100%', ...style }}
    >
      <Canvas
        camera={{ fov, position: CAMERA_POSITION }}
        dpr={CANVAS_DPR}
        gl={{ antialias: true }}
        shadows
        style={{ background }}
      >
        <ambientLight intensity={AMBIENT_LIGHT_INTENSITY} />
        <directionalLight
          castShadow
          intensity={DIRECTIONAL_LIGHT_INTENSITY}
          position={DIRECTIONAL_LIGHT_POSITION}
          shadow-mapSize={DIRECTIONAL_LIGHT_SHADOW_MAP_SIZE}
        />
        <hemisphereLight args={HEMISPHERE_LIGHT_ARGS} />
        <BoxBotModel
          autoRotate={autoRotate}
          interactive={interactive}
          rotateSpeed={rotateSpeed}
          {...cfg}
        />
        <ContactShadows
          blur={CONTACT_SHADOWS_BLUR}
          far={CONTACT_SHADOWS_FAR}
          opacity={CONTACT_SHADOWS_OPACITY}
          position={CONTACT_SHADOWS_POSITION}
          scale={shadowScale}
        />
        {orbit && (
          <OrbitControls
            enablePan={false}
            maxDistance={ORBIT_MAX_DISTANCE}
            minDistance={ORBIT_MIN_DISTANCE}
            target={ORBIT_TARGET}
          />
        )}
      </Canvas>
    </div>
  )
}
