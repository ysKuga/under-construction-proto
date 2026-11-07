import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren, useState } from 'react'

import { useExpeditionEventDispatcher } from '../../_events'
import { ExpeditionEventContext } from '../../_events/_contexts/event-context'
import { ChoicesStoreProvider, useChoicesStore } from '../../_stores/choices'
import {
  useWaypointFlowStoreApi,
  WaypointFlowStoreProvider,
} from '../../_stores/waypoint-flow'

import { useRouteChoices } from '.'

vi.unmock('zustand')

/** 「実行」の処理（ステージの handle 等に依存するため差し替える） */
const executePath = vi.fn<() => Promise<void>>(async () => {})

vi.mock('./_hooks/use-execute-path', () => ({
  useExecutePath: () => executePath,
}))

/** listener（`ExpeditionEventListeners`）を含めず EventTarget のみ配布する */
const Wrapper = (props: PropsWithChildren) => {
  const [eventTarget] = useState(() => new EventTarget())

  return (
    <WaypointFlowStoreProvider>
      <ChoicesStoreProvider>
        <ExpeditionEventContext.Provider value={eventTarget}>
          {props.children}
        </ExpeditionEventContext.Provider>
      </ChoicesStoreProvider>
    </WaypointFlowStoreProvider>
  )
}

/** 経路の選択肢を登録し、登録済みの選択肢・選択の発行・中継点フローの store api を描画する */
const renderRouteChoices = () =>
  renderHook(
    () => {
      useRouteChoices()

      return {
        choices: useChoicesStore((state) => state.choices),
        dispatcher: useExpeditionEventDispatcher(),
        waypointFlowStoreApi: useWaypointFlowStoreApi(),
      }
    },
    { wrapper: Wrapper },
  )

/**
 * 選択肢を選ぶ（`Expedition-choice-select` を発行する）
 *
 * @param result 描画結果
 * @param id 選ぶ選択肢の識別子
 */
const select = (
  result: ReturnType<typeof renderRouteChoices>['result'],
  id: string,
) =>
  act(() => {
    void result.current.dispatcher['Expedition-choice-select']({ id })
  })

describe('useRouteChoices', () => {
  beforeEach(() => executePath.mockClear())

  it('経路提示中でなければ登録しない', () => {
    expect(renderRouteChoices().result.current.choices).toEqual([])
  })

  it('経路提示中は実行・中継点・キャンセルを登録する', () => {
    const { result } = renderRouteChoices()

    act(() =>
      result.current.waypointFlowStoreApi.getState().setFlowState('proposing'),
    )

    expect(result.current.choices.map(({ id }) => id)).toEqual([
      'execute',
      'waypoint',
      'cancel',
    ])
  })

  it('実行の選択で経路の自動移動を開始する', () => {
    const { result } = renderRouteChoices()

    act(() =>
      result.current.waypointFlowStoreApi.getState().setFlowState('proposing'),
    )
    select(result, 'execute')

    expect(executePath).toHaveBeenCalledTimes(1)
  })

  it('中継点の選択で選択中を切り替え、選択中は押下中の表示にする', () => {
    const { result } = renderRouteChoices()
    /** 中継点の選択肢が押下中か */
    const waypointPressed = () =>
      result.current.choices.find(({ id }) => id === 'waypoint')?.pressed

    act(() =>
      result.current.waypointFlowStoreApi.getState().setFlowState('proposing'),
    )
    expect(waypointPressed()).toBe(false)

    select(result, 'waypoint')
    expect(result.current.waypointFlowStoreApi.getState().flowState).toBe(
      'selecting',
    )
    expect(waypointPressed()).toBe(true)

    select(result, 'waypoint')
    expect(result.current.waypointFlowStoreApi.getState().flowState).toBe(
      'proposing',
    )
  })

  it('キャンセルの選択で中継点選択中からも通常状態へ戻し、登録を外す', () => {
    const { result } = renderRouteChoices()

    act(() =>
      result.current.waypointFlowStoreApi.getState().setFlowState('selecting'),
    )
    select(result, 'cancel')

    expect(result.current.waypointFlowStoreApi.getState().flowState).toBe(
      'idle',
    )
    expect(result.current.choices).toEqual([])
  })

  it('他の選択肢の id では何もしない', () => {
    const { result } = renderRouteChoices()

    act(() =>
      result.current.waypointFlowStoreApi.getState().setFlowState('proposing'),
    )
    select(result, 'other')

    expect(executePath).not.toHaveBeenCalled()
    expect(result.current.waypointFlowStoreApi.getState().flowState).toBe(
      'proposing',
    )
  })
})
