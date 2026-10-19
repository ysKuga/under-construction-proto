import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import { EnergyStoreProvider } from '@/components/pages/expedition/_stores/energy'
import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import { HEX_DIRECTIONS } from '@/components/pages/expedition/_stage-components/hex-stage/_lib/hex'
import { ActorsStoreProvider } from '@/components/pages/expedition/_stage-components/hex-stage/_stores/actors'

import { StageLayoutProvider } from '../../../../../_contexts/stage-layout'
import { DEFAULT_STAGE_LAYOUT } from '../../../../../_contexts/stage-layout/constants'
import {
  GamePhaseStoreProvider,
  useGamePhaseStoreApi,
} from '../../../../../_stores/game-phase'

import { useCanEnterCell } from './use-can-enter-cell'

vi.unmock('zustand')

const Wrapper = (props: PropsWithChildren) => (
  <StageLayoutProvider stageLayout={DEFAULT_STAGE_LAYOUT}>
    <EnergyStoreProvider>
      <ActorsStoreProvider
        initialActors={{ [PLAYER_ACTOR_ID]: DEFAULT_STAGE_LAYOUT.start }}
      >
        <GamePhaseStoreProvider>{props.children}</GamePhaseStoreProvider>
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
      () => ({ ...useCanEnterCell(), gamePhase: useGamePhaseStoreApi() }),
      { wrapper: Wrapper },
    )

    expect(NEIGHBORS.some(result.current.canEnterCell)).toBe(true)
    expect(NEIGHBORS.some(result.current.canEnterCellPerceived)).toBe(true)

    act(() => {
      result.current.gamePhase.getState().reachGoal()
    })

    expect(NEIGHBORS.some(result.current.canEnterCell)).toBe(false)
    expect(NEIGHBORS.some(result.current.canEnterCellPerceived)).toBe(false)
  })
})
