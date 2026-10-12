import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import {
  Stage07EventProvider,
  useStage07EventDispatcher,
} from '@/prototypes/stage/stage-07/_events'

import { ResetProvider } from '../../../../../_contexts/reset'
import { StageLayoutProvider } from '../../../../../_contexts/stage-layout'
import { DEFAULT_STAGE_LAYOUT } from '../../../../../_contexts/stage-layout/constants'
import {
  FindPathEventProvider,
  useFindPathEventDispatcher,
} from '../../../../../_events'
import { CarriedItemStoreProvider } from '../../../../../_stores/carried-items'
import { FogStoreProvider, useFogStoreApi } from '../../../../../_stores/fog'
import { PlayerActivityStoreProvider } from '../../../../../_stores/player-activity'

import { useResetToCheckpointEventListener } from './use-reset-to-checkpoint-event-listener'

vi.unmock('zustand')

const Wrapper = (props: PropsWithChildren) => (
  <StageLayoutProvider stageLayout={DEFAULT_STAGE_LAYOUT}>
    <ResetProvider>
      <EnergyStoreProvider>
        <CarriedItemStoreProvider>
          <PlayerActivityStoreProvider>
            <FindPathEventProvider>
              <Stage07EventProvider>
                <FogStoreProvider initialMode="all-hidden">
                  {props.children}
                </FogStoreProvider>
              </Stage07EventProvider>
            </FindPathEventProvider>
          </PlayerActivityStoreProvider>
        </CarriedItemStoreProvider>
      </EnergyStoreProvider>
    </ResetProvider>
  </StageLayoutProvider>
)

const setupResetToCheckpoint = () =>
  renderHook(
    () => {
      useResetToCheckpointEventListener()

      return {
        energy: useEnergyStoreApi(),
        findPathDispatch: useFindPathEventDispatcher(),
        fog: useFogStoreApi(),
        stage07Dispatch: useStage07EventDispatcher(),
      }
    },
    { wrapper: Wrapper },
  ).result

describe('useResetToCheckpointEventListener', () => {
  it('EN 切れ中かつ停止中なら、配下を再マウントして盤面ごと初期状態へ戻す', async () => {
    const result = setupResetToCheckpoint()
    const { energy, findPathDispatch, fog } = result.current
    const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

    energy.getState().consume(PLAYER_ACTOR_ID, max)
    fog.getState().markVisited({ q: 2, r: 3 })

    await act(async () => {
      await expect(
        findPathDispatch['FindPath-reset-to-checkpoint'](undefined),
      ).resolves.toBe(true)
    })

    expect(result.current.energy).not.toBe(energy)
    expect(
      result.current.energy.getState().getEnergyInfo(PLAYER_ACTOR_ID).current,
    ).toBe(max)
    expect(result.current.fog.getState().currentCell).toEqual(
      DEFAULT_STAGE_LAYOUT.start,
    )
    expect(result.current.fog.getState().visitedKeys.has('2,3')).toBe(false)
  })

  it('EN が残っていれば拒否する', async () => {
    const result = setupResetToCheckpoint()
    const { energy, findPathDispatch } = result.current

    await expect(
      findPathDispatch['FindPath-reset-to-checkpoint'](undefined),
    ).resolves.toBe(false)
    expect(result.current.energy).toBe(energy)
  })

  it('移動中は拒否し、停止後は受理する', async () => {
    const result = setupResetToCheckpoint()
    const { energy, findPathDispatch, stage07Dispatch } = result.current
    const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

    energy.getState().consume(PLAYER_ACTOR_ID, max)
    await stage07Dispatch['Stage07-move-start']({ actorId: PLAYER_ACTOR_ID })

    await expect(
      findPathDispatch['FindPath-reset-to-checkpoint'](undefined),
    ).resolves.toBe(false)
    expect(result.current.energy).toBe(energy)

    await stage07Dispatch['Stage07-move-stop']({ actorId: PLAYER_ACTOR_ID })

    await act(async () => {
      await expect(
        findPathDispatch['FindPath-reset-to-checkpoint'](undefined),
      ).resolves.toBe(true)
    })
    expect(result.current.energy).not.toBe(energy)
  })
})
