import { createGamePhaseStore } from './store'

describe('createGamePhaseStore', () => {
  it('playing → clearing → cleared の順に進む', () => {
    const store = createGamePhaseStore()

    expect(store.getState().phase).toBe('playing')

    store.getState().reachGoal()

    expect(store.getState().phase).toBe('clearing')

    store.getState().arriveAtGoal()

    expect(store.getState().phase).toBe('cleared')
  })

  it('playing のままゴール中心へ着いても cleared へ進まない', () => {
    const store = createGamePhaseStore()

    store.getState().arriveAtGoal()

    expect(store.getState().phase).toBe('playing')
  })

  it('cleared でゴールへ再進入しても戻らない', () => {
    const store = createGamePhaseStore()

    store.getState().reachGoal()
    store.getState().arriveAtGoal()
    store.getState().reachGoal()

    expect(store.getState().phase).toBe('cleared')
  })

  it('allows は現在のフェーズの許可を返す', () => {
    const store = createGamePhaseStore()

    expect(store.getState().allows('enterCell')).toBe(true)

    store.getState().reachGoal()

    expect(store.getState().allows('enterCell')).toBe(false)
  })
})
