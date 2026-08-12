import { createStore } from 'zustand/vanilla'

import { PathState, PathStore } from './types'

const INITIAL_STATE = {
  pathById: {},
} satisfies Partial<PathState>

export const createPathStore = (): PathStore =>
  createStore<PathState>((set) => ({
    ...INITIAL_STATE,
    reset: () => {
      set(INITIAL_STATE)
    },
    setPath: (actorId, path) => {
      set((state) => ({
        pathById: { ...state.pathById, [actorId]: path },
      }))
    },
  }))
