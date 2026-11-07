import { useCallback, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

import { ChoicePanelProps, UseChoicePanelReturn } from '../index.types'

/**
 * パネルの開閉
 *
 * - 選択肢が現れたら開き、無くなったら閉じる。選択肢の数の増減だけでは変えない
 * - 選択肢が別の選択肢へ入れ替わったら（前回と同じ id が 1 つもない）開く
 *   - 例: EN スポットの使用 → 救助。外側のクリックで閉じた直後の入替わりも開き直す
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
  /** 選択肢の id の並び（入替わりの検出用） */
  const choiceIdsKey = choices.map(({ id }) => id).join('\n')
  /** パネルが開いているか */
  const [open, setOpen] = useState(hasChoices)
  /**
   * 前回のレンダー時の選択肢の id の並び（現れた・無くなった・入れ替わった瞬間の検出用）
   *
   * - レンダー中に読むため ref でなく state で持つ（`react-hooks/refs`）。再レンダリングは id の変化時のみ
   */
  const [prevChoiceIdsKey, setPrevChoiceIdsKey] = useState(choiceIdsKey)
  /** ピン留め中か */
  const [pinned, setPinned] = useState(false)
  /** パネル（ポップオーバー）の要素 */
  const popoverRef = useRef<HTMLDivElement>(null)

  // 選択肢の id が変わった: 現れた・入れ替わったら開き、無くなったら閉じる（ピン留め中は閉じない）
  if (choiceIdsKey !== prevChoiceIdsKey) {
    /** 前回の選択肢の id */
    const prevIds = prevChoiceIdsKey === '' ? [] : prevChoiceIdsKey.split('\n')
    /** 前回と同じ id の選択肢が残っているか（数の増減のみか） */
    const hasKeptChoice = choices.some(({ id }) => prevIds.includes(id))

    /** 選択肢が現れた・入れ替わったか */
    const appearedOrReplaced = hasChoices && !hasKeptChoice

    setPrevChoiceIdsKey(choiceIdsKey)

    // 無くなった: 閉じる（ピン留め中は閉じない）
    if (!hasChoices) setOpen(pinned)

    // 現れた・入れ替わった: 開く
    if (appearedOrReplaced) setOpen(true)
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

    // ピン留め: 属性変更で閉じたため開き直す。解除: 閉じたままにする（`beforetoggle` event で state も閉じる）
    if (nextPinned) {
      popoverRef.current?.showPopover()
    }
  }, [pinned])

  return { close, handlePinClick, open, pinned, popoverRef, toggle }
}
