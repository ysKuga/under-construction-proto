import { fireEvent, renderHook } from '@testing-library/react'

import {
  WaypointFlowStoreProvider,
  useWaypointFlowStoreApi,
} from '../../../../../_stores/waypoint-flow'

import { useEffectCancelWaypointSelectingOnEscape } from './use-effect-cancel-waypoint-selecting-on-escape'

const renderCancelOnEscape = () => {
  const { result } = renderHook(
    () => {
      useEffectCancelWaypointSelectingOnEscape()

      return useWaypointFlowStoreApi()
    },
    { wrapper: WaypointFlowStoreProvider },
  )

  return result.current
}

describe('useEffectCancelWaypointSelectingOnEscape', () => {
  it('中継点選択中の ESC で中継点を消し、経路提示中へ戻す', () => {
    const store = renderCancelOnEscape()

    store.getState().propose({ q: 2, r: 3 })
    store.getState().setFlowState('selecting')
    store.getState().setWaypoints([{ q: 1, r: 1 }])
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(store.getState().flowState).toBe('proposing')
    expect(store.getState().waypoints).toEqual([])
  })

  it('中継点選択中でなければ ESC で何もしない', () => {
    const store = renderCancelOnEscape()

    store.getState().propose({ q: 2, r: 3 })
    fireEvent.keyDown(window, { key: 'Escape' })

    expect(store.getState().flowState).toBe('proposing')
    expect(store.getState().objectiveCell).toEqual({ q: 2, r: 3 })
  })

  it('ESC 以外のキーでは何もしない', () => {
    const store = renderCancelOnEscape()

    store.getState().propose({ q: 2, r: 3 })
    store.getState().setFlowState('selecting')
    store.getState().setWaypoints([{ q: 1, r: 1 }])
    fireEvent.keyDown(window, { key: 'Enter' })

    expect(store.getState().flowState).toBe('selecting')
    expect(store.getState().waypoints).toEqual([{ q: 1, r: 1 }])
  })
})
