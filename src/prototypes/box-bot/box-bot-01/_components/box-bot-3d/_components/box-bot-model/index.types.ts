import type { ThreeEvent } from '@react-three/fiber'
import type { RefObject } from 'react'
import type { Group } from 'three'

import type { JumpConfig } from './_actions/jump/config'

export type { JumpConfig, JumpOverride } from './_actions/jump/config'

export interface BoxBot3DConfig {
  /** 腕の設定 */
  arm: {
    /** 奥行き */
    d: number
    /**
     * 左腕の角度(z 軸回転)
     *
     * - leftUp = false(下げ)時の値
     */
    leftAngle: number
    /** 左腕の長さ */
    leftLen: number
    /**
     * 右腕の角度(z 軸回転)
     *
     * - rightUp = true(上げ)時の値
     */
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
  /** ジャンプの設定。型・既定値は `_actions/jump` が持つ */
  jump: JumpConfig
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

export interface BoxBotModelProps extends Partial<BoxBot3DConfig> {
  /**
   * 要素クリック → 発火する action イベント名の対応
   *
   * - bot は要素押下で `CLICK_BODY` / `CLICK_HEAD` を発行するだけ。この対応表が\
   *   それをどの action イベントへ変換するかを決める
   * - 省略キーは既定(`DEFAULT_CLICK_BINDINGS`、body/head とも jump)。\
   *   値に `undefined` を渡すとその要素は何も起こさない
   */
  clickBindings?: ClickBindings
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
  /** 全体グループ。jump の squash(scale)対象。JSX で `<group ref>` にバインドする */
  rootRef: RefObject<Group | null>
}

/** 要素クリック → 発火する action イベント名の対応。省略キーは既定のまま */
export type ClickBindings = Partial<Record<ClickTarget, string>>

/** クリック可能な bot 要素 */
export type ClickTarget = 'body' | 'head'

export type Handlers = {
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void
}

export interface UseBoxBotModelReturn extends Pick<BoxBotRefs, 'rootRef'> {
  /** マージ後の設定値 */
  cfg: BoxBot3DConfig
  /** body 押下で `CLICK_BODY` を発行(紐づく action は `clickBindings` 側で決まる) */
  clickBody: (e: ThreeEvent<PointerEvent>) => void
  /** head 押下で `CLICK_HEAD` を発行(紐づく action は `clickBindings` 側で決まる) */
  clickHead: (e: ThreeEvent<PointerEvent>) => void
  /** 頭の前面 z 座標 */
  headFront: number
  /** 頭の中心 y 座標 */
  headY: number
  /** ホバー時のカーソル制御ハンドラ */
  hover: Handlers
  /** インタラクション有効か */
  interactive: boolean
  /** 脚の x オフセット */
  legX: number
  /** 脚グループの付け根 y 座標 */
  legY: number
  /** body/head クリック確定で発火するコールバック(props.onClick そのまま) */
  onClick?: () => void
  /** 初期 y 軸回転(ラジアン) */
  rotationY: number
  /** 肩の x オフセット */
  shoulderX: number
  /** 肩の y 座標 */
  shoulderY: number
}
