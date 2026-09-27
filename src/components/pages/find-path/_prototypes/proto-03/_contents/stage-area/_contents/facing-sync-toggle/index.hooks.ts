import { MouseEvent, useCallback } from 'react'

import { useDisplaySettingsStore } from '../../../../_stores/display-settings'

/** 向き同期トグルの表示値・操作 */
export type UseFacingSyncToggleReturn = {
  /**
   * クリック時。同期 ⇔ 固定を切り替える
   *
   * - 直後に hover 中の変更先アイコンが出ないよう、hover を一度外すまで抑止する
   */
  handleClick: (event: MouseEvent<HTMLButtonElement>) => void
  /** hover を外した時。変更先アイコンの抑止を解除する */
  handleMouseLeave: (event: MouseEvent<HTMLButtonElement>) => void
  /** 独立 bot（状態表示）の向きをステージ上の bot と同期するか */
  syncStandaloneBotFacing: boolean
}

/** 独立 bot の向き同期設定を購読し、切替操作を返す */
export const useFacingSyncToggle = (): UseFacingSyncToggleReturn => {
  const syncStandaloneBotFacing = useDisplaySettingsStore(
    (state) => state.syncStandaloneBotFacing,
  )
  const setSyncStandaloneBotFacing = useDisplaySettingsStore(
    (state) => state.setSyncStandaloneBotFacing,
  )

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      // 抑止は React state でなく DOM 属性で持つ（再レンダリングで上書きされないよう JSX には書かない）
      event.currentTarget.dataset.hoverSuppressed = ''
      setSyncStandaloneBotFacing(!syncStandaloneBotFacing)
    },
    [setSyncStandaloneBotFacing, syncStandaloneBotFacing],
  )

  const handleMouseLeave = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      delete event.currentTarget.dataset.hoverSuppressed
    },
    [],
  )

  return { handleClick, handleMouseLeave, syncStandaloneBotFacing }
}
