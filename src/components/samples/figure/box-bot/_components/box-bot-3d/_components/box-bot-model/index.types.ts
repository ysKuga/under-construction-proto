import type { ThreeEvent } from '@react-three/fiber'
import type { RefObject } from 'react'
import type { Group } from 'three'

export interface BoxBot3DConfig {
  arm: {
    d: number
    leftAngle: number
    leftLen: number
    rightAngle: number
    rightLen: number
    w: number
  }
  body: { d: number; h: number; w: number }
  eye: { d: number; h: number; offset: number; w: number }
  head: { d: number; h: number; w: number }
  ink: string
  leg: { d: number; gap: number; h: number; w: number }
  /** 辺の太さ(px) */
  lineWidth: number
  /** 反転ハルのシルエット縁取り */
  outline: boolean
  /** 縁取りの太さ(world) */
  outlineWidth: number
  paper: string
  /** ジッターの固定シード */
  seed: number
  /** 手描きジッター振幅(world)。0 = 直線 */
  sketch: number
  /** 分割密度(1あたりの分割数)。大きいほど細かく震える */
  sketchDetail: number
}

export interface BoxBotModelProps extends Partial<BoxBot3DConfig> {
  autoRotate?: boolean
  interactive?: boolean
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
  /** ホバー時のカーソル制御ハンドラ */
  hover: Handlers
  /** インタラクション有効か */
  interactive: boolean
  /** 左腕の回転支点グループ ref */
  leftArm: RefObject<Group | null>
  /** 左腕の目標角度(z 軸)。leftUp 状態に応じた現在の目標値 */
  leftArmAngle: number
  /** 脚の x オフセット */
  legX: number
  /** 脚の y 座標 */
  legY: number
  /** 右腕の回転支点グループ ref */
  rightArm: RefObject<Group | null>
  /** 右腕の目標角度(z 軸)。rightUp 状態に応じた現在の目標値 */
  rightArmAngle: number
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
