'use client'

import { ContactShadows, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'

import { BoxBotModel } from './_components/box-bot-model'
import type { BoxBot3DProps } from './index.types'

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
  fov = 34,
  interactive = true,
  orbit = true,
  rotateSpeed,
  shadowScale = 8,
  style,
  ...cfg
}: BoxBot3DProps) {
  return (
    <div className={className} style={{ height: 480, width: '100%', ...style }}>
      <Canvas
        camera={{ fov, position: [3.6, 2.2, 5.4] }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        shadows
        style={{ background }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight
          castShadow
          intensity={0.7}
          position={[4, 6, 4]}
          shadow-mapSize={[1024, 1024]}
        />
        <hemisphereLight args={['#ffffff', '#d8d8dc', 0.35]} />
        <BoxBotModel
          autoRotate={autoRotate}
          interactive={interactive}
          rotateSpeed={rotateSpeed}
          {...cfg}
        />
        <ContactShadows
          blur={2.4}
          far={4}
          opacity={0.35}
          position={[0, -1.42, 0]}
          scale={shadowScale}
        />
        {orbit && (
          <OrbitControls
            enablePan={false}
            maxDistance={12}
            minDistance={3.5}
            target={[0, 0.4, 0]}
          />
        )}
      </Canvas>
    </div>
  )
}
