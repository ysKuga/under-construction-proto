import { act, renderHook } from '@testing-library/react'
import { PropsWithChildren } from 'react'

import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import {
  HexStageEventProvider,
  useHexStageEventDispatcher,
} from '@/components/pages/expedition/_stage-components/hex-stage/_events'

import { useReachedCell } from '../_layers/move-target-layer/_hooks/use-reached-cell'
import {
  FollowPathStoreProvider,
  useFollowPathStoreApi,
} from '../_stores/follow-path'

import { useAdvanceFollowPathOnCellReach } from './use-advance-follow-path-on-cell-reach'

const Wrapper = (props: PropsWithChildren) => {
  const { children } = props

  return (
    <HexStageEventProvider>
      <FollowPathStoreProvider>{children}</FollowPathStoreProvider>
    </HexStageEventProvider>
  )
}

const renderAdvance = () => {
  const { result } = renderHook(
    () => {
      useAdvanceFollowPathOnCellReach(PLAYER_ACTOR_ID)

      return {
        dispatcher: useHexStageEventDispatcher(),
        followPathStoreApi: useFollowPathStoreApi(),
      }
    },
    { wrapper: Wrapper },
  )

  const cellReach = (actorId = PLAYER_ACTOR_ID) =>
    act(async () => {
      await result.current.dispatcher['HexStage-cell-reach']({
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

describe('HexStage-cell-reach の多重購読', () => {
  it('useReachedCell と同時に購読できる', () => {
    expect(() =>
      renderHook(
        () => {
          useAdvanceFollowPathOnCellReach(PLAYER_ACTOR_ID)
          useReachedCell(PLAYER_ACTOR_ID)
        },
        { wrapper: Wrapper },
      ),
    ).not.toThrow()
  })
})
