import { Ref } from 'react'

/** 向き矢印の props(中心回転・半径端 共通) */
export type FacingArrowProps = {
  /**
   * 回転させる要素の ref
   *
   * - 呼び出し側が ref 先の `style.transform` へ `rotate()`(0 = 右、時計回り)を直書きして\
   *   向きを変える。state を介さないため再レンダリングは発生しない
   */
  ref?: Ref<HTMLDivElement>
}
