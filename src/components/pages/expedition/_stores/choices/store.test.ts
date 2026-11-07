import { createChoicesStore } from './store'

describe('createChoicesStore', () => {
  it('order 順に並べ、同じ id は置き換える', () => {
    const store = createChoicesStore()

    store.getState().register({ id: 'b', label: 'B', order: 20 })
    store.getState().register({ id: 'a', label: 'A', order: 10 })
    store.getState().register({ id: 'b', label: 'B2', order: 20 })

    expect(store.getState().choices).toEqual([
      { id: 'a', label: 'A', order: 10 },
      { id: 'b', label: 'B2', order: 20 },
    ])
  })

  it('unregister で登録を外す', () => {
    const store = createChoicesStore()

    store.getState().register({ id: 'a', label: 'A', order: 10 })
    store.getState().unregister('a')

    expect(store.getState().choices).toEqual([])
  })
})
