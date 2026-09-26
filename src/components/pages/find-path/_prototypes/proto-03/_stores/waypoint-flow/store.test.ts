import { createWaypointFlowStore } from './store'

describe('createWaypointFlowStore', () => {
  it('propose で目標を設定し、経路提示中へ移行する', () => {
    const store = createWaypointFlowStore()

    store.getState().propose({ q: 2, r: 3 })

    expect(store.getState().objectiveCell).toEqual({ q: 2, r: 3 })
    expect(store.getState().flowState).toBe('proposing')
  })

  it('propose は前の目標の中継点を引き継がない', () => {
    const store = createWaypointFlowStore()

    store.getState().propose({ q: 2, r: 3 })
    store.getState().setWaypoints([{ q: 1, r: 1 }])
    store.getState().propose({ q: 4, r: 0 })

    expect(store.getState().objectiveCell).toEqual({ q: 4, r: 0 })
    expect(store.getState().waypoints).toEqual([])
  })

  it('clear は目標・中継点を消し通常状態へ戻す', () => {
    const store = createWaypointFlowStore()

    store.getState().propose({ q: 2, r: 3 })
    store.getState().setWaypoints([{ q: 1, r: 1 }])
    store.getState().setFlowState('selecting')
    store.getState().clear()

    expect(store.getState().objectiveCell).toBeUndefined()
    expect(store.getState().flowState).toBe('idle')
    expect(store.getState().waypoints).toEqual([])
  })
})
