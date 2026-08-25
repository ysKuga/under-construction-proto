'use client'

import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import * as React from 'react'

import { BoxBotModel } from './_components/box-bot-model'
import { CastShadow } from './_components/cast-shadow'
import { ContactShadow } from './_components/contact-shadow'
import type { BoxBot3DProps, Vec3 } from './index.types'

export { ACTION_SPIN } from './_components/box-bot-model/index.constants'

/** 外側 div のデフォルト高さ(px)。style で上書き可能 */
const DEFAULT_HEIGHT = 480

/** カメラ位置(world) */
const CAMERA_POSITION: Vec3 = [3.6, 2.2, 5.4]

/** Canvas の devicePixelRatio 範囲 */
const CANVAS_DPR: [number, number] = [1, 2]

/** 環境光の強度 */
const AMBIENT_LIGHT_INTENSITY = 0.85

/** 平行光源の強度 */
const DIRECTIONAL_LIGHT_INTENSITY = 0.7
/** 平行光源の位置(world)の既定値。低い角度にする程、影が長く伸びる */
const DIRECTIONAL_LIGHT_POSITION: Vec3 = [4, 6, 4]
/** 平行光源のシャドウマップ解像度 */
const DIRECTIONAL_LIGHT_SHADOW_MAP_SIZE: [number, number] = [512, 512]

/**
 * hemisphereLight の args
 *
 * - [空の色, 地面の色, 強度]
 */
const HEMISPHERE_LIGHT_ARGS: [string, string, number] = [
  '#ffffff',
  '#d8d8dc',
  0.35,
]

/** 接地面(影の受け皿)の位置(world) */
const GROUND_POSITION: Vec3 = [0, -1.42, 0]
/** 接地影の既定の不透明度 */
const SHADOW_OPACITY = 0.35

/** OrbitControls の最大ズームアウト距離 */
const ORBIT_MAX_DISTANCE = 12
/** OrbitControls の最大ズームイン距離 */
const ORBIT_MIN_DISTANCE = 3.5
/** OrbitControls の注視点(world) */
const ORBIT_TARGET: Vec3 = [
  0,
  // 転倒 (fall) 時に下部に見切れないように、少し上に注視点をずらす
  -0.6, 0,
]

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
  children,
  className,
  fov = 64,
  groundPosition = GROUND_POSITION,
  interactive = true,
  lightPosition = DIRECTIONAL_LIGHT_POSITION,
  orbit = true,
  rotateSpeed,
  shadowOpacity = SHADOW_OPACITY,
  shadowVariant = 'contact',
  style,
  ...cfg
}: BoxBot3DProps) {
  const canvasHoverRef = React.useRef(false)

  return (
    <div
      className={className}
      onPointerEnter={() => {
        canvasHoverRef.current = true
      }}
      onPointerLeave={() => {
        canvasHoverRef.current = false
      }}
      style={{ height: DEFAULT_HEIGHT, width: '100%', ...style }}
    >
      <Canvas
        camera={{ fov, position: CAMERA_POSITION }}
        dpr={CANVAS_DPR}
        gl={{ antialias: true }}
        shadows
        style={{ background }}
      >
        {children}
        <ambientLight intensity={AMBIENT_LIGHT_INTENSITY} />
        <directionalLight
          castShadow
          intensity={DIRECTIONAL_LIGHT_INTENSITY}
          position={lightPosition}
          shadow-mapSize={DIRECTIONAL_LIGHT_SHADOW_MAP_SIZE}
        />
        <hemisphereLight args={HEMISPHERE_LIGHT_ARGS} />
        <BoxBotModel
          autoRotate={autoRotate}
          canvasHoverRef={canvasHoverRef}
          interactive={interactive}
          rotateSpeed={rotateSpeed}
          {...cfg}
        />
        {shadowVariant === 'cast' ? (
          <CastShadow opacity={shadowOpacity} position={groundPosition} />
        ) : (
          <ContactShadow opacity={shadowOpacity} position={groundPosition} />
        )}
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
