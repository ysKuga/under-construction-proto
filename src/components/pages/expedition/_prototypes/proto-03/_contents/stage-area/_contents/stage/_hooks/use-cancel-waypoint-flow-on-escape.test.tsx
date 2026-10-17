import { act, fireEvent, renderHook } from '@testing-library/react'

import {
  useWaypointFlowStoreApi,
  WaypointFlowStoreProvider,
} from '../../../../../_stores/waypoint-flow'

import { useCancelWaypointFlowOnEscape } from './use-cancel-waypoint-flow-on-escape'

vi.unmock('zustand')

const setupCancelOnEscape = () => {
  const { result } = renderHook(
    () => {
      useCancelWaypointFlowOnEscape()

      return useWaypointFlowStoreApi()
    },
    { wrapper: WaypointFlowStoreProvider },
  )

  return result.current
}

const pressEscape = () => {
  fireEvent.keyDown(window, { key: 'Escape' })
}

describe('useCancelWaypointFlowOnEscape', () => {
  it('中継点選択中の ESC で中継点を消し、経路提示中へ戻す', () => {
    const store = setupCancelOnEscape()

    act(() => {
      store.getState().propose({ q: 2, r: 3 })
      store.getState().setFlowState('selecting')
      store.getState().setWaypoints([{ q: 1, r: 1 }])
    })
    pressEscape()

    expect(store.getState().flowState).toBe('proposing')
    expect(store.getState().objectiveCell).toEqual({ q: 2, r: 3 })
    expect(store.getState().waypoints).toEqual([])
  })

  it('経路提示中の ESC で目標設定をキャンセルする', () => {
    const store = setupCancelOnEscape()

    act(() => {
      store.getState().propose({ q: 2, r: 3 })
    })
    pressEscape()

    expect(store.getState().flowState).toBe('idle')
    expect(store.getState().objectiveCell).toBeUndefined()
  })

  it('中継点選択中から ESC 2 回で通常状態へ戻る', () => {
    const store = setupCancelOnEscape()

    act(() => {
      store.getState().propose({ q: 2, r: 3 })
      store.getState().setFlowState('selecting')
    })
    pressEscape()
    pressEscape()

    expect(store.getState().flowState).toBe('idle')
  })

  it('ESC 以外で選択を抜けた後の ESC は目標設定のキャンセルになる', () => {
    const store = setupCancelOnEscape()

    act(() => {
      store.getState().propose({ q: 2, r: 3 })
      store.getState().setFlowState('selecting')
      store.getState().setWaypoints([{ q: 1, r: 1 }])
      // 「完了」相当（中継点を残して経路提示中へ戻る）
      store.getState().setFlowState('proposing')
    })
    pressEscape()

    expect(store.getState().flowState).toBe('idle')
  })

  it('ESC 以外のキーでは何もしない', () => {
    const store = setupCancelOnEscape()

    act(() => {
      store.getState().propose({ q: 2, r: 3 })
    })
    fireEvent.keyDown(window, { key: 'Enter' })

    expect(store.getState().flowState).toBe('proposing')
  })
})
