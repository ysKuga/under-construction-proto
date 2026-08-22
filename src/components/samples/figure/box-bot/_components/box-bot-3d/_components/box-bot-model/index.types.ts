import type { ThreeEvent } from '@react-three/fiber'
import type { RefObject } from 'react'
import type { Group } from 'three'

export interface ArmSideState {
  /** クリックで切替(現状は上げ下げ toggle のみ) */
  toggle: (e: ThreeEvent<MouseEvent>) => void
  /** 上がっているか */
  up: boolean
}

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
  /** 自動回転の有無 */
  autoRotate?: boolean
  /**
   * body 全体の上下(bobbing)を有効にするか
   *
   * - walking(脚 swing)・marching(脚 bob)いずれかの実際の動きから高さを計算する。\
   *   どちらも歩いていない間は連動する脚の動きがないため無効
   */
  bodyBobbing?: boolean
  /**
   * action イベント発行/購読に使う EventTarget
   *
   * - 省略時は instance 固有のものを内部生成
   */
  eventTarget?: EventTarget
  /** クリック操作(腕上げ下げ・ホップ)を有効にするか */
  interactive?: boolean
  /** 脚アニメーション(walking/marching 共通)の周期(秒) */
  legCycle?: number
  /** 自動回転の速度 */
  rotateSpeed?: number
}

/** BoxBotRefsProvider が配布する ref 群 */
export interface BoxBotRefs {
  /**
   * ジャンプ進行度の ref
   *
   * - -1: 非ジャンプ中、0以上: 経過秒数
   */
  jumpRef: RefObject<number>
  /** 左腕の回転支点グループ ref */
  leftArmRef: RefObject<Group | null>
  /** 左脚のグループ ref */
  leftLegRef: RefObject<Group | null>
  /** 足踏みしている状態か(見た目の挙動は含まない)の ref */
  marchingRef: RefObject<boolean>
  /** 右腕の回転支点グループ ref */
  rightArmRef: RefObject<Group | null>
  /** 右脚のグループ ref */
  rightLegRef: RefObject<Group | null>
  /** 全体のジャンプ・スケール制御グループ ref */
  rootRef: RefObject<Group | null>
  /** 自動回転グループ ref */
  spinRef: RefObject<Group | null>
  /** 歩行中の body 全体上下(bobbing)制御グループ ref */
  walkingBobRef: RefObject<Group | null>
  /** 歩いている状態か(見た目の挙動は含まない)の ref */
  walkingRef: RefObject<boolean>
}

export type Handlers = {
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void
}

/** `useBoxBotActionDispatcher` の戻り値 */
export interface UseBoxBotActionDispatcherReturn {
  /** 左腕上げ下げ action を発火する */
  armLeftToggle: () => Promise<void>
  /** 右腕上げ下げ action を発火する */
  armRightToggle: () => Promise<void>
  /** ジャンプ action を発火する */
  jump: () => Promise<void>
  /** 足踏みしている状態(marching)の toggle action を発火する */
  marchingToggle: () => Promise<void>
  /** 歩いている状態(walking)の toggle action を発火する */
  walkingToggle: () => Promise<void>
}

export interface UseBoxBotModelReturn extends Pick<
  BoxBotRefs,
  | 'jumpRef'
  | 'leftArmRef'
  | 'leftLegRef'
  | 'marchingRef'
  | 'rightArmRef'
  | 'rightLegRef'
  | 'rootRef'
  | 'spinRef'
  | 'walkingBobRef'
  | 'walkingRef'
> {
  /** 左右の腕の状態・操作 */
  arm: {
    /** 左腕 */
    left: ArmSideState
    /** 右腕 */
    right: ArmSideState
  }
  /** マージ後の設定値 */
  cfg: BoxBot3DConfig
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
  /** 肩の x オフセット */
  shoulderX: number
  /** 肩の y 座標 */
  shoulderY: number
  /** 腕/頭/胴クリックでジャンプ開始 */
  startJump: (e: ThreeEvent<MouseEvent>) => void
}
