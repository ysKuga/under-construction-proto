import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useHexMove } from '../_hooks/use-hex-move'
import { HexCell } from '../_lib/hex'

const CURRENT: HexCell = { q: 1, r: 1 }
const ADJACENT: HexCell = { q: 1, r: 2 }
const NON_ADJACENT: HexCell = { q: 1, r: 3 }

const renderHexMove = () => {
  const moveActor = vi.fn<(cell: HexCell) => void>()
  const onNonAdjacentClick = vi.fn<(cell: HexCell) => void>()
  const { result } = renderHook(() =>
    useHexMove(
      CURRENT,
      moveActor,
      undefined,
      undefined,
      undefined,
      onNonAdjacentClick,
    ),
  )

  return { moveActor, onNonAdjacentClick, result }
}

describe('useHexMove', () => {
  it('現在マスのクリックは移動も非隣接通知もしない', () => {
    const { moveActor, onNonAdjacentClick, result } = renderHexMove()

    result.current.handleCellClick({ ...CURRENT })

    expect(moveActor).not.toHaveBeenCalled()
    expect(onNonAdjacentClick).not.toHaveBeenCalled()
  })

  it('隣接マスのクリックで移動する', () => {
    const { moveActor, onNonAdjacentClick, result } = renderHexMove()

    result.current.handleCellClick(ADJACENT)

    expect(moveActor).toHaveBeenCalledWith(ADJACENT)
    expect(onNonAdjacentClick).not.toHaveBeenCalled()
  })

  it('非隣接マスのクリックで非隣接通知する', () => {
    const { moveActor, onNonAdjacentClick, result } = renderHexMove()

    result.current.handleCellClick(NON_ADJACENT)

    expect(moveActor).not.toHaveBeenCalled()
    expect(onNonAdjacentClick).toHaveBeenCalledWith(NON_ADJACENT)
  })
})
