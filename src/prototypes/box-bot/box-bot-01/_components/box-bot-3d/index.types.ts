import type { CSSProperties, PropsWithChildren } from 'react'

import type { BoxBotModelProps } from './_components/box-bot-model/index.types'

export interface BoxBot3DProps
  extends Omit<BoxBotModelProps, 'jumpLiftRef'>, PropsWithChildren {
  /** Canvas の背景色 */
  background?: string
  /** ルート要素の className */
  className?: string
  /**
   * カメラの視野角(度)
   *
   * - 省略時は Canvas サイズから自動算出し、サイズが変わっても bot の見かけの大きさを一定に保つ
   * - 表示範囲を意図的に広げ/狭めたい場合のみ明示指定する
   */
  fov?: number
  /**
   * 接地面(影の受け皿)の位置(world)
   *
   * - 省略時 [0, -1.42, 0](bot 直下)
   */
  groundPosition?: Vec3
  /**
   * 平行光源の位置(world)
   *
   * - 影の向き・長さを決める。低い角度(y を小さく)にする程、影が長く伸びる
   * - 省略時 [4, 6, 4]
   */
  lightPosition?: Vec3
  /** マウスドラッグでの回転操作(OrbitControls)を有効にするか */
  orbit?: boolean
  /** 接地影の不透明度。省略時 0.35 */
  shadowOpacity?: number
  /**
   * 接地影の方式
   *
   * - `contact`(既定): 俯瞰ブラー式の疑似影(drei ContactShadows)。ソフトで軽量、光源とは無関係
   * - `cast`: 平行光源によるシャドウマッピング。`lightPosition` で向き・長さを制御できる
   */
  shadowVariant?: 'cast' | 'contact'
  /** ルート要素の style */
  style?: CSSProperties
}

export type Vec3 = [number, number, number]
