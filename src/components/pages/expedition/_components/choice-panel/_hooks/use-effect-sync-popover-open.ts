import { RefObject, useEffect } from 'react'

/**
 * 開閉の状態をポップオーバーへ反映する
 *
 * @param popoverRef ポップオーバーの要素
 * @param open 開いているか
 */
export const useEffectSyncPopoverOpen = (
  popoverRef: RefObject<HTMLDivElement | null>,
  open: boolean,
): void => {
  useEffect(() => {
    // 開閉をポップオーバーへ反映する
    /** ポップオーバーの要素 */
    const popover = popoverRef.current

    if (!popover) return

    if (open) {
      popover.showPopover()
    } else {
      popover.hidePopover()
    }
  }, [open, popoverRef])
}
