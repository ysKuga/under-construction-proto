import { createStore } from 'zustand/vanilla'

import { DEFAULT_PLANNED_PATH } from './constants'
import { PlannedPathState, PlannedPathStore } from './types'

const INITIAL_STATE = {
  plannedPathById: {},
} satisfies Partial<PlannedPathState>

export const createPlannedPathStore = (): PlannedPathStore =>
  createStore<PlannedPathState>((set, get) => ({
    ...INITIAL_STATE,
    getPlannedPath: (actorId) =>
      get().plannedPathById[actorId] ?? DEFAULT_PLANNED_PATH,
    reset: () => {
      set(INITIAL_STATE)
    },
    setPlannedPath: (actorId, path) => {
      set((state) => ({
        plannedPathById: { ...state.plannedPathById, [actorId]: path },
      }))
    },
  }))
