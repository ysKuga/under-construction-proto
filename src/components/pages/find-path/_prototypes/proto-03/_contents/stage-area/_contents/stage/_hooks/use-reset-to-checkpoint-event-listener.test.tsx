import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { Stage07Handle } from '@/prototypes/stage/stage-07'
import {
  Stage07EventProvider,
  useStage07EventDispatcher,
} from '@/prototypes/stage/stage-07/_events'

import {
  Stage07HandleProvider,
  useStage07HandleRef,
} from '../../../../../_contexts/stage07-handle'
import {
  FindPathEventProvider,
  useFindPathEventDispatcher,
} from '../../../../../_events'
import { CarriedItemStoreProvider } from '../../../../../_stores/carried-items'
import { FogStoreProvider, useFogStoreApi } from '../../../../../_stores/fog'
import {
  useWaypointFlowStoreApi,
  WaypointFlowStoreProvider,
} from '../../../../../_stores/waypoint-flow'
import { START_POSITION } from '../../../../../constants'

import { useResetToCheckpointEventListener } from './use-reset-to-checkpoint-event-listener'

vi.unmock('zustand')

const Wrapper = (props: PropsWithChildren) => (
  <EnergyStoreProvider>
    <CarriedItemStoreProvider>
      <FindPathEventProvider>
        <Stage07EventProvider>
          <FogStoreProvider initialMode="all-hidden">
            <WaypointFlowStoreProvider>
              <Stage07HandleProvider>{props.children}</Stage07HandleProvider>
            </WaypointFlowStoreProvider>
          </FogStoreProvider>
        </Stage07EventProvider>
      </FindPathEventProvider>
    </CarriedItemStoreProvider>
  </EnergyStoreProvider>
)

const setupResetToCheckpoint = () => {
  const { result } = renderHook(
    () => {
      useResetToCheckpointEventListener()

      return {
        energy: useEnergyStoreApi(),
        findPathDispatch: useFindPathEventDispatcher(),
        fog: useFogStoreApi(),
        stage07Dispatch: useStage07EventDispatcher(),
        stage07HandleRef: useStage07HandleRef(),
        waypointFlow: useWaypointFlowStoreApi(),
      }
    },
    { wrapper: Wrapper },
  )
  const warp = vi.fn<Stage07Handle['warp']>()

  result.current.stage07HandleRef.current = {
    followPath: vi.fn<Stage07Handle['followPath']>(),
    warp,
  }

  return { ...result.current, warp }
}

describe('useResetToCheckpointEventListener', () => {
  it('EN 切れ中かつ停止中なら、目標設定を消して開始位置へワープし EN を上限まで回復する', async () => {
    const { energy, findPathDispatch, fog, warp, waypointFlow } =
      setupResetToCheckpoint()
    const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

    energy.getState().consume(PLAYER_ACTOR_ID, max)
    fog.getState().markVisited({ q: 2, r: 3 })
    waypointFlow.getState().propose({ q: 4, r: 4 })

    await act(async () => {
      await expect(
        findPathDispatch['FindPath-reset-to-checkpoint'](undefined),
      ).resolves.toBe(true)
    })

    expect(waypointFlow.getState().flowState).toBe('idle')
    expect(warp).toHaveBeenCalledWith(START_POSITION)
    expect(fog.getState().currentCell).toEqual(START_POSITION)
    expect(energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current).toBe(max)
  })

  it('EN が残っていれば拒否する', async () => {
    const { findPathDispatch, warp } = setupResetToCheckpoint()

    await expect(
      findPathDispatch['FindPath-reset-to-checkpoint'](undefined),
    ).resolves.toBe(false)
    expect(warp).not.toHaveBeenCalled()
  })

  it('移動中は拒否し、停止後は受理する', async () => {
    const { energy, findPathDispatch, stage07Dispatch, warp } =
      setupResetToCheckpoint()
    const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

    energy.getState().consume(PLAYER_ACTOR_ID, max)
    await stage07Dispatch['Stage07-move-start']({ actorId: PLAYER_ACTOR_ID })

    await expect(
      findPathDispatch['FindPath-reset-to-checkpoint'](undefined),
    ).resolves.toBe(false)
    expect(warp).not.toHaveBeenCalled()

    await stage07Dispatch['Stage07-move-stop']({ actorId: PLAYER_ACTOR_ID })

    await act(async () => {
      await expect(
        findPathDispatch['FindPath-reset-to-checkpoint'](undefined),
      ).resolves.toBe(true)
    })
    expect(warp).toHaveBeenCalledWith(START_POSITION)
  })
})
