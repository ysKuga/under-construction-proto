import { renderHook } from '@testing-library/react'

import { useEventDispatcher } from '.'

test('listener が preventDefault しなければ true を返す', async () => {
  const target = new EventTarget()
  target.addEventListener('Test-event', () => {})
  const { result } = renderHook(() => useEventDispatcher(target))

  await expect(
    result.current(new Event('Test-event', { cancelable: true })),
  ).resolves.toBe(true)
})

test('cancelable な event を listener が preventDefault すると false を返す', async () => {
  const target = new EventTarget()
  target.addEventListener('Test-event', (event) => event.preventDefault())
  const { result } = renderHook(() => useEventDispatcher(target))

  await expect(
    result.current(new Event('Test-event', { cancelable: true })),
  ).resolves.toBe(false)
})

test('cancelable でない event は preventDefault されても true を返す', async () => {
  const target = new EventTarget()
  target.addEventListener('Test-event', (event) => event.preventDefault())
  const { result } = renderHook(() => useEventDispatcher(target))

  await expect(result.current('Test-event')).resolves.toBe(true)
})
