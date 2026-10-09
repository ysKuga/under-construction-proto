import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useEventListener } from '.'

describe('useEventListener', () => {
  it('handler の参照が変わっても再登録せず、最新の handler を呼ぶ', () => {
    const target = new EventTarget()
    const addSpy = vi.spyOn(target, 'addEventListener')
    const first = vi.fn<(event: Event) => void>()
    const second = vi.fn<(event: Event) => void>()

    const { rerender } = renderHook(
      ({ handler }) => useEventListener('test', handler, { target }),
      { initialProps: { handler: first } },
    )
    rerender({ handler: second })
    target.dispatchEvent(new Event('test'))

    expect(addSpy).toHaveBeenCalledTimes(1)
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })
})
