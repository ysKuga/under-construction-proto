import { createFollowPathStore } from './store'

describe('createFollowPathStore', () => {
  it('start で経路を固定し、advance で進んだマス数を数える', () => {
    const store = createFollowPathStore()
    const path = [
      { q: 0, r: 1 },
      { q: 0, r: 2 },
    ]

    store.getState().start(path)
    store.getState().advance()

    expect(store.getState().followingPath).toBe(path)
    expect(store.getState().followedCount).toBe(1)
    expect(store.getState().isFollowing()).toBe(true)
  })

  it('自動移動中でなければ advance は何もしない', () => {
    const store = createFollowPathStore()

    store.getState().advance()

    expect(store.getState().followedCount).toBe(0)
  })

  it('end で経路・進んだマス数をクリアする', () => {
    const store = createFollowPathStore()

    store.getState().start([{ q: 0, r: 1 }])
    store.getState().advance()
    store.getState().end()

    expect(store.getState().followingPath).toEqual([])
    expect(store.getState().followedCount).toBe(0)
    expect(store.getState().isFollowing()).toBe(false)
  })
})
