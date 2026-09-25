import { createStore } from 'zustand/vanilla'

import { GoalState, GoalStore } from './types'

/** ゴール到達状況の store を生成する */
export const createGoalStore = (): GoalStore =>
  createStore<GoalState>((set) => ({
    reach: () => {
      set({ reached: true })
    },
    reached: false,
  }))
