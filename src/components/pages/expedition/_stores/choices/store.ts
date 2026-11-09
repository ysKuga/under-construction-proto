import { createStore } from 'zustand/vanilla'

import { ChoicesState, ChoicesStore } from './types'

/** 選択肢パネルへ並べる選択肢の store を生成する */
export const createChoicesStore = (): ChoicesStore => {
  /** 次に振る登録の通し番号 */
  let nextSerial = 0

  return createStore<ChoicesState>((set) => ({
    choices: [],
    register: (choice) => {
      /** 今回の登録の通し番号 */
      const serial = nextSerial++

      set((state) => ({
        choices: [
          ...state.choices.filter(({ id }) => id !== choice.id),
          { ...choice, serial },
        ].sort((a, b) => a.order - b.order),
      }))
    },
    unregister: (id) => {
      set((state) => ({
        choices: state.choices.filter((choice) => choice.id !== id),
      }))
    },
  }))
}
