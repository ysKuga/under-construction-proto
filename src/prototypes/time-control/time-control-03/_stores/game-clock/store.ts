import { createStore } from 'zustand/vanilla'

import { buildHistory } from './lib'
import { GameClockState, GameClockStore, GameEvent } from './types'

const INITIAL_STATE = {
  commonGameTimeMs: 0,
  eventLog: [],
} satisfies Partial<GameClockState>

export const createGameClockStore = (): GameClockStore =>
  createStore<GameClockState>((set, get) => ({
    ...INITIAL_STATE,
    getHistory: (actorIds) => buildHistory(actorIds, get().eventLog),
    logEvent: (<TEvent extends GameEvent>(
      payload: Omit<TEvent, 'gameTimeMs'>,
      advanceTickMs?: number,
    ): TEvent => {
      if (advanceTickMs === undefined) {
        const event = {
          ...payload,
          gameTimeMs: get().commonGameTimeMs,
        } as TEvent

        set((state) => ({
          eventLog: [...state.eventLog, { event, time: Date.now() }],
        }))

        return event
      }

      const gameTimeMs = get().commonGameTimeMs + advanceTickMs
      const event = { ...payload, gameTimeMs } as TEvent

      set((state) => ({
        commonGameTimeMs: gameTimeMs,
        eventLog: [...state.eventLog, { event, time: Date.now() }],
      }))

      return event
    }) as GameClockState['logEvent'],
    logEventAt: (<TEvent extends GameEvent>(
      payload: Omit<TEvent, 'gameTimeMs'>,
      gameTimeMs: number,
    ): TEvent => {
      const event = { ...payload, gameTimeMs } as TEvent

      set((state) => ({
        commonGameTimeMs: Math.max(state.commonGameTimeMs, gameTimeMs),
        eventLog: [...state.eventLog, { event, time: Date.now() }],
      }))

      return event
    }) as GameClockState['logEventAt'],
    reset: () => {
      set(INITIAL_STATE)
    },
  }))
