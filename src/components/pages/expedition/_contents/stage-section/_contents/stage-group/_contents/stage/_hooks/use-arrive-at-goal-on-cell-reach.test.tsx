import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import {
  HexStageEventProvider,
  useHexStageEventDispatcher,
} from '@/components/pages/expedition/_stage-components/hex-stage/_events'
import { HexCell } from '@/components/pages/expedition/_stage-components/hex-stage/_lib/hex'

import { StageLayoutProvider } from '../../../../../../../_contexts/stage-layout'
import { DEFAULT_STAGE_LAYOUT } from '../../../../../../../_contexts/stage-layout/constants'
import {
  GamePhaseStoreProvider,
  useGamePhaseStoreApi,
} from '../../../../../../../_stores/game-phase'

import { useArriveAtGoalOnCellReach } from './use-arrive-at-goal-on-cell-reach'

const Wrapper = (props: PropsWithChildren) => {
  const { children } = props

  return (
    <StageLayoutProvider stageLayout={DEFAULT_STAGE_LAYOUT}>
      <HexStageEventProvider>
        <GamePhaseStoreProvider>{children}</GamePhaseStoreProvider>
      </HexStageEventProvider>
    </StageLayoutProvider>
  )
}

const renderArrive = () => {
  const { result } = renderHook(
    () => {
      useArriveAtGoalOnCellReach(PLAYER_ACTOR_ID)

      return {
        dispatcher: useHexStageEventDispatcher(),
        gamePhaseStoreApi: useGamePhaseStoreApi(),
      }
    },
    { wrapper: Wrapper },
  )

  const cellReach = (cell: HexCell, actorId = PLAYER_ACTOR_ID) =>
    act(async () => {
      await result.current.dispatcher['HexStage-cell-reach']({ actorId, cell })
    })

  return { cellReach, gamePhaseStoreApi: result.current.gamePhaseStoreApi }
}

describe('useArriveAtGoalOnCellReach', () => {
  it('clearing でゴールセルの中心へ着くと cleared へ進む', async () => {
    const { cellReach, gamePhaseStoreApi } = renderArrive()

    gamePhaseStoreApi.getState().reachGoal()
    await cellReach(DEFAULT_STAGE_LAYOUT.goal)

    expect(gamePhaseStoreApi.getState().phase).toBe('cleared')
  })

  it('ゴール以外のセルへの到達では進まない', async () => {
    const { cellReach, gamePhaseStoreApi } = renderArrive()

    gamePhaseStoreApi.getState().reachGoal()
    await cellReach({ q: 0, r: 0 })

    expect(gamePhaseStoreApi.getState().phase).toBe('clearing')
  })

  it('他 actor のゴール到達では進まない', async () => {
    const { cellReach, gamePhaseStoreApi } = renderArrive()

    gamePhaseStoreApi.getState().reachGoal()
    await cellReach(DEFAULT_STAGE_LAYOUT.goal, 'other')

    expect(gamePhaseStoreApi.getState().phase).toBe('clearing')
  })
})
