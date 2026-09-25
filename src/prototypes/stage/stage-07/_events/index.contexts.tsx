'use client'

import { PropsWithChildren, useState } from 'react'

import { Stage07EventContext } from './_contexts/event-context'

export { useStage07EventTarget } from './_contexts/event-context'

/**
 * stage-07 専用の EventTarget を配布する
 *
 * - `Stage07` の外側に置く（`ActorsStoreProvider` と同じく、`Stage07` の外から\
 *   actor の状態変化を購読できるようにするため）
 * - 省略可。Provider がなければ `Stage07` は発行しても何も起きない
 * - box-bot 側の `actorEventTarget`（action dispatch 用）とは分離する
 */
export const Stage07EventProvider = (props: PropsWithChildren) => {
  const { children } = props

  const [eventTarget] = useState(() => new EventTarget())

  return (
    <Stage07EventContext.Provider value={eventTarget}>
      {children}
    </Stage07EventContext.Provider>
  )
}
