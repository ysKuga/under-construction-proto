import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useRelayEvents } from './use-relay-events'

describe('useRelayEvents', () => {
  it('許可したイベントを detail ごと中継先へ再送する', () => {
    const source = new EventTarget()
    const target = new EventTarget()
    const handler = vi.fn<(event: Event) => void>()

    target.addEventListener('a', handler)
    renderHook(() => useRelayEvents(source, target, ['a']))

    source.dispatchEvent(new CustomEvent('a', { detail: 200 }))

    expect(handler).toHaveBeenCalledTimes(1)
    expect((handler.mock.calls[0][0] as CustomEvent).detail).toBe(200)
  })

  it('許可していないイベントは中継しない', () => {
    const source = new EventTarget()
    const target = new EventTarget()
    const handler = vi.fn<(event: Event) => void>()

    target.addEventListener('b', handler)
    renderHook(() => useRelayEvents(source, target, ['a']))

    source.dispatchEvent(new CustomEvent('b'))

    expect(handler).not.toHaveBeenCalled()
  })

  it('unmount 後は中継しない', () => {
    const source = new EventTarget()
    const target = new EventTarget()
    const handler = vi.fn<(event: Event) => void>()

    target.addEventListener('a', handler)
    const { unmount } = renderHook(() => useRelayEvents(source, target, ['a']))

    unmount()
    source.dispatchEvent(new CustomEvent('a'))

    expect(handler).not.toHaveBeenCalled()
  })
})
