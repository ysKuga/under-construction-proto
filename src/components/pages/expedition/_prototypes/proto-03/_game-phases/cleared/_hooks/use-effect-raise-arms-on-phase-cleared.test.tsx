import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import { ACTION_ARM_TOGGLE } from '@/components/theater/figure/box-bot'

import {
  PlayerActorEventTargetProvider,
  usePlayerActorEventTarget,
} from '../../../_contexts/player-actor-event-target'
import {
  GamePhaseStoreProvider,
  useGamePhaseStoreApi,
} from '../../../_stores/game-phase'

import { useEffectRaiseArmsOnPhaseCleared } from './use-effect-raise-arms-on-phase-cleared'

const Wrapper = (props: PropsWithChildren) => {
  const { children } = props

  return (
    <PlayerActorEventTargetProvider>
      <GamePhaseStoreProvider>{children}</GamePhaseStoreProvider>
    </PlayerActorEventTargetProvider>
  )
}

const renderRaiseArms = () => {
  const { result } = renderHook(
    () => {
      useEffectRaiseArmsOnPhaseCleared()

      return {
        actorEventTarget: usePlayerActorEventTarget(),
        gamePhaseStoreApi: useGamePhaseStoreApi(),
      }
    },
    { wrapper: Wrapper },
  )
  const { actorEventTarget, gamePhaseStoreApi } = result.current
  const onArmToggle = vi.fn<(event: Event) => void>()

  actorEventTarget.addEventListener(ACTION_ARM_TOGGLE, onArmToggle)

  return { gamePhaseStoreApi, onArmToggle }
}

describe('useEffectRaiseArmsOnPhaseCleared', () => {
  it('cleared へ入った時点で armToggle を 1 回発火する', () => {
    const { gamePhaseStoreApi, onArmToggle } = renderRaiseArms()

    act(() => {
      gamePhaseStoreApi.getState().reachGoal()
    })

    expect(onArmToggle).not.toHaveBeenCalled()

    act(() => {
      gamePhaseStoreApi.getState().arriveAtGoal()
      gamePhaseStoreApi.getState().arriveAtGoal()
    })

    expect(onArmToggle).toHaveBeenCalledTimes(1)
    expect(
      (onArmToggle.mock.calls[0][0] as CustomEvent).detail.upDelta,
    ).toBeGreaterThan(0)
  })
})
