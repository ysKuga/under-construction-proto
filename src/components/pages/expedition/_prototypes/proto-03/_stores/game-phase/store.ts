import { createStore } from 'zustand/vanilla'

import { PHASE_PERMISSIONS } from './constants'
import { GamePhaseState, GamePhaseStore } from './types'

/** ゲームのフェーズの store を生成する */
export const createGamePhaseStore = (): GamePhaseStore =>
  createStore<GamePhaseState>((set, get) => ({
    allows: (permission) => PHASE_PERMISSIONS[get().phase][permission],
    arriveAtGoal: () => {
      if (get().phase !== 'clearing') return

      set({ phase: 'cleared' })
    },
    phase: 'playing',
    reachGoal: () => {
      if (get().phase !== 'playing') return

      set({ phase: 'clearing' })
    },
  }))
