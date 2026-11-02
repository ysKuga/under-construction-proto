import { RefObject, useEffect, useState } from 'react'

import { useKeyLayer } from '@/hooks/use-key-layer'

/**
 * パネルの開閉の state をブラウザ側の開閉と合わせ、開いている間は Esc で閉じる層を `useKeyLayer` へ積む
 *
 * - ブラウザが閉じた時（`popover="auto"` の外側のクリック等）も `close` を呼び、開閉の state を合わせる
 * - 層はポップオーバーが実際に開いた時点（`toggle` event）で積む
 *   - 経路の提示でパネルが自動で開く時、経路をキャンセルする層（親の `Stage` 側）と同じ描画で有効になる
 *   - effect は子から親の順に走るため、開閉の state で積むとキャンセルの層が上になる
 *   - `toggle` event は effect の後に非同期で届くため、パネルの層が上になる
 *
 * @param popoverRef パネル（ポップオーバー）の要素
 * @param close パネルを閉じる
 * @param pinned ピン留め中か。ピン留め中は積まない（Esc で閉じない）
 */
export const useCloseOnEscape = (
  popoverRef: RefObject<HTMLDivElement | null>,
  close: () => void,
  pinned: boolean,
): void => {
  /**
   * ポップオーバーが開いているか（`toggle` event で反映）
   *
   * - `useKeyLayer` の `enabled` としてレンダー中に読むため state で持つ。再レンダリングは開閉時のみ
   */
  const [shown, setShown] = useState(false)

  useEffect(() => {
    // ポップオーバーの開閉を shown へ反映する
    /** パネル（ポップオーバー）の要素 */
    const popover = popoverRef.current

    if (!popover) return

    /** 開閉を shown へ反映する */
    const handleToggle = (event: Event) => {
      /** 開いたか */
      const opened = (event as ToggleEvent).newState === 'open'

      setShown(opened)

      // ブラウザが閉じた（外側のクリック等）: 開閉の state を合わせる
      if (!opened) close()
    }

    popover.addEventListener('toggle', handleToggle)

    return () => popover.removeEventListener('toggle', handleToggle)
  }, [close, popoverRef])

  useKeyLayer('Escape', close, { enabled: shown && !pinned })
}
