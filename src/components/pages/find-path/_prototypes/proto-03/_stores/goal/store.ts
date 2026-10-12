import { createStore } from 'zustand/vanilla'

import { GoalState, GoalStore } from './types'

/** ゴール到達状況の store を生成する */
export const createGoalStore = (): GoalStore =>
  createStore<GoalState>((set, get) => ({
    flagRaised: false,
    raiseFlag: () => {
      if (!get().reached) return

      set({ flagRaised: true })
    },
    reach: () => {
      set({ reached: true })
    },
    reached: false,
  }))
