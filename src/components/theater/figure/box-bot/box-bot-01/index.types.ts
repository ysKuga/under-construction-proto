import type { CSSProperties, PropsWithChildren } from 'react'

import { BOX_BOT_ACTIONS } from './_actions'
import type { AnyBoxBotAction, BoxBotActionConfigs } from './_actions/types'
import type {
  BoxBotModelProps,
  ClickBindings,
} from './_components/box-bot-model/index.types'

export interface BoxBot3DProps
  extends
    Omit<
      BoxBotModelProps,
      'actionConfig' | 'actions' | 'clickBindings' | 'displayAreaRef'
    >,
    PropsWithChildren {
  /**
   * per-action 設定の上書き
   *
   * - キー = アクション名、値 = そのアクションの設定の部分指定
   * - 既定の `BOX_BOT_ACTIONS` から型が導出される。例: `{ jump: { liftPx: 200 } }`
   */
  actionConfig?: {
    [K in keyof BoxBotActionConfigs<typeof BOX_BOT_ACTIONS>]?: Partial<
      BoxBotActionConfigs<typeof BOX_BOT_ACTIONS>[K]
    >
  }
  /**
   * bot が実行するアクション一覧
   *
   * - 省略時は既定の `BOX_BOT_ACTIONS`。`BoxBot3D` が Context 化して内部へ配る
   */
  actions?: readonly AnyBoxBotAction[]
  /** Canvas の背景色 */
  background?: string
  /**
   * 表示領域(Canvas ラッパー)の高さ。px 数値のみ
   *
   * - 省略時は設置領域と一致(正方形)。#108 の「表示領域 = 設置領域」原則の既定
   * - 明示すると設置領域を縦へ逸脱して Canvas を広げる。縦画角(fov)は Canvas 高さに
   *   依存しないため、拡大率ぶん fov を広げて bot の見かけの大きさ・位置は不変に保つ
   * - CSS 文字列は実 px が不定で fov 補正できないため不可(`canvasWidth` と異なり数値限定)
   * - 拡大表示でジャンプしても頭が Canvas 外へ切れないよう、縦の可動域を増やす用途
   */
  canvasHeight?: number
  /**
   * 表示領域(Canvas ラッパー)の幅。CSS 長さ or px 数値
   *
   * - 省略時は設置領域と一致(正方形)。#108 の「表示領域 = 設置領域」原則の既定
   * - 明示すると設置領域を横へ逸脱して Canvas を広げる。高さ・fov は変えないため
   *   bot の見かけの大きさは不変で、左右に見える範囲(余白)だけ増える
   * - 隣接要素と衝突しない文脈(トップページのヒーロー等)向けの opt-in。\
   *   `100vw` 等を渡す場合、横スクロール防止のため祖先で `overflow-x` をクリップする
   */
  canvasWidth?: number | string
  /** ルート要素の className */
  className?: string
  /**
   * 要素クリック → 発火する action イベント名の上書き
   *
   * - 省略キーは既定(`DEFAULT_CLICK_BINDINGS`)。`BoxBot3D` がマージして Context 化する
   */
  clickBindings?: ClickBindings
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
