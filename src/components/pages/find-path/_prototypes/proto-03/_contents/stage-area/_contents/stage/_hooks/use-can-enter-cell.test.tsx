import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import { EnergyStoreProvider } from '@/components/pages/find-path/_prototypes/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import { HEX_DIRECTIONS } from '@/prototypes/stage/stage-07/_lib/hex'
import { ActorsStoreProvider } from '@/prototypes/stage/stage-07/_stores/actors'

import { StageLayoutProvider } from '../../../../../_contexts/stage-layout'
import { DEFAULT_STAGE_LAYOUT } from '../../../../../_contexts/stage-layout/constants'
import { GoalStoreProvider, useGoalStoreApi } from '../../../../../_stores/goal'

import { useCanEnterCell } from './use-can-enter-cell'

vi.unmock('zustand')

const Wrapper = (props: PropsWithChildren) => (
  <StageLayoutProvider stageLayout={DEFAULT_STAGE_LAYOUT}>
    <EnergyStoreProvider>
      <ActorsStoreProvider
        initialActors={{ [PLAYER_ACTOR_ID]: DEFAULT_STAGE_LAYOUT.start }}
      >
        <GoalStoreProvider>{props.children}</GoalStoreProvider>
      </ActorsStoreProvider>
    </EnergyStoreProvider>
  </StageLayoutProvider>
)

/** 開始位置の隣接セル */
const NEIGHBORS = HEX_DIRECTIONS.map((direction) => ({
  q: DEFAULT_STAGE_LAYOUT.start.q + direction.q,
  r: DEFAULT_STAGE_LAYOUT.start.r + direction.r,
}))

describe('useCanEnterCell', () => {
  it('ゴール到達後は全セル進入不可になる', () => {
    const { result } = renderHook(
      () => ({ ...useCanEnterCell(), goal: useGoalStoreApi() }),
      { wrapper: Wrapper },
    )

    expect(NEIGHBORS.some(result.current.canEnterCell)).toBe(true)
    expect(NEIGHBORS.some(result.current.canEnterCellPerceived)).toBe(true)

    act(() => {
      result.current.goal.getState().reach()
    })

    expect(NEIGHBORS.some(result.current.canEnterCell)).toBe(false)
    expect(NEIGHBORS.some(result.current.canEnterCellPerceived)).toBe(false)
  })
})
