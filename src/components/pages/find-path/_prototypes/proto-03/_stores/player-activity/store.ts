import { createStore } from 'zustand/vanilla'

import { PlayerActivityState, PlayerActivityStore } from './types'

/** player の行為の store を生成する */
export const createPlayerActivityStore = (): PlayerActivityStore =>
  createStore<PlayerActivityState>((set) => ({
    activity: 'idle',
    setActivity: (activity) => {
      set({ activity })
    },
  }))
