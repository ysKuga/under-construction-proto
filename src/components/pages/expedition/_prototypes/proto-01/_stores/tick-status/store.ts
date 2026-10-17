import { createStore } from 'zustand/vanilla'

import { TickStatusState, TickStatusStore } from './types'

/** tick 実行状態 store を生成する */
export const createTickStatusStore = (): TickStatusStore =>
  createStore<TickStatusState>((set) => ({
    isRunning: false,
    reachedGoal: false,
    setIsRunning: (isRunning) => set({ isRunning }),
    setReachedGoal: (reachedGoal) => set({ reachedGoal }),
  }))
