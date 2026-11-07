import { act, renderHook } from '@testing-library/react'

import {
  useWaypointFlowStoreApi,
  WaypointFlowStoreProvider,
} from '../../../../../../../_stores/waypoint-flow'

import { useRouteChoices } from './use-route-choices'

vi.unmock('zustand')

/** 選択肢と、中継点フローの store api を描画する */
const renderChoices = (
  handleExecuteSelect = vi.fn<() => Promise<void>>(async () => {}),
) =>
  renderHook(
    () => ({
      choices: useRouteChoices(handleExecuteSelect),
      waypointFlowStoreApi: useWaypointFlowStoreApi(),
    }),
    { wrapper: WaypointFlowStoreProvider },
  )

/** 識別子で選択肢を探す */
const findChoice = (
  choices: ReturnType<typeof useRouteChoices>,
  id: string,
): ReturnType<typeof useRouteChoices>[number] => {
  const choice = choices.find((item) => item.id === id)

  if (!choice) throw new Error(`選択肢 ${id} がない`)

  return choice
}

describe('useRouteChoices', () => {
  it('経路提示中でなければ選択肢なし', () => {
    expect(renderChoices().result.current.choices).toEqual([])
  })

  it('経路提示中は実行・中継点・キャンセルを並べる', () => {
    const { result } = renderChoices()

    act(() =>
      result.current.waypointFlowStoreApi.getState().setFlowState('proposing'),
    )

    expect(result.current.choices.map(({ id }) => id)).toEqual([
      'execute',
      'waypoint',
      'cancel',
    ])
  })

  it('実行で handleExecuteSelect を呼ぶ', () => {
    const handleExecuteSelect = vi.fn<() => Promise<void>>(async () => {})
    const { result } = renderChoices(handleExecuteSelect)

    act(() =>
      result.current.waypointFlowStoreApi.getState().setFlowState('proposing'),
    )
    act(() => findChoice(result.current.choices, 'execute').onSelect())

    expect(handleExecuteSelect).toHaveBeenCalledTimes(1)
  })

  it('中継点で選択中を切り替え、選択中は押下中の表示にする', () => {
    const { result } = renderChoices()

    act(() =>
      result.current.waypointFlowStoreApi.getState().setFlowState('proposing'),
    )
    expect(findChoice(result.current.choices, 'waypoint').pressed).toBe(false)

    act(() => findChoice(result.current.choices, 'waypoint').onSelect())
    expect(result.current.waypointFlowStoreApi.getState().flowState).toBe(
      'selecting',
    )
    expect(findChoice(result.current.choices, 'waypoint').pressed).toBe(true)

    act(() => findChoice(result.current.choices, 'waypoint').onSelect())
    expect(result.current.waypointFlowStoreApi.getState().flowState).toBe(
      'proposing',
    )
  })

  it('キャンセルで中継点選択中からも通常状態へ戻す', () => {
    const { result } = renderChoices()

    act(() =>
      result.current.waypointFlowStoreApi.getState().setFlowState('selecting'),
    )
    act(() => findChoice(result.current.choices, 'cancel').onSelect())

    expect(result.current.waypointFlowStoreApi.getState().flowState).toBe(
      'idle',
    )
    expect(result.current.choices).toEqual([])
  })
})
