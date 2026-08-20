import type { CSSProperties } from 'react'

export interface BoxBotConfig {
  animate: boolean
  arms: { left: Pt[]; right: Pt[] }
  body: { h: number; w: number; x: number; y: number }
  color: string
  /** 1ストロークあたりの描画秒数 */
  drawDuration: number
  /** 目は縦線。lx/rx = 中心 x、y = 中心 y、len = 縦線の長さ */
  eyes: { len: number; lx: number; rx: number; y: number }
  head: { h: number; w: number; x: number; y: number }
  legs: { len: number; lx: number; rx: number; y: number }
  mouth: { x1: number; x2: number; y: number }
  /** ジッター密度(長さ1あたりの分割点数)。大きいほど細かく震える */
  roughness: number
  /** 揺らぎパターンの固定シード */
  seed: number
  strokeWidth: number
  /** 法線方向のジッター振幅(viewBox 単位)。0 = 直線 */
  wobble: number
}

export interface BoxBotProps extends Partial<BoxBotConfig> {
  className?: string
  height?: number | string
  style?: CSSProperties
  viewBox?: string
  width?: number | string
}

export type Pt = [number, number]
