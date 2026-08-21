import type { CSSProperties } from 'react'

import type { BoxBotModelProps } from './_components/box-bot-model/index.types'

export interface BoxBot3DProps extends BoxBotModelProps {
  /** Canvas の背景色 */
  background?: string
  /** ルート要素の className */
  className?: string
  /**
   * カメラの視野角(度)
   *
   * - Canvas サイズを変える際、本体の見かけの大きさを保ったまま表示範囲だけ広げたい場合に調整する
   */
  fov?: number
  /** マウスドラッグでの回転操作(OrbitControls)を有効にするか */
  orbit?: boolean
  /**
   * 接地影(ContactShadows)の広がり(world)
   *
   * - 円形クリップ時など見切れを避けたい場合に縮小する
   */
  shadowScale?: number
  /** ルート要素の style */
  style?: CSSProperties
}

export type Vec3 = [number, number, number]
