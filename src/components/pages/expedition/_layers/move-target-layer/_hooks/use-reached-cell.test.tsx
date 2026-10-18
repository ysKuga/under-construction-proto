import { act, renderHook } from '@testing-library/react'

import { PLAYER_ACTOR_ID } from '@/components/pages/expedition/_stage-components/hex-stage/constants'
import {
  HexStageEventProvider,
  useHexStageEventDispatcher,
} from '@/components/pages/expedition/_stage-components/hex-stage/_events'

import { useReachedCell } from './use-reached-cell'

const renderReachedCell = () => {
  const { result } = renderHook(
    () => ({
      dispatcher: useHexStageEventDispatcher(),
      reachedCell: useReachedCell(PLAYER_ACTOR_ID),
    }),
    { wrapper: HexStageEventProvider },
  )

  const cellReach = (actorId = PLAYER_ACTOR_ID) =>
    act(async () => {
      await result.current.dispatcher['HexStage-cell-reach']({
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
