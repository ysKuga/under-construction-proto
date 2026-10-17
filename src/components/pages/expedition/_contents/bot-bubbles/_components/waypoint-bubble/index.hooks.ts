import { useCallback, useEffect, useRef } from 'react'

import { WaypointBubbleHandle } from '../../../../_components/waypoint-bubble'
import {
  useWaypointFlowStore,
  useWaypointFlowStoreApi,
} from '../../../../_stores/waypoint-flow'

import { UseWaypointBubbleContentReturn } from './index.types'

/** 中継点の吹き出しの操作・選択モードの反映をまとめる */
export const useWaypointBubbleContent = (): UseWaypointBubbleContentReturn => {
  const waypointBubbleRef = useRef<WaypointBubbleHandle>(null)
  const waypointFlowStoreApi = useWaypointFlowStoreApi()
  /** 中継点選択モード中か */
  const isSelecting = useWaypointFlowStore(
    (state) => state.flowState === 'selecting',
  )

  useEffect(() => {
    // 選択モードの切替を吹き出しの selectable・半透明化へ反映する（issue #226）
    waypointBubbleRef.current?.setSelectable(isSelecting)
    waypointBubbleRef.current?.setTranslucent(isSelecting)
  }, [isSelecting])

  const handleClick = useCallback(() => {
    const { cancelSelecting, flowState, setFlowState } =
      waypointFlowStoreApi.getState()

    // 選択中: キャンセルして経路提示中へ戻す
    if (flowState === 'selecting') {
      cancelSelecting()

      return
    }

    setFlowState('selecting')
  }, [waypointFlowStoreApi])

  return { handleClick, waypointBubbleRef }
}
