import { act, render } from '@testing-library/react'
import { useEffect } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { HexStageHandle } from '..'
import { MoveOnAdjacentCellClick } from '../_components/move-on-adjacent-cell-click'
import {
  HexStageHandleProvider,
  useHexStageHandleRef,
} from '../_contexts/hex-stage-handle'
import { HexStageEventProvider, useHexStageEventDispatcher } from '../_events'
import { HexCell } from '../_lib/hex'

/** テストから `HexStage-cell-click` を発行する dispatcher */
type Dispatch = (cell: HexCell) => Promise<unknown>

/** context の handle を差し替え、dispatcher を外へ渡す */
const Harness = (props: {
  handle: null | HexStageHandle
  onReady: (dispatch: Dispatch) => void
}) => {
  const { handle, onReady } = props
  const handleRef = useHexStageHandleRef()
  const dispatcher = useHexStageEventDispatcher()

  useEffect(() => {
    // handle を差し替え、dispatcher をテストへ渡す
    handleRef.current = handle
    onReady((cell) => dispatcher['HexStage-cell-click']({ cell }))
  })

  return null
}

const renderMoveOnAdjacentCellClick = (handle: null | HexStageHandle) => {
  let dispatch: Dispatch = async () => {}

  render(
    <HexStageHandleProvider>
      <HexStageEventProvider>
        <MoveOnAdjacentCellClick />
        <Harness
          handle={handle}
          onReady={(next) => {
            dispatch = next
          }}
        />
      </HexStageEventProvider>
    </HexStageHandleProvider>,
  )

  return (cell: HexCell) => act(() => dispatch(cell))
}

describe('MoveOnAdjacentCellClick', () => {
  it('セルのクリックで、そのセルへの moveTo を呼ぶ', async () => {
    const moveTo = vi.fn<(cell: HexCell) => boolean>(() => true)
    const click = renderMoveOnAdjacentCellClick({
      followPath: () => {},
      moveTo,
      setTilt: () => {},
      warp: () => {},
    })

    await click({ q: 1, r: 0 })

    expect(moveTo).toHaveBeenCalledWith({ q: 1, r: 0 })
  })

  it('handle 未設定でも落ちない', async () => {
    const click = renderMoveOnAdjacentCellClick(null)

    await expect(click({ q: 1, r: 0 })).resolves.not.toThrow()
  })
})
