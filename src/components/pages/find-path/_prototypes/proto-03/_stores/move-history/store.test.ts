import { createMoveHistoryStore, MOVE_HISTORY_LIMIT } from './store'

describe('createMoveHistoryStore', () => {
  it('手・リセットを古い順に記録する', () => {
    const store = createMoveHistoryStore()

    expect(store.getState().entries).toEqual([])

    store.getState().recordMove([{ q: 1, r: 0 }])
    store.getState().recordReset()
    store.getState().recordMove([
      { q: 1, r: 1 },
      { q: 1, r: 2 },
    ])

    expect(store.getState().entries).toEqual([
      { kind: 'move', path: [{ q: 1, r: 0 }] },
      { kind: 'reset' },
      {
        kind: 'move',
        path: [
          { q: 1, r: 1 },
          { q: 1, r: 2 },
        ],
      },
    ])
  })

  it('上限を超えたら古い順に捨てる', () => {
    const store = createMoveHistoryStore()

    for (let q = 0; q <= MOVE_HISTORY_LIMIT; q++) {
      store.getState().recordMove([{ q, r: 0 }])
    }

    const { entries } = store.getState()

    expect(entries).toHaveLength(MOVE_HISTORY_LIMIT)
    expect(entries[0]).toEqual({ kind: 'move', path: [{ q: 1, r: 0 }] })
  })
})
