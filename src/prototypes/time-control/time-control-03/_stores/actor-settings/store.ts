import { createStore } from 'zustand/vanilla'

import { DEFAULT_ACTOR_SETTINGS } from './constants'
import { ActorSettingsState, ActorSettingsStore } from './types'

const INITIAL_STATE = {
  settingsById: {},
} satisfies Partial<ActorSettingsState>

export const createActorSettingsStore = (): ActorSettingsStore =>
  createStore<ActorSettingsState>((set, get) => ({
    ...INITIAL_STATE,
    getActorSettings: (actorId) =>
      get().settingsById[actorId] ?? DEFAULT_ACTOR_SETTINGS,
    reset: () => {
      set(INITIAL_STATE)
    },
    setFixedPathSteps: (actorId, steps) => {
      set((state) => ({
        settingsById: {
          ...state.settingsById,
          [actorId]: {
            ...(state.settingsById[actorId] ?? DEFAULT_ACTOR_SETTINGS),
            fixedPathSteps: steps,
          },
        },
      }))
    },
    setFixedPathStepsAll: (actorIds, steps) => {
      set((state) => ({
        settingsById: actorIds.reduce(
          (settingsById, actorId) => ({
            ...settingsById,
            [actorId]: {
              ...(state.settingsById[actorId] ?? DEFAULT_ACTOR_SETTINGS),
              fixedPathSteps: steps,
            },
          }),
          state.settingsById,
        ),
      }))
    },
    setIsFixedPathSteps: (actorId, isFixed) => {
      set((state) => ({
        settingsById: {
          ...state.settingsById,
          [actorId]: {
            ...(state.settingsById[actorId] ?? DEFAULT_ACTOR_SETTINGS),
            isFixedPathSteps: isFixed,
          },
        },
      }))
    },
    setIsFixedPathStepsAll: (actorIds, isFixed) => {
      set((state) => ({
        settingsById: actorIds.reduce(
          (settingsById, actorId) => ({
            ...settingsById,
            [actorId]: {
              ...(state.settingsById[actorId] ?? DEFAULT_ACTOR_SETTINGS),
              isFixedPathSteps: isFixed,
            },
          }),
          state.settingsById,
        ),
      }))
    },
    setProgressMode: (actorId, mode) => {
      set((state) => ({
        settingsById: {
          ...state.settingsById,
          [actorId]: {
            ...(state.settingsById[actorId] ?? DEFAULT_ACTOR_SETTINGS),
            progressMode: mode,
          },
        },
      }))
    },
    toggleProgressMode: (actorIds) => {
      const currentMode = get().getActorSettings(actorIds[0]).progressMode
      const nextMode = currentMode === 'auto' ? 'manual' : 'auto'

      set((state) => ({
        settingsById: actorIds.reduce(
          (settingsById, actorId) => ({
            ...settingsById,
            [actorId]: {
              ...(state.settingsById[actorId] ?? DEFAULT_ACTOR_SETTINGS),
              progressMode: nextMode,
            },
          }),
          state.settingsById,
        ),
      }))
    },
  }))
