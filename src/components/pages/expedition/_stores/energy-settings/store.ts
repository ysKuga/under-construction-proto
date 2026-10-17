import { createStore } from 'zustand/vanilla'

import { EnergySettingsState, EnergySettingsStore } from './types'

/** EN の調整設定の store を生成する */
export const createEnergySettingsStore = (): EnergySettingsStore =>
  createStore<EnergySettingsState>((set) => ({
    consumePerMove: 1,
    setConsumePerMove: (consumePerMove) => {
      set({ consumePerMove })
    },
  }))
