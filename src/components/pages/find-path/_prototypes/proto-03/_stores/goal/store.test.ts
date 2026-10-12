import { createGoalStore } from './store'

describe('createGoalStore', () => {
  it('reach で到達済みになる', () => {
    const store = createGoalStore()

    expect(store.getState().reached).toBe(false)

    store.getState().reach()

    expect(store.getState().reached).toBe(true)
  })

  it('raiseFlag は到達済みのときのみ旗を掲げる', () => {
    const store = createGoalStore()

    store.getState().raiseFlag()

    expect(store.getState().flagRaised).toBe(false)

    store.getState().reach()
    store.getState().raiseFlag()

    expect(store.getState().flagRaised).toBe(true)
  })
})
