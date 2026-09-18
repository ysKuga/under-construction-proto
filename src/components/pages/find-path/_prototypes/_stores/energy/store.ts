import { createStore } from 'zustand/vanilla'

import { DEFAULT_ENERGY_INFO } from './constants'
import { EnergyState, EnergyStore } from './types'

const INITIAL_STATE = {
  energyById: {},
} satisfies Partial<EnergyState>

export const createEnergyStore = (): EnergyStore =>
  createStore<EnergyState>((set, get) => ({
    ...INITIAL_STATE,
    consume: (actorId, amount) => {
      set((state) => {
        const info = state.energyById[actorId] ?? DEFAULT_ENERGY_INFO

        return {
          energyById: {
            ...state.energyById,
            [actorId]: {
              ...info,
              current: Math.max(0, info.current - amount),
            },
          },
        }
      })
    },
    getEnergyInfo: (actorId) =>
      get().energyById[actorId] ?? DEFAULT_ENERGY_INFO,
    recover: (actorId, amount) => {
      set((state) => {
        const info = state.energyById[actorId] ?? DEFAULT_ENERGY_INFO

        return {
          energyById: {
            ...state.energyById,
            [actorId]: {
              ...info,
              current: Math.min(info.max, info.current + amount),
            },
          },
        }
      })
    },
    reset: () => {
      set(INITIAL_STATE)
    },
  }))
