import { renderHook } from '@testing-library/react'
import { PropsWithChildren, useState } from 'react'

import { ExpeditionEventContext } from '../_contexts/event-context'
import { useExpeditionEventTarget } from '../index.contexts'

import { useExpeditionEventDispatcher } from './use-expedition-event-dispatcher'

/** listener（`ExpeditionEventListeners`）を含めず EventTarget のみ配布する */
const Wrapper = (props: PropsWithChildren) => {
  const [eventTarget] = useState(() => new EventTarget())

  return (
    <ExpeditionEventContext.Provider value={eventTarget}>
      {props.children}
    </ExpeditionEventContext.Provider>
  )
}

const renderDispatcher = () =>
  renderHook(
    () => ({
      dispatcher: useExpeditionEventDispatcher(),
      eventTarget: useExpeditionEventTarget(),
    }),
    { wrapper: Wrapper },
  )

test('listener が拒否しなければ true を返す', async () => {
  const { result } = renderDispatcher()

  await expect(
    result.current.dispatcher['Expedition-propose-path']({
      cell: { q: 1, r: 0 },
    }),
  ).resolves.toBe(true)
})

test('listener が preventDefault すると false を返す', async () => {
  const { result } = renderDispatcher()
  result.current.eventTarget.addEventListener(
    'Expedition-propose-path',
    (event) => event.preventDefault(),
  )

  await expect(
    result.current.dispatcher['Expedition-propose-path']({
      cell: { q: 1, r: 0 },
    }),
  ).resolves.toBe(false)
})
