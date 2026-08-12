import { createStore } from 'zustand/vanilla'

import { PlannedPathState, PlannedPathStore } from './types'

const INITIAL_STATE = {
  plannedPathById: {},
} satisfies Partial<PlannedPathState>

export const createPlannedPathStore = (): PlannedPathStore =>
  createStore<PlannedPathState>((set) => ({
    ...INITIAL_STATE,
    reset: () => {
      set(INITIAL_STATE)
    },
    setPlannedPath: (actorId, path) => {
      set((state) => ({
        plannedPathById: { ...state.plannedPathById, [actorId]: path },
      }))
    },
  }))
