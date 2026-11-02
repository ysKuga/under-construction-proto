import { useCallback, useRef, useState } from 'react'

import { useKeyLayer } from '@/hooks/use-key-layer'

import { ChoicePanelProps, UseChoicePanelReturn } from '../index.types'

/**
 * パネルの開閉
 *
 * - 選択肢が現れたら開き、無くなったら閉じる。選択肢の数の増減だけでは変えない
 * - 呼び出しボタンで、選択肢の有無によらず開閉できる
 * - 開いている間、Esc で閉じる層を `useKeyLayer` へ積む
 * - パネルは `popover="manual"`。外側（床のクリック等）では閉じない
 */
export const usePanelOpen = (
  props: ChoicePanelProps,
): Pick<UseChoicePanelReturn, 'close' | 'open' | 'popoverRef' | 'toggle'> => {
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
  /** パネル（ポップオーバー）の要素 */
  const popoverRef = useRef<HTMLDivElement>(null)

  // 選択肢が現れた・無くなった: 開閉をそれに合わせる
  if (hasChoices !== prevHasChoices) {
    setPrevHasChoices(hasChoices)
    setOpen(hasChoices)
  }

  /** パネルを閉じる */
  const close = useCallback(() => setOpen(false), [])
  /** 開閉を切り替える */
  const toggle = useCallback(() => setOpen((current) => !current), [])

  useKeyLayer('Escape', close, { enabled: open })

  return { close, open, popoverRef, toggle }
}
