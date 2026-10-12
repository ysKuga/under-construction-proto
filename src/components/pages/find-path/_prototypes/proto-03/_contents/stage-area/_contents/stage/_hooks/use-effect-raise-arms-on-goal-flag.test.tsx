import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import { ACTION_ARM_TOGGLE } from '@/components/theater/figure/box-bot'

import {
  PlayerActorEventTargetProvider,
  usePlayerActorEventTarget,
} from '../../../../../_contexts/player-actor-event-target'
import { GoalStoreProvider, useGoalStoreApi } from '../../../../../_stores/goal'

import { useEffectRaiseArmsOnGoalFlag } from './use-effect-raise-arms-on-goal-flag'

const Wrapper = (props: PropsWithChildren) => {
  const { children } = props

  return (
    <PlayerActorEventTargetProvider>
      <GoalStoreProvider>{children}</GoalStoreProvider>
    </PlayerActorEventTargetProvider>
  )
}

const renderRaiseArms = () => {
  const { result } = renderHook(
    () => {
      useEffectRaiseArmsOnGoalFlag()

      return {
        actorEventTarget: usePlayerActorEventTarget(),
        goalStoreApi: useGoalStoreApi(),
      }
    },
    { wrapper: Wrapper },
  )
  const { actorEventTarget, goalStoreApi } = result.current
  const onArmToggle = vi.fn<(event: Event) => void>()

  actorEventTarget.addEventListener(ACTION_ARM_TOGGLE, onArmToggle)

  return { goalStoreApi, onArmToggle }
}

describe('useEffectRaiseArmsOnGoalFlag', () => {
  it('旗を掲げた時点で armToggle を 1 回発火する', () => {
    const { goalStoreApi, onArmToggle } = renderRaiseArms()

    act(() => {
      goalStoreApi.getState().reach()
    })

    expect(onArmToggle).not.toHaveBeenCalled()

    act(() => {
      goalStoreApi.getState().raiseFlag()
      goalStoreApi.getState().raiseFlag()
    })

    expect(onArmToggle).toHaveBeenCalledTimes(1)
  })
})
