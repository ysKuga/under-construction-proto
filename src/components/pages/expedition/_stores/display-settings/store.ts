import { createStore } from 'zustand/vanilla'

import { MOTION_DEFAULTS } from '@/components/pages/expedition/_stage-components/hex-stage/constants'

import { DisplaySettingsState, DisplaySettingsStore } from './types'

/** 表示・演出の切替設定の store を生成する */
export const createDisplaySettingsStore = (): DisplaySettingsStore =>
  createStore<DisplaySettingsState>((set) => ({
    ...MOTION_DEFAULTS,
    displayMode: 'scatter',
    enableWalking: true,
    setBodyBobHeight: (bodyBobHeight) => {
      set({ bodyBobHeight })
    },
    setDisplayMode: (displayMode) => {
      set({ displayMode })
    },
    setEnableWalking: (enableWalking) => {
      set({ enableWalking })
    },
    setLegSwingAngle: (legSwingAngle) => {
      set({ legSwingAngle })
    },
    setMaxWalkCycleSec: (maxWalkCycleSec) => {
      set({ maxWalkCycleSec })
    },
    setMoveDurationMs: (moveDurationMs) => {
      set({ moveDurationMs })
    },
    setSyncStandaloneBotFacing: (syncStandaloneBotFacing) => {
      set({ syncStandaloneBotFacing })
    },
    syncStandaloneBotFacing: false,
  }))
