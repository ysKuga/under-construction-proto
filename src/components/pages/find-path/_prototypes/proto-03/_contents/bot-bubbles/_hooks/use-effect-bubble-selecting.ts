import { RefObject, useEffect } from 'react'

import { ExecuteBubbleHandle } from '../../../_components/execute-bubble'
import { WaypointBubbleHandle } from '../../../_components/waypoint-bubble'
import { useWaypointFlowStore } from '../../../_stores/waypoint-flow'

/**
 * 中継点選択モードの切替を吹き出しの selectable・半透明化(imperative) へ同期する
 *
 * - 中継点選択中は吹き出しが背後の経路を隠さないよう半透明にする（issue #226）
 *
 * @param waypointBubbleRef `WaypointBubble` の imperative API
 * @param executeBubbleRef `ExecuteBubble` の imperative API
 */
export const useEffectBubbleSelecting = (
  waypointBubbleRef: RefObject<null | WaypointBubbleHandle>,
  executeBubbleRef: RefObject<ExecuteBubbleHandle | null>,
) => {
  /** 中継点選択モード中か */
  const isSelecting = useWaypointFlowStore(
    (state) => state.flowState === 'selecting',
  )

  useEffect(() => {
    // 選択モードの切替を吹き出しへ反映する
    waypointBubbleRef.current?.setSelectable(isSelecting)
    waypointBubbleRef.current?.setTranslucent(isSelecting)
    executeBubbleRef.current?.setTranslucent(isSelecting)
  }, [executeBubbleRef, isSelecting, waypointBubbleRef])
}
