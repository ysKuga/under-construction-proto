import { act, render } from '@testing-library/react'
import { useEffect } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Stage07Handle } from '..'
import { MoveOnAdjacentCellClick } from '../_components/move-on-adjacent-cell-click'
import {
  Stage07HandleProvider,
  useStage07HandleRef,
} from '../_contexts/stage07-handle'
import { Stage07EventProvider, useStage07EventDispatcher } from '../_events'
import { HexCell } from '../_lib/hex'

/** テストから `Stage07-cell-click` を発行する dispatcher */
type Dispatch = (cell: HexCell) => Promise<unknown>

/** context の handle を差し替え、dispatcher を外へ渡す */
const Harness = (props: {
  handle: null | Stage07Handle
  onReady: (dispatch: Dispatch) => void
}) => {
  const { handle, onReady } = props
  const handleRef = useStage07HandleRef()
  const dispatcher = useStage07EventDispatcher()

  useEffect(() => {
    // handle を差し替え、dispatcher をテストへ渡す
    handleRef.current = handle
    onReady((cell) => dispatcher['Stage07-cell-click']({ cell }))
  })

  return null
}

const renderMoveOnAdjacentCellClick = (handle: null | Stage07Handle) => {
  let dispatch: Dispatch = async () => {}

  render(
    <Stage07HandleProvider>
      <Stage07EventProvider>
        <MoveOnAdjacentCellClick />
        <Harness
          handle={handle}
          onReady={(next) => {
            dispatch = next
          }}
        />
      </Stage07EventProvider>
    </Stage07HandleProvider>,
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
