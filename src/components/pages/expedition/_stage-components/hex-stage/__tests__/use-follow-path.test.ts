import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useFollowPath } from '../_hooks/use-follow-path'
import { HexCell } from '../_lib/hex'

const MOVE_DURATION_MS = 100

const PATH: HexCell[] = [
  { q: 0, r: 1 },
  { q: 0, r: 2 },
  { q: 0, r: 3 },
]

describe('useFollowPath', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('moveDurationMs 間隔で経路を 1 マスずつ進み、最終セル到着で終了する', () => {
    const tryMove = vi.fn<(cell: HexCell) => boolean>(() => true)
    const onEnd = vi.fn<(blockedCell?: HexCell) => void>()
    const { result } = renderHook(() =>
      useFollowPath(tryMove, MOVE_DURATION_MS, onEnd),
    )

    act(() => result.current.followPath(PATH))
    expect(tryMove).toHaveBeenCalledTimes(1)

    // 途中の到着では終了しない
    expect(result.current.notifyArrived()).toBe(true)
    expect(onEnd).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(MOVE_DURATION_MS * 2))
    expect(tryMove.mock.calls.map(([cell]) => cell)).toEqual(PATH)
    expect(onEnd).not.toHaveBeenCalled()

    expect(result.current.notifyArrived()).toBe(true)
    expect(onEnd).toHaveBeenCalledWith()

    // left/top の二重通知は無視する
    expect(result.current.notifyArrived()).toBe(false)
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('進入不可のセルでその場で停止し、そのセルを onEnd へ渡す', () => {
    const tryMove = vi.fn<(cell: HexCell) => boolean>((cell) => cell.r !== 2)
    const onEnd = vi.fn<(blockedCell?: HexCell) => void>()
    const { result } = renderHook(() =>
      useFollowPath(tryMove, MOVE_DURATION_MS, onEnd),
    )

    act(() => result.current.followPath(PATH))
    act(() => vi.advanceTimersByTime(MOVE_DURATION_MS * 5))

    expect(tryMove).toHaveBeenCalledTimes(2)
    expect(onEnd).toHaveBeenCalledWith({ q: 0, r: 2 })
    expect(result.current.notifyArrived()).toBe(false)
  })

  it('自動移動していない時の到着通知は false を返す', () => {
    const { result } = renderHook(() =>
      useFollowPath(() => true, MOVE_DURATION_MS, vi.fn<() => void>()),
    )

    expect(result.current.notifyArrived()).toBe(false)
  })

  it('空の経路は即座に終了する', () => {
    const tryMove = vi.fn<(cell: HexCell) => boolean>(() => true)
    const onEnd = vi.fn<(blockedCell?: HexCell) => void>()
    const { result } = renderHook(() =>
      useFollowPath(tryMove, MOVE_DURATION_MS, onEnd),
    )

    act(() => result.current.followPath([]))

    expect(tryMove).not.toHaveBeenCalled()
    expect(onEnd).toHaveBeenCalledWith()
  })
})
