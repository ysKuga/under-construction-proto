import { useCallback } from 'react'

import { useHexStageHandleRef } from '@/components/pages/expedition/_stage-components/hex-stage/_contexts/hex-stage-handle'

import { useExpeditionEventDispatcher } from '../../../_events'
import { usePreviewPath } from '../../../_hooks/use-preview-path'
import { useFollowPathStoreApi } from '../../../_stores/follow-path'
import { useMoveHistoryStoreApi } from '../../../_stores/move-history'
import { useWaypointFlowStoreApi } from '../../../_stores/waypoint-flow'

/**
 * 「実行」の選択時の処理。表示中の経路に沿って自動移動を開始する
 *
 * - 中継点フローは終了する（`objectiveCell`/`waypoints` は最初の 1 マス移動時に
 *   stage content の `handleCellChange` がクリアする）
 * - 経路は follow-path store へ固定し、自動移動中はその残りをプレビューする
 * - 自動移動中は `HexStage` を非対話化し、クリックによる割込みを防ぐ
 * - 開始前に `Expedition-execute-path` を発行し、listener に拒否されたら（EN 切れ等）
 *   開始しない。経路提示後に EN が切れた場合の対策
 * - 開始した経路を 1 手として手数の履歴へ記録する
 */
export const useExecutePath = (): (() => Promise<void>) => {
  /** 表示中の経路 */
  const previewPath = usePreviewPath()
  /** ステージの imperative API（自動移動の命令に使う） */
  const hexStageHandleRef = useHexStageHandleRef()
  /** 実行の可否を問う event（`Expedition-execute-path`）の発行に使う */
  const expeditionEventDispatcher = useExpeditionEventDispatcher()
  /** 自動移動の経路の store（経路の固定に使う） */
  const followPathStoreApi = useFollowPathStoreApi()
  /** 手数の履歴の store（実行した経路の記録に使う） */
  const moveHistoryStoreApi = useMoveHistoryStoreApi()
  /** 中継点フローの store（フローの終了に使う） */
  const waypointFlowStoreApi = useWaypointFlowStoreApi()

  return useCallback(async () => {
    /** 表示中の経路があるか */
    const hasPath = previewPath.length > 0

    // 経路なし: 何もしない
    if (!hasPath) return

    /** listener が実行を許可したか（EN 切れ等で拒否される） */
    const executeAllowed = await expeditionEventDispatcher[
      'Expedition-execute-path'
    ]({ path: previewPath })

    // 実行を拒否された: 開始しない
    if (!executeAllowed) {
      return
    }

    waypointFlowStoreApi.getState().setFlowState('idle')
    followPathStoreApi.getState().start(previewPath)
    hexStageHandleRef.current?.followPath(previewPath)
    moveHistoryStoreApi.getState().record({ kind: 'move', path: previewPath })
  }, [
    expeditionEventDispatcher,
    followPathStoreApi,
    moveHistoryStoreApi,
    previewPath,
    hexStageHandleRef,
    waypointFlowStoreApi,
  ])
}
