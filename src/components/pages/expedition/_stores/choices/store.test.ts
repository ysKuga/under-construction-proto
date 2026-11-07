import { createChoicesStore } from './store'

describe('createChoicesStore', () => {
  it('order 順に並べ、同じ id は置き換える', () => {
    const store = createChoicesStore()

    store.getState().register({ id: 'b', label: 'B', order: 20 })
    store.getState().register({ id: 'a', label: 'A', order: 10 })
    store.getState().register({ id: 'b', label: 'B2', order: 20 })

    expect(
      store.getState().choices.map(({ id, label }) => ({ id, label })),
    ).toEqual([
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B2' },
    ])
  })

  it('登録し直すと通し番号が変わる', () => {
    const store = createChoicesStore()

    store.getState().register({ id: 'a', label: 'A', order: 10 })
    /** 1 回目の通し番号 */
    const firstSerial = store.getState().choices[0].serial

    store.getState().register({ id: 'a', label: 'A', order: 10 })

    expect(store.getState().choices[0].serial).not.toBe(firstSerial)
  })

  it('unregister で登録を外す', () => {
    const store = createChoicesStore()

    store.getState().register({ id: 'a', label: 'A', order: 10 })
    store.getState().unregister('a')

    expect(store.getState().choices).toEqual([])
  })
})
