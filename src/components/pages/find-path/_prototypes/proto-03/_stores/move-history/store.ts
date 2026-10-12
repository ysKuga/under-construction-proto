import { createStore } from 'zustand/vanilla'

import { MoveHistoryState, MoveHistoryStore } from './types'

/** 手数の履歴の保持上限 */
export const MOVE_HISTORY_LIMIT = 10000

/** 手数の履歴の store を生成する */
export const createMoveHistoryStore = (): MoveHistoryStore =>
  createStore<MoveHistoryState>((set) => ({
    moves: [],
    record: (path) => {
      set(({ moves }) => ({
        moves: [...moves, path].slice(-MOVE_HISTORY_LIMIT),
      }))
    },
  }))
