import { useCallback } from 'react'

import { useStage07HandleRef } from '@/components/pages/expedition/_stage-components/hex-stage/_contexts/stage07-handle'

import { useDisplaySettingsStore } from '../../../../../../_stores/display-settings'

import { UseStageSlidersReturn } from './index.types'

/** ステージの調整スライダーの表示値・操作を store・handle から集める */
export const useStageSliders = (): UseStageSlidersReturn => {
  const stage07HandleRef = useStage07HandleRef()
  const moveDurationMs = useDisplaySettingsStore(
    (state) => state.moveDurationMs,
  )
  const setMoveDurationMs = useDisplaySettingsStore(
    (state) => state.setMoveDurationMs,
  )

  /** 床の傾きを反映する（ref 直書きのため再レンダリングなし） */
  const handleTiltChange = useCallback(
    (deg: number) => {
      stage07HandleRef.current?.setTilt(deg)
    },
    [stage07HandleRef],
  )

  return { handleTiltChange, moveDurationMs, setMoveDurationMs }
}
