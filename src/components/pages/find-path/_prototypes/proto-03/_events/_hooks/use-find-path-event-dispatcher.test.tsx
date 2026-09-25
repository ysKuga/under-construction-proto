import { renderHook } from '@testing-library/react'

import { PropsWithChildren, useState } from 'react'

import { FindPathEventContext } from '../_contexts/event-context'
import { useFindPathEventTarget } from '../index.contexts'

import { useFindPathEventDispatcher } from './use-find-path-event-dispatcher'

/** listener（`FindPathEventListeners`）を含めず EventTarget のみ配布する */
const Wrapper = (props: PropsWithChildren) => {
  const [eventTarget] = useState(() => new EventTarget())

  return (
    <FindPathEventContext.Provider value={eventTarget}>
      {props.children}
    </FindPathEventContext.Provider>
  )
}

const renderDispatcher = () =>
  renderHook(
    () => ({
      dispatcher: useFindPathEventDispatcher(),
      eventTarget: useFindPathEventTarget(),
    }),
    { wrapper: Wrapper },
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
