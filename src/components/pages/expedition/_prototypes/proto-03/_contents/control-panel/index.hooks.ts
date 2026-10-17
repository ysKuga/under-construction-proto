import { useCallback, useRef } from 'react'

import { useReset } from '../../_contexts/reset'
import { useStageSeed } from '../../_contexts/stage-seed'
import { useDisplaySettingsStore } from '../../_stores/display-settings'
import { useFogStore, useFogStoreApi } from '../../_stores/fog'
import { useGamePhaseStore } from '../../_stores/game-phase'
import {
  useWaypointFlowStore,
  useWaypointFlowStoreApi,
} from '../../_stores/waypoint-flow'

import { UseControlPanelReturn } from './index.types'

/** 「再生成」で選ぶ seed の上限（入力欄で扱いやすい桁数に収める） */
const RANDOM_SEED_LIMIT = 1_000_000

/** 操作パネルの表示値・操作を各 store から集める */
export const useControlPanel = (): UseControlPanelReturn => {
  const displayMode = useDisplaySettingsStore((state) => state.displayMode)
  const setDisplayMode = useDisplaySettingsStore(
    (state) => state.setDisplayMode,
  )
  const enableWalking = useDisplaySettingsStore((state) => state.enableWalking)
  const setEnableWalking = useDisplaySettingsStore(
    (state) => state.setEnableWalking,
  )
  const syncStandaloneBotFacing = useDisplaySettingsStore(
    (state) => state.syncStandaloneBotFacing,
  )
  const setSyncStandaloneBotFacing = useDisplaySettingsStore(
    (state) => state.setSyncStandaloneBotFacing,
  )
  const setShowVisited = useFogStore((state) => state.setShowVisited)
  const setFogMode = useFogStore((state) => state.setMode)
  const fogStoreApi = useFogStoreApi()
  const goalReached = useGamePhaseStore((state) => state.phase !== 'playing')
  const isSelectingWaypoint = useWaypointFlowStore(
    (state) => state.flowState === 'selecting',
  )
  const waypointCount = useWaypointFlowStore((state) => state.waypoints.length)
  const waypointFlowStoreApi = useWaypointFlowStoreApi()
  const reset = useReset()
  const { seed, setSeed } = useStageSeed()
  const seedInputRef = useRef<HTMLInputElement>(null)

  /**
   * 中継点選択を確定し、経路提示中(`proposing`)へ戻す
   *
   * - 設置済みの `waypoints` はクリアしない（「実行」までプレビュー経路に使う）
   * - `idle` へ戻すと吹き出し（「実行」）が消え、経路プレビューだけ残るため不可
   */
  const handleWaypointDoneClick = useCallback(() => {
    waypointFlowStoreApi.getState().setFlowState('proposing')
  }, [waypointFlowStoreApi])

  /** 入力欄の seed で盤面を生成する（数値でなければ何もしない） */
  const handleGenerateClick = useCallback(() => {
    /** 入力された seed */
    const inputSeed = seedInputRef.current?.valueAsNumber

    // 数値でない（未入力等）: 何もしない
    if (inputSeed === undefined || !Number.isInteger(inputSeed)) {
      return
    }

    setSeed(inputSeed)
  }, [setSeed])

  /** 新しい seed をランダムに選んで盤面を生成する */
  const handleRegenerateClick = useCallback(() => {
    setSeed(Math.floor(Math.random() * RANDOM_SEED_LIMIT))
  }, [setSeed])

  return {
    displayMode,
    enableWalking,
    fogModeDefault: fogStoreApi.getState().mode,
    goalReached,
    handleGenerateClick,
    handleRegenerateClick,
    handleReset: reset,
    handleWaypointDoneClick,
    isSelectingWaypoint,
    seed,
    seedInputRef,
    setDisplayMode,
    setEnableWalking,
    setFogMode,
    setShowVisited,
    setSyncStandaloneBotFacing,
    syncStandaloneBotFacing,
    waypointCount,
  }
}
