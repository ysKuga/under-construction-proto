import { useEffect } from 'react'

import { useWaypointFlowStoreApi } from '../../../../../_stores/waypoint-flow'

/**
 * 中継点選択中の ESC キーで中継点選択をキャンセルする
 *
 * - `WaypointBubble` の再クリックと同じく `cancelSelecting`（中継点を消し
 *   経路提示中へ戻す）を呼ぶ
 * - 選択中以外の ESC は扱わない（目標設定のキャンセルは別途検討）
 */
export const useEffectCancelWaypointSelectingOnEscape = (): void => {
  const waypointFlowStoreApi = useWaypointFlowStoreApi()

  useEffect(() => {
    // 選択中の ESC で中継点選択をキャンセルする
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      const { cancelSelecting, flowState } = waypointFlowStoreApi.getState()

      if (flowState !== 'selecting') return

      cancelSelecting()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [waypointFlowStoreApi])
}
