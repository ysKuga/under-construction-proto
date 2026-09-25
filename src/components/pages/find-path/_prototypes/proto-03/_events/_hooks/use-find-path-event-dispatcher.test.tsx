import { renderHook } from '@testing-library/react'

import {
  FindPathEventProvider,
  useFindPathEventTarget,
} from '../index.contexts'

import { useFindPathEventDispatcher } from './use-find-path-event-dispatcher'

const renderDispatcher = () =>
  renderHook(
    () => ({
      dispatcher: useFindPathEventDispatcher(),
      eventTarget: useFindPathEventTarget(),
    }),
    { wrapper: FindPathEventProvider },
  )

test('listener が拒否しなければ true を返す', async () => {
  const { result } = renderDispatcher()

  await expect(
    result.current.dispatcher['FindPath-propose-path']({
      cell: { q: 1, r: 0 },
    }),
  ).resolves.toBe(true)
})

test('listener が preventDefault すると false を返す', async () => {
  const { result } = renderDispatcher()
  result.current.eventTarget.addEventListener(
    'FindPath-propose-path',
    (event) => event.preventDefault(),
  )

  await expect(
    result.current.dispatcher['FindPath-propose-path']({
      cell: { q: 1, r: 0 },
    }),
  ).resolves.toBe(false)
})
