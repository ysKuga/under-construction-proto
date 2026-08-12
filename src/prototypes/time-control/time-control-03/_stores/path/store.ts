import { createStore } from 'zustand/vanilla'

import { DEFAULT_PATH } from './constants'
import { PathState, PathStore } from './types'

const INITIAL_STATE = {
  pathById: {},
} satisfies Partial<PathState>

export const createPathStore = (): PathStore =>
  createStore<PathState>((set, get) => ({
    ...INITIAL_STATE,
    getPath: (actorId) => get().pathById[actorId] ?? DEFAULT_PATH,
    reset: () => {
      set(INITIAL_STATE)
    },
    setPath: (actorId, path) => {
      set((state) => ({
        pathById: { ...state.pathById, [actorId]: path },
      }))
    },
  }))
