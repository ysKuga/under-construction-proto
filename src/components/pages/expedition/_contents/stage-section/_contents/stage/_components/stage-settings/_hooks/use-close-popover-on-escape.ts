import { RefObject, useCallback, useEffect, useState } from 'react'

import { useKeyLayer } from '@/hooks/use-key-layer'

/**
 * ESC キーでポップオーバーを閉じる処理を `useKeyLayer` の層として積む
 *
 * - 開いている間（ピン留め中を除く）のみ積む。後から開いたもの（経路提示等）が先に処理される
 * - `popover="auto"` のブラウザ標準の Esc での閉じは、`useKeyLayer` の `preventDefault()` で止まる
 *
 * @param popoverRef ポップオーバーの要素
 * @param pinned ピン留め中か
 */
export const useClosePopoverOnEscape = (
  popoverRef: RefObject<HTMLDivElement | null>,
  pinned: boolean,
): void => {
  /** ポップオーバーが開いているか */
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // ポップオーバーの開閉を open へ反映する
    /** ポップオーバーの要素 */
    const popover = popoverRef.current

    if (!popover) return

    /** 開閉を open へ反映する */
    const handleToggle = (event: Event) => {
      setOpen((event as ToggleEvent).newState === 'open')
    }

    popover.addEventListener('toggle', handleToggle)

    return () => popover.removeEventListener('toggle', handleToggle)
  }, [popoverRef])

  /** ポップオーバーを閉じる */
  const close = useCallback(() => {
    popoverRef.current?.hidePopover()
  }, [popoverRef])

  useKeyLayer('Escape', close, { enabled: open && !pinned })
}
