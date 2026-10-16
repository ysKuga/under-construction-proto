import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useHexMove } from '../_hooks/use-hex-move'
import { HexCell } from '../_lib/hex'

const CURRENT: HexCell = { q: 1, r: 1 }
const ADJACENT: HexCell = { q: 1, r: 2 }
const NON_ADJACENT: HexCell = { q: 1, r: 3 }

const renderHexMove = (canEnter?: (cell: HexCell) => boolean) => {
  const moveActor = vi.fn<(cell: HexCell) => void>()
  const { result } = renderHook(() =>
    useHexMove(CURRENT, moveActor, undefined, undefined, canEnter),
  )

  return { moveActor, result }
}

describe('useHexMove', () => {
  it('現在マスへは移動しない', () => {
    const { moveActor, result } = renderHexMove()

    expect(result.current.tryMove({ ...CURRENT })).toBe(false)
    expect(moveActor).not.toHaveBeenCalled()
  })

  it('隣接マスへ移動する', () => {
    const { moveActor, result } = renderHexMove()

    expect(result.current.tryMove(ADJACENT)).toBe(true)
    expect(moveActor).toHaveBeenCalledWith(ADJACENT)
  })

  it('進入できない隣接マスへは移動しない', () => {
    const { moveActor, result } = renderHexMove(() => false)

    expect(result.current.tryMove(ADJACENT)).toBe(false)
    expect(moveActor).not.toHaveBeenCalled()
  })

  it('非隣接マスへは移動しない', () => {
    const { moveActor, result } = renderHexMove()

    expect(result.current.tryMove(NON_ADJACENT)).toBe(false)
    expect(moveActor).not.toHaveBeenCalled()
  })
})
