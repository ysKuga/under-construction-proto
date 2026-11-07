import { useMemo } from 'react'

import {
  useWaypointFlowStore,
  useWaypointFlowStoreApi,
} from '../../../../../../../_stores/waypoint-flow'
import { UseChoicePanelContentReturn } from '../index.types'

/**
 * 経路提示中に並べる選択肢（実行・中継点・キャンセル）を組み立てる
 *
 * - 経路提示中（中継点フローが `idle` 以外）のみ並べ、それ以外は空にする
 * - 中継点: 選択モードを切り替える。選択中は押下中の表示にし、再選択で経路提示中へ戻す
 * - キャンセル: 目標設定をキャンセルし通常状態へ戻す（中継点選択中も含め一括）
 *
 * @param handleExecuteSelect 「実行」の選択時
 */
export const useChoices = (
  handleExecuteSelect: UseChoicePanelContentReturn['handleExecuteSelect'],
): UseChoicePanelContentReturn['choices'] => {
  const waypointFlowStoreApi = useWaypointFlowStoreApi()
  /** 中継点フローの状態 */
  const flowState = useWaypointFlowStore((state) => state.flowState)

  return useMemo(() => {
    // 経路提示中でない: 選択肢なし
    if (flowState === 'idle') return []

    /** 中継点選択モード中か */
    const selecting = flowState === 'selecting'

    return [
      {
        id: 'execute',
        label: '実行',
        onSelect: () => void handleExecuteSelect(),
      },
      {
        id: 'waypoint',
        label: '中継点',
        onSelect: () => {
          const { cancelSelecting, setFlowState } =
            waypointFlowStoreApi.getState()

          // 選択中: キャンセルして経路提示中へ戻す
          if (selecting) {
            cancelSelecting()

            return
          }

          setFlowState('selecting')
        },
        pressed: selecting,
      },
      {
        id: 'cancel',
        label: 'キャンセル',
        onSelect: () => waypointFlowStoreApi.getState().clear(),
      },
    ]
  }, [flowState, handleExecuteSelect, waypointFlowStoreApi])
}
