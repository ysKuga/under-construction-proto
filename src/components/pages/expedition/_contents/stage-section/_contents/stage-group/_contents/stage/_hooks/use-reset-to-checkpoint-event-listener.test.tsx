import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/expedition/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import {
  HexStageEventProvider,
  useHexStageEventDispatcher,
} from '@/components/pages/expedition/_stage-components/hex-stage/_events'

import { ResetProvider } from '../../../../../../../_contexts/reset'
import { StageLayoutProvider } from '../../../../../../../_contexts/stage-layout'
import { DEFAULT_STAGE_LAYOUT } from '../../../../../../../_contexts/stage-layout/constants'
import {
  ExpeditionEventProvider,
  useExpeditionEventDispatcher,
} from '../../../../../../../_events'
import { CarriedItemStoreProvider } from '../../../../../../../_stores/carried-items'
import {
  FogStoreProvider,
  useFogStoreApi,
} from '../../../../../../../_stores/fog'
import {
  MoveHistoryStoreProvider,
  useMoveHistoryStoreApi,
} from '../../../../../../../_stores/move-history'
import { PlayerActivityStoreProvider } from '../../../../../../../_stores/player-activity'

import { useResetToCheckpointEventListener } from './use-reset-to-checkpoint-event-listener'

vi.unmock('zustand')

const Wrapper = (props: PropsWithChildren) => (
  <StageLayoutProvider stageLayout={DEFAULT_STAGE_LAYOUT}>
    <MoveHistoryStoreProvider>
      <ResetProvider>
        <EnergyStoreProvider>
          <CarriedItemStoreProvider>
            <PlayerActivityStoreProvider>
              <ExpeditionEventProvider>
                <HexStageEventProvider>
                  <FogStoreProvider initialMode="all-hidden">
                    {props.children}
                  </FogStoreProvider>
                </HexStageEventProvider>
              </ExpeditionEventProvider>
            </PlayerActivityStoreProvider>
          </CarriedItemStoreProvider>
        </EnergyStoreProvider>
      </ResetProvider>
    </MoveHistoryStoreProvider>
  </StageLayoutProvider>
)

const setupResetToCheckpoint = () =>
  renderHook(
    () => {
      useResetToCheckpointEventListener()

      return {
        energy: useEnergyStoreApi(),
        expeditionDispatch: useExpeditionEventDispatcher(),
        fog: useFogStoreApi(),
        moveHistory: useMoveHistoryStoreApi(),
        hexStageDispatch: useHexStageEventDispatcher(),
      }
    },
    { wrapper: Wrapper },
  ).result

describe('useResetToCheckpointEventListener', () => {
  it('EN 切れ中かつ停止中なら、配下を再マウントして盤面ごと初期状態へ戻す', async () => {
    const result = setupResetToCheckpoint()
    const { energy, expeditionDispatch, fog } = result.current
    const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

    energy.getState().consume(PLAYER_ACTOR_ID, max)
    fog.getState().markVisited({ q: 2, r: 3 })

    await act(async () => {
      await expect(
        expeditionDispatch['Expedition-reset-to-checkpoint'](undefined),
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
    // 履歴は再マウントの外にあるため残り、リセットが記録される
    expect(result.current.moveHistory.getState().entries).toEqual([
      { kind: 'reset' },
    ])
  })

  it('EN が残っていれば拒否する', async () => {
    const result = setupResetToCheckpoint()
    const { energy, expeditionDispatch } = result.current

    await expect(
      expeditionDispatch['Expedition-reset-to-checkpoint'](undefined),
    ).resolves.toBe(false)
    expect(result.current.energy).toBe(energy)
    expect(result.current.moveHistory.getState().entries).toEqual([])
  })

  it('移動中は拒否し、停止後は受理する', async () => {
    const result = setupResetToCheckpoint()
    const { energy, expeditionDispatch, hexStageDispatch } = result.current
    const { max } = energy.getState().getEnergyInfo(PLAYER_ACTOR_ID)

    energy.getState().consume(PLAYER_ACTOR_ID, max)
    await hexStageDispatch['HexStage-move-start']({ actorId: PLAYER_ACTOR_ID })

    await expect(
      expeditionDispatch['Expedition-reset-to-checkpoint'](undefined),
    ).resolves.toBe(false)
    expect(result.current.energy).toBe(energy)

    await hexStageDispatch['HexStage-move-stop']({ actorId: PLAYER_ACTOR_ID })

    await act(async () => {
      await expect(
        expeditionDispatch['Expedition-reset-to-checkpoint'](undefined),
      ).resolves.toBe(true)
    })
    expect(result.current.energy).not.toBe(energy)
  })
})
