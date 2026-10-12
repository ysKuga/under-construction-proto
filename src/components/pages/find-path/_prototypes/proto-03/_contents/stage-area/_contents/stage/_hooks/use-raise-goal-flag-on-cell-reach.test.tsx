import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import {
  Stage07EventProvider,
  useStage07EventDispatcher,
} from '@/prototypes/stage/stage-07/_events'
import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { StageLayoutProvider } from '../../../../../_contexts/stage-layout'
import { DEFAULT_STAGE_LAYOUT } from '../../../../../_contexts/stage-layout/constants'
import { GoalStoreProvider, useGoalStoreApi } from '../../../../../_stores/goal'

import { useRaiseGoalFlagOnCellReach } from './use-raise-goal-flag-on-cell-reach'

const Wrapper = (props: PropsWithChildren) => {
  const { children } = props

  return (
    <StageLayoutProvider stageLayout={DEFAULT_STAGE_LAYOUT}>
      <Stage07EventProvider>
        <GoalStoreProvider>{children}</GoalStoreProvider>
      </Stage07EventProvider>
    </StageLayoutProvider>
  )
}

const renderRaise = () => {
  const { result } = renderHook(
    () => {
      useRaiseGoalFlagOnCellReach(PLAYER_ACTOR_ID)

      return {
        dispatcher: useStage07EventDispatcher(),
        goalStoreApi: useGoalStoreApi(),
      }
    },
    { wrapper: Wrapper },
  )

  const cellReach = (cell: HexCell, actorId = PLAYER_ACTOR_ID) =>
    act(async () => {
      await result.current.dispatcher['Stage07-cell-reach']({ actorId, cell })
    })

  return { cellReach, goalStoreApi: result.current.goalStoreApi }
}

describe('useRaiseGoalFlagOnCellReach', () => {
  it('到達済みでゴールセルの中心へ着くと旗を掲げる', async () => {
    const { cellReach, goalStoreApi } = renderRaise()

    goalStoreApi.getState().reach()
    await cellReach(DEFAULT_STAGE_LAYOUT.goal)

    expect(goalStoreApi.getState().flagRaised).toBe(true)
  })

  it('ゴール以外のセルへの到達では掲げない', async () => {
    const { cellReach, goalStoreApi } = renderRaise()

    goalStoreApi.getState().reach()
    await cellReach({ q: 0, r: 0 })

    expect(goalStoreApi.getState().flagRaised).toBe(false)
  })

  it('他 actor のゴール到達では掲げない', async () => {
    const { cellReach, goalStoreApi } = renderRaise()

    goalStoreApi.getState().reach()
    await cellReach(DEFAULT_STAGE_LAYOUT.goal, 'other')

    expect(goalStoreApi.getState().flagRaised).toBe(false)
  })
})
