import { act, renderHook } from '@testing-library/react'

import { ACTION_JUMP } from '@/components/theater/figure/box-bot'

import { useJumpUnlock } from './use-jump-unlock'

/** eventTarget へ ACTION_JUMP を 1 回発火する */
const dispatchJump = (target: EventTarget) => {
  act(() => {
    target.dispatchEvent(new Event(ACTION_JUMP))
  })
}

test('しきい値未満のジャンプでは解放されない', () => {
  const eventTarget = new EventTarget()
  const setUnlocked = vi.fn<(next: boolean) => void>()
  renderHook(() => useJumpUnlock(eventTarget, setUnlocked))

  dispatchJump(eventTarget)
  dispatchJump(eventTarget)

  expect(setUnlocked).not.toHaveBeenCalled()
})

test('しきい値(3 回)到達で setUnlocked(true) を 1 回呼ぶ', () => {
  const eventTarget = new EventTarget()
  const setUnlocked = vi.fn<(next: boolean) => void>()
  renderHook(() => useJumpUnlock(eventTarget, setUnlocked))

  dispatchJump(eventTarget)
  dispatchJump(eventTarget)
  dispatchJump(eventTarget)
  dispatchJump(eventTarget)

  expect(setUnlocked).toHaveBeenCalledExactlyOnceWith(true)
})

test('アンマウントで購読を解除する', () => {
  const eventTarget = new EventTarget()
  const removeEventListener = vi.spyOn(eventTarget, 'removeEventListener')
  const { unmount } = renderHook(() =>
    useJumpUnlock(eventTarget, vi.fn<(next: boolean) => void>()),
  )

  unmount()

  expect(removeEventListener).toHaveBeenCalledOnce()
  expect(removeEventListener.mock.calls[0][0]).toBe(ACTION_JUMP)
})
