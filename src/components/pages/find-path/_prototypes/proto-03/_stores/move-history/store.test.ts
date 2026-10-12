import { createMoveHistoryStore, MOVE_HISTORY_LIMIT } from './store'

describe('createMoveHistoryStore', () => {
  it('record で手を古い順に記録する', () => {
    const store = createMoveHistoryStore()

    expect(store.getState().moves).toEqual([])

    store.getState().record([{ q: 1, r: 0 }])
    store.getState().record([
      { q: 1, r: 1 },
      { q: 1, r: 2 },
    ])

    expect(store.getState().moves).toEqual([
      [{ q: 1, r: 0 }],
      [
        { q: 1, r: 1 },
        { q: 1, r: 2 },
      ],
    ])
  })

  it('上限を超えたら古い順に捨てる', () => {
    const store = createMoveHistoryStore()

    for (let q = 0; q <= MOVE_HISTORY_LIMIT; q++) {
      store.getState().record([{ q, r: 0 }])
    }

    const { moves } = store.getState()

    expect(moves).toHaveLength(MOVE_HISTORY_LIMIT)
    expect(moves[0]).toEqual([{ q: 1, r: 0 }])
  })
})
