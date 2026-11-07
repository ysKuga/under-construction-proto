import { useCallback, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

import { ChoicePanelProps, UseChoicePanelReturn } from '../index.types'

/**
 * パネルの開閉
 *
 * - 選択肢が現れたら開き、無くなったら閉じる。選択肢の数の増減だけでは変えない
 * - 呼び出しボタンで、選択肢の有無によらず開閉できる
 * - パネルは `popover="auto"`。外側のクリック・Esc でブラウザが閉じた時は、`useCloseOnEscape` が開閉の state を合わせる
 * - ピン留め中は `popover="manual"` にし、外側のクリック・Esc で閉じない（設定ポップオーバーと同じ）
 *   - 選択肢が無くなっても閉じない
 *   - 閉じるとピン留めも外れる。ピン留めの解除でも閉じる（属性の変更でブラウザが閉じる）
 */
export const usePanelOpen = (
  props: ChoicePanelProps,
): Pick<
  UseChoicePanelReturn,
  'close' | 'handlePinClick' | 'open' | 'pinned' | 'popoverRef' | 'toggle'
> => {
  const { choices } = props

  /** 選択肢があるか */
  const hasChoices = choices.length > 0
  /** パネルが開いているか */
  const [open, setOpen] = useState(hasChoices)
  /**
   * 前回のレンダー時に選択肢があったか（現れた・無くなった瞬間の検出用）
   *
   * - レンダー中に読むため ref でなく state で持つ（`react-hooks/refs`）。再レンダリングは有無の切替時のみ
   */
  const [prevHasChoices, setPrevHasChoices] = useState(hasChoices)
  /** ピン留め中か */
  const [pinned, setPinned] = useState(false)
  /** パネル（ポップオーバー）の要素 */
  const popoverRef = useRef<HTMLDivElement>(null)

  // 選択肢が現れた・無くなった: 開閉をそれに合わせる（ピン留め中は閉じない）
  if (hasChoices !== prevHasChoices) {
    setPrevHasChoices(hasChoices)
    setOpen(hasChoices || pinned)
  }

  /** パネルを閉じる */
  const close = useCallback(() => {
    setOpen(false)
    setPinned(false)
  }, [])
  /** 開閉を切り替える */
  const toggle = useCallback(() => setOpen((current) => !current), [])

  /** ピン留め ⇔ 解除を切り替える */
  const handlePinClick = useCallback(() => {
    /** 切替後のピン留め状態 */
    const nextPinned = !pinned

    // `popover` 属性を同期的に切り替える（表示中の属性変更でブラウザが閉じる）
    flushSync(() => setPinned(nextPinned))

    // ピン留め: 属性変更で閉じたため開き直す。解除: 閉じたままにする（`toggle` event で state も閉じる）
    if (nextPinned) {
      popoverRef.current?.showPopover()
    }
  }, [pinned])

  return { close, handlePinClick, open, pinned, popoverRef, toggle }
}
