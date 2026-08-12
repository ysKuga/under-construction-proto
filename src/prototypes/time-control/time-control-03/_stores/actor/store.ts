import { createStore } from 'zustand/vanilla'

import { BASE_TICK_MS } from '../../../time-control-02/_lib/get-tick-ms'

import { DEFAULT_ACTOR_INFO } from './constants'
import { ActorState, ActorStore } from './types'

const INITIAL_STATE = {
  actorById: {},
} satisfies Partial<ActorState>

export const createActorStore = (): ActorStore =>
  createStore<ActorState>((set) => ({
    ...INITIAL_STATE,
    reset: () => {
      set(INITIAL_STATE)
    },
    setTickMs: (actorId, tickMs) => {
      set((state) => ({
        actorById: {
          ...state.actorById,
          [actorId]: {
            ...(state.actorById[actorId] ?? DEFAULT_ACTOR_INFO),
            tickRate: BASE_TICK_MS / tickMs,
          },
        },
      }))
    },
  }))
