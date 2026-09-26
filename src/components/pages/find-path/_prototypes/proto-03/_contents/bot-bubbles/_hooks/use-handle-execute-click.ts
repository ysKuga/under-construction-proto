import { useCallback } from 'react'

import { useStage07HandleRef } from '../../../_contexts/stage07-handle'
import { useFindPathEventDispatcher } from '../../../_events'
import { usePreviewPath } from '../../../_hooks/use-preview-path'
import { useFollowPathStoreApi } from '../../../_stores/follow-path'
import { useWaypointFlowStoreApi } from '../../../_stores/waypoint-flow'
import { UseBotBubblesReturn } from '../index.types'

/**
 * 「実行」吹き出しクリック時の処理。表示中の経路に沿って自動移動を開始する
 *
 * - 中継点フローは終了する（`objectiveCell`/`waypoints` は最初の 1 マス移動時に
 *   stage content の `handleCellChange` がクリアする）
 * - 経路は follow-path store へ固定し、自動移動中はその残りをプレビューする
 * - 自動移動中は `Stage07` を非対話化し、クリックによる割込みを防ぐ
 * - 開始前に `FindPath-execute-path` を発行し、listener に拒否されたら（EN 切れ等）
 *   開始しない。経路提示後に EN が切れた場合の対策
 */
export const useHandleExecuteClick =
  (): UseBotBubblesReturn['handleExecuteClick'] => {
    const previewPath = usePreviewPath()
    const stage07HandleRef = useStage07HandleRef()
    const findPathEventDispatcher = useFindPathEventDispatcher()
    const followPathStoreApi = useFollowPathStoreApi()
    const waypointFlowStoreApi = useWaypointFlowStoreApi()

    return useCallback(async () => {
      if (previewPath.length === 0) return
      if (
        !(await findPathEventDispatcher['FindPath-execute-path']({
          path: previewPath,
        }))
      ) {
        return
      }

      waypointFlowStoreApi.getState().setFlowState('idle')
      followPathStoreApi.getState().start(previewPath)
      stage07HandleRef.current?.followPath(previewPath)
    }, [
      findPathEventDispatcher,
      followPathStoreApi,
      previewPath,
      stage07HandleRef,
      waypointFlowStoreApi,
    ])
  }
