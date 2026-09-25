import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import {
  Stage07EventProvider,
  useStage07EventDispatcher,
} from '@/prototypes/stage/stage-07/_events'

import {
  FollowPathStoreProvider,
  useFollowPathStoreApi,
} from '../_stores/follow-path'

import { useAdvanceFollowPathOnCellReach } from './use-advance-follow-path-on-cell-reach'

const Wrapper = (props: PropsWithChildren) => {
  const { children } = props

  return (
    <Stage07EventProvider>
      <FollowPathStoreProvider>{children}</FollowPathStoreProvider>
    </Stage07EventProvider>
  )
}

const renderAdvance = () => {
  const { result } = renderHook(
    () => {
      useAdvanceFollowPathOnCellReach(PLAYER_ACTOR_ID)

      return {
        dispatcher: useStage07EventDispatcher(),
        followPathStoreApi: useFollowPathStoreApi(),
      }
    },
    { wrapper: Wrapper },
  )

  const cellReach = (actorId = PLAYER_ACTOR_ID) =>
    act(async () => {
      await result.current.dispatcher['Stage07-cell-reach']({
        actorId,
        cell: { q: 0, r: 1 },
      })
    })

  return { cellReach, followPathStoreApi: result.current.followPathStoreApi }
}

describe('useAdvanceFollowPathOnCellReach', () => {
  it('セル中心への到達で自動移動の進行を 1 マス進める', async () => {
    const { cellReach, followPathStoreApi } = renderAdvance()

    followPathStoreApi.getState().start([
      { q: 0, r: 1 },
      { q: 0, r: 2 },
    ])
    await cellReach()

    expect(followPathStoreApi.getState().followedCount).toBe(1)
  })

  it('他 actor の到達は無視する', async () => {
    const { cellReach, followPathStoreApi } = renderAdvance()

    followPathStoreApi.getState().start([{ q: 0, r: 1 }])
    await cellReach('mob-01')

    expect(followPathStoreApi.getState().followedCount).toBe(0)
  })
})
