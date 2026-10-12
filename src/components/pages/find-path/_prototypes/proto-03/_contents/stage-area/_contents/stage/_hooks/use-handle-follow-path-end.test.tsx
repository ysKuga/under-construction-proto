import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import { useNotifications } from '@/components/ui/notifications'

import {
  FollowPathStoreProvider,
  useFollowPathStoreApi,
} from '../../../../../_stores/follow-path'
import { GoalStoreProvider, useGoalStoreApi } from '../../../../../_stores/goal'
import { WaypointFlowStoreProvider } from '../../../../../_stores/waypoint-flow'

import { useHandleFollowPathEnd } from './use-handle-follow-path-end'

vi.unmock('zustand')

const Wrapper = (props: PropsWithChildren) => (
  <FollowPathStoreProvider>
    <WaypointFlowStoreProvider>
      <GoalStoreProvider>{props.children}</GoalStoreProvider>
    </WaypointFlowStoreProvider>
  </FollowPathStoreProvider>
)

const renderHandleFollowPathEnd = () =>
  renderHook(
    () => ({
      followPath: useFollowPathStoreApi(),
      goal: useGoalStoreApi(),
      handleFollowPathEnd: useHandleFollowPathEnd(),
    }),
    { wrapper: Wrapper },
  ).result.current

/** 現在の通知件数 */
const countNotifications = () =>
  useNotifications.getState().notifications.length

describe('useHandleFollowPathEnd', () => {
  it('EN 不足による途中停止は警告する', () => {
    const { followPath, handleFollowPathEnd } = renderHandleFollowPathEnd()
    const before = countNotifications()

    act(() => {
      followPath.getState().start([{ q: 1, r: 1 }])
      handleFollowPathEnd({ q: 1, r: 1 })
    })

    expect(countNotifications()).toBe(before + 1)
    expect(followPath.getState().isFollowing()).toBe(false)
  })

  it('ゴール到達による停止は警告しない', () => {
    const { followPath, goal, handleFollowPathEnd } =
      renderHandleFollowPathEnd()
    const before = countNotifications()

    act(() => {
      followPath.getState().start([{ q: 1, r: 1 }])
      goal.getState().reach()
      handleFollowPathEnd({ q: 1, r: 1 })
    })

    expect(countNotifications()).toBe(before)
    expect(followPath.getState().isFollowing()).toBe(false)
  })
})
