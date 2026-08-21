import type { ThreeEvent } from '@react-three/fiber'
import type { RefObject } from 'react'
import type { Group } from 'three'

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
   * action イベント発行/購読に使う EventTarget
   *
   * - 省略時は instance 固有のものを内部生成
   */
  eventTarget?: EventTarget
  /** クリック操作(腕上げ下げ・ホップ)を有効にするか */
  interactive?: boolean
  /** 自動回転の速度 */
  rotateSpeed?: number
}

export type Handlers = {
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void
}

export interface UseBoxBotModelReturn {
  /** マージ後の設定値 */
  cfg: BoxBot3DConfig
  /** 頭の前面 z 座標 */
  headFront: number
  /** 頭の中心 y 座標 */
  headY: number
  /**
   * ホップ(ジャンプ)進行度の ref
   *
   * - -1: 非ジャンプ中、0以上: 経過秒数
   */
  hop: RefObject<number>
  /** ホバー時のカーソル制御ハンドラ */
  hover: Handlers
  /** インタラクション有効か */
  interactive: boolean
  /** 左腕の回転支点グループ ref */
  leftArm: RefObject<Group | null>
  /** 脚の x オフセット */
  legX: number
  /** 脚の y 座標 */
  legY: number
  /** 右腕の回転支点グループ ref */
  rightArm: RefObject<Group | null>
  /** 全体のホップ・スケール制御グループ ref */
  root: RefObject<Group | null>
  /** 肩の x オフセット */
  shoulderX: number
  /** 肩の y 座標 */
  shoulderY: number
  /** 自動回転グループ ref */
  spin: RefObject<Group | null>
  /** 腕/頭/胴クリックでホップ開始 */
  startHop: (e: ThreeEvent<MouseEvent>) => void
  /** 左腕クリックで上げ下げ切替 */
  toggleLeft: (e: ThreeEvent<MouseEvent>) => void
  /** 右腕クリックで上げ下げ切替 */
  toggleRight: (e: ThreeEvent<MouseEvent>) => void
}
