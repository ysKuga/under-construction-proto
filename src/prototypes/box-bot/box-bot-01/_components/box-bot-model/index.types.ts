import type { ThreeEvent } from '@react-three/fiber'
import type { RefObject } from 'react'
import type { Group } from 'three'

import type {
  ActionConfigOverrides,
  AnyBoxBotAction,
} from '../../_actions/types'

export interface BoxBot3DConfig {
  /** 腕の設定 */
  arm: {
    /** 奥行き */
    d: number
    /** 左腕の傾き(肩を支点にした z 軸回転、rad)。0 = 下げ */
    leftAngle: number
    /** 左腕の長さ */
    leftLen: number
    /** 右腕の傾き(肩を支点にした z 軸回転、rad)。0 = 下げ */
    rightAngle: number
    /** 右腕の長さ */
    rightLen: number
    /** 幅 */
    w: number
  }
  /** 胴体の設定 */
  body: {
    /** 奥行き */
    d: number
    /** 高さ */
    h: number
    /** 幅 */
    w: number
  }
  /** 目の設定 */
  eye: {
    /** 奥行き */
    d: number
    /** 高さ */
    h: number
    /** 中心からの左右オフセット */
    offset: number
    /** 幅 */
    w: number
  }
  /** 頭の設定 */
  head: {
    /** 奥行き */
    d: number
    /** 高さ */
    h: number
    /** 幅 */
    w: number
  }
  /** 線(輪郭・目・口)の色 */
  ink: string
  /** 脚の設定 */
  leg: {
    /** 奥行き */
    d: number
    /** 左右の脚の間隔比率(胴幅に対する倍率) */
    gap: number
    /** 高さ */
    h: number
    /** 幅 */
    w: number
  }
  /** 辺の太さ(px) */
  lineWidth: number
  /** 反転ハルのシルエット縁取り */
  outline: boolean
  /** 縁取りの太さ(world) */
  outlineWidth: number
  /** 箱本体(紙面)の色 */
  paper: string
  /** ジッターの固定シード */
  seed: number
  /**
   * 手描きジッター振幅(world)
   *
   * - 0 = 直線
   */
  sketch: number
  /**
   * 分割密度(1あたりの分割数)
   *
   * - 大きいほど細かく震える
   */
  sketchDetail: number
}

/**
 * 部位の配置アンカー
 *
 * - `cfg` から導出した派生座標。raw 寸法(`cfg.body.w` 等)ではない
 * - 2 階層固定 `layout.<部位>.<軸 | 意味>`
 */
export interface BoxBotLayout {
  /** 接地点 */
  ground: {
    /** 脚下端の y 座標(足元。fall の回転 pivot になる) */
    y: number
  }
  /** 頭 */
  head: {
    /** 前面 z 座標(目・口を浮かせる面) */
    front: number
    /** 中心 y 座標 */
    y: number
  }
  /** 脚 */
  leg: {
    /** 中心からの x オフセット */
    x: number
    /** 脚グループの付け根 y 座標 */
    y: number
  }
  /** 肩(腕の付け根) */
  shoulder: {
    /** 中心からの x オフセット */
    x: number
    /** y 座標 */
    y: number
  }
}

export interface BoxBotModelProps extends Partial<BoxBot3DConfig> {
  /**
   * per-action 設定の外部上書き
   *
   * - キー = アクション名。`BoxBot3D`(外殻)が厳密型(`BoxBotActionConfigs`)で受け、\
   *   ここへは緩い形で渡す。`defineAction` のラッパーが各アクションの `defaults` と\
   *   マージして `ctx.config` にする
   */
  actionConfig?: ActionConfigOverrides
  /**
   * このモデルが実行するアクション一覧
   *
   * - `BoxBot3D`(外殻)が解決して注入する。`box-bot-model` 内部は Context 経由で参照する
   */
  actions: readonly AnyBoxBotAction[]
  /**
   * 要素クリック → 発火する action イベント名の解決済み対応表
   *
   * - bot は要素押下で `ON_CLICK_ELEMENT`(`detail` に押下要素)を発行するだけ。この対応表が\
   *   それをどの action イベントへ変換するかを決める
   * - `BoxBot3D` が既定(`DEFAULT_CLICK_BINDINGS`)へ prop 上書きをマージして注入する
   */
  clickBindings: ClickBindings
  /**
   * 表示領域(Canvas ラッパー)の DOM ref
   *
   * - `BoxBot3D`(bot の外殻)が生成し、Canvas 内のアクションへ橋渡しする\
   *   (Context は r3f Canvas 境界を越えないため props 配線)
   * - jump は縦移動をこの要素の `top` 書き換えで行い、設置領域を上方向へ逸脱させて\
   *   可動域を確保する(#108)。bot 本体はこの ref の用途を知らない
   */
  displayAreaRef?: RefObject<HTMLDivElement | null>
  /**
   * action イベント発行/購読に使う EventTarget
   *
   * - 省略時は instance 固有のものを内部生成
   */
  eventTarget?: EventTarget
  /** クリック操作を有効にするか(無効時は要素クリックを発行しない) */
  interactive?: boolean
  /**
   * body/head クリック確定で発火するコールバック
   *
   * - r3f 標準の click(pointerdown/pointerup が同一要素上で完結した場合のみ発火)を使うため、\
   *   bot 外へドラッグして離した場合は発火しない(通常の a要素のクリックと同じセマンティクス)
   */
  onClick?: () => void
  /** 初期 y 軸回転(ラジアン、既定: 0) */
  rotationY?: number
}

