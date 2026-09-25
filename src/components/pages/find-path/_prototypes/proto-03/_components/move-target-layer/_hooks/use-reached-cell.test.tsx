import { act, renderHook } from '@testing-library/react'

import { PLAYER_ACTOR_ID } from '@/prototypes/stage/stage-06/constants'
import {
  Stage07EventProvider,
  useStage07EventDispatcher,
} from '@/prototypes/stage/stage-07/_events'

import { useReachedCell } from './use-reached-cell'

const renderReachedCell = () => {
  const { result } = renderHook(
    () => ({
      dispatcher: useStage07EventDispatcher(),
      reachedCell: useReachedCell(PLAYER_ACTOR_ID),
    }),
    { wrapper: Stage07EventProvider },
  )

  const cellReach = (actorId = PLAYER_ACTOR_ID) =>
    act(async () => {
      await result.current.dispatcher['Stage07-cell-reach']({
        actorId,
        cell: { q: 1, r: 2 },
      })
    })

  return { cellReach, result }
}

describe('useReachedCell', () => {
  it('到達通知までは undefined', () => {
    const { result } = renderReachedCell()

    expect(result.current.reachedCell).toBeUndefined()
  })

  it('到達通知のセルを返す', async () => {
    const { cellReach, result } = renderReachedCell()

    await cellReach()

    expect(result.current.reachedCell).toEqual({ q: 1, r: 2 })
  })

  it('他 actor の到達は無視する', async () => {
    const { cellReach, result } = renderReachedCell()

    await cellReach('mob-01')

    expect(result.current.reachedCell).toBeUndefined()
  })
})
