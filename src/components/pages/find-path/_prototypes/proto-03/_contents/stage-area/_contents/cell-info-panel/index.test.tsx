import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  Stage07EventProvider,
  useStage07EventDispatcher,
} from '@/prototypes/stage/stage-07/_events'

import { ItemStoreProvider } from '../../../../_stores/items'
import { ItemInstance } from '../../../../_stores/items/types'
import { WaypointFlowStoreProvider } from '../../../../_stores/waypoint-flow'
import { OBSTACLE_CELLS } from '../../../../constants'

import { useCellInfoPanel } from './index.hooks'

vi.unmock('zustand')

/** EN スポット（残り 2 回） */
const SPOT: ItemInstance = {
  amount: 1,
  cell: { q: 0, r: 1 },
  id: 'spot-1',
  kind: 'energy-charge',
  stock: 2,
}

const Wrapper = (props: PropsWithChildren) => (
  <Stage07EventProvider>
    <ItemStoreProvider initialItems={[SPOT]}>
      <WaypointFlowStoreProvider>{props.children}</WaypointFlowStoreProvider>
    </ItemStoreProvider>
  </Stage07EventProvider>
)

/** hook の戻り値と描画回数・hover 発行を返す */
const renderCellInfoPanel = () => {
  /** 描画回数 */
  let renderCount = 0
  const view = renderHook(
    () => {
      renderCount += 1

      return {
        cellInfoPanel: useCellInfoPanel(),
        dispatcher: useStage07EventDispatcher(),
      }
    },
    { wrapper: Wrapper },
  )
  /** `Stage07-cell-hover` を発行する */
  const hover = (cell: ItemInstance['cell'] | undefined) =>
    act(async () => {
      await view.result.current.dispatcher['Stage07-cell-hover']({ cell })
    })

  return { getHookCallCount: () => renderCount, hover, ...view }
}

test('hover なしは要素一覧を返さない', () => {
  const { result } = renderCellInfoPanel()

  expect(result.current.cellInfoPanel.hoveredCell).toBeUndefined()
  expect(result.current.cellInfoPanel.entries).toEqual([])
})

test('障害物のセルは障害物を返す', async () => {
  const { hover, result } = renderCellInfoPanel()

  await hover(OBSTACLE_CELLS[0])

  expect(result.current.cellInfoPanel.entries).toEqual([
    expect.objectContaining({ key: 'obstacle' }),
  ])
})

test('EN スポットのセルは残り回数を返す', async () => {
  const { hover, result } = renderCellInfoPanel()

  await hover(SPOT.cell)

  expect(result.current.cellInfoPanel.entries).toEqual([
    expect.objectContaining({ key: SPOT.id, status: '残り 2 回' }),
  ])
})

test('同じセルへの hover 通知では再レンダリングしない', async () => {
  const { getHookCallCount, hover } = renderCellInfoPanel()

  await hover(SPOT.cell)
  /** 1回目の hover 後の hook 呼出回数（= 描画回数） */
  const callCountAfterHover = getHookCallCount()
  await hover({ ...SPOT.cell })

  expect(getHookCallCount()).toBe(callCountAfterHover)
})

test('hover 解除で要素一覧を返さない', async () => {
  const { hover, result } = renderCellInfoPanel()

  await hover(SPOT.cell)
  await hover(undefined)

  expect(result.current.cellInfoPanel.hoveredCell).toBeUndefined()
  expect(result.current.cellInfoPanel.entries).toEqual([])
})
