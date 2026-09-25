import { useCallback, useRef } from 'react'

import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useActorsStore } from '@/prototypes/stage/stage-07/_stores/actors'

import { ExecuteBubbleHandle } from '../../_components/execute-bubble'
import { WaypointBubbleHandle } from '../../_components/waypoint-bubble'
import {
  useWaypointFlowStore,
  useWaypointFlowStoreApi,
} from '../../_stores/waypoint-flow'

import { useEffectBubbleSelecting } from './_hooks/use-effect-bubble-selecting'
import { useHandleExecuteClick } from './_hooks/use-handle-execute-click'
import { UseBotBubblesReturn } from './index.types'

/** bot 頭上の吹き出し（中継点・実行）の表示・操作をまとめる */
export const useBotBubbles = (): UseBotBubblesReturn => {
  const waypointBubbleRef = useRef<WaypointBubbleHandle>(null)
  const executeBubbleRef = useRef<ExecuteBubbleHandle>(null)
  const playerOverlayContainer = useActorsStore(
    (state) => state.overlayContainers[PLAYER_ACTOR_ID],
  )
  const visible = useWaypointFlowStore((state) => state.flowState !== 'idle')
  const waypointFlowStoreApi = useWaypointFlowStoreApi()
  const handleExecuteClick = useHandleExecuteClick()

  useEffectBubbleSelecting(waypointBubbleRef, executeBubbleRef)

  /**
   * 選択中なら解除し、経路提示中(`proposing`)へ戻す。吹き出しは表示したままにし、
   * 「実行」や再度の選択へつなげる
   */
  const handleWaypointBubbleClick = useCallback(() => {
    const { flowState, setFlowState } = waypointFlowStoreApi.getState()

    setFlowState(flowState === 'selecting' ? 'proposing' : 'selecting')
  }, [waypointFlowStoreApi])

  return {
    executeBubbleRef,
    handleExecuteClick,
    handleWaypointBubbleClick,
    playerOverlayContainer,
    visible,
    waypointBubbleRef,
  }
}
