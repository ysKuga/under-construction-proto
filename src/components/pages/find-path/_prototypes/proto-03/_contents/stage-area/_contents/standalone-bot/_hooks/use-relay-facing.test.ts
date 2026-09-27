import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ACTION_FACE } from '@/components/theater/figure/box-bot'

import { useRelayFacing } from './use-relay-facing'

/** face action を dispatch する */
const dispatchFace = (eventTarget: EventTarget, rad: number) => {
  eventTarget.dispatchEvent(new CustomEvent(ACTION_FACE, { detail: { rad } }))
}

/** handler が最後に受けた向き指定 */
const lastDetail = (handler: ReturnType<typeof vi.fn>) =>
  (handler.mock.lastCall![0] as CustomEvent).detail

describe('useRelayFacing', () => {
  it('有効時は source の向きを target へ瞬時の指定で再送する', () => {
    const source = new EventTarget()
    const target = new EventTarget()
    const handler = vi.fn<(event: Event) => void>()

    target.addEventListener(ACTION_FACE, handler)
    renderHook(() => useRelayFacing(source, target, true))

    dispatchFace(source, 1)

    expect(lastDetail(handler)).toEqual({ rad: 1 })
  })

  it('無効時は source の向きを再送しない', () => {
    const source = new EventTarget()
    const target = new EventTarget()
    const handler = vi.fn<(event: Event) => void>()

    renderHook(() => useRelayFacing(source, target, false))
    target.addEventListener(ACTION_FACE, handler)

    dispatchFace(source, 1)

    expect(handler).not.toHaveBeenCalled()
  })

  it('有効化した時点で、無効中に受けた最新の向きへ 300ms かけて合わせる', () => {
    const source = new EventTarget()
    const target = new EventTarget()
    const handler = vi.fn<(event: Event) => void>()

    target.addEventListener(ACTION_FACE, handler)
    const { rerender } = renderHook(
      ({ enabled }) => useRelayFacing(source, target, enabled),
      { initialProps: { enabled: false } },
    )

    dispatchFace(source, 1)
    dispatchFace(source, 2)
    rerender({ enabled: true })

    expect(lastDetail(handler)).toEqual({ durationMs: 300, rad: 2 })
  })

  it('無効化した時点で既定の向き(0)へ 300ms かけて戻す', () => {
    const source = new EventTarget()
    const target = new EventTarget()
    const handler = vi.fn<(event: Event) => void>()

    target.addEventListener(ACTION_FACE, handler)
    const { rerender } = renderHook(
      ({ enabled }) => useRelayFacing(source, target, enabled),
      { initialProps: { enabled: true } },
    )

    dispatchFace(source, 1)
    rerender({ enabled: false })

    expect(lastDetail(handler)).toEqual({ durationMs: 300, rad: 0 })
  })
})
