import { CSSProperties } from 'react'

/** 行列の数を管理する stage の大きさの情報 */
export type StageSize = {
  /** 列数 */
  cols: number
  /** 行数 */
  rows: number
}

/** stage における位置情報 */
export type Position = {
  /**
   * X 軸方向の位置
   *
   * - CSS で指定するため型を利用
   */
  left: CSSProperties['left']
  /**
   * Y 軸方向の位置
   *
   * - CSS で指定するため型を利用
   */
  top: CSSProperties['top']
}
