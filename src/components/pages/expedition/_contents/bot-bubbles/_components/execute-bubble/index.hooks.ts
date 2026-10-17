import { useEffect, useRef } from 'react'

import { ExecuteBubbleHandle } from '../../../../_components/execute-bubble'
import { useWaypointFlowStore } from '../../../../_stores/waypoint-flow'

import { useHandleExecuteClick } from './_hooks/use-handle-execute-click'
import { UseExecuteBubbleContentReturn } from './index.types'

/** 「実行」吹き出しの操作・選択モードの反映をまとめる */
export const useExecuteBubbleContent = (): UseExecuteBubbleContentReturn => {
  const executeBubbleRef = useRef<ExecuteBubbleHandle>(null)
  const handleClick = useHandleExecuteClick()
  const handleClose = useWaypointFlowStore((state) => state.clear)
  /** 中継点選択モード中か */
  const isSelecting = useWaypointFlowStore(
    (state) => state.flowState === 'selecting',
  )

  useEffect(() => {
    // 選択モードの切替を吹き出しの半透明化へ反映する（issue #226）
    executeBubbleRef.current?.setTranslucent(isSelecting)
  }, [isSelecting])

  return { executeBubbleRef, handleClick, handleClose }
}
