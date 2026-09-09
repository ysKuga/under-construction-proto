import { act, renderHook } from '@testing-library/react'

import { ACTION_JUMP } from '@/components/samples/figure/box-bot'

import { useWalkUnlock } from './use-walk-unlock'

/** eventTarget へ ACTION_JUMP を 1 回発火する */
const dispatchJump = (target: EventTarget) => {
  act(() => {
    target.dispatchEvent(new Event(ACTION_JUMP))
  })
}

test('しきい値未満のジャンプでは解放されない', () => {
  const eventTarget = new EventTarget()
  const { result } = renderHook(() => useWalkUnlock(eventTarget))

  expect(result.current.walkUnlocked).toBe(false)

  dispatchJump(eventTarget)
  dispatchJump(eventTarget)

  expect(result.current.walkUnlocked).toBe(false)
})

test('しきい値(3 回)到達で解放される', () => {
  const eventTarget = new EventTarget()
  const { result } = renderHook(() => useWalkUnlock(eventTarget))

  dispatchJump(eventTarget)
  dispatchJump(eventTarget)
  dispatchJump(eventTarget)

  expect(result.current.walkUnlocked).toBe(true)
})

test('アンマウントで購読を解除する', () => {
  const eventTarget = new EventTarget()
  const removeEventListener = vi.spyOn(eventTarget, 'removeEventListener')
  const { unmount } = renderHook(() => useWalkUnlock(eventTarget))

  unmount()

  expect(removeEventListener).toHaveBeenCalledOnce()
  expect(removeEventListener.mock.calls[0][0]).toBe(ACTION_JUMP)
})