/** bot 本体で共有する ref 群 */
export interface BoxBotRefs {
  /**
   * fall が体心を軸に前傾させるグループ
   *
   * - fall がここへ `rotation.x` を入れる。`rootRef` の内側、bot 全体を包む。\
   *   足元が前方へ出た「倒れ込み」の見た目は表示領域の DOM ずらしで合わせる(#108)。\
   *   JSX で `<group ref>` にバインド
   */
  fallPivotRef: RefObject<Group | null>
  /** 左腕グループ。fall が `rotation.x` を入れて頭側へ引き寄せる。JSX で `<group ref>` にバインド */
  leftArmRef: RefObject<Group | null>
  /** 右腕グループ。fall が `rotation.x` を入れて頭側へ引き寄せる。JSX で `<group ref>` にバインド */
  rightArmRef: RefObject<Group | null>
  /** 全体グループ。jump の squash(scale)対象。JSX で `<group ref>` にバインドする */
  rootRef: RefObject<Group | null>
  /**
   * y 軸回転を増分で累積するグループ
   *
   * - `rotation.y` を `+=` で足す対象。spin / autoRotate 等 複数 action が相乗りする
   * - `rootRef` を包む外側グループ。JSX で `<group ref>` にバインドする。\
   *   回転 prop を持たせないことで、再レンダー時に累積回転が巻き戻らないようにする
   */
  yawRef: RefObject<Group | null>
}

/** 要素クリック → 発火する action イベント名の対応。省略キーは既定のまま */
export type ClickBindings = Partial<Record<ClickTarget, string>>

/** `ON_CLICK_ELEMENT` の `detail`。押下された bot 要素を運ぶ */
export type ClickElementDetail = {
  /** 押下された要素 */
  target: ClickTarget
}

/** クリック可能な bot 要素 */
export type ClickTarget = 'body' | 'head'

export type Handlers = {
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void
}

export interface UseBoxBotModelReturn extends Pick<
  BoxBotRefs,
  'fallPivotRef' | 'leftArmRef' | 'rightArmRef' | 'rootRef' | 'yawRef'
> {
  /** マージ後の設定値 */
  cfg: BoxBot3DConfig
  /**
   * 要素の押下 → その要素を `detail` に載せた `ON_CLICK_ELEMENT` を発行するハンドラを作る
   *
   * - 例: `createClickEmitter('body')` を body 要素の `onPointerDown` に渡す。\
   *   どの要素かは呼び出し側(部位を定義する JSX)が決める。\
   *   発行された要素イベントを action へ繋ぐのは `clickBindings`
   */
  createClickEmitter: (
    target: ClickTarget,
  ) => (e: ThreeEvent<PointerEvent>) => void
  /** ホバー時のカーソル制御ハンドラ */
  hover: Handlers
  /** インタラクション有効か */
  interactive: boolean
  /**
   * 部位の配置アンカー(`cfg` からの派生座標)
   *
   * - アクセスは `layout.head.y` / `layout.leg.x` の形
   */
  layout: BoxBotLayout
  /** body/head クリック確定で発火するコールバック(props.onClick そのまま) */
  onClick?: () => void
  /** 初期 y 軸回転(ラジアン) */
  rotationY: number
}
