import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useHexMove } from '../_hooks/use-hex-move'
import { HexCell } from '../_lib/hex'

const CURRENT: HexCell = { q: 1, r: 1 }
const ADJACENT: HexCell = { q: 1, r: 2 }
const NON_ADJACENT: HexCell = { q: 1, r: 3 }

const renderHexMove = (canEnter?: (cell: HexCell) => boolean) => {
  const moveActor = vi.fn<(cell: HexCell) => void>()
  const onIndirectClick = vi.fn<(cell: HexCell) => void>()
  const { result } = renderHook(() =>
    useHexMove(
      CURRENT,
      moveActor,
      undefined,
      undefined,
      canEnter,
      onIndirectClick,
    ),
  )

  return { moveActor, onIndirectClick, result }
}

describe('useHexMove', () => {
  it('現在マスのクリックは移動も呼出し側への委譲もしない', () => {
    const { moveActor, onIndirectClick, result } = renderHexMove()

    result.current.handleCellClick({ ...CURRENT })

    expect(moveActor).not.toHaveBeenCalled()
    expect(onIndirectClick).not.toHaveBeenCalled()
  })

  it('隣接マスのクリックで移動する', () => {
    const { moveActor, onIndirectClick, result } = renderHexMove()

    result.current.handleCellClick(ADJACENT)

    expect(moveActor).toHaveBeenCalledWith(ADJACENT)
    expect(onIndirectClick).not.toHaveBeenCalled()
  })

  it('進入できない隣接マスのクリックは呼出し側へ委ねる', () => {
    const { moveActor, onIndirectClick, result } = renderHexMove(() => false)

    result.current.handleCellClick(ADJACENT)

    expect(moveActor).not.toHaveBeenCalled()
    expect(onIndirectClick).toHaveBeenCalledWith(ADJACENT)
  })

  it('非隣接マスのクリックは呼出し側へ委ねる', () => {
    const { moveActor, onIndirectClick, result } = renderHexMove()

    result.current.handleCellClick(NON_ADJACENT)

    expect(moveActor).not.toHaveBeenCalled()
    expect(onIndirectClick).toHaveBeenCalledWith(NON_ADJACENT)
  })
})
