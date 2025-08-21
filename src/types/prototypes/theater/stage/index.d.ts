import { CSSProperties } from 'react'

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
