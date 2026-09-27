import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import { ItemStoreProvider } from '../../../../../_stores/items'
import {
  useWaypointFlowStoreApi,
  WaypointFlowStoreProvider,
} from '../../../../../_stores/waypoint-flow'

import { OBJECTIVE_CANCEL_TITLE, useGetCellTitle } from './use-get-cell-title'

vi.unmock('zustand')

const Wrapper = (props: PropsWithChildren) => (
  <ItemStoreProvider initialItems={[]}>
    <WaypointFlowStoreProvider>{props.children}</WaypointFlowStoreProvider>
  </ItemStoreProvider>
)

const renderGetCellTitle = () =>
  renderHook(
    () => ({
      getCellTitle: useGetCellTitle(),
      waypointFlow: useWaypointFlowStoreApi(),
    }),
    { wrapper: Wrapper },
  )

test('経路提示中の目標セルにキャンセル可能な旨を表示する', () => {
  const { result } = renderGetCellTitle()

  act(() => {
    result.current.waypointFlow.getState().propose({ q: 2, r: 3 })
  })

  expect(result.current.getCellTitle({ q: 2, r: 3 })).toContain(
    OBJECTIVE_CANCEL_TITLE,
  )
  expect(result.current.getCellTitle({ q: 3, r: 3 }) ?? '').not.toContain(
    OBJECTIVE_CANCEL_TITLE,
  )
})

test('中継点選択中の目標セルには表示しない', () => {
  const { result } = renderGetCellTitle()

  act(() => {
    result.current.waypointFlow.getState().propose({ q: 2, r: 3 })
    result.current.waypointFlow.getState().setFlowState('selecting')
  })

  expect(result.current.getCellTitle({ q: 2, r: 3 }) ?? '').not.toContain(
    OBJECTIVE_CANCEL_TITLE,
  )
})
