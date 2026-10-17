import { createStore } from 'zustand/vanilla'

import { MoveHistoryState, MoveHistoryStore } from './types'

/** 手数の履歴の保持上限 */
export const MOVE_HISTORY_LIMIT = 10000

/** 手数の履歴の store を生成する */
export const createMoveHistoryStore = (): MoveHistoryStore =>
  createStore<MoveHistoryState>((set) => ({
    entries: [],
    record: (entry) => {
      // 上限を超えた古い分は捨てる
      set(({ entries }) => ({
        entries: [...entries, entry].slice(-MOVE_HISTORY_LIMIT),
      }))
    },
  }))
