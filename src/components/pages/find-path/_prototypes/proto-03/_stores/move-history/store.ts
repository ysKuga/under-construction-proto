import { createStore } from 'zustand/vanilla'

import { MoveHistoryEntry, MoveHistoryState, MoveHistoryStore } from './types'

/** 手数の履歴の保持上限 */
export const MOVE_HISTORY_LIMIT = 10000

/** 手数の履歴の store を生成する */
export const createMoveHistoryStore = (): MoveHistoryStore =>
  createStore<MoveHistoryState>((set) => {
    /** 履歴へ 1 件追加し、上限を超えた古い分を捨てる */
    const append = (entry: MoveHistoryEntry) => {
      set(({ entries }) => ({
        entries: [...entries, entry].slice(-MOVE_HISTORY_LIMIT),
      }))
    }

    return {
      entries: [],
      recordMove: (path) => append({ kind: 'move', path }),
      recordReset: () => append({ kind: 'reset' }),
    }
  })
