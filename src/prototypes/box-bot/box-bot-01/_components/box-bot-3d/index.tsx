'use client'

import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import * as React from 'react'

import { Assembly } from './_components/assembly'
import { BoxBotModel } from './_components/box-bot-model'
import { DEFAULTS } from './_components/box-bot-model/index.constants'
import { CastShadow } from './_components/cast-shadow'
import { ContactShadow } from './_components/contact-shadow'
import type { BoxBot3DProps, Vec3 } from './index.types'

export { ACTION_SPIN } from './_components/box-bot-model/index.constants'

/**
 * Assembly(設置領域)= Canvas(表示領域)のデフォルトの一辺(px)
 *
 * - 表示領域を設置領域と一致させる方針(#108)。`style.height` が数値でない場合のフォールバック
 * - lineWidth の縮小スケール算出の基準値も兼ねる
 */
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
  onClick,
  orbit = true,
  rotateSpeed,
  shadowOpacity = SHADOW_OPACITY,
  shadowVariant = 'contact',
  style,
  ...cfg
}: BoxBot3DProps) {
  /**
   * Assembly(設置領域)= Canvas(表示領域)の一辺(px)
   *
   * - 表示領域を設置領域と一致させる(#108)。`style.height` が数値でなければ DEFAULT_HEIGHT
   */
  const assemblySize =
    typeof style?.height === 'number' ? style.height : DEFAULT_HEIGHT
  /**
   * lineWidth(screen-space px 固定)の縮小スケール
   *
   * - DEFAULT_HEIGHT より縮小した分だけ細くし、拡大時は太らせない
   * - outlineWidth は world 単位(box 自体の物理縁取り)のため対象外。Canvas 縮小に伴い\
   *   スクリーン上の見た目も自然に比例して細くなる
   */
  const lineScale = Math.min(1, assemblySize / DEFAULT_HEIGHT)
  /** ジャンプ時に上下させる表示領域(Canvas ラッパー)の ref */
  const jumpLiftRef = React.useRef<HTMLDivElement>(null)

  return (
    <Assembly
      className={className}
      style={{ ...style, height: assemblySize, width: assemblySize }}
    >
      {/* ジャンプ時に表示領域(Canvas)ごと上下させるラッパー。設置領域(Assembly)は
          動かさず、この div の transform を use-jump-action が直接書き換える(#108) */}
      <div
        ref={jumpLiftRef}
        style={{
          height: '100%',
          left: '50%',
          position: 'absolute',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100%',
        }}
      >
        <Canvas
          camera={{ fov, position: CAMERA_POSITION }}
          dpr={CANVAS_DPR}
          // mousedown 中にポインタを動かすとブラウザがネイティブドラッグ操作(HTML5
          // Drag and Drop)を開始しようとし、canvas は draggable でないため
          // ポインタイベントの配送が乱れる(raycast が反応しなくなる)ことがあった。
          // draggable=false で潜在的なドラッグ対象からも明示的に外す
          draggable={false}
          gl={{ antialias: true }}
          // orbit=false 時は OrbitControls が target への lookAt を行わないため、
          // ここで明示する(orbit=true 時も無害、OrbitControls が毎フレーム上書きする)
          onCreated={(state) => state.camera.lookAt(...ORBIT_TARGET)}
          // dragstart 自体も止め、raycast への実害(ポインタイベント配送の乱れ)を防ぐ。
          // 禁止カーソル等の視覚効果は draggable=false でも残ることがあるが、\
          // 見た目のみで実害は無いため許容する
          onDragStart={(e) => e.preventDefault()}
          // shadows={true} は内部で PCFSoftShadowMap をデフォルト設定するが、
          // three 0.185 で PCFSoftShadowMap は非推奨化され PCFShadowMap へ
          // 強制フォールバックされる(警告発生・見た目は変化なし)。
          // "percentage" 指定で PCFShadowMap を直接使い、非推奨経路を回避する
          shadows="percentage"
          style={
            {
              background,
              height: '100%',
              userSelect: 'none',
              // ベンダープレフィックス付きのため CSSProperties 型に無く、下の as で吸収
              WebkitUserDrag: 'none',
              width: '100%',
            } as React.CSSProperties
          }
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
            interactive={interactive}
            onClick={onClick}
            rotateSpeed={rotateSpeed}
            {...cfg}
            jumpLiftRef={jumpLiftRef}
            lineWidth={cfg.lineWidth ?? DEFAULTS.lineWidth * lineScale}
          />
          {shadowVariant === 'cast' ? (
            <CastShadow opacity={shadowOpacity} position={groundPosition} />
          ) : (
            <ContactShadow opacity={shadowOpacity} position={groundPosition} />
          )}
          {orbit && (
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              maxDistance={ORBIT_MAX_DISTANCE}
              minDistance={ORBIT_MIN_DISTANCE}
              target={ORBIT_TARGET}
            />
          )}
        </Canvas>
      </div>
    </Assembly>
  )
}
