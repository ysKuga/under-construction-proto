import { createStore } from 'zustand/vanilla'

import { DEFAULT_EN_INFO } from './constants'
import { EnState, EnStore } from './types'

const INITIAL_STATE = {
  enById: {},
} satisfies Partial<EnState>

export const createEnStore = (): EnStore =>
  createStore<EnState>((set, get) => ({
    ...INITIAL_STATE,
    consume: (actorId, amount) => {
      set((state) => {
        const info = state.enById[actorId] ?? DEFAULT_EN_INFO

        return {
          enById: {
            ...state.enById,
            [actorId]: {
              ...info,
              current: Math.max(0, info.current - amount),
            },
          },
        }
      })
    },
    getEnInfo: (actorId) => get().enById[actorId] ?? DEFAULT_EN_INFO,
    reset: () => {
      set(INITIAL_STATE)
    },
  }))
