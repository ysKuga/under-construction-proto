import type { CSSProperties, PropsWithChildren } from 'react'

import type { BoxBotModelProps } from './_components/box-bot-model/index.types'

export interface BoxBot3DProps extends BoxBotModelProps, PropsWithChildren {
  /** Canvas の背景色 */
  background?: string
  /**
   * Canvas の高さ。px 数値のみ
   *
   * - 省略時は既定算出(`assemblySize / BODY_HEIGHT_RATIO`)。明示すると高さだけ広がる
   * - fov は縦画角で Canvas 高さに依存しないため、そのままでは bot が大きく見える。\
   *   拡大率ぶん fov を広げ、bot の見かけの大きさ・縦位置は不変に保つ
   * - CSS 文字列(`%`/`vh` 等)は実 px が不定で fov 補正できないため不可(`canvasWidth` と異なり数値限定)
   * - 用途: トップページで拡大(OrbitControls ズームイン)してジャンプしても\
   *   頭が Canvas 外へ切れないよう、縦の可動域を増やす
   */
  canvasHeight?: number
  /**
   * Canvas の幅。CSS 長さ or px 数値
   *
   * - 省略時は高さと同じ(正方形)。明示すると幅だけ広がる
   * - 高さ・fov は変えないため bot の見かけの大きさは不変で、左右に見える範囲だけ増える
   * - `100vw` 等を渡す場合、横スクロール防止のため祖先で `overflow-x` をクリップする
   */
  canvasWidth?: number | string
  /** ルート要素の className */
  className?: string
  /**
   * カメラの視野角(度)
   *
   * - Canvas サイズを変える際、本体の見かけの大きさを保ったまま表示範囲だけ広げたい場合に調整する
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
