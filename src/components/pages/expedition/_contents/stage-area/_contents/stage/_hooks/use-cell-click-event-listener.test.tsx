import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren, useEffect } from 'react'

import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/expedition/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import {
  Stage07HandleProvider,
  useStage07HandleRef,
} from '@/components/pages/expedition/_stage-components/hex-stage/_contexts/stage07-handle'
import {
  Stage07EventProvider,
  useStage07EventDispatcher,
} from '@/components/pages/expedition/_stage-components/hex-stage/_events'
import { HexCell } from '@/components/pages/expedition/_stage-components/hex-stage/_lib/hex'
import { ActorsStoreProvider } from '@/components/pages/expedition/_stage-components/hex-stage/_stores/actors'

import { StageLayoutProvider } from '../../../../../_contexts/stage-layout'
import { DEFAULT_STAGE_LAYOUT } from '../../../../../_contexts/stage-layout/constants'
import {
  FindPathEventProvider,
  useFindPathEventListener,
} from '../../../../../_events'
import { CarriedItemStoreProvider } from '../../../../../_stores/carried-items'
import { MoveHistoryStoreProvider } from '../../../../../_stores/move-history'
import { PlayerActivityStoreProvider } from '../../../../../_stores/player-activity'
import {
  useWaypointFlowStoreApi,
  WaypointFlowStoreProvider,
} from '../../../../../_stores/waypoint-flow'

import { useCellClickEventListener } from './use-cell-click-event-listener'

vi.unmock('zustand')

const Wrapper = (props: PropsWithChildren) => (
  <StageLayoutProvider stageLayout={DEFAULT_STAGE_LAYOUT}>
    <EnergyStoreProvider>
      <MoveHistoryStoreProvider>
        <CarriedItemStoreProvider>
          <PlayerActivityStoreProvider>
            <FindPathEventProvider>
              <ActorsStoreProvider
                initialActors={{ [PLAYER_ACTOR_ID]: { q: 0, r: 0 } }}
              >
                <Stage07EventProvider>
                  <WaypointFlowStoreProvider>
                    <Stage07HandleProvider>
                      {props.children}
                    </Stage07HandleProvider>
                  </WaypointFlowStoreProvider>
                </Stage07EventProvider>
              </ActorsStoreProvider>
            </FindPathEventProvider>
          </PlayerActivityStoreProvider>
        </CarriedItemStoreProvider>
      </MoveHistoryStoreProvider>
    </EnergyStoreProvider>
  </StageLayoutProvider>
)

/**
 * listener を有効化し、`Stage07-cell-click` を発行できるようにする
 *
 * @param moveTo handle の `moveTo`（既定は常に移動できない）
 * @param onShakeBotBubble `FindPath-shake-bot-bubble` の購読
 */
const renderListener = (
  moveTo = vi.fn<(cell: HexCell) => boolean>(() => false),
  onShakeBotBubble = vi.fn<() => void>(),
) => {
  const { result } = renderHook(
    () => {
      const stage07HandleRef = useStage07HandleRef()
      const dispatcher = useStage07EventDispatcher()

      useEffect(() => {
        // handle を moveTo のみ差し替える
        stage07HandleRef.current = {
          followPath: () => {},
          moveTo,
          warp: () => {},
        }
      }, [stage07HandleRef])
      useCellClickEventListener()
      useFindPathEventListener('FindPath-shake-bot-bubble', onShakeBotBubble)

      return {
        dispatcher,
        energy: useEnergyStoreApi(),
        waypointFlow: useWaypointFlowStoreApi(),
      }
    },
    { wrapper: Wrapper },
  )

  /** セルのクリックを発行する */
  const click = (cell: HexCell) =>
    act(() => result.current.dispatcher['Stage07-cell-click']({ cell }))

  return { click, moveTo, onShakeBotBubble, result }
}

test('現在マスのクリックでは移動も目標設定もしない', async () => {
  const { click, moveTo, result } = renderListener()

  await click({ q: 0, r: 0 })

  expect(moveTo).not.toHaveBeenCalled()
  expect(result.current.waypointFlow.getState().flowState).toBe('idle')
})

test('移動できたら目標設定しない', async () => {
  const { click, moveTo, result } = renderListener(vi.fn(() => true))

  await click({ q: 0, r: 1 })

  expect(moveTo).toHaveBeenCalledWith({ q: 0, r: 1 })
  expect(result.current.waypointFlow.getState().flowState).toBe('idle')
})

test('隣接マスでも moveTo に拒否されたら目標として経路を提示する', async () => {
  const { click, moveTo, result } = renderListener()

  await click({ q: 0, r: 1 })

  expect(moveTo).toHaveBeenCalledWith({ q: 0, r: 1 })
  expect(result.current.waypointFlow.getState().flowState).toBe('proposing')
})

test('非隣接マスでは moveTo を呼ばない', async () => {
  const { click, moveTo } = renderListener()

  await click({ q: 2, r: 0 })

  expect(moveTo).not.toHaveBeenCalled()
})

test('経路提示中に目標セルを再クリックすると目標設定をキャンセルする', async () => {
  const { click, result } = renderListener()
  const { waypointFlow } = result.current

  act(() => {
    waypointFlow.getState().propose({ q: 2, r: 3 })
  })
  await click({ q: 2, r: 3 })

  expect(waypointFlow.getState().flowState).toBe('idle')
  expect(waypointFlow.getState().objectiveCell).toBeUndefined()
})

test('EN 切れでも目標セルの再クリックでキャンセルできる', async () => {
  const { click, result } = renderListener()
  const { energy, waypointFlow } = result.current
  const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

  act(() => {
    waypointFlow.getState().propose({ q: 2, r: 3 })
    energy.getState().consume(PLAYER_ACTOR_ID, max)
  })
  await click({ q: 2, r: 3 })

  expect(waypointFlow.getState().flowState).toBe('idle')
})

test('EN 切れで提示を拒否されると bot 頭上の吹き出しを揺らす', async () => {
  const { click, onShakeBotBubble, result } = renderListener()
  const { energy, waypointFlow } = result.current
  const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

  act(() => {
    energy.getState().consume(PLAYER_ACTOR_ID, max)
  })
  await click({ q: 2, r: 0 })

  expect(onShakeBotBubble).toHaveBeenCalledTimes(1)
  expect(waypointFlow.getState().flowState).toBe('idle')
})

test('提示を許可されれば吹き出しを揺らさず経路を提示する', async () => {
  const { click, onShakeBotBubble, result } = renderListener()

  await click({ q: 2, r: 0 })

  expect(onShakeBotBubble).not.toHaveBeenCalled()
  expect(result.current.waypointFlow.getState().flowState).toBe('proposing')
})
