import { useCallback, useMemo } from 'react'

import {
  useWaypointFlowStore,
  useWaypointFlowStoreApi,
} from '../../_stores/waypoint-flow'
import { useChoiceSelectEventListener } from '../_hooks/use-choice-select-event-listener'
import { useEffectRegisterChoice } from '../_hooks/use-effect-register-choice'

import { useExecutePath } from './_hooks/use-execute-path'

/**
 * 経路提示中の選択肢（実行・中継点・キャンセル）を登録し、選択時の処理を購読する
 *
 * - 経路提示中（中継点フローが `idle` 以外）のみ登録する
 * - 提示中の経路（目標・中継点）が変わったら 3 つとも登録し直す。パネルを開き直し、可能な選択を再提示する
 *   - 中継点の押下表示の切替は中継点のみ登録し直す（パネルを開き直さない）
 * - 実行: 表示中の経路に沿って自動移動を開始する（`useExecutePath`）
 * - 中継点: 選択モードを切り替える。選択中は押下中の表示にし、再選択で経路提示中へ戻す
 * - キャンセル: 目標設定をキャンセルし通常状態へ戻す（中継点選択中も含め一括）
 */
export const useRouteChoices = (): void => {
  /** 中継点フローの store（選択時の操作に使う） */
  const waypointFlowStoreApi = useWaypointFlowStoreApi()
  /** 中継点フローの状態 */
  const flowState = useWaypointFlowStore((state) => state.flowState)
  /** 目標セル */
  const objectiveCell = useWaypointFlowStore((state) => state.objectiveCell)
  /** 中継点 */
  const waypoints = useWaypointFlowStore((state) => state.waypoints)
  /** 「実行」の選択時。表示中の経路に沿って自動移動を開始する */
  const executePath = useExecutePath()

  /** 経路提示中か */
  const proposing = flowState !== 'idle'
  /** 中継点選択モード中か */
  const selecting = flowState === 'selecting'
  /**
   * 提示中の経路（目標・中継点）。経路提示中でなければ `undefined`
   *
   * - 経路が変わるたび別の値になり、選択肢を登録し直す
   */
  const proposal = useMemo(
    () => (proposing ? { objectiveCell, waypoints } : undefined),
    [proposing, objectiveCell, waypoints],
  )

  useEffectRegisterChoice(
    useMemo(
      () => proposal && { id: 'execute', label: '実行', order: 10 },
      [proposal],
    ),
  )
  useEffectRegisterChoice(
    useMemo(
      () =>
        proposal && {
          id: 'waypoint',
          label: '中継点',
          order: 20,
          pressed: selecting,
        },
      [proposal, selecting],
    ),
  )
  useEffectRegisterChoice(
    useMemo(
      () => proposal && { id: 'cancel', label: 'キャンセル', order: 30 },
      [proposal],
    ),
  )

  useChoiceSelectEventListener(
    'execute',
    useCallback(() => void executePath(), [executePath]),
  )
  useChoiceSelectEventListener(
    'waypoint',
    useCallback(() => {
      const { cancelSelecting, flowState, setFlowState } =
        waypointFlowStoreApi.getState()

      // 選択中: キャンセルして経路提示中へ戻す
      if (flowState === 'selecting') {
        cancelSelecting()

        return
      }

      setFlowState('selecting')
    }, [waypointFlowStoreApi]),
  )
  useChoiceSelectEventListener(
    'cancel',
    useCallback(
      () => waypointFlowStoreApi.getState().clear(),
      [waypointFlowStoreApi],
    ),
  )
}
