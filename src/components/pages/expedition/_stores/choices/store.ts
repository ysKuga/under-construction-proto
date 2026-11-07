import { createStore } from 'zustand/vanilla'

import { ChoicesState, ChoicesStore } from './types'

/** 選択肢パネルへ並べる選択肢の store を生成する */
export const createChoicesStore = (): ChoicesStore =>
  createStore<ChoicesState>((set) => ({
    choices: [],
    register: (choice) => {
      set((state) => ({
        choices: [
          ...state.choices.filter(({ id }) => id !== choice.id),
          choice,
        ].sort((a, b) => a.order - b.order),
      }))
    },
    unregister: (id) => {
      set((state) => ({
        choices: state.choices.filter((choice) => choice.id !== id),
      }))
    },
  }))
