import { createStore } from 'zustand/vanilla'

import { DisplaySettingsState, DisplaySettingsStore } from './types'

/** 表示・演出の切替設定の store を生成する */
export const createDisplaySettingsStore = (): DisplaySettingsStore =>
  createStore<DisplaySettingsState>((set) => ({
    displayMode: 'scatter',
    enableWalking: true,
    setDisplayMode: (displayMode) => {
      set({ displayMode })
    },
    setEnableWalking: (enableWalking) => {
      set({ enableWalking })
    },
  }))
