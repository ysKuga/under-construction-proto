import { useCallback, useRef } from 'react'

import {
  useEnergyEventDispatcher,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { useStage07EventListener } from '@/prototypes/stage/stage-07/_events'

import { useStage07HandleRef } from '../../../../../_contexts/stage07-handle'
import { useFindPathEventListener } from '../../../../../_events'
import { useFogStoreApi } from '../../../../../_stores/fog'
import { useWaypointFlowStoreApi } from '../../../../../_stores/waypoint-flow'
import { START_POSITION } from '../../../../../constants'

/**
 * チェックポイント（開始位置）へのリセットを受け付け、player の位置・EN を戻す
 *
 * - EN 切れ中かつ停止中でなければ `preventDefault()` で拒否する
 *   - 停止中かは `Stage07-move-start`/`Stage07-move-stop` の購読で知る
 * - 戻すのは位置・EN（初期値まで）のみ。盤面の状態・携行アイテムは保持する\
 *   （decision-records.md 2026-09-28 案A）
 * - `Stage07Handle` を使うため、`Stage07` を描画する stage content で購読する
 */
export const useResetToCheckpointEventListener = (): void => {
  const energy = useEnergyStoreApi()
  const energyDispatch = useEnergyEventDispatcher()
  const fogStoreApi = useFogStoreApi()
  const stage07HandleRef = useStage07HandleRef()
  const waypointFlowStoreApi = useWaypointFlowStoreApi()
  /** player が移動中か */
  const isMovingRef = useRef(false)

  useStage07EventListener(
    'Stage07-move-start',
    useCallback((event) => {
      if (event.detail.actorId !== PLAYER_ACTOR_ID) return

      isMovingRef.current = true
    }, []),
    { allowMultiple: true },
  )

  useStage07EventListener(
    'Stage07-move-stop',
    useCallback((event) => {
      if (event.detail.actorId !== PLAYER_ACTOR_ID) return

      isMovingRef.current = false
    }, []),
    { allowMultiple: true },
  )

  useFindPathEventListener('FindPath-reset-to-checkpoint', async (event) => {
    const { current, max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

    /** EN 切れ中かつ停止中か（リセットを提示する状況） */
    const isAcceptable = current <= 0 && !isMovingRef.current

    // EN が残っている、または移動中: リセットを拒否する
    if (!isAcceptable) {
      event.preventDefault()

      return
    }

    // ワープ先の到達で自動移動が進まないよう、ワープより先に目標・中継点を消す
    waypointFlowStoreApi.getState().clear()
    stage07HandleRef.current?.warp(START_POSITION)
    fogStoreApi.getState().markVisited(START_POSITION)

    await energyDispatch['Energy-recover']({
      actorId: PLAYER_ACTOR_ID,
      amount: max - current,
    })
  })
}
