import { useKeyLayer } from '@/hooks/use-key-layer'

import { useWaypointFlowStore } from '../../../../../_stores/waypoint-flow'

/**
 * ESC キーで中継点フローを 1 段ずつキャンセルする
 *
 * - 中継点選択中: `cancelSelecting`（中継点を消し経路提示中へ戻す）。
 *   `WaypointBubble` の再クリックと同じ
 * - 経路提示中: `clear`（目標設定をキャンセルし通常状態へ戻す）
 * - `useKeyLayer` の層として積むため、1 回の押下で進むのは 1 段のみ。
 *   選択中の層が後から積まれるため先に処理される
 */
export const useCancelWaypointFlowOnEscape = (): void => {
  const cancelSelecting = useWaypointFlowStore((state) => state.cancelSelecting)
  const clear = useWaypointFlowStore((state) => state.clear)
  /** 経路提示中（中継点選択中を含む）か */
  const proposing = useWaypointFlowStore((state) => state.flowState !== 'idle')
  /** 中継点選択中か */
  const selecting = useWaypointFlowStore(
    (state) => state.flowState === 'selecting',
  )

  useKeyLayer('Escape', clear, { enabled: proposing })
  useKeyLayer('Escape', cancelSelecting, { enabled: selecting })
}
