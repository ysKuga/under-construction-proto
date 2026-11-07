import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import { ActorsStoreProvider } from '@/components/pages/expedition/_stage-components/hex-stage/_stores/actors'
import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import {
  EnergyStoreProvider,
  useEnergyStoreApi,
} from '@/components/pages/expedition/_stores/energy'

import {
  GamePhaseStoreProvider,
  useGamePhaseStoreApi,
} from '../../../../../../../_stores/game-phase'
import { ItemStoreProvider } from '../../../../../../../_stores/items'
import { ItemInstance } from '../../../../../../../_stores/items/types'
import {
  PlayerActivityStoreProvider,
  usePlayerActivityStoreApi,
} from '../../../../../../../_stores/player-activity'

import { useEnergyChoices } from './use-energy-choices'

vi.unmock('zustand')

/** player の開始セル */
const playerCell = { q: 0, r: 0 }

/** player の開始セルの EN スポット */
const energySpot: ItemInstance = {
  amount: 1,
  cell: playerCell,
  id: 'spot-a',
  kind: 'energy-charge',
  stock: 3,
}

/**
 * `useEnergyChoices` と、状態を変える store api を描画する
 *
 * @param initialItems 盤面のアイテム
 */
const renderEnergyChoices = (initialItems: ItemInstance[] = []) => {
  const Wrapper = (props: PropsWithChildren) => (
    <GamePhaseStoreProvider>
      <PlayerActivityStoreProvider>
        <EnergyStoreProvider>
          <ActorsStoreProvider
            initialActors={{ [PLAYER_ACTOR_ID]: playerCell }}
          >
            <ItemStoreProvider initialItems={initialItems}>
              {props.children}
            </ItemStoreProvider>
          </ActorsStoreProvider>
        </EnergyStoreProvider>
      </PlayerActivityStoreProvider>
    </GamePhaseStoreProvider>
  )

  return renderHook(
    () => ({
      activity: usePlayerActivityStoreApi(),
      choices: useEnergyChoices({
        handleEnergySpotSelect: async () => {},
        handleRescueSelect: async () => {},
      }),
      energy: useEnergyStoreApi(),
      gamePhase: useGamePhaseStoreApi(),
    }),
    { wrapper: Wrapper },
  )
}

/** 選択肢の識別子の並び */
const ids = (choices: ReturnType<typeof useEnergyChoices>) =>
  choices.map(({ id }) => id)

describe('useEnergyChoices', () => {
  it('EN が残り、EN スポット上でなければ選択肢なし', () => {
    expect(renderEnergyChoices().result.current.choices).toEqual([])
  })

  it('EN 切れ中は救助を並べ、補給中は外す', () => {
    const { result } = renderEnergyChoices()
    const { max } = result.current.energy
      .getState()
      .getEnergyInfo(PLAYER_ACTOR_ID)

    act(() => result.current.energy.getState().consume(PLAYER_ACTOR_ID, max))

    expect(ids(result.current.choices)).toEqual(['rescue'])

    act(() => result.current.activity.getState().setActivity('charging'))

    expect(result.current.choices).toEqual([])
  })

  it('EN スポット上で停止中、かつ補給できれば EN スポットの使用を並べる', () => {
    const { result } = renderEnergyChoices([energySpot])

    // EN が上限: 補給できない
    expect(result.current.choices).toEqual([])

    act(() => result.current.energy.getState().consume(PLAYER_ACTOR_ID, 1))

    expect(ids(result.current.choices)).toEqual(['energy-spot'])

    act(() => result.current.activity.getState().setActivity('moving'))

    expect(result.current.choices).toEqual([])
  })

  it('盤面を操作できないフェーズでは選択肢なし', () => {
    const { result } = renderEnergyChoices()
    const { max } = result.current.energy
      .getState()
      .getEnergyInfo(PLAYER_ACTOR_ID)

    act(() => {
      result.current.energy.getState().consume(PLAYER_ACTOR_ID, max)
      result.current.gamePhase.getState().reachGoal()
    })

    expect(result.current.choices).toEqual([])
  })
})
