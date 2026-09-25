import { createGoalStore } from './store'

describe('createGoalStore', () => {
  it('reach で到達済みになる', () => {
    const store = createGoalStore()

    expect(store.getState().reached).toBe(false)

    store.getState().reach()

    expect(store.getState().reached).toBe(true)
  })
})
