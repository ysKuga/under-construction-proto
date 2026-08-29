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

/**
 * Assembly(設置領域)= Canvas(表示領域)のデフォルトの一辺(px)
 *
 * - 表示領域を設置領域と一致させる方針(#108)。`style.height` が数値でない場合のフォールバック
 * - bot を少しだけ囲うサイズ。余白は最小限にする
 * - lineWidth の縮小スケール算出の基準値も兼ねる
 */
const DEFAULT_HEIGHT = 234

/**
 * bot の見かけの px サイズを較正した基準の組(Canvas 一辺 px / fov 度)
 *
 * - この Canvas サイズ・fov のとき bot(影なし)がちょうど収まる。ここを基準に、\
 *   任意の Canvas サイズでも bot の画面上の大きさが一定になるよう fov を自動算出する
 */
const REFERENCE_HEIGHT = 480
const REFERENCE_FOV = 64

/**
 * bot の見かけの大きさを Canvas サイズに依らず一定に保つための不変量
 *
 * - `assemblySize / tan(fov/2)` を一定にすると、Canvas を縮めても bot の画面上の\
 *   px 高さが変わらない(カメラ位置は動かさず fov だけ絞る)
 */
const VIEW_INVARIANT =
  REFERENCE_HEIGHT / Math.tan((REFERENCE_FOV * Math.PI) / 360)

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
/**
 * OrbitControls の注視点(world)
 *
 * - Canvas を bot ぴったりに縮めたため、直立 bot が Canvas 中央へ来るよう較正した値
 * - fall 時の下部見切れ対策は #108 フェーズ1 で別途
 */
const ORBIT_TARGET: Vec3 = [-0.2, 0.2, 0]

/**
 * BoxBot3D — 手描き風ボックスロボットの 3D 版(react-three-fiber)
 *
 * papercraft 表現に 2 つの手描き技法を適用:
 *   - sketch    : 箱の12辺を細分し頂点を 3D ジッター(手ブレの折れ線)。0 で直線。
 *   - outline   : 反転ハル方式のシルエット縁取り(一回り大きい裏面ソリッド)。
 * 辺は drei <Line>(fat-line)で描くため lineWidth(px)が効く。
 *
 * インタラクション(interactive=true):
 *   - 頭/胴をクリック … ジャンプ
 *
 * 依存: three, @react-three/fiber, @react-three/drei
 *   npm i three @react-three/fiber @react-three/drei
 *   npm i -D @types/three
 *
 * Next.js(App Router)では先頭の "use client" が必須(付与済み)。
 */

export default function BoxBot3D({
  background = 'transparent',
  children,
  className,
  fov: fovProp,
  groundPosition = GROUND_POSITION,
  interactive = true,
  lightPosition = DIRECTIONAL_LIGHT_POSITION,
  onClick,
  orbit = true,
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
   * カメラ視野角(度)
   *
   * - 明示指定なければ assemblySize から自動算出し、Canvas サイズが変わっても\
   *   bot の見かけの px サイズを一定に保つ(`VIEW_INVARIANT`)
   */
  const fov =
    fovProp ?? (Math.atan(assemblySize / VIEW_INVARIANT) * 360) / Math.PI
  /**
   * lineWidth(screen-space px 固定)の縮小スケール
   *
   * - DEFAULT_HEIGHT より縮小した分だけ細くし、拡大時は太らせない
   * - outlineWidth は world 単位(box 自体の物理縁取り)のため対象外。Canvas 縮小に伴い\
   *   スクリーン上の見た目も自然に比例して細くなる
   */
  const lineScale = Math.min(1, assemblySize / DEFAULT_HEIGHT)
  /**
   * 表示領域(Canvas ラッパー)の ref
   *
   * - Canvas 内のアクションへ橋渡しする。jump がこの要素の `top` を書き換えて縦移動する
   */
  const displayAreaRef = React.useRef<HTMLDivElement>(null)

  return (
    <Assembly
      className={className}
      style={{ ...style, height: assemblySize, width: assemblySize }}
    >
      {/* 表示領域(Canvas)ラッパー。設置領域(Assembly)は動かさず、jump が
          この div の top を書き換えて縦移動する(#108)。transform は中央寄せ専用に固定 */}
      <div
        ref={displayAreaRef}
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
            interactive={interactive}
            onClick={onClick}
            {...cfg}
            displayAreaRef={displayAreaRef}
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
