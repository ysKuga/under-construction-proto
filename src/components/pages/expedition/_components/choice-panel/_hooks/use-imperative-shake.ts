import { ForwardedRef, RefObject, useImperativeHandle } from 'react'

import { ChoicePanelHandle } from '../index.types'

/**
 * パネルを揺らす命令を呼び出し元へ公開する
 *
 * - 揺れは Web Animations API で再生する。再生中に呼ばれても最初から再生し直す
 * - `transform` でなく `translate` を動かす（`BotBubble` の揺れと同じ動き）
 * - 閉じている間は揺れが見えない
 *
 * @param ref 呼び出し元の ref
 * @param popoverRef パネル（ポップオーバー）の要素
 */
export const useImperativeShake = (
  ref: ForwardedRef<ChoicePanelHandle>,
  popoverRef: RefObject<HTMLDivElement | null>,
): void => {
  useImperativeHandle(
    ref,
    () => ({
      shake: () => {
        popoverRef.current?.animate(
          [
            { translate: '0' },
            { translate: '-4px' },
            { translate: '4px' },
            { translate: '-4px' },
            { translate: '4px' },
            { translate: '0' },
          ],
          { duration: 400, easing: 'ease-in-out' },
        )
      },
    }),
    [popoverRef],
  )
}
