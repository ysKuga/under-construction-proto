import { createPlayerActivityStore } from './store'

describe('createPlayerActivityStore', () => {
  it('停止中から始まり、setActivity で行為を切り替える', () => {
    const store = createPlayerActivityStore()

    expect(store.getState().activity).toBe('idle')

    store.getState().setActivity('recovering')

    expect(store.getState().activity).toBe('recovering')
  })
})
