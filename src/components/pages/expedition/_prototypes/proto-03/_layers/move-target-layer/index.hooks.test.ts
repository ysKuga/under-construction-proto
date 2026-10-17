import { act, renderHook } from '@testing-library/react'

import { HexCell } from '@/prototypes/stage/stage-07/_lib/hex'

import { MoveTargetDisplayMode } from '../../_stores/display-settings/types'

import { MOVE_TARGET_TRANSITION_MS, useMoveTargetLayer } from './index.hooks'

const CURRENT: HexCell = { q: 2, r: 1 }

const renderMoveTargetLayer = (mode: MoveTargetDisplayMode = 'scatter') =>
  renderHook(
    ({ isEnabled }) => useMoveTargetLayer(CURRENT, 5, 20, isEnabled, mode, 5),
    { initialProps: { isEnabled: true } },
  )

/** 出現準備(SPAWN_DELAY_MS)・次フレームを経て表示完了まで進める */
const advanceToRevealed = () => {
  // 段階ごとに effect を反映させるため act を分ける
  act(() => {
    vi.advanceTimersByTime(80)
  })
  act(() => {
    vi.advanceTimersByTime(20)
  })
}

describe('useMoveTargetLayer', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'requestAnimationFrame',
        'cancelAnimationFrame',
      ],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('表示完了後は対象セルの位置・等倍で表示する', () => {
    const { result } = renderMoveTargetLayer()

    advanceToRevealed()

    expect(result.current.length).toBeGreaterThan(0)
    expect(result.current.every((target) => target.scale === 1)).toBe(true)
  })

  it('無効化すると bot マスへ引っ込め、演出後に非表示にする', () => {
    const { rerender, result } = renderMoveTargetLayer()

    advanceToRevealed()
    const revealed = result.current

    rerender({ isEnabled: false })

    expect(result.current.length).toBe(revealed.length)
    expect(
      new Set(result.current.map((t) => `${t.position.x},${t.position.y}`))
        .size,
    ).toBe(1)
    expect(result.current.every((target) => target.scale < 1)).toBe(true)

    act(() => {
      vi.advanceTimersByTime(MOVE_TARGET_TRANSITION_MS)
    })

    expect(result.current).toEqual([])
  })

  it('instant では無効化で即座に非表示にする', () => {
    const { rerender, result } = renderMoveTargetLayer('instant')

    advanceToRevealed()
    rerender({ isEnabled: false })

    expect(result.current).toEqual([])
  })

  it('無効中は表示せず、有効化すると移動直後と同じ演出で表示する', () => {
    const { rerender, result } = renderMoveTargetLayer()

    advanceToRevealed()
    rerender({ isEnabled: false })
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current).toEqual([])

    rerender({ isEnabled: true })

    expect(result.current).toEqual([])

    act(() => {
      vi.advanceTimersByTime(80)
    })

    // 出現準備(bot マスへ集合・縮小)
    expect(result.current.every((target) => target.scale < 1)).toBe(true)

    advanceToRevealed()

    expect(result.current.every((target) => target.scale === 1)).toBe(true)
  })
})
