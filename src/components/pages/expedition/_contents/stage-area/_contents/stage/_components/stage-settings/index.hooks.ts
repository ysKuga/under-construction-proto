import { useCallback, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

import { UseStageSettingsReturn } from './index.types'

/** ポップオーバーのピン留め状態と切替操作 */
export const useStageSettings = (): UseStageSettingsReturn => {
  /** ピン留め中か */
  const [pinned, setPinned] = useState(false)
  /** ポップオーバーの要素 */
  const popoverRef = useRef<HTMLDivElement>(null)

  /** ピン留め ⇔ 解除を切り替える */
  const handlePinClick = useCallback(() => {
    /** 切替後のピン留め状態 */
    const nextPinned = !pinned

    // `popover` 属性を同期的に切り替える（表示中の属性変更でブラウザが閉じる）
    flushSync(() => setPinned(nextPinned))

    // ピン留め: 属性変更で閉じたため開き直す。解除: 閉じたままにする
    if (nextPinned) {
      popoverRef.current?.showPopover()
    }
  }, [pinned])

  return { handlePinClick, pinned, popoverRef }
}
